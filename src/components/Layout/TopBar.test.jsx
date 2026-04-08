import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../../context/LanguageContext';

let notificationPermission = 'default';
let documentVisibilityState = 'visible';
let documentHasFocus = true;
let browserNotifications = [];

class NotificationMock {
  static requestPermission = vi.fn(() => Promise.resolve(notificationPermission));

  constructor(title, options = {}) {
    this.title = title;
    this.options = options;
    this.onclick = null;
    this.onclose = null;
    this.close = vi.fn(() => {
      this.onclose?.();
    });
    browserNotifications.push(this);
  }

  static get permission() {
    return notificationPermission;
  }
}

Object.defineProperty(window, 'Notification', {
  configurable: true,
  writable: true,
  value: NotificationMock,
});

Object.defineProperty(document, 'visibilityState', {
  configurable: true,
  get: () => documentVisibilityState,
});

const authState = {
  isAuthenticated: true,
  user: { id: 1, fullName: 'Test Creator', avatarUrl: '' },
};

const subscribeToPrivateChannelMock = vi.fn();

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

vi.mock('../../services/realtime', () => ({
  subscribeToPrivateChannel: (...args) => subscribeToPrivateChannelMock(...args),
}));

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
    vi.restoreAllMocks();
    vi.clearAllMocks();
    browserNotifications = [];
    notificationPermission = 'default';
    documentVisibilityState = 'visible';
    documentHasFocus = true;
    vi.spyOn(document, 'hasFocus').mockImplementation(() => documentHasFocus);
    vi.spyOn(window, 'focus').mockImplementation(() => {});
    authState.isAuthenticated = true;
    authState.user = { id: 1, fullName: 'Test Creator', avatarUrl: '' };
    api.searchSuggestions.mockResolvedValue({ data: { videos: [], creators: [], categories: [] } });
    api.getNotifications.mockResolvedValue({ data: { notifications: [] } });
    api.markNotificationRead.mockResolvedValue({ data: { notification: { id: 1, readAt: '2025-01-01T12:05:00.000Z' } } });
    api.markAllNotificationsRead.mockResolvedValue({});
    subscribeToPrivateChannelMock.mockImplementation(() => vi.fn());
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

  it('updates the notification badge and drawer from realtime events', async () => {
    let listeners = null;

    subscribeToPrivateChannelMock.mockImplementation((channelName, nextListeners) => {
      expect(channelName).toBe('notifications.1');
      listeners = nextListeners;
      return vi.fn();
    });

    api.getNotifications.mockResolvedValue({ data: { notifications: [] } });

    renderTopBar();

    await waitFor(() => expect(api.getNotifications).toHaveBeenCalledTimes(1));
    expect(listeners).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    await screen.findByRole('dialog', { name: /notifications/i });

    listeners['.notification.created']({
      notification: {
        id: 5,
        type: 'message',
        title: 'New message',
        body: 'Realtime hello',
        data: { conversationId: 9 },
        readAt: null,
        createdAt: '2025-01-01T12:10:00.000Z',
      },
    });

    await waitFor(() => expect(screen.getByRole('button', { name: /notifications/i })).toHaveTextContent('1'));
    expect(await screen.findByText('Realtime hello')).toBeInTheDocument();

    listeners['.notification.updated']({
      notification: {
        id: 5,
        type: 'message',
        title: 'New message',
        body: 'Realtime hello',
        data: { conversationId: 9 },
        readAt: '2025-01-01T12:11:00.000Z',
        createdAt: '2025-01-01T12:10:00.000Z',
      },
    });

    await waitFor(() => expect(screen.getByRole('button', { name: /notifications/i })).not.toHaveTextContent('1'));

    listeners['.notification.deleted']({ notificationId: 5 });

    await waitFor(() => expect(screen.queryByText('Realtime hello')).not.toBeInTheDocument());
  });

  it('shows a popup for new realtime notifications while the drawer is closed', async () => {
    let listeners = null;

    subscribeToPrivateChannelMock.mockImplementation((_channelName, nextListeners) => {
      listeners = nextListeners;
      return vi.fn();
    });

    api.markNotificationRead.mockResolvedValue({
      data: {
        notification: {
          id: 8,
          type: 'message',
          title: 'New message',
          body: 'Popup hello',
          data: { conversationId: 13 },
          readAt: '2025-01-01T12:12:00.000Z',
          createdAt: '2025-01-01T12:10:00.000Z',
        },
      },
    });

    renderTopBar();

    await waitFor(() => expect(api.getNotifications).toHaveBeenCalledTimes(1));

    listeners['.notification.created']({
      notification: {
        id: 8,
        type: 'message',
        title: 'New message',
        body: 'Popup hello',
        data: { conversationId: 13 },
        readAt: null,
        createdAt: '2025-01-01T12:10:00.000Z',
      },
    });

    expect(await screen.findByRole('status')).toHaveTextContent('Popup hello');

    fireEvent.click(screen.getByRole('button', { name: /new message popup hello/i }));

    await waitFor(() => expect(api.markNotificationRead).toHaveBeenCalledWith(8));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/messages'));
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  });

  it('requests browser notification permission from the bell click when permission is undecided', async () => {
    renderTopBar();

    await waitFor(() => expect(api.getNotifications).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));

    expect(NotificationMock.requestPermission).toHaveBeenCalledTimes(1);
  });

  it('shows a browser notification when the tab is hidden and navigates on click', async () => {
    let listeners = null;
    notificationPermission = 'granted';
    documentVisibilityState = 'hidden';
    documentHasFocus = false;
    api.markNotificationRead.mockResolvedValue({
      data: {
        notification: {
          id: 12,
          type: 'message',
          title: 'New message',
          body: 'Background hello',
          data: { conversationId: 25 },
          readAt: '2025-01-01T12:20:00.000Z',
          createdAt: '2025-01-01T12:19:00.000Z',
        },
      },
    });

    subscribeToPrivateChannelMock.mockImplementation((_channelName, nextListeners) => {
      listeners = nextListeners;
      return vi.fn();
    });

    renderTopBar();

    await waitFor(() => expect(api.getNotifications).toHaveBeenCalledTimes(1));

    listeners['.notification.created']({
      notification: {
        id: 12,
        type: 'message',
        title: 'New message',
        body: 'Background hello',
        data: { conversationId: 25 },
        readAt: null,
        createdAt: '2025-01-01T12:19:00.000Z',
      },
    });

    await waitFor(() => expect(browserNotifications).toHaveLength(1));
    expect(browserNotifications[0].title).toBe('New message');
    expect(browserNotifications[0].options).toEqual(expect.objectContaining({ body: 'Background hello', tag: 'notification-12' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    await act(async () => {
      browserNotifications[0].onclick?.();
    });

    await waitFor(() => expect(api.markNotificationRead).toHaveBeenCalledWith(12));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/messages'));
    expect(browserNotifications[0].close).toHaveBeenCalled();
  });

  it('does not show realtime delivery alerts when the user disables them in settings', async () => {
    let listeners = null;

    notificationPermission = 'granted';
    documentVisibilityState = 'hidden';
    documentHasFocus = false;
    authState.user = {
      id: 1,
      fullName: 'Test Creator',
      avatarUrl: '',
      preferences: {
        notificationSettings: {
          inAppRealtime: false,
          browserRealtime: false,
        },
      },
    };

    subscribeToPrivateChannelMock.mockImplementation((_channelName, nextListeners) => {
      listeners = nextListeners;
      return vi.fn();
    });

    renderTopBar();

    await waitFor(() => expect(api.getNotifications).toHaveBeenCalledTimes(1));

    listeners['.notification.created']({
      notification: {
        id: 15,
        type: 'message',
        title: 'New message',
        body: 'Respect my settings',
        data: { conversationId: 33 },
        readAt: null,
        createdAt: '2025-01-01T12:30:00.000Z',
      },
    });

    await waitFor(() => expect(screen.getByRole('button', { name: /notifications/i })).toHaveTextContent('1'));
    expect(browserNotifications).toHaveLength(0);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('does not show the popup when the notification drawer is already open', async () => {
    let listeners = null;

    subscribeToPrivateChannelMock.mockImplementation((_channelName, nextListeners) => {
      listeners = nextListeners;
      return vi.fn();
    });

    renderTopBar();

    await waitFor(() => expect(api.getNotifications).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /notifications/i }));
    await screen.findByRole('dialog', { name: /notifications/i });

    listeners['.notification.created']({
      notification: {
        id: 9,
        type: 'message',
        title: 'New message',
        body: 'Drawer already open',
        data: { conversationId: 14 },
        readAt: null,
        createdAt: '2025-01-01T12:15:00.000Z',
      },
    });

    await waitFor(() => expect(screen.getByText('Drawer already open')).toBeInTheDocument());
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});