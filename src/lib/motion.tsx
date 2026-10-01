import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export const EASE = [0.22, 1, 0.36, 1] as const;

export function MotionRoot({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
};

/** Fade + 12px rise, once, when the element enters the viewport. */
export function RevealItem({ children, delay = 0, className, as = "div" }: RevealProps) {
  const reduce = useReducedMotion();
  const Tag = m[as];
  return (
    <Tag
      data-reveal
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: reduce ? 0.2 : 0.35, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

/** Island entry point for wrapping static Astro markup. */
export default function Reveal(props: RevealProps) {
  return (
    <MotionRoot>
      <RevealItem {...props} />
    </MotionRoot>
  );
}
