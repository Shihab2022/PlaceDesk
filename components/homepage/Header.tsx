"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/placeDesk/layout/BrandLogo";

const NAV = [
  { label: "Platform", href: "#platform" },
  { label: "Solutions", href: "#solutions" },
  { label: "Data", href: "#data" },
  { label: "How It Works", href: "#how-it-works" },
];

/**
 * Marketing homepage header — sticky/floating. Links to the app via /dashboard.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-line/70 bg-white/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6 sm:px-8">
        {/* Brand */}
        <a href="#top" className="group flex items-center gap-2.5">
          <BrandLogo size={34} className="transition-transform duration-300 group-hover:scale-105" />
          <span className="flex flex-col leading-none">
            <span className="text-[17px] font-semibold tracking-tight text-ink-900">
              Spatic
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-500">
              Spatial Intelligence
            </span>
          </span>
        </a>

        {/* Nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className="focusable rounded-lg px-3.5 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-800"
            >
              {n.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden items-center gap-2 sm:flex">
          <Link
            href="/dashboard"
            className="focusable rounded-lg px-3.5 py-2 text-sm font-medium text-ink-700 transition-colors hover:text-brand-800"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="focusable group inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 transition-all duration-200 hover:-translate-y-px hover:bg-brand-800 hover:shadow-md hover:shadow-brand-600/30"
          >
            Explore Spatic
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle navigation"
          className="focusable flex h-10 w-10 items-center justify-center rounded-lg text-ink-700 hover:bg-brand-50 lg:hidden"
        >
          <span className="sr-only">Menu</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="anim-fade-up border-t border-line/70 bg-white/95 px-6 py-4 backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV.map((n) => (
              <a
                key={n.label}
                href={n.href}
                onClick={() => setOpen(false)}
                className="focusable rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-brand-50"
              >
                {n.label}
              </a>
            ))}
            <a
              href="/dashboard"
              className="focusable mt-2 rounded-lg bg-brand-700 px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Explore Spatic →
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}