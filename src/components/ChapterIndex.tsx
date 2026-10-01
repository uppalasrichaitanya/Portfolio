import { useEffect, useState } from "react";

type Entry = { id: string; index: string; title: string };

/** Margin index for the four chapters; the current one turns teal. Wide screens only. */
export default function ChapterIndex({ entries }: { entries: Entry[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (records) => {
        records.forEach((r) => seen.set(r.target.id, r.isIntersecting));
        const current = entries.find((e) => seen.get(e.id));
        setActive(current ? current.id : null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    entries.forEach((e) => {
      const el = document.getElementById(e.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [entries]);

  return (
    <nav
      aria-label="Projects"
      className={`fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 transition-opacity duration-300 2xl:block ${active ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <ol className="space-y-3 font-mono text-[12px]">
        {entries.map((e) => {
          const on = e.id === active;
          return (
            <li key={e.id}>
              <a
                href={`#${e.id}`}
                aria-current={on ? "true" : undefined}
                className={`group flex items-center gap-3 transition-colors duration-200 ${on ? "text-signal" : "text-faint hover:text-text"}`}
              >
                <span className={`h-px transition-all duration-300 ${on ? "w-6 bg-signal" : "w-3 bg-line-strong group-hover:w-5"}`} />
                {e.index}
                <span className={`transition-opacity duration-200 ${on ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>{e.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
