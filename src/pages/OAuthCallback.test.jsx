import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const authenticateWithToken = vi.fn();

vi.mock('../context/LanguageContext', async () => {
  const actual = await vi.importActual('../locales/translations');
  const t = actual.createTranslator('es');

  return {
    useLanguage: () => ({ locale: 'es', setLocale: vi.fn(), t }),
  };
});

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ authenticateWithToken }),
}));

import OAuthCallback from './OAuthCallback';

function renderPage(initialEntry) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/login" element={<div>Login screen</div>} />
        <Route path="/home" element={<div>Home screen</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('OAuthCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders localized in-progress copy while finishing social sign in', async () => {
    authenticateWithToken.mockReturnValue(new Promise(() => {}));

    renderPage('/auth/callback?provider=google&token=token-123');

    expect(await screen.findByText('Terminando el inicio de sesión con Google...')).toBeInTheDocument();
    expect(screen.getByText('Espera mientras conectamos tu cuenta e iniciamos sesión.')).toBeInTheDocument();
  });

  it('renders localized fallback errors and returns to login', async () => {
    const user = userEvent.setup();

    renderPage('/auth/callback?provider=google');

    expect(await screen.findByText('Error al iniciar sesión con Google')).toBeInTheDocument();
    expect(screen.getByText('Falta el token de autenticación. Inténtalo de nuevo.')).toBeInTheDocument();
    expect(authenticateWithToken).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Volver al inicio de sesión' }));

    expect(await screen.findByText('Login screen')).toBeInTheDocument();
  });
});