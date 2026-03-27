import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { fullName: 'Test Creator' },
  }),
}));

vi.mock('../services/api', async () => {
  const actual = await vi.importActual('../services/api');

  return {
    ...actual,
    api: {
      getConversations: vi.fn(),
      getSuggestedUsers: vi.fn(),
      getConversationMessages: vi.fn(),
      markConversationRead: vi.fn(),
      sendConversationMessage: vi.fn(),
      createConversation: vi.fn(),
    },
  };
});

import { api } from '../services/api';
import Messages from './Messages';

describe('Messages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('loads the active conversation and sends a message', async () => {
    const user = userEvent.setup();

    api.getConversations.mockResolvedValue({
      data: {
        conversations: [{
          id: 10,
          participant: { id: 2, fullName: 'Bob Builder', avatarUrl: '', isOnline: true },
          unreadCount: 2,
          status: 'Active now',
          updatedAt: '2025-01-01T00:00:00.000Z',
          lastMessage: { id: 1, body: 'Hello there', createdAt: '2025-01-01T00:00:00.000Z' },
        }],
      },
    });
    api.getSuggestedUsers.mockResolvedValue({
      data: {
        users: [{ id: 3, fullName: 'Eve Example', avatarUrl: '', isOnline: false }],
      },
    });
    api.getConversationMessages.mockResolvedValue({
      data: {
        messages: [{
          id: 1,
          body: 'Hello there',
          createdAt: '2025-01-01T00:00:00.000Z',
          isMine: false,
          sender: { fullName: 'Bob Builder' },
        }],
      },
    });
    api.markConversationRead.mockResolvedValue({});
    api.sendConversationMessage.mockResolvedValue({
      data: {
        message: {
          id: 2,
          body: 'Hi Bob',
          createdAt: '2025-01-01T00:01:00.000Z',
          isMine: true,
          sender: { fullName: 'Test Creator' },
        },
      },
    });

    render(<Messages />);

    await screen.findByPlaceholderText(/Message Bob Builder/i);

    await user.type(screen.getByPlaceholderText(/Message Bob Builder/i), 'Hi Bob');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => expect(api.sendConversationMessage).toHaveBeenCalledWith(10, 'Hi Bob'));

    expect(api.markConversationRead).toHaveBeenCalledWith(10);
    await waitFor(() => expect(screen.getAllByText('Hi Bob')).toHaveLength(2));
  });

  it('starts a conversation from the suggested creators list', async () => {
    const user = userEvent.setup();

    api.getConversations.mockResolvedValue({ data: { conversations: [] } });
    api.getSuggestedUsers.mockResolvedValue({
      data: {
        users: [{ id: 7, fullName: 'Nora Network', avatarUrl: '', isOnline: false }],
      },
    });
    api.createConversation.mockResolvedValue({
      data: {
        conversation: {
          id: 22,
          participant: { id: 7, fullName: 'Nora Network', avatarUrl: '', isOnline: false },
          unreadCount: 0,
          status: 'Sent just now',
          updatedAt: '2025-01-01T00:02:00.000Z',
          lastMessage: null,
        },
      },
    });
    api.getConversationMessages.mockResolvedValue({ data: { messages: [] } });
    api.markConversationRead.mockResolvedValue({});

    render(<Messages />);

    await screen.findByText('Nora Network');
    await user.click(screen.getByRole('button', { name: 'Message' }));

    await waitFor(() => expect(api.createConversation).toHaveBeenCalledWith({ userId: 7 }));

    await screen.findByText('Conversation with Nora Network is ready.');
    expect(screen.getByText(/No messages yet. Say hello to Nora Network./i)).toBeInTheDocument();
  });

  it('polls only for new messages and merges them into the active conversation', async () => {
    let activeConversationPoll;
    let inboxPoll;
    const setIntervalSpy = vi.spyOn(window, 'setInterval').mockImplementation((callback, delay, ...args) => {
      if (delay === 5000) {
        activeConversationPoll = () => callback(...args);
      }

      if (delay === 15000) {
        inboxPoll = () => callback(...args);
      }

      return 1;
    });
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval').mockImplementation(() => {});

    api.getConversations
      .mockResolvedValueOnce({
        data: {
          conversations: [{
            id: 10,
            participant: { id: 2, fullName: 'Bob Builder', avatarUrl: '', isOnline: true },
            unreadCount: 2,
            status: 'Active now',
            updatedAt: '2025-01-01T00:00:00.000Z',
            lastMessage: { id: 1, body: 'Hello there', createdAt: '2025-01-01T00:00:00.000Z' },
          }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          conversations: [{
            id: 10,
            participant: { id: 2, fullName: 'Bob Builder', avatarUrl: '', isOnline: true },
            unreadCount: 9,
            status: 'Active now',
            updatedAt: '2025-01-01T00:00:00.000Z',
            lastMessage: { id: 1, body: 'Hello there', createdAt: '2025-01-01T00:00:00.000Z' },
          }],
        },
      });
    api.getSuggestedUsers.mockResolvedValue({ data: { users: [] } });
    api.getConversationMessages
      .mockResolvedValueOnce({
        data: {
          messages: [{
            id: 1,
            body: 'Hello there',
            createdAt: '2025-01-01T00:00:00.000Z',
            isMine: false,
            sender: { fullName: 'Bob Builder' },
          }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          messages: [{
            id: 2,
            body: 'New reply',
            createdAt: '2025-01-01T00:01:00.000Z',
            isMine: false,
            sender: { fullName: 'Bob Builder' },
          }],
        },
      });
    api.markConversationRead.mockResolvedValue({});

    render(<Messages />);

    await waitFor(() => expect(api.getConversationMessages).toHaveBeenNthCalledWith(1, 10, { after: undefined }));
    await waitFor(() => expect(screen.getAllByText('Hello there')).toHaveLength(2));
    await waitFor(() => expect(activeConversationPoll).toEqual(expect.any(Function)));
    await waitFor(() => expect(inboxPoll).toEqual(expect.any(Function)));

    await activeConversationPoll();

    await waitFor(() => expect(api.getConversationMessages).toHaveBeenNthCalledWith(2, 10, { after: 1 }));
    await waitFor(() => expect(screen.getAllByText('New reply')).toHaveLength(2));

    await inboxPoll();

    await waitFor(() => expect(api.getConversations).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getAllByText('New reply')).toHaveLength(2));
    expect(screen.queryByText('9')).not.toBeInTheDocument();

    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });
});