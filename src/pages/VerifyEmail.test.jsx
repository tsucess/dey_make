import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const authState = {
  pendingVerification: { required: true, email: 'ada@example.com', expiresInMinutes: 10 },
  verifyEmailCode: vi.fn(),
  resendVerificationCode: vi.fn(),
  clearPendingVerification: vi.fn(),
};

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

vi.mock('../context/AuthContext', () => ({
  useAuth: () => authState,
}));

import VerifyEmail from './VerifyEmail';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/verify-email']}>
      <Routes>
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/home" element={<div>Home screen</div>} />
        <Route path="/login" element={<div>Login screen</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('VerifyEmail', () => {
  beforeEach(() => {
    authState.pendingVerification = { required: true, email: 'ada@example.com', expiresInMinutes: 10 };
    authState.verifyEmailCode.mockReset();
    authState.verifyEmailCode.mockResolvedValue({ id: 1 });
    authState.resendVerificationCode.mockReset();
    authState.resendVerificationCode.mockResolvedValue({});
    authState.clearPendingVerification.mockReset();
  });

  it('renders the pending verification email and blocks incomplete submissions', async () => {
    const user = userEvent.setup();

    renderPage();

    expect(screen.getByText('Enter the 4-digit code')).toBeInTheDocument();
    expect(screen.getByText(/ada@example.com/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Verify code' }));

    expect(screen.getByText('Enter the full 4-digit verification code.')).toBeInTheDocument();
    expect(authState.verifyEmailCode).not.toHaveBeenCalled();
  });

  it('accepts a pasted code, verifies it, and navigates home', async () => {
    const user = userEvent.setup();

    renderPage();

    fireEvent.paste(screen.getByLabelText('Verification code digit 1'), {
      clipboardData: {
        getData: () => '1234',
      },
    });
    await user.click(screen.getByRole('button', { name: 'Verify code' }));

    await waitFor(() => expect(authState.verifyEmailCode).toHaveBeenCalledWith({ code: '1234' }));
    expect(await screen.findByText('Home screen')).toBeInTheDocument();
  });

  it('resends the code and shows a confirmation message', async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(screen.getByRole('button', { name: 'Resend code' }));

    await waitFor(() => expect(authState.resendVerificationCode).toHaveBeenCalledTimes(1));
    expect(screen.getByText('A new verification code has been sent to your email.')).toBeInTheDocument();
  });

  it('clears pending verification and returns to login', async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(screen.getByRole('button', { name: 'Back to login' }));

    expect(authState.clearPendingVerification).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Login screen')).toBeInTheDocument();
  });
});