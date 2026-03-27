import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/api', async () => {
  const actual = await vi.importActual('../services/api');

  return {
    ...actual,
    api: {
      me: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    },
  };
});

import { api, getStoredToken, setStoredToken } from '../services/api';
import { AuthProvider, useAuth } from './AuthContext';

function AuthHarness() {
  const { user, isLoading, isAuthenticated, login } = useAuth();

  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="auth">{String(isAuthenticated)}</div>
      <div data-testid="name">{user?.name || user?.fullName || ''}</div>
      <button type="button" onClick={() => login({ email: 'ada@example.com', password: 'secret' })}>
        Login
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
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

    expect(api.login).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'secret' });
    expect(getStoredToken()).toBe('fresh-token');
    expect(screen.getByTestId('name')).toHaveTextContent('Ada Lovelace');
  });
});