import Spinner from "./Spinner";

function joinClassNames(...values) {
  return values.filter(Boolean).join(" ");
}

export default function SectionState({
  title,
  message,
  actionLabel,
  onAction,
  loading = false,
  className = "",
  titleClassName = "",
  messageClassName = "",
  actionClassName = "",
}) {
  const resolvedContainerClassName = joinClassNames(
    "rounded-3xl bg-white300 px-5 py-8 text-center dark:bg-black200",
    className,
  );
  const resolvedTitleClassName = joinClassNames(
    "text-xl font-semibold text-black dark:text-white",
    titleClassName,
  );
  const resolvedMessageClassName = joinClassNames(
    title ? "mt-2 text-sm text-slate600 dark:text-slate200" : "text-sm text-slate600 dark:text-slate200",
    messageClassName,
  );
  const resolvedActionClassName = joinClassNames(
    "mt-4 rounded-full bg-orange100 px-5 py-2 text-sm font-medium text-black",
    actionClassName,
  );

  return (
    <div className={resolvedContainerClassName}>
      {loading ? <Spinner /> : null}
      {!loading && title ? <h2 className={resolvedTitleClassName}>{title}</h2> : null}
      {message ? <p className={resolvedMessageClassName}>{message}</p> : null}
      {onAction ? (
        <button type="button" onClick={onAction} className={resolvedActionClassName}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}