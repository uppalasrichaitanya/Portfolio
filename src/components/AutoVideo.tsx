import { useEffect, useRef, useState } from "react";

type Props = {
  webm: string;
  mp4: string;
  poster: string;
  width: number;
  height: number;
  label: string;
  preferMp4?: boolean;
};

/** Muted loop that only plays while on screen. Respects reduced motion and Save-Data. */
export default function AutoVideo({ webm, mp4, poster, width, height, label, preferMp4 }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [manual, setManual] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)").matches || conn?.saveData;
    if (quiet) {
      setManual(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (video.preload !== "auto") video.preload = "auto";
          video.play().catch((err: DOMException) => {
            // An AbortError only means a pause interrupted play (fast scroll); real blocking is NotAllowedError.
            if (err?.name === "NotAllowedError") setManual(true);
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  const sources = [
    <source key="webm" src={webm} type="video/webm" />,
    <source key="mp4" src={mp4} type="video/mp4" />,
  ];

  return (
    <div className="relative">
      <video
        ref={ref}
        className="block h-auto w-full"
        width={width}
        height={height}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        {preferMp4 ? sources.reverse() : sources}
      </video>
      {manual && (
        <button
          type="button"
          onClick={() => {
            const v = ref.current;
            if (!v) return;
            if (v.paused) v.play();
            else v.pause();
          }}
          className="absolute bottom-3 right-3 z-[3] rounded-full border border-line-strong bg-bg/90 px-3 py-1.5 font-mono text-xs text-text transition-colors hover:border-signal"
        >
          {playing ? "Pause" : "Play"}
        </button>
      )}
    </div>
  );
}
