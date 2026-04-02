export const MENTION_RENDER_REGEX = /([@#])([a-zA-Z0-9._]{3,30})/g;

const ACTIVE_MENTION_LEFT_REGEX = /(^|[\s([{>])([@#])([a-zA-Z0-9._]{0,30})$/;
const ACTIVE_MENTION_RIGHT_REGEX = /^([a-zA-Z0-9._]{0,30})/;

export function normalizeMentionHandle(value) {
  return `${value || ""}`.trim().toLowerCase();
}

export function splitTextWithMentions(text = "") {
  if (!text) return [];

  const parts = [];
  let lastIndex = 0;

  for (const match of text.matchAll(MENTION_RENDER_REGEX)) {
    const index = match.index ?? 0;
    const raw = match[0] || "";

    if (index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, index) });
    }

    parts.push({
      type: "mention",
      raw,
      prefix: match[1] || "@",
      handle: normalizeMentionHandle(match[2]),
    });

    lastIndex = index + raw.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts;
}

export function getActiveMentionCandidate(text = "", cursorIndex = text.length) {
  if (typeof text !== "string") return null;

  const safeCursorIndex = Math.max(0, Math.min(cursorIndex, text.length));
  const leftText = text.slice(0, safeCursorIndex);
  const rightText = text.slice(safeCursorIndex);
  const leftMatch = ACTIVE_MENTION_LEFT_REGEX.exec(leftText);

  if (!leftMatch) return null;

  const leftHandle = leftMatch[3] || "";
  const rightHandle = ACTIVE_MENTION_RIGHT_REGEX.exec(rightText)?.[1] || "";

  return {
    prefix: leftMatch[2] || "@",
    query: normalizeMentionHandle(`${leftHandle}${rightHandle}`),
    start: safeCursorIndex - leftHandle.length - 1,
    end: safeCursorIndex + rightHandle.length,
  };
}