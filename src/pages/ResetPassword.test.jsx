import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../components/AuthLayout', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../components/Logo', () => ({
  default: () => <div>Logo</div>,
}));

vi.mock('../components/NetworkIllustration', () => ({
  default: () => <div>Illustration</div>,
}));

vi.mock('../context/LanguageContext', async () => {
  const actual = await vi.importActual('../locales/translations');
  const t = actual.createTranslator('en');

  return {
    useLanguage: () => ({ locale: 'en', setLocale: vi.fn(), t }),
  };
});

vi.mock('../services/api', async () => {
  const actual = await vi.importActual('../services/api');

  return {
    ...actual,
    api: {
      ...actual.api,
      resetPassword: vi.fn(),
    },
  };
});

import { api } from '../services/api';
import ResetPassword from './ResetPassword';
import { getPendingPasswordReset, setPendingPasswordReset } from '../utils/authFlowStorage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/reset-password']}>
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login" element={<div>Login screen</div>} />
        <Route path="/forgot-password" element={<div>Forgot password screen</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('prefills stored reset details and blocks mismatched passwords', async () => {
    const user = userEvent.setup();

    setPendingPasswordReset({
      email: 'ada@example.com',
      token: 'reset-token-123',
      expiresInMinutes: 60,
    });

    renderPage();

    expect(screen.getByPlaceholderText('Email')).toHaveValue('ada@example.com');
    expect(screen.getByPlaceholderText('Reset token')).toHaveValue('reset-token-123');

    await user.type(screen.getByPlaceholderText('New password'), 'Password1');
    await user.type(screen.getByPlaceholderText('Confirm password'), 'Mismatch1');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    expect(api.resetPassword).not.toHaveBeenCalled();
  });

  it('submits the new password, clears stored reset state, and shows success', async () => {
    const user = userEvent.setup();

    setPendingPasswordReset({
      email: 'ada@example.com',
      token: 'reset-token-123',
      expiresInMinutes: 60,
    });
    api.resetPassword.mockResolvedValue({ data: { user: { id: 1 } } });

    renderPage();

    await user.type(screen.getByPlaceholderText('New password'), 'Password1');
    await user.type(screen.getByPlaceholderText('Confirm password'), 'Password1');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    await waitFor(() => expect(api.resetPassword).toHaveBeenCalledWith({
      email: 'ada@example.com',
      token: 'reset-token-123',
      password: 'Password1',
    }));
    expect(await screen.findByText('Password reset complete')).toBeInTheDocument();
    expect(getPendingPasswordReset()).toBeNull();
  });
});