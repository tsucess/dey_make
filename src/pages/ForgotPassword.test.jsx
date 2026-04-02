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
      forgotPassword: vi.fn(),
    },
  };
});

import { api } from '../services/api';
import ForgotPassword from './ForgotPassword';
import { getPendingPasswordReset } from '../utils/authFlowStorage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/forgot-password']}>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<div>Reset password screen</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('validates the email before submitting', async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(api.forgotPassword).not.toHaveBeenCalled();
  });

  it('stores the reset token and navigates to the reset password page', async () => {
    const user = userEvent.setup();

    api.forgotPassword.mockResolvedValue({
      data: {
        email: 'ada@example.com',
        resetToken: 'reset-token-123',
        expiresInMinutes: 60,
      },
    });

    renderPage();

    await user.type(screen.getByPlaceholderText('Email'), 'ada@example.com');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(api.forgotPassword).toHaveBeenCalledWith({ email: 'ada@example.com' }));
    expect(await screen.findByText('Reset password screen')).toBeInTheDocument();
    expect(getPendingPasswordReset()).toMatchObject({
      email: 'ada@example.com',
      token: 'reset-token-123',
      expiresInMinutes: 60,
    });
  });
});