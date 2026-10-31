export function ChangeMark({
  kind,
  className = "ml-2",
}: {
  kind: "new" | "updated";
  className?: string;
}) {
  if (!import.meta.env.DEV) return null;
  return (
    <span
      className={
        (kind === "new"
          ? "inline-block rounded-full border border-accent px-2 py-0.5 align-middle text-[10px] font-semibold tracking-wide text-accent uppercase"
          : "inline-block rounded-full border border-line px-2 py-0.5 align-middle text-[10px] font-semibold tracking-wide text-muted uppercase") +
        (className ? ` ${className}` : "")
      }
    >
      {kind === "new" ? "New" : "Updated"}
    </span>
  );
}

export function ReviewNote() {
  if (!import.meta.env.DEV) return null;
  return (
    <p className="mt-2 text-sm text-muted">
      Review labels only. New means added. Updated means changed.
    </p>
  );
}