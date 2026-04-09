import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../context/LanguageContext', async () => {
  const actual = await vi.importActual('../locales/translations');
  const t = actual.createTranslator('es');

  return {
    useLanguage: () => ({ locale: 'es', setLocale: vi.fn(), t }),
  };
});

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ isDark: false, toggleTheme: vi.fn(), theme: 'light', setThemePreference: vi.fn() }),
}));

vi.mock('../services/api', async () => {
  const actual = await vi.importActual('../services/api');

  return {
    ...actual,
    api: {
      ...actual.api,
      joinWaitlist: vi.fn(),
    },
  };
});

import LandingPage from './LandingPage';

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.IntersectionObserver = class IntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  it('renders localized landing copy in Spanish', () => {
    render(<LandingPage onSignUp={vi.fn()} />);

    expect(screen.getByRole('link', { name: 'Acerca de' })).toBeInTheDocument();
    expect(screen.getByText('Crea. Publica. Crece.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Un nuevo hogar para creadores/i })).toBeInTheDocument();
    expect(screen.getByText('Por qué los creadores eligen DeyMake')).toBeInTheDocument();
    expect(screen.getByText('Preguntas frecuentes')).toBeInTheDocument();
    expect(screen.getByText('©2025 DeyMake. Todos los derechos reservados.')).toBeInTheDocument();
  });

  it('shows localized waitlist validation messages', async () => {
    const user = userEvent.setup();

    render(<LandingPage onSignUp={vi.fn()} />);

    const form = screen.getByPlaceholderText('Nombre + apellido').closest('form');
    await user.click(within(form).getByRole('button', { name: 'Únete a la lista de espera' }));

    expect(await screen.findByText('El nombre es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('El correo electrónico es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('El país es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('Cuéntanos qué te describe.')).toBeInTheDocument();
    expect(screen.getByText('Debes aceptar que te contactemos.')).toBeInTheDocument();
  });
});