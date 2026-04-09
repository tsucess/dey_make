import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/api', async () => {
  const actual = await vi.importActual('../services/api');

  return {
    ...actual,
    api: {
      me: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      verifyEmailCode: vi.fn(),
      resendVerificationCode: vi.fn(),
      logout: vi.fn(),
    },
  };
});

import { api, getStoredActivityAt, getStoredToken, setStoredToken, touchStoredActivity } from '../services/api';
import { AuthProvider, useAuth } from './AuthContext';

const PENDING_VERIFICATION_STORAGE_KEY = 'deymake.auth.pendingVerification';

function AuthHarness() {
  const {
    user,
    isLoading,
    isAuthenticated,
    pendingVerification,
    login,
    register,
    verifyEmailCode,
    resendVerificationCode,
  } = useAuth();

  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="auth">{String(isAuthenticated)}</div>
      <div data-testid="name">{user?.name || user?.fullName || ''}</div>
      <div data-testid="pending-email">{pendingVerification?.email || ''}</div>
      <div data-testid="pending-expires">{pendingVerification?.expiresInMinutes || ''}</div>
      <button type="button" onClick={() => login({ identifier: 'ada', password: 'secret' })}>
        Login
      </button>
      <button
        type="button"
        onClick={() => register({ fullName: 'Ada Lovelace', username: 'ada', email: 'ada@example.com', password: 'secret' })}
      >
        Register
      </button>
      <button type="button" onClick={() => verifyEmailCode({ code: '1234' })}>
        Verify
      </button>
      <button type="button" onClick={() => resendVerificationCode()}>
        Resend
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('clears an invalid stored token during bootstrap', async () => {
    setStoredToken('stale-token');
    api.me.mockRejectedValue(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    expect(api.me).toHaveBeenCalledTimes(1);
    expect(getStoredToken()).toBeNull();
    expect(screen.getByTestId('auth')).toHaveTextContent('false');
  });

  it('clears a long-idle stored session before bootstrap', async () => {
    setStoredToken('stale-token');
    touchStoredActivity(new Date(Date.now() - (60 * 60 * 1000)));

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    expect(api.me).not.toHaveBeenCalled();
    expect(getStoredToken()).toBeNull();
    expect(getStoredActivityAt()).toBeNull();
    expect(screen.getByTestId('auth')).toHaveTextContent('false');
  });

  it('stores the token and authenticates after login', async () => {
    const user = userEvent.setup();

    api.login.mockResolvedValue({
      data: {
        token: 'fresh-token',
        user: { id: 1, name: 'Ada Lovelace' },
      },
    });

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('true'));

    expect(api.login).toHaveBeenCalledWith({ identifier: 'ada', password: 'secret' });
    expect(getStoredToken()).toBe('fresh-token');
    expect(screen.getByTestId('name')).toHaveTextContent('Ada Lovelace');
  });

  it('stores pending verification instead of authenticating when register requires email verification', async () => {
    const user = userEvent.setup();

    api.register.mockResolvedValue({
      data: {
        user: { id: 1, email: 'ada@example.com' },
        verification: {
          required: true,
          email: 'ada@example.com',
          expiresInMinutes: 10,
        },
      },
    });

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    await user.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => expect(screen.getByTestId('pending-email')).toHaveTextContent('ada@example.com'));

    expect(screen.getByTestId('auth')).toHaveTextContent('false');
    expect(getStoredToken()).toBeNull();
    expect(JSON.parse(sessionStorage.getItem(PENDING_VERIFICATION_STORAGE_KEY))).toMatchObject({
      required: true,
      email: 'ada@example.com',
      expiresInMinutes: 10,
    });
  });

  it('uses the stored pending verification email to verify the code and authenticate', async () => {
    const user = userEvent.setup();

    api.register.mockResolvedValue({
      data: {
        user: { id: 1, email: 'ada@example.com' },
        verification: {
          required: true,
          email: 'ada@example.com',
          expiresInMinutes: 10,
        },
      },
    });
    api.verifyEmailCode.mockResolvedValue({
      data: {
        token: 'verified-token',
        user: { id: 1, name: 'Ada Verified' },
      },
    });

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    await user.click(screen.getByRole('button', { name: 'Register' }));
    await waitFor(() => expect(screen.getByTestId('pending-email')).toHaveTextContent('ada@example.com'));

    await user.click(screen.getByRole('button', { name: 'Verify' }));

    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('true'));

    expect(api.verifyEmailCode).toHaveBeenCalledWith({ code: '1234', email: 'ada@example.com' });
    expect(getStoredToken()).toBe('verified-token');
    expect(screen.getByTestId('name')).toHaveTextContent('Ada Verified');
    expect(screen.getByTestId('pending-email')).toHaveTextContent('');
    expect(sessionStorage.getItem(PENDING_VERIFICATION_STORAGE_KEY)).toBeNull();
  });

  it('resends the verification code using the stored pending verification email', async () => {
    const user = userEvent.setup();

    sessionStorage.setItem(PENDING_VERIFICATION_STORAGE_KEY, JSON.stringify({
      required: true,
      email: 'pending@example.com',
      expiresInMinutes: 10,
    }));

    api.resendVerificationCode.mockResolvedValue({
      data: {
        email: 'pending@example.com',
        expiresInMinutes: 15,
      },
    });

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('pending-email')).toHaveTextContent('pending@example.com');

    await user.click(screen.getByRole('button', { name: 'Resend' }));

    await waitFor(() => expect(screen.getByTestId('pending-expires')).toHaveTextContent('15'));

    expect(api.resendVerificationCode).toHaveBeenCalledWith({ email: 'pending@example.com' });
    expect(JSON.parse(sessionStorage.getItem(PENDING_VERIFICATION_STORAGE_KEY))).toMatchObject({
      required: true,
      email: 'pending@example.com',
      expiresInMinutes: 15,
    });
  });
});