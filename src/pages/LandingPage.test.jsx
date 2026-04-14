import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTranslator } from '../locales/translations';

const t = createTranslator('es');

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

    expect(screen.getByRole('link', { name: t('landing.navbar.about') })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Crea\.?\s*Publica\.?\s*Crece\./i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: `${t('landing.creatives.titlePrefix')} ${t('landing.creatives.titleAccent')}` })).toBeInTheDocument();
    expect(screen.getByText(t('landing.why.title'))).toBeInTheDocument();
    expect(screen.getByText(t('landing.faq.title'))).toBeInTheDocument();
    expect(screen.getByText(t('landing.footer.copyright'))).toBeInTheDocument();
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