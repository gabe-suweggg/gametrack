import { Link, createFileRoute } from "@tanstack/react-router";
import { previewPathPrefix } from "@/lib/preview-path-prefix";

export const Route = createFileRoute("/first")({
  component: FirstVersion,
});

function firstHtmlSrc() {
  if (typeof window === "undefined") return "/first.html";
  const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
  return `${prefix ?? ""}/first.html`;
}

function FirstVersion() {
  return (
    <div className="flex h-screen flex-col bg-bg text-fg">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="text-sm text-muted">First version · the single monitor page</p>
        <Link to="/" search={{ loc: "ca" }} className="text-sm text-accent">
          Back to current
        </Link>
      </div>
      <iframe title="GameTrack first version" src={firstHtmlSrc()} className="min-h-0 w-full flex-1 border-0" />
    </div>
  );
}
