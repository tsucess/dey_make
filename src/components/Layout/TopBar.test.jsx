import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../../context/LanguageContext';

const authState = {
  isAuthenticated: true,
  user: { fullName: 'Test Creator', avatarUrl: '' },
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('../../services/api', async () => {
  const actual = await vi.importActual('../../services/api');

  return {
    ...actual,
    api: {
      searchSuggestions: vi.fn(),
      getNotifications: vi.fn(),
      markNotificationRead: vi.fn(),
      markAllNotificationsRead: vi.fn(),
    },
  };
});

import { api } from '../../services/api';
import TopBar from './TopBar';

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
}

function renderTopBar(initialEntry = '/home') {
  return render(
    <LanguageProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="*" element={<><TopBar /><LocationDisplay /></>} />
        </Routes>
      </MemoryRouter>
    </LanguageProvider>,
  );
}

describe('TopBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.isAuthenticated = true;
    authState.user = { fullName: 'Test Creator', avatarUrl: '' };
    api.searchSuggestions.mockResolvedValue({ data: { videos: [], creators: [], categories: [] } });
    api.getNotifications.mockResolvedValue({ data: { notifications: [] } });
    api.markNotificationRead.mockResolvedValue({ data: { notification: { id: 1, readAt: '2025-01-01T12:05:00.000Z' } } });
    api.markAllNotificationsRead.mockResolvedValue({});
  });

  it('loads lookup suggestions and navigates to search results', async () => {
    api.searchSuggestions.mockResolvedValue({
      data: {
        videos: [{ id: 9, title: 'Moonlight Session', author: { fullName: 'DJ Aurora' } }],
        creators: [{ id: 4, fullName: 'Ada Lovelace', subscriberCount: 12 }],
        categories: [{ id: 2, label: 'Jazz' }],
      },
    });

    renderTopBar();

    fireEvent.change(screen.getByLabelText(/search deymake/i), { target: { value: '  Jazz  ' } });

    await waitFor(() => expect(api.searchSuggestions).toHaveBeenCalledWith('Jazz'));

    expect(await screen.findByText('Moonlight Session')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view all results for “jazz”/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /view all results for “jazz”/i }));

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/search?q=Jazz');
    });
  });

  it('hides authenticated-only actions for signed-out visitors', () => {
    authState.isAuthenticated = false;
    authState.user = null;

    renderTopBar('/users/7');

    expect(screen.getByLabelText(/search deymake/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /notifications/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /profile/i })).not.toBeInTheDocument();
  });

  it('loads dynamic notifications, shows unread count, and navigates on selection', async () => {
    api.getNotifications.mockResolvedValue({
      data: {
        notifications: [
          {
            id: 1,
            type: 'comment',
            title: 'Ada commented on your video',
            body: '“This drop is clean.”',
            data: { videoId: 44, commentId: 9 },
            readAt: null,
            createdAt: '2025-01-01T12:00:00.000Z',
          },
          {
            id: 2,
            type: 'message',
            title: 'New message',
            body: 'Can we collaborate?',
            data: { conversationId: 8 },
            readAt: null,
            createdAt: '2025-01-01T11:00:00.000Z',
          },
        ],
      },
    });
    api.markNotificationRead.mockResolvedValue({
      data: {
        notification: {
          id: 1,
          type: 'comment',
          title: 'Ada commented on your video',
          body: '“This drop is clean.”',
          data: { videoId: 44, commentId: 9 },
          readAt: '2025-01-01T12:05:00.000Z',
          createdAt: '2025-01-01T12:00:00.000Z',
        },
      },
    });

    renderTopBar();

    await waitFor(() => expect(api.getNotifications).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: /notifications/i })).toHaveTextContent('2');

    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));

    expect(await screen.findByRole('dialog', { name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByText('Ada commented on your video')).toBeInTheDocument();
    expect(screen.getByText('Can we collaborate?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mark all as read/i })).toBeInTheDocument();

    fireEvent.click(screen.getByText('Ada commented on your video').closest('button'));

    await waitFor(() => expect(api.markNotificationRead).toHaveBeenCalledWith(1));
    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/video/44');
    });
  });

  it('refreshes notifications in the background without reopening the panel', async () => {
    const intervals = [];
    const setIntervalSpy = vi.spyOn(window, 'setInterval').mockImplementation((callback, delay) => {
      intervals.push({ callback, delay });
      return intervals.length;
    });
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval').mockImplementation(() => {});

    api.getNotifications
      .mockResolvedValueOnce({
        data: {
          notifications: [
            {
              id: 1,
              type: 'comment',
              title: 'Ada commented on your video',
              body: '“This drop is clean.”',
              data: { videoId: 44 },
              readAt: null,
              createdAt: '2025-01-01T12:00:00.000Z',
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          notifications: [
            {
              id: 1,
              type: 'comment',
              title: 'Ada commented on your video',
              body: '“This drop is clean.”',
              data: { videoId: 44 },
              readAt: null,
              createdAt: '2025-01-01T12:00:00.000Z',
            },
            {
              id: 2,
              type: 'message',
              title: 'New message',
              body: 'Can we collaborate?',
              data: { conversationId: 8 },
              readAt: null,
              createdAt: '2025-01-01T12:05:00.000Z',
            },
          ],
        },
      });

    try {
      renderTopBar();

      await waitFor(() => expect(api.getNotifications).toHaveBeenCalledTimes(1));
      expect(screen.getByRole('button', { name: /notifications/i })).toHaveTextContent('1');
      const notificationPoller = intervals.find((entry) => entry.delay === 15000);

      expect(notificationPoller).toBeTruthy();

      await act(async () => {
        await notificationPoller.callback();
      });

      await waitFor(() => expect(api.getNotifications).toHaveBeenCalledTimes(2));
      expect(screen.getByRole('button', { name: /notifications/i })).toHaveTextContent('2');
    } finally {
      setIntervalSpy.mockRestore();
      clearIntervalSpy.mockRestore();
    }
  });

  it('refreshes notifications immediately when the window regains focus', async () => {
    api.getNotifications
      .mockResolvedValueOnce({ data: { notifications: [] } })
      .mockResolvedValueOnce({
        data: {
          notifications: [
            {
              id: 7,
              type: 'subscription',
              title: 'New subscriber',
              body: 'Creator Subscriber subscribed to your profile.',
              data: { creatorId: 12 },
              readAt: null,
              createdAt: '2025-01-01T12:05:00.000Z',
            },
          ],
        },
      });

    renderTopBar();

    await waitFor(() => expect(api.getNotifications).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('button', { name: /notifications/i })).not.toHaveTextContent('1');

    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });

    await waitFor(() => expect(api.getNotifications).toHaveBeenCalledTimes(2));
    expect(screen.getByRole('button', { name: /notifications/i })).toHaveTextContent('1');
  });
});