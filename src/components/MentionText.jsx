import { Fragment } from "react";
import { Link } from "react-router-dom";
import { buildSearchPath } from "../utils/search";
import { normalizeMentionHandle, splitTextWithMentions } from "../utils/mentions";

function getMentionHref(handle, resolveMentionHref) {
  const normalizedHandle = normalizeMentionHandle(handle);
  return resolveMentionHref?.(normalizedHandle) || buildSearchPath(normalizedHandle, "creators");
}

export default function MentionText({ text = "", resolveMentionHref }) {
  if (!text) return null;

  const parts = splitTextWithMentions(text);

  if (!parts.length) return text;

  return parts.map((part, index) => (
    part.type === "mention"
      ? (
        <Link
          key={`${part.raw}-${index}`}
          to={getMentionHref(part.handle, resolveMentionHref)}
          className="font-medium text-orange100 transition-opacity hover:opacity-80"
        >
          {part.raw}
        </Link>
      )
      : <Fragment key={`text-${index}`}>{part.value}</Fragment>
  ));
}