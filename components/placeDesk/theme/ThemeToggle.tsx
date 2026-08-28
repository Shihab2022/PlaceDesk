"use client";

import { useEffect, useRef, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "./ThemeProvider";
import type { ThemeMode } from "./ThemeProvider";

const MODES: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

/** Compact theme switcher for the app header. Cycling light/dark/system. */
export default function ThemeToggle({
  className = "",
}: {
  className?: string;
}) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const dark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle theme"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Theme"
        className="focusable flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-canvas hover:text-ink-900"
      >
        {dark ? (
          <FiMoon className="h-4.5 w-4.5" />
        ) : (
          <FiSun className="h-4.5 w-4.5" />
        )}
      </button>
      {open && (
        <div
          role="menu"
          className="anim-fade-scale absolute right-0 top-full z-40 mt-1.5 w-28 overflow-hidden rounded-xl border border-line bg-white p-1 shadow-xl shadow-ink-900/10"
        >
          {MODES.map((m) => {
            const on = theme === m.value;
            return (
              <button
                key={m.value}
                type="button"
                role="menuitemradio"
                aria-checked={on}
                onClick={() => {
                  setTheme(m.value);
                  setOpen(false);
                }}
                className={`focusable w-full rounded-lg px-2.5 py-1.5 text-left text-[12px] transition-colors ${
                  on
                    ? "bg-brand-50 font-semibold text-brand-800"
                    : "text-ink-600 hover:bg-canvas"
                }`}
              >
                {m.label}
                {on && <span className="float-right text-brand-600">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
