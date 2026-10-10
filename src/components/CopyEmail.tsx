import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { MotionRoot, EASE } from "../lib/motion";

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
    <MotionRoot>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${email} to clipboard`}
        className="group flex w-full max-w-[40rem] items-center gap-3 rounded-full border border-line-strong bg-sunk/70 p-2 pl-5 text-left backdrop-blur transition-colors hover:border-signal/60 sm:pl-6"
      >
        <span className="min-w-0 flex-1 truncate py-2 text-[clamp(1rem,2.6vw,1.6rem)] font-semibold tracking-[-0.02em] text-strong">
          {email}
        </span>
        <span
          className={`relative inline-flex h-11 w-[7rem] shrink-0 items-center justify-center overflow-hidden rounded-full font-mono text-[11.5px] uppercase tracking-[0.1em] transition-colors ${copied ? "bg-signal text-[#1a0c03]" : "bg-white/5 text-muted group-hover:text-strong"}`}
          aria-live="polite"
        >
          <AnimatePresence mode="wait" initial={false}>
            <m.span
              key={copied ? "done" : "copy"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: EASE }}
            >
              {copied ? "Copied ✓" : "Copy"}
            </m.span>
          </AnimatePresence>
        </span>
      </button>
    </MotionRoot>
  );
}
