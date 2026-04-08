import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseTheme = vi.fn();
const authState = { isAuthenticated: true };

vi.mock('../../context/ThemeContext', () => ({
  useTheme: () => mockUseTheme(),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('../../context/LanguageContext', async () => {
  const actual = await vi.importActual('../../locales/translations');
  const t = actual.createTranslator('en');

  return {
    useLanguage: () => ({
      locale: 'en',
      setLocale: vi.fn(),
      t,
    }),
  };
});

vi.mock('./Sidebar', () => ({ default: () => <div>Sidebar</div> }));
vi.mock('./TopBar', () => ({ default: () => <div>TopBar</div> }));
vi.mock('./BottomNav', () => ({ default: () => <div>BottomNav</div> }));

import AppLayout from './AppLayout';

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
}

function renderLayout(initialEntry = '/home') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route path="home" element={<LocationDisplay />} />
          <Route path="live" element={<LocationDisplay />} />
          <Route path="profile" element={<LocationDisplay />} />
          <Route path="users/:id" element={<LocationDisplay />} />
          <Route path="search" element={<LocationDisplay />} />
          <Route path="settings" element={<LocationDisplay />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('AppLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.isAuthenticated = true;
  });

  it('renders labeled homepage actions and navigates to search', async () => {
    mockUseTheme.mockReturnValue({ isDark: false, toggleTheme: vi.fn() });

    renderLayout('/home');

    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /open search/i }));

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/search');
    });
  });

  it('renders a labeled settings link on the profile page', async () => {
    mockUseTheme.mockReturnValue({ isDark: true, toggleTheme: vi.fn() });

    renderLayout('/profile');

    fireEvent.click(screen.getByRole('link', { name: /open settings/i }));

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/settings');
    });
  });

  it('renders the live page title and search action', () => {
    mockUseTheme.mockReturnValue({ isDark: false, toggleTheme: vi.fn() });

    renderLayout('/live');

    expect(screen.getByRole('heading', { name: /live/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open search/i })).toBeInTheDocument();
  });

  it('hides authenticated navigation chrome on public profile routes', () => {
    authState.isAuthenticated = false;
    mockUseTheme.mockReturnValue({ isDark: false, toggleTheme: vi.fn() });

    renderLayout('/users/42');

    expect(screen.queryByText('Sidebar')).not.toBeInTheDocument();
    expect(screen.queryByText('BottomNav')).not.toBeInTheDocument();
    expect(screen.getByText('TopBar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open search/i })).toBeInTheDocument();
  });
});