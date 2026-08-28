"use client";

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

/**
 * Shared helpers for the PlaceDesk marketing homepage.
 */

export function Reveal({
  children,
  className = "",
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "h2" | "h3" | "span" | "p";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver !== "undefined") {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setShown(true);
            io.disconnect();
          }
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
      );
      io.observe(el);
      return () => io.disconnect();
    }
    setShown(true);
  }, []);

  const style: CSSProperties = { transitionDelay: delay + "ms" };
  const classNames =
    className + " transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] " +
    (shown ? "translate-y-0 opacity-100 " : "translate-y-6 opacity-0 ") +
    "motion-reduce:transition-none motion-reduce:translate-y-0 motion-reduce:opacity-100";

  return (
    <div ref={ref} style={style} className={classNames}>
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(124,77,255,0.8)]" />
      {children}
    </span>
  );
}

export function Section({
  children,
  id,
  className = "",
}: {
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={"relative mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 sm:py-24 " + className}>
      {children}
    </section>
  );
}