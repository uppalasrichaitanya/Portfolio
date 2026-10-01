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
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="button"
          onClick={copy}
          className="trace-link break-all text-left text-[clamp(1.25rem,4vw,2.5rem)] font-semibold tracking-[-0.02em] text-strong"
          aria-label={`Copy ${email} to clipboard`}
        >
          {email}
        </button>
        <span className="relative inline-flex h-6 min-w-[5.5rem] items-center font-mono text-[12px]" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <m.span
                key="done"
                className="text-signal"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: EASE }}
              >
                Copied ✓
              </m.span>
            ) : (
              <m.a
                key="mail"
                href={`mailto:${email}`}
                className="trace-link text-muted"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: EASE }}
              >
                or open mail ↗
              </m.a>
            )}
          </AnimatePresence>
        </span>
      </div>
      <p className="mt-2 font-mono text-[12px] text-faint">Click the address to copy it.</p>
    </MotionRoot>
  );
}
