import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { api, firstError } from "../services/api";
import { joinPresenceChannel, subscribeToPrivateChannel } from "../services/realtime";
import { useAuth } from "../context/AuthContext";
import { formatRelativeTime, getProfileAvatar, getProfileName } from "../utils/content";
import Spinner from "../components/Layout/Spinner";
import { HiOutlineSearch, HiOutlineChevronDown, HiOutlinePaperClip, HiOutlineEmojiHappy, HiOutlinePaperAirplane } from "react-icons/hi";

const INBOX_POLL_INTERVAL_MS = 15000;
const ACTIVE_CONVERSATION_POLL_INTERVAL_MS = 5000;
const TYPING_IDLE_MS = 1400;

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

function buildConversationStatus(conversation, t) {
  if (conversation?.participant?.isOnline) return t("messages.activeNow");
  if (conversation?.lastMessage?.createdAt) return `${t("messages.sentPrefix")} ${formatRelativeTime(conversation.lastMessage.createdAt)}`;
  return conversation?.status || t("messages.noMessagesYetStatus");
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

function ConversationRow({ conversation, active, typingParticipant, onClick }) {
  const { t } = useLanguage();
  const participant = conversation.participant;
  const preview = typingParticipant ? t("messages.typingPreview") : (conversation.lastMessage?.body || buildConversationStatus(conversation, t));
  const timestamp = conversation.lastMessage?.createdAt || conversation.updatedAt;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-4 rounded-xl px-4 py-3.5 text-left transition-colors ${
        active
          ? "bg-white text-black"
          : "bg-transparent hover:bg-black/5 dark:hover:bg-white/5"
      }`}
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="relative flex shrink-0">
          <img src={getProfileAvatar(participant)} alt={getProfileName(participant)} className="h-12 w-12 rounded-full object-cover" />
          {participant?.isOnline ? (
            <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-[#00BA88] dark:border-black" />
          ) : null}
        </div>
        <div className="min-w-0">
          <p className={`truncate text-[15px] font-semibold font-inter ${active ? "text-black" : "text-black dark:text-white"}`}>
            {getProfileName(participant)}
          </p>
          <p className={`mt-0.5 line-clamp-1 text-[13px] ${active ? "text-slate600" : "text-slate400"}`}>
            {preview}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between h-10">
        <span className={`text-[10px] font-medium ${active ? "text-slate500" : "text-orange100"}`}>
          {timestamp ? new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : t("content.justNow")}
        </span>
        {conversation.unreadCount ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange100 text-[10px] font-bold text-black mt-1">
            {conversation.unreadCount}
          </span>
        ) : conversation.lastMessage?.isMine ? (
           <svg viewBox="0 0 24 24" fill="currentColor" className={`w-3.5 h-3.5 mt-1 ${active ? "text-slate400" : "text-slate500"}`}><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h4v6h2v-6h4v-2l-2-2z"/></svg>
        ) : <div className="h-5 w-5 mt-1"></div>}
      </div>
    </button>
  );
}

function MessageBubble({ message }) {
  const attachment = message.attachment;
  const isImage = attachment && (attachment.type === "image" || attachment.type === "gif" || (attachment.mime || "").startsWith("image/"));
  const isVideo = attachment && (attachment.type === "video" || (attachment.mime || "").startsWith("video/"));

  return (
    <div className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] px-5 py-3.5 relative ${
          message.isMine
            ? "bg-[#EADDCB] text-black rounded-[1.25rem] rounded-br-sm"
            : "bg-[#F3F3F3] dark:bg-white text-black rounded-[1.25rem] rounded-bl-sm"
        }`}
      >
        {attachment ? (
          isImage ? (
            <a href={attachment.url} target="_blank" rel="noreferrer" className="block mb-2">
              <img src={attachment.url} alt={attachment.name || ""} className="rounded-lg max-h-64 object-cover" />
            </a>
          ) : isVideo ? (
            <video src={attachment.url} controls className="rounded-lg max-h-64 mb-2" />
          ) : (
            <a href={attachment.url} target="_blank" rel="noreferrer" className="mb-2 flex items-center gap-2 rounded-lg bg-black/5 px-3 py-2 text-[13px] font-medium text-black hover:bg-black/10 transition-colors">
              <HiOutlinePaperClip className="h-4 w-4 -rotate-45" />
              <span className="truncate">{attachment.name || "attachment"}</span>
            </a>
          )
        ) : null}
        {message.body ? (
          <p className="text-[14px] font-inter leading-relaxed">{message.body}</p>
        ) : null}
        <p className={`mt-1 text-right text-[10px] font-medium ${message.isMine ? "text-black/50" : "text-black/40"}`}>
          {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </p>
      </div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <section className="space-y-4 rounded-3xl bg-white300 px-5 py-5 dark:bg-black100 md:px-4 md:py-6">
      <h2 className="text-lg font-medium font-bricolage text-black dark:text-white md:text-2xl">{title}</h2>
      {children}
    </section>
  );
}

const EMOJI_CATEGORIES = {
  smileys: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮"],
  gestures: ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👋", "🤚", "🖐️", "✋", "🖖", "👏", "🙌", "🤝", "🙏", "💪", "🦾", "🖖", "✍️", "🤳", "💅", "🤲"],
  hearts: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "♥️", "💌", "💋"],
  objects: ["🔥", "✨", "🎉", "🎊", "🎁", "🎂", "🍰", "🍕", "🍔", "🍟", "☕", "🍺", "🍻", "🥂", "🍷", "🎵", "🎶", "🎸", "🎤", "📱", "💻", "⌚", "📷", "🚀", "🌟", "⭐", "🌈", "☀️", "🌙", "⚡", "💯", "✅", "❌", "⚠️", "❓", "❗"],
};

function isSameCalendarDay(left, right) {
  return (
    left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate()
  );
}

function formatDayDivider(dateValue, t) {
  const messageDate = new Date(dateValue);
  if (Number.isNaN(messageDate.getTime())) return "";

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameCalendarDay(messageDate, now)) return t("messages.todayLabel");
  if (isSameCalendarDay(messageDate, yesterday)) return t("messages.yesterdayLabel");

  return messageDate.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
}

function groupMessagesByDay(messages, t) {
  const groups = [];
  let currentKey = null;

  messages.forEach((message) => {
    const timestamp = message.createdAt ? new Date(message.createdAt) : null;
    const key = timestamp && !Number.isNaN(timestamp.getTime())
      ? `${timestamp.getFullYear()}-${timestamp.getMonth()}-${timestamp.getDate()}`
      : "unknown";

    if (key !== currentKey) {
      groups.push({ key, label: timestamp ? formatDayDivider(timestamp, t) : "", messages: [] });
      currentKey = key;
    }

    groups[groups.length - 1].messages.push(message);
  });

  return groups;
}

export default function Messages() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isMountedRef = useRef(false);
  const activeConversationIdRef = useRef(null);
  const conversationsRef = useRef([]);
  const messagesRef = useRef([]);
  const presenceChannelsRef = useRef({});
  const localTypingConversationIdRef = useRef(null);
  const localTypingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const emojiPopoverRef = useRef(null);
  const fileInputRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draftMessage, setDraftMessage] = useState("");
  const [typingParticipantsByConversation, setTypingParticipantsByConversation] = useState({});
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [busyUserId, setBusyUserId] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [chatSearchOpen, setChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [emojiCategory, setEmojiCategory] = useState("smileys");

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) || null,
    [activeConversationId, conversations],
  );

  const activeTypingParticipant = activeConversationId ? typingParticipantsByConversation[activeConversationId] || null : null;

  const suggestedCreators = useMemo(() => {
    const interactedCreatorIds = new Set(
      conversations
        .map((conversation) => conversation.participant?.id)
        .filter((participantId) => participantId != null),
    );

    return suggestedUsers.filter((participant) => !interactedCreatorIds.has(participant.id));
  }, [conversations, suggestedUsers]);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const filteredConversations = useMemo(() => {
    if (!normalizedSearchQuery) return conversations;

    return conversations.filter((conversation) => {
      const participant = conversation.participant;
      const nameMatch = (getProfileName(participant) || "").toLowerCase().includes(normalizedSearchQuery);
      const usernameMatch = (participant?.username || "").toLowerCase().includes(normalizedSearchQuery);
      const lastMessageMatch = (conversation.lastMessage?.body || "").toLowerCase().includes(normalizedSearchQuery);
      return nameMatch || usernameMatch || lastMessageMatch;
    });
  }, [conversations, normalizedSearchQuery]);

  const filteredSuggestedCreators = useMemo(() => {
    if (!normalizedSearchQuery) return suggestedCreators;

    return suggestedCreators.filter((participant) => {
      const nameMatch = (getProfileName(participant) || "").toLowerCase().includes(normalizedSearchQuery);
      const usernameMatch = (participant?.username || "").toLowerCase().includes(normalizedSearchQuery);
      return nameMatch || usernameMatch;
    });
  }, [normalizedSearchQuery, suggestedCreators]);

  const groupedMessages = useMemo(() => groupMessagesByDay(messages, t), [messages, t]);

  const normalizedChatSearchQuery = chatSearchQuery.trim().toLowerCase();

  const filteredGroupedMessages = useMemo(() => {
    if (!normalizedChatSearchQuery) return groupedMessages;
    return groupedMessages
      .map((group) => ({
        ...group,
        messages: group.messages.filter((message) =>
          (message.body || "").toLowerCase().includes(normalizedChatSearchQuery)
          || (message.attachment?.name || "").toLowerCase().includes(normalizedChatSearchQuery),
        ),
      }))
      .filter((group) => group.messages.length > 0);
  }, [groupedMessages, normalizedChatSearchQuery]);

  const conversationSubscriptionKey = useMemo(
    () => [...new Set(conversations.map((conversation) => `${conversation.id || ""}`.trim()).filter(Boolean))].sort().join(":"),
    [conversations],
  );

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
    setChatSearchOpen(false);
    setChatSearchQuery("");
  }, [activeConversationId]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      if (localTypingTimeoutRef.current) window.clearTimeout(localTypingTimeoutRef.current);
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const node = messagesEndRef.current;
    if (!node || typeof node.scrollIntoView !== "function") return;
    node.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, activeTypingParticipant]);

  useEffect(() => {
    if (!emojiPickerOpen) return undefined;

    function handleOutsideClick(event) {
      if (emojiPopoverRef.current && !emojiPopoverRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [emojiPickerOpen]);

  const updateParticipantPresence = useCallback((conversationId, participantId, isOnline) => {
    if (!participantId) return;

    setConversations((current) => current.map((conversation) => {
      if (Number(conversation.id || 0) !== Number(conversationId || 0)) return conversation;
      if (Number(conversation.participant?.id || 0) !== Number(participantId || 0)) return conversation;
      if (Boolean(conversation.participant?.isOnline) === Boolean(isOnline)) return conversation;

      return {
        ...conversation,
        participant: {
          ...conversation.participant,
          isOnline: Boolean(isOnline),
        },
      };
    }));

    setSuggestedUsers((current) => current.map((participant) => (
      Number(participant.id || 0) === Number(participantId || 0)
        ? { ...participant, isOnline: Boolean(isOnline) }
        : participant
    )));
  }, []);

  const syncPresenceMembers = useCallback((conversationId, members = []) => {
    const onlineIds = new Set((members || []).map((member) => Number(member?.id || 0)).filter(Boolean));

    setConversations((current) => current.map((conversation) => {
      if (Number(conversation.id || 0) !== Number(conversationId || 0) || !conversation.participant?.id) return conversation;

      const nextOnline = onlineIds.has(Number(conversation.participant.id || 0));
      if (Boolean(conversation.participant?.isOnline) === nextOnline) return conversation;

      return {
        ...conversation,
        participant: {
          ...conversation.participant,
          isOnline: nextOnline,
        },
      };
    }));
  }, []);

  const clearConversationTyping = useCallback((conversationId, participantId = null) => {
    setTypingParticipantsByConversation((current) => {
      const existingParticipant = current[conversationId];
      if (!existingParticipant) return current;
      if (participantId && Number(existingParticipant.id || 0) !== Number(participantId || 0)) return current;

      const next = { ...current };
      delete next[conversationId];
      return next;
    });
  }, []);

  const sendLocalTypingWhisper = useCallback((conversationId, typing) => {
    const channelHandle = presenceChannelsRef.current[conversationId];
    if (!channelHandle || !conversationId || !user?.id) return;

    channelHandle.whisper("typing", {
      conversationId,
      userId: user.id,
      typing,
      participant: {
        id: user.id,
        fullName: user.fullName,
        username: user.username || null,
        avatarUrl: user.avatarUrl || "",
      },
    });

    localTypingConversationIdRef.current = typing ? conversationId : null;
  }, [user?.avatarUrl, user?.fullName, user?.id, user?.username]);

  const stopLocalTyping = useCallback((conversationId = localTypingConversationIdRef.current) => {
    if (localTypingTimeoutRef.current) {
      window.clearTimeout(localTypingTimeoutRef.current);
      localTypingTimeoutRef.current = null;
    }

    if (!conversationId) return;

    sendLocalTypingWhisper(conversationId, false);
  }, [sendLocalTypingWhisper]);

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

  const handleRealtimeMessage = useCallback((conversationId, message) => {
    if (!conversationId || !message?.id) return;

    const normalizedMessage = {
      ...message,
      isMine: Number(message?.sender?.id || 0) === Number(user?.id || 0),
    };
    const isActiveConversation = Number(activeConversationIdRef.current || 0) === Number(conversationId || 0);

    if (isActiveConversation) {
      setMessages((current) => mergeMessages(current, [normalizedMessage]));
    }

    setConversations((current) =>
      sortConversations(
        current.map((conversation) => {
          if (Number(conversation.id || 0) !== Number(conversationId || 0)) return conversation;

          const isDuplicateLastMessage = Number(conversation.lastMessage?.id || 0) === Number(normalizedMessage.id || 0);

          return {
            ...conversation,
            lastMessage: normalizedMessage,
            unreadCount: isActiveConversation || normalizedMessage.isMine
              ? 0
              : (isDuplicateLastMessage ? conversation.unreadCount : Number(conversation.unreadCount || 0) + 1),
            status: conversation.participant?.isOnline ? t("messages.activeNow") : t("messages.sentJustNow"),
            updatedAt: normalizedMessage.createdAt || conversation.updatedAt,
          };
        }),
      ),
    );

    if (isActiveConversation && !normalizedMessage.isMine) {
      api.markConversationRead(conversationId).catch(() => {});
    }
    if (!normalizedMessage.isMine) clearConversationTyping(conversationId, message?.sender?.id);
  }, [clearConversationTyping, t, user?.id]);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  useEffect(() => {
    if (!user?.id || !conversationSubscriptionKey) return undefined;

    const subscriptionHandles = conversationSubscriptionKey
      .split(":")
      .filter(Boolean)
      .map((conversationId) => {
        const messageUnsubscribe = subscribeToPrivateChannel(`conversations.${conversationId}`, {
          ".conversation.message.created": (event) => {
            if (`${event?.conversationId || ""}` !== conversationId || !event?.message) return;
            handleRealtimeMessage(event.conversationId, event.message);
          },
        });

        const presenceChannel = joinPresenceChannel(`conversation-presence.${conversationId}`, {
          here: (members) => syncPresenceMembers(conversationId, members),
          joining: (member) => updateParticipantPresence(conversationId, member?.id, true),
          leaving: (member) => {
            updateParticipantPresence(conversationId, member?.id, false);
            clearConversationTyping(conversationId, member?.id);
          },
          whispers: {
            typing: (payload) => {
              if (
                Number(payload?.conversationId || 0) !== Number(conversationId || 0)
                || Number(payload?.userId || 0) === Number(user?.id || 0)
              ) {
                return;
              }

              if (!payload?.typing) {
                clearConversationTyping(conversationId, payload?.userId);
                return;
              }

              setTypingParticipantsByConversation((current) => ({
                ...current,
                [conversationId]: payload?.participant || conversationsRef.current.find((conversation) => Number(conversation.id || 0) === Number(conversationId || 0))?.participant,
              }));
            },
          },
        });

        presenceChannelsRef.current[conversationId] = presenceChannel;

        return () => {
          if (localTypingConversationIdRef.current === conversationId) {
            stopLocalTyping(conversationId);
          }

          delete presenceChannelsRef.current[conversationId];
          messageUnsubscribe?.();
          presenceChannel.unsubscribe?.();
        };
      });

    return () => {
      subscriptionHandles.forEach((unsubscribe) => unsubscribe?.());
    };
  }, [clearConversationTyping, conversationSubscriptionKey, handleRealtimeMessage, stopLocalTyping, syncPresenceMembers, updateParticipantPresence, user?.id]);

  useEffect(() => () => stopLocalTyping(), [stopLocalTyping]);

  useEffect(() => {
    if (!activeConversationId || !user?.id) {
      stopLocalTyping();
      return undefined;
    }

    const nextDraft = draftMessage.trim();

    if (!nextDraft) {
      if (localTypingConversationIdRef.current === activeConversationId) stopLocalTyping(activeConversationId);
      return undefined;
    }

    if (localTypingConversationIdRef.current !== activeConversationId) {
      if (localTypingConversationIdRef.current) stopLocalTyping(localTypingConversationIdRef.current);
      sendLocalTypingWhisper(activeConversationId, true);
    }

    if (localTypingTimeoutRef.current) window.clearTimeout(localTypingTimeoutRef.current);
    localTypingTimeoutRef.current = window.setTimeout(() => {
      stopLocalTyping(activeConversationId);
    }, TYPING_IDLE_MS);

    return undefined;
  }, [activeConversationId, draftMessage, sendLocalTypingWhisper, stopLocalTyping, user?.id]);

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
    stopLocalTyping(activeConversationId);

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

  async function handleAttachmentPick(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !activeConversationId) return;

    setUploadingAttachment(true);
    setError("");
    setFeedback(t("messages.attachmentUploading"));

    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadResponse = await api.uploadFile(formData);
      const upload = uploadResponse?.data?.upload;
      if (!upload) throw new Error(t("messages.attachmentUploadFailed"));

      const attachmentUrl = upload.processedUrl || upload.url || upload.path;
      const attachmentType = upload.type || (file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file");

      const sendResponse = await api.sendConversationMessage(activeConversationId, {
        body: draftMessage.trim(),
        attachmentUrl,
        attachmentType,
        attachmentName: file.name,
        attachmentMime: file.type || null,
        attachmentSize: file.size || null,
      });

      const nextMessage = sendResponse?.data?.message;
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
      setFeedback("");
    } catch (nextError) {
      setFeedback("");
      setError(firstError(nextError?.errors, nextError?.message || t("messages.attachmentUploadFailed")));
    } finally {
      setUploadingAttachment(false);
    }
  }

  return (
    <div className="min-h-full bg-white dark:bg-black300 text-slate-900 dark:text-white">
      <div className="mx-auto w-full max-w-7xl h-screen md:h-[calc(100vh-34px)] flex flex-col">
        {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 m-4 shrink-0">{error}</div> : null}
        {feedback ? <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700 m-4 shrink-0">{feedback}</div> : null}

        <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] flex-1 overflow-hidden">
          <div className="flex flex-col border-r border-black/10 dark:border-white/5 pt-6 pl-4 pr-2 overflow-hidden">
            <div className="mb-6 px-2 shrink-0">
              <div className="flex items-center gap-3 rounded-2xl bg-[#F5F5F5] dark:bg-[#2A2A2A] px-4 py-3">
                <HiOutlineSearch className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t("messages.searchPlaceholder")}
                  className="bg-transparent text-[15px] text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 outline-none w-full"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 space-y-1">
              <section>
                <h3 className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  {t("messages.inbox")}
                </h3>
                {loadingConversations ? (
                  <div className="text-sm text-slate-500 dark:text-slate-400"><Spinner/></div>
                ) : filteredConversations.length ? (
                  filteredConversations.map((conversation) => (
                    <ConversationRow
                      key={conversation.id}
                      conversation={conversation}
                      typingParticipant={typingParticipantsByConversation[conversation.id] || null}
                      active={conversation.id === activeConversationId}
                      onClick={() => setActiveConversationId(conversation.id)}
                    />
                  ))
                ) : (
                  <p className="px-4 text-sm text-slate-500 dark:text-slate-400">
                    {normalizedSearchQuery && conversations.length
                      ? t("messages.searchNoResults")
                      : t("messages.noConversations")}
                  </p>
                )}
              </section>

              <section className="mt-8">
                <h3 className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  {t("messages.suggestedCreators")}
                </h3>
                {loadingSuggestions ? (
                  <div className="px-4 text-sm text-slate-500 dark:text-slate-400"><Spinner/></div>
                ) : filteredSuggestedCreators.length ? (
                  <div className="space-y-1">
                    {filteredSuggestedCreators.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <div className="flex min-w-0 items-center gap-3">
                          <img src={getProfileAvatar(participant)} alt={getProfileName(participant)} className="h-10 w-10 rounded-full object-cover" />
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-medium text-slate-900 dark:text-white">{getProfileName(participant)}</p>
                            <p className="text-[12px] text-slate-500 dark:text-slate-400">
                              {participant.isOnline ? t("messages.activeNow") : t("messages.suggestedForNewChats")}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => startConversation(participant)}
                          disabled={busyUserId === participant.id}
                          className="rounded-full bg-slate-200 dark:bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
                        >
                          {busyUserId === participant.id ? t("messages.opening") : t("messages.messageAction")}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="px-4 text-sm text-slate-500 dark:text-slate-400">{t("messages.noSuggestions")}</p>
                )}
              </section>
            </div>
          </div>

          <section className="flex flex-col bg-white dark:bg-transparent overflow-hidden px-4 md:px-8 pt-6 pb-4">
            {activeConversation ? (
              <>
                <div className="flex items-center justify-between border-b border-black/10 dark:border-white/5 pb-5 shrink-0">
                  <div className="flex items-center gap-3">
                    <img
                      src={getProfileAvatar(activeConversation.participant)}
                      alt={getProfileName(activeConversation.participant)}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold font-inter text-slate-900 dark:text-white">
                        {getProfileName(activeConversation.participant)}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`h-2 w-2 rounded-full ${activeConversation.participant?.isOnline ? "bg-[#00BA88]" : "bg-slate-400"}`}></span>
                        <span className="text-[13px] text-slate-500 dark:text-slate-400">
                          {activeConversation.participant?.isOnline ? t("messages.online") : t("messages.offline")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 text-slate-500 dark:text-slate-400">
                    <HiOutlineSearch
                      className="h-5 w-5 cursor-pointer hover:text-slate-700 dark:hover:text-white transition-colors"
                      onClick={() => setChatSearchOpen((current) => !current)}
                    />
                    <HiOutlineChevronDown className="h-5 w-5 cursor-pointer hover:text-slate-700 dark:hover:text-white transition-colors" />
                  </div>
                </div>

                {chatSearchOpen ? (
                  <div className="mt-3 flex items-center gap-2 rounded-2xl bg-[#F5F5F5] dark:bg-[#2A2A2A] px-4 py-2 shrink-0">
                    <HiOutlineSearch className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <input
                      autoFocus
                      type="text"
                      value={chatSearchQuery}
                      onChange={(event) => setChatSearchQuery(event.target.value)}
                      placeholder={t("messages.chatSearchPlaceholder")}
                      className="bg-transparent text-[14px] text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 outline-none w-full"
                    />
                    {chatSearchQuery ? (
                      <button
                        type="button"
                        onClick={() => setChatSearchQuery("")}
                        className="text-[12px] text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      >
                        ×
                      </button>
                    ) : null}
                  </div>
                ) : null}

                <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-2">
                  {loadingMessages ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">{t("messages.loadingMessages")}</p>
                  ) : messages.length ? (
                    filteredGroupedMessages.length ? (
                      filteredGroupedMessages.map((group) => (
                        <div key={group.key} className="space-y-4">
                          {group.label ? (
                            <div className="flex justify-center mb-6">
                              <span className="rounded bg-slate-100 dark:bg-white text-slate-900 px-3 py-1 text-[11px] font-bold tracking-wider uppercase">
                                {group.label}
                              </span>
                            </div>
                          ) : null}
                          {group.messages.map((message) => <MessageBubble key={message.id} message={message} />)}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-10">
                        {t("messages.chatSearchNoMatches")}
                      </div>
                    )
                  ) : (
                    <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-10">
                      {t("messages.noMessagesYet", { name: getProfileName(activeConversation.participant) })}
                    </div>
                  )}
                  {activeTypingParticipant ? (
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 italic">
                      {t("messages.typingStatus", { name: getProfileName(activeTypingParticipant) })}
                    </p>
                  ) : null}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="pt-2 shrink-0">
                  <div className="relative flex items-center gap-3 rounded-2xl bg-[#F5F5F5] dark:bg-[#2A2A2A] p-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleAttachmentPick}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAttachment}
                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors disabled:opacity-60"
                    >
                      <HiOutlinePaperClip className="h-6 w-6 transform -rotate-45" />
                    </button>
                    <textarea
                      value={draftMessage}
                      onChange={(event) => setDraftMessage(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          if (!sending && draftMessage.trim()) handleSendMessage(event);
                        }
                      }}
                      rows={1}
                      placeholder={t("messages.messagePlaceholder", { name: getProfileName(activeConversation.participant) })}
                      className="min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] text-slate-900 dark:text-white outline-none"
                    />
                    <div ref={emojiPopoverRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setEmojiPickerOpen((current) => !current)}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                      >
                        <HiOutlineEmojiHappy className="h-6 w-6" />
                      </button>
                      {emojiPickerOpen ? (
                        <div className="absolute bottom-full right-0 mb-2 w-72 rounded-2xl bg-white dark:bg-[#1F1F1F] p-2 shadow-lg ring-1 ring-black/5 z-10">
                          <div className="flex items-center gap-1 border-b border-black/5 dark:border-white/5 pb-2 mb-2">
                            {Object.keys(EMOJI_CATEGORIES).map((category) => (
                              <button
                                key={category}
                                type="button"
                                onClick={() => setEmojiCategory(category)}
                                className={`flex-1 rounded-lg px-2 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                                  emojiCategory === category
                                    ? "bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white"
                                    : "text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
                                }`}
                              >
                                {t(`messages.emojiCategory${category.charAt(0).toUpperCase()}${category.slice(1)}`)}
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                            {EMOJI_CATEGORIES[emojiCategory].map((emoji, index) => (
                              <button
                                key={`${emoji}-${index}`}
                                type="button"
                                onClick={() => {
                                  setDraftMessage((current) => `${current}${emoji}`);
                                }}
                                className="rounded-lg px-2 py-1 text-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <button
                      type="submit"
                      disabled={sending || !draftMessage.trim()}
                      className="flex items-center gap-2 rounded-full bg-orange100 px-5 py-2.5 text-[15px] font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60 transition-opacity hover:opacity-90"
                    >
                      <span>{sending ? t("messages.sending") : t("messages.send")}</span>
                      <HiOutlinePaperAirplane className="h-5 w-5 transform rotate-45" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                {t("messages.selectConversation")}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}