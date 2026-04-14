import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const logoutMock = vi.fn();
const authState = { logout: logoutMock, user: { id: 1, isAdmin: false } };

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('../../context/LanguageContext', async () => {
  const actual = await vi.importActual('../../locales/translations');
  const t = actual.createTranslator('en');

  return {
    useLanguage: () => ({ locale: 'en', setLocale: vi.fn(), t }),
  };
});

import Sidebar from './Sidebar';

describe('Sidebar', () => {
  it('shows the admin link only for admin users', () => {
    authState.user = { id: 1, isAdmin: true };

    const { rerender } = render(
      <MemoryRouter initialEntries={['/home']}>
        <Sidebar />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin');

    authState.user = { id: 2, isAdmin: false };
    rerender(
      <MemoryRouter initialEntries={['/home']}>
        <Sidebar />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
  });

  it('calls logout from the auth context', () => {
    authState.user = { id: 1, isAdmin: false };

    render(
      <MemoryRouter initialEntries={['/home']}>
        <Sidebar />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});