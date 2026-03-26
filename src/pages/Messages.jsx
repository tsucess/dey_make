import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, firstError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatRelativeTime, getProfileAvatar, getProfileName } from "../utils/content";

function ConversationRow({ conversation, active, onClick }) {
  const participant = conversation.participant;
  const preview = conversation.lastMessage?.body || conversation.status;
  const timestamp = conversation.lastMessage?.createdAt || conversation.updatedAt;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-4 rounded-[1.75rem] px-4 py-4 text-left transition-colors ${
        active
          ? "bg-orange100/15 dark:bg-white/8"
          : "bg-[#F5F5F5] hover:bg-[#ECECEC] dark:bg-black100 dark:hover:bg-[#262626]"
      }`}
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="relative">
          <img src={getProfileAvatar(participant)} alt={getProfileName(participant)} className="h-12 w-12 rounded-full object-cover" />
          {participant?.isOnline ? (
            <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green100 dark:border-black100" />
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-medium font-inter text-black dark:text-white">{getProfileName(participant)}</p>
          <p className="mt-1 line-clamp-2 text-sm text-slate700 dark:text-slate200">{preview}</p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="text-xs text-slate500 dark:text-slate200">{timestamp ? formatRelativeTime(timestamp) : "Now"}</span>
        {conversation.unreadCount ? (
          <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-red200 px-2 text-sm font-medium text-white">
            {conversation.unreadCount}
          </span>
        ) : null}
      </div>
    </button>
  );
}

function MessageBubble({ message }) {
  return (
    <div className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-3xl px-4 py-3 ${
          message.isMine
            ? "bg-orange100 text-black"
            : "bg-[#F3F3F3] text-slate100 dark:bg-[#262626] dark:text-white"
        }`}
      >
        {!message.isMine ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate500 dark:text-slate200">
            {getProfileName(message.sender)}
          </p>
        ) : null}
        <p className="text-sm font-inter leading-relaxed">{message.body}</p>
        <p className={`mt-2 text-[11px] ${message.isMine ? "text-black/70" : "text-slate500 dark:text-slate200"}`}>
          {formatRelativeTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <section className="space-y-4 rounded-3xl bg-white300 px-5 py-5 dark:bg-black100 md:px-6 md:py-6">
      <h2 className="text-lg font-medium font-bricolage text-black dark:text-white md:text-2xl">{title}</h2>
      {children}
    </section>
  );
}

export default function Messages() {
  const { user } = useAuth();
  const isMountedRef = useRef(true);
  const activeConversationIdRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draftMessage, setDraftMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [busyUserId, setBusyUserId] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) || null,
    [activeConversationId, conversations],
  );

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => () => {
    isMountedRef.current = false;
  }, []);

  const loadInbox = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
      setError("");
    }

    try {
      const [conversationResponse, suggestedResponse] = await Promise.all([
        api.getConversations(),
        api.getSuggestedUsers(),
      ]);

      if (!isMountedRef.current) return;

      const currentActiveConversationId = activeConversationIdRef.current;
      const nextConversations = (conversationResponse?.data?.conversations || []).map((conversation) =>
        conversation.id === currentActiveConversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation,
      );

      setConversations(nextConversations);
      setSuggestedUsers(suggestedResponse?.data?.users || []);
      setActiveConversationId((current) =>
        nextConversations.some((conversation) => conversation.id === current)
          ? current
          : nextConversations[0]?.id || null,
      );
    } catch (nextError) {
      if (!silent && isMountedRef.current) {
        setError(firstError(nextError?.errors, nextError?.message || "Unable to load messages."));
      }
    } finally {
      if (!silent && isMountedRef.current) setLoading(false);
    }
  }, []);

  const loadConversationMessages = useCallback(async (conversationId, { silent = false } = {}) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    if (!silent) setLoadingMessages(true);

    try {
      const response = await api.getConversationMessages(conversationId);

      if (!isMountedRef.current) return;

      const nextMessages = response?.data?.messages || [];
      const latestMessage = nextMessages[nextMessages.length - 1] || null;

      setMessages(nextMessages);
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                unreadCount: 0,
                ...(latestMessage
                  ? {
                      lastMessage: latestMessage,
                      updatedAt: latestMessage.createdAt,
                    }
                  : {}),
              }
            : conversation,
        ),
      );

      api.markConversationRead(conversationId).catch(() => {});
    } catch (nextError) {
      if (!silent && isMountedRef.current) {
        setError(firstError(nextError?.errors, nextError?.message || "Unable to load conversation."));
      }
    } finally {
      if (!silent && isMountedRef.current) setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  useEffect(() => {
    loadConversationMessages(activeConversationId);
  }, [activeConversationId, loadConversationMessages]);

  useEffect(() => {
    if (!feedback) return undefined;

    const timeoutId = window.setTimeout(() => {
      setFeedback("");
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  useEffect(() => {
    let polling = false;

    const intervalId = window.setInterval(async () => {
      if (polling || !isMountedRef.current) return;

      polling = true;

      try {
        await Promise.all([
          loadInbox({ silent: true }),
          activeConversationId ? loadConversationMessages(activeConversationId, { silent: true }) : Promise.resolve(),
        ]);
      } finally {
        polling = false;
      }
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [activeConversationId, loadConversationMessages, loadInbox]);

  async function startConversation(participant) {
    const existingConversation = conversations.find((conversation) => conversation.participant?.id === participant.id);

    if (existingConversation) {
      setActiveConversationId(existingConversation.id);
      return;
    }

    setBusyUserId(participant.id);
    setError("");
    setFeedback("");

    try {
      const response = await api.createConversation({ userId: participant.id });
      const conversation = response?.data?.conversation;

      if (!conversation) return;

      setConversations((current) => [conversation, ...current.filter((item) => item.id !== conversation.id)]);
      setSuggestedUsers((current) => current.filter((item) => item.id !== participant.id));
      setActiveConversationId(conversation.id);
      setMessages(conversation.lastMessage ? [conversation.lastMessage] : []);
      setFeedback(`Conversation with ${getProfileName(participant)} is ready.`);
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || "Unable to start conversation."));
    } finally {
      setBusyUserId(null);
    }
  }

  async function handleSendMessage(event) {
    event.preventDefault();

    const body = draftMessage.trim();

    if (!body || !activeConversationId) return;

    setSending(true);
    setError("");

    try {
      const response = await api.sendConversationMessage(activeConversationId, body);
      const nextMessage = response?.data?.message;

      if (!nextMessage) return;

      setMessages((current) => [...current, nextMessage]);
      setDraftMessage("");
      setConversations((current) => {
        const updated = current.map((conversation) =>
          conversation.id === activeConversationId
            ? {
                ...conversation,
                lastMessage: nextMessage,
                unreadCount: 0,
                status: "Sent just now",
                updatedAt: nextMessage.createdAt,
              }
            : conversation,
        );

        return [...updated].sort(
          (left, right) => new Date(right.updatedAt || 0).getTime() - new Date(left.updatedAt || 0).getTime(),
        );
      });
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || "Unable to send message."));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-full bg-white px-4 pb-24 pt-2 dark:bg-slate100 md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {feedback ? <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{feedback}</div> : null}

        <div className="grid gap-6 lg:grid-cols-[340px,minmax(0,1fr)]">
          <div className="space-y-6">
            <SectionCard title="Inbox">
              {loading ? (
                <p className="text-sm text-slate600 dark:text-slate200">Loading conversations...</p>
              ) : conversations.length ? (
                <div className="space-y-3">
                  {conversations.map((conversation) => (
                    <ConversationRow
                      key={conversation.id}
                      conversation={conversation}
                      active={conversation.id === activeConversationId}
                      onClick={() => setActiveConversationId(conversation.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate600 dark:text-slate200">No conversations yet. Start one from suggested creators.</p>
              )}
            </SectionCard>

            <SectionCard title="Suggested creators">
              {loading ? (
                <p className="text-sm text-slate600 dark:text-slate200">Loading suggestions...</p>
              ) : suggestedUsers.length ? (
                <div className="space-y-3">
                  {suggestedUsers.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[#F5F5F5] px-4 py-3 dark:bg-[#262626]">
                      <div className="flex min-w-0 items-center gap-3">
                        <img src={getProfileAvatar(participant)} alt={getProfileName(participant)} className="h-11 w-11 rounded-full object-cover" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-black dark:text-white">{getProfileName(participant)}</p>
                          <p className="text-xs text-slate600 dark:text-slate200">
                            {participant.isOnline ? "Active now" : "Suggested for new chats"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => startConversation(participant)}
                        disabled={busyUserId === participant.id}
                        className="rounded-full bg-orange100 px-4 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busyUserId === participant.id ? "Opening..." : "Message"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate600 dark:text-slate200">No suggestions right now.</p>
              )}
            </SectionCard>
          </div>

          <section className="flex min-h-[540px] flex-col rounded-3xl bg-white300 p-5 dark:bg-black100 md:p-6">
            {activeConversation ? (
              <>
                <div className="flex items-center gap-3 border-b border-black/8 pb-4 dark:border-white/8">
                  <img
                    src={getProfileAvatar(activeConversation.participant)}
                    alt={getProfileName(activeConversation.participant)}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-medium font-inter text-black dark:text-white">
                      {getProfileName(activeConversation.participant)}
                    </p>
                    <p className="text-sm text-slate600 dark:text-slate200">{activeConversation.status}</p>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto py-5">
                  {loadingMessages ? (
                    <p className="text-sm text-slate600 dark:text-slate200">Loading messages...</p>
                  ) : messages.length ? (
                    messages.map((message) => <MessageBubble key={message.id} message={message} />)
                  ) : (
                    <div className="rounded-3xl bg-[#F5F5F5] px-4 py-6 text-center text-sm text-slate600 dark:bg-[#262626] dark:text-slate200">
                      No messages yet. Say hello to {getProfileName(activeConversation.participant)}.
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="border-t border-black/8 pt-4 dark:border-white/8">
                  <div className="flex items-end gap-3">
                    <textarea
                      value={draftMessage}
                      onChange={(event) => setDraftMessage(event.target.value)}
                      rows={2}
                      placeholder={`Message ${getProfileName(activeConversation.participant)}...`}
                      className="min-h-24 flex-1 resize-none rounded-3xl bg-white px-4 py-3 text-sm text-slate100 outline-none placeholder:text-slate400 dark:bg-[#1E1E1E] dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={sending || !draftMessage.trim()}
                      className="rounded-full bg-orange100 px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sending ? "Sending..." : "Send"}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate500 dark:text-slate200">Signed in as {user?.fullName || "you"}</p>
                </form>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-3xl bg-[#F5F5F5] px-6 text-center text-sm text-slate600 dark:bg-[#262626] dark:text-slate200">
                Select a conversation or start one from the suggested creators list.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}