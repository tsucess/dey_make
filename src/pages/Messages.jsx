import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { api, firstError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatRelativeTime, getProfileAvatar, getProfileName } from "../utils/content";
import Spinner from "../components/Layout/Spinner";

const INBOX_POLL_INTERVAL_MS = 15000;
const ACTIVE_CONVERSATION_POLL_INTERVAL_MS = 5000;

function isDocumentHidden() {
  return typeof document !== "undefined" && document.visibilityState === "hidden";
}

function mergeMessages(currentMessages, incomingMessages) {
  if (!incomingMessages.length) return currentMessages;

  const messagesById = new Map(currentMessages.map((message) => [message.id, message]));

  incomingMessages.forEach((message) => {
    messagesById.set(message.id, message);
  });

  return [...messagesById.values()].sort(
    (left, right) => new Date(left.createdAt || 0).getTime() - new Date(right.createdAt || 0).getTime(),
  );
}

function getConversationActivityTimestamp(conversation) {
  return new Date(conversation?.lastMessage?.createdAt || conversation?.updatedAt || 0).getTime();
}

function sortConversations(conversations) {
  return [...conversations].sort(
    (left, right) => getConversationActivityTimestamp(right) - getConversationActivityTimestamp(left),
  );
}

function hasNewerLocalSummary(currentConversation, incomingConversation) {
  const currentMessageId = Number(currentConversation?.lastMessage?.id || 0);
  const incomingMessageId = Number(incomingConversation?.lastMessage?.id || 0);

  if (currentMessageId !== incomingMessageId) {
    return currentMessageId > incomingMessageId;
  }

  return getConversationActivityTimestamp(currentConversation) > getConversationActivityTimestamp(incomingConversation);
}

function mergeConversationSummaries(currentConversations, incomingConversations, activeConversationId) {
  const currentById = new Map(currentConversations.map((conversation) => [conversation.id, conversation]));

  return sortConversations(
    incomingConversations.map((incomingConversation) => {
      const currentConversation = currentById.get(incomingConversation.id);
      const shouldPreserveLocalSummary = currentConversation && hasNewerLocalSummary(currentConversation, incomingConversation);

      return {
        ...incomingConversation,
        ...(shouldPreserveLocalSummary
          ? {
              lastMessage: currentConversation.lastMessage ?? incomingConversation.lastMessage,
              updatedAt: currentConversation.updatedAt ?? incomingConversation.updatedAt,
              status: currentConversation.status ?? incomingConversation.status,
            }
          : {}),
        unreadCount: incomingConversation.id === activeConversationId ? 0 : incomingConversation.unreadCount,
      };
    }),
  );
}

function ConversationRow({ conversation, active, onClick }) {
  const { t } = useLanguage();
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
        <span className="text-xs text-slate500 dark:text-slate200">{timestamp ? formatRelativeTime(timestamp) : t("content.justNow")}</span>
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
  const { t } = useLanguage();
  const { user } = useAuth();
  const isMountedRef = useRef(false);
  const activeConversationIdRef = useRef(null);
  const conversationsRef = useRef([]);
  const messagesRef = useRef([]);
  const [conversations, setConversations] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draftMessage, setDraftMessage] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [busyUserId, setBusyUserId] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) || null,
    [activeConversationId, conversations],
  );

  const suggestedCreators = useMemo(() => {
    const interactedCreatorIds = new Set(
      conversations
        .map((conversation) => conversation.participant?.id)
        .filter((participantId) => participantId != null),
    );

    return suggestedUsers.filter((participant) => !interactedCreatorIds.has(participant.id));
  }, [conversations, suggestedUsers]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    messagesRef.current = [];
  }, [activeConversationId]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadInbox = useCallback(async ({ silent = false, includeSuggested = true } = {}) => {
    if (!silent) {
      setLoadingConversations(true);
      if (includeSuggested) setLoadingSuggestions(true);
      setError("");
    }

    const requests = [
      api.getConversations()
        .then((response) => {
          if (!isMountedRef.current) return;

          const currentActiveConversationId = activeConversationIdRef.current;
          const nextConversations = mergeConversationSummaries(
            conversationsRef.current,
            response?.data?.conversations || [],
            currentActiveConversationId,
          );

          setConversations(nextConversations);
          setActiveConversationId((current) =>
            nextConversations.some((conversation) => conversation.id === current)
              ? current
              : nextConversations[0]?.id || null,
          );
        })
        .catch((nextError) => {
          if (!silent && isMountedRef.current) {
            setError((current) => current || firstError(nextError?.errors, nextError?.message || t("messages.unableToLoadInbox")));
          }
        })
        .finally(() => {
          if (!silent && isMountedRef.current) setLoadingConversations(false);
        }),
    ];

    if (includeSuggested) {
      requests.push(
        api.getSuggestedUsers()
          .then((response) => {
            if (!isMountedRef.current) return;
            setSuggestedUsers(response?.data?.users || []);
          })
          .catch((nextError) => {
            if (!silent && isMountedRef.current) {
              setError((current) => current || firstError(nextError?.errors, nextError?.message || t("messages.unableToLoadSuggestions")));
            }
          })
          .finally(() => {
            if (!silent && isMountedRef.current) setLoadingSuggestions(false);
          }),
      );
    }

    await Promise.allSettled(requests);
  }, [t]);

  const loadConversationMessages = useCallback(async (conversationId, { silent = false, after } = {}) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    if (!silent) setLoadingMessages(true);

    try {
      const response = await api.getConversationMessages(conversationId, { after });

      if (!isMountedRef.current || activeConversationIdRef.current !== conversationId) return;

      const nextMessages = response?.data?.messages || [];
      const latestMessage = nextMessages[nextMessages.length - 1] || null;

      setMessages((current) => (after ? mergeMessages(current, nextMessages) : nextMessages));
      setConversations((current) =>
        sortConversations(
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
        ),
      );

      if (!after || nextMessages.some((message) => !message.isMine)) {
        api.markConversationRead(conversationId).catch(() => {});
      }
    } catch (nextError) {
      if (!silent && isMountedRef.current) {
        setError(firstError(nextError?.errors, nextError?.message || t("messages.unableToLoadConversation")));
      }
    } finally {
      if (!silent && isMountedRef.current) setLoadingMessages(false);
    }
  }, [t]);

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
      if (polling || !isMountedRef.current || isDocumentHidden()) return;

      polling = true;

      try {
        await loadInbox({ silent: true, includeSuggested: false });
      } finally {
        polling = false;
      }
    }, INBOX_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [loadInbox]);

  useEffect(() => {
    if (!activeConversationId) return undefined;

    let polling = false;

    const intervalId = window.setInterval(async () => {
      const currentConversationId = activeConversationIdRef.current;
      const lastMessageId = messagesRef.current[messagesRef.current.length - 1]?.id;

      if (polling || !isMountedRef.current || !currentConversationId || isDocumentHidden()) return;

      polling = true;

      try {
        await loadConversationMessages(currentConversationId, {
          silent: true,
          after: lastMessageId,
        });
      } finally {
        polling = false;
      }
    }, ACTIVE_CONVERSATION_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [activeConversationId, loadConversationMessages]);

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
      setFeedback(t("messages.conversationReady", { name: getProfileName(participant) }));
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || t("messages.unableToStartConversation")));
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

      setMessages((current) => mergeMessages(current, [nextMessage]));
      setDraftMessage("");
      setConversations((current) => {
        const updated = current.map((conversation) =>
          conversation.id === activeConversationId
            ? {
                ...conversation,
                lastMessage: nextMessage,
                unreadCount: 0,
                status: t("messages.sentJustNow"),
                updatedAt: nextMessage.createdAt,
              }
            : conversation,
        );

        return [...updated].sort(
          (left, right) => new Date(right.updatedAt || 0).getTime() - new Date(left.updatedAt || 0).getTime(),
        );
      });
    } catch (nextError) {
      setError(firstError(nextError.errors, nextError.message || t("messages.unableToSendMessage")));
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
            <SectionCard title={t("messages.inbox")}>
              {loadingConversations ? (
                <div className="text-sm text-slate600 dark:text-slate200"><Spinner/></div>
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
                <p className="text-sm text-slate600 dark:text-slate200">{t("messages.noConversations")}</p>
              )}
            </SectionCard>

            <SectionCard title={t("messages.suggestedCreators")}>
              {loadingSuggestions ? (
                <div className="text-sm text-slate600 dark:text-slate200"><Spinner/></div>
              ) : suggestedCreators.length ? (
                <div className="space-y-3">
                  {suggestedCreators.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[#F5F5F5] px-4 py-3 dark:bg-[#262626]">
                      <div className="flex min-w-0 items-center gap-3">
                        <img src={getProfileAvatar(participant)} alt={getProfileName(participant)} className="h-11 w-11 rounded-full object-cover" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-black dark:text-white">{getProfileName(participant)}</p>
                          <p className="text-xs text-slate600 dark:text-slate200">
                            {participant.isOnline ? t("messages.activeNow") : t("messages.suggestedForNewChats")}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => startConversation(participant)}
                        disabled={busyUserId === participant.id}
                        className="rounded-full bg-orange100 px-4 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busyUserId === participant.id ? t("messages.opening") : t("messages.messageAction")}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate600 dark:text-slate200">{t("messages.noSuggestions")}</p>
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
                    <p className="text-sm text-slate600 dark:text-slate200">{t("messages.loadingMessages")}</p>
                  ) : messages.length ? (
                    messages.map((message) => <MessageBubble key={message.id} message={message} />)
                  ) : (
                    <div className="rounded-3xl bg-[#F5F5F5] px-4 py-6 text-center text-sm text-slate600 dark:bg-[#262626] dark:text-slate200">
                      {t("messages.noMessagesYet", { name: getProfileName(activeConversation.participant) })}
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="border-t border-black/8 pt-4 dark:border-white/8">
                  <div className="flex items-end gap-3">
                    <textarea
                      value={draftMessage}
                      onChange={(event) => setDraftMessage(event.target.value)}
                      rows={2}
                      placeholder={t("messages.messagePlaceholder", { name: getProfileName(activeConversation.participant) })}
                      className="min-h-24 flex-1 resize-none rounded-3xl bg-white px-4 py-3 text-sm text-slate100 outline-none placeholder:text-slate400 dark:bg-[#1E1E1E] dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={sending || !draftMessage.trim()}
                      className="rounded-full bg-orange100 px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sending ? t("messages.sending") : t("messages.send")}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate500 dark:text-slate200">{t("messages.signedInAs", { name: user?.fullName || t("messages.you") })}</p>
                </form>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-3xl bg-[#F5F5F5] px-6 text-center text-sm text-slate600 dark:bg-[#262626] dark:text-slate200">
                {t("messages.selectConversation")}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}