import { useState } from "react";

export default function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${email} to clipboard`}
      className="group flex w-full max-w-[40rem] items-center gap-3 rounded-full border border-line-strong bg-sunk/70 p-2 pl-5 text-left backdrop-blur transition-colors hover:border-signal/60 sm:pl-6"
    >
      <span className="min-w-0 flex-1 truncate py-2 text-[clamp(1rem,2.6vw,1.6rem)] font-semibold tracking-[-0.02em] text-strong">{email}</span>
      <span
        className={`relative inline-flex h-11 w-[7rem] shrink-0 items-center justify-center overflow-hidden rounded-full font-mono text-[11.5px] uppercase tracking-[0.1em] transition-colors ${copied ? "bg-signal text-[#1a0c03]" : "bg-white/5 text-muted group-hover:text-strong"}`}
        aria-live="polite"
      >
        {/* Keyed so the label re-mounts and replays its CSS entrance; Motion is not worth loading for this. */}
        <span key={copied ? "done" : "copy"} className="copy-label">
          {copied ? "Copied ✓" : "Copy"}
        </span>
      </span>
    </button>
  );
}
