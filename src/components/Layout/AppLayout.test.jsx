import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseTheme = vi.fn();
const authState = { isAuthenticated: true, user: { id: 1 } };
const subscribeToPrivateChannelMock = vi.fn();

vi.mock('../../context/ThemeContext', () => ({
  useTheme: () => mockUseTheme(),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('../../services/api', async () => {
  const actual = await vi.importActual('../../services/api');

  return {
    ...actual,
    api: {
      getNotifications: vi.fn(),
      markNotificationRead: vi.fn(),
      markAllNotificationsRead: vi.fn(),
    },
  };
});

vi.mock('../../services/realtime', () => ({
  subscribeToPrivateChannel: (...args) => subscribeToPrivateChannelMock(...args),
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

import { api } from '../../services/api';
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
    authState.user = { id: 1 };
    mockUseTheme.mockReturnValue({ isDark: false, toggleTheme: vi.fn() });
    api.getNotifications.mockResolvedValue({ data: { notifications: [] } });
    api.markNotificationRead.mockResolvedValue({ data: { notification: { id: 1, readAt: '2025-01-01T12:05:00.000Z' } } });
    api.markAllNotificationsRead.mockResolvedValue({});
    subscribeToPrivateChannelMock.mockImplementation(() => vi.fn());
  });

  it('renders labeled homepage actions and navigates to search', async () => {
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
    renderLayout('/live');

    expect(screen.getByRole('heading', { name: /live/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open search/i })).toBeInTheDocument();
  });

  it('shows mobile notification data and badge count from the shared notification state', async () => {
    api.getNotifications.mockResolvedValue({
      data: {
        notifications: [
          {
            id: 7,
            type: 'message',
            title: 'New mobile alert',
            body: 'You have a fresh notification.',
            data: { conversationId: 8 },
            readAt: null,
            createdAt: '2025-01-01T12:05:00.000Z',
          },
        ],
      },
    });

    renderLayout('/home');

    await waitFor(() => expect(api.getNotifications).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: /notifications/i })).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));

    expect(await screen.findByRole('dialog', { name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByText('New mobile alert')).toBeInTheDocument();
    expect(screen.getByText('You have a fresh notification.')).toBeInTheDocument();
  });

  it('hides authenticated navigation chrome on public profile routes', () => {
    authState.isAuthenticated = false;
    authState.user = null;

    renderLayout('/users/42');

    expect(screen.queryByText('Sidebar')).not.toBeInTheDocument();
    expect(screen.queryByText('BottomNav')).not.toBeInTheDocument();
    expect(screen.getByText('TopBar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open search/i })).toBeInTheDocument();
  });
});