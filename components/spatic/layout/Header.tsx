"use client";

import { useState } from "react";
import {
  FiBell,
  FiChevronDown,
  FiHelpCircle,
  FiSearch,
} from "react-icons/fi";
import BrandLogo from "./BrandLogo";

interface HeaderProps {
  onOpenSearch: () => void;
  usage?: number; // 0-100
}

export default function Header({ onOpenSearch, usage = 64 }: HeaderProps) {
  const [userOpen, setUserOpen] = useState(false);

  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center gap-3 border-b border-line bg-white px-3 sm:px-4">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <BrandLogo size={34} />
        <div className="hidden items-baseline gap-2 sm:flex">
          <span className="text-[17px] font-semibold tracking-tight text-ink-900">
            Spatic
          </span>
          <span className="text-[11px] font-medium text-ink-400">
            Location Intelligence Platform
          </span>
        </div>
      </div>

      <div className="mx-1 hidden h-6 w-px bg-line sm:block" />

      {/* Workspace selector */}
      <button
        type="button"
        className="focusable flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-ink-900 transition-colors hover:bg-canvas"
        aria-haspopup="true"
      >
        <span className="hidden md:inline">Bengaluru Retail</span>
        <FiChevronDown className="h-3.5 w-3.5 text-ink-400" />
      </button>

      {/* Search (opens command palette) */}
      <button
        type="button"
        onClick={onOpenSearch}
        aria-label="Search locations, companies, datasets"
        className="focusable group mx-auto flex w-full max-w-xl items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2 text-left transition-all hover:border-brand-300 hover:bg-white"
      >
        <FiSearch className="h-4 w-4 shrink-0 text-ink-400" />
        <span className="flex-1 truncate text-[13px] text-ink-400">
          Search locations, companies, datasets…
        </span>
        <kbd className="hidden select-none rounded-md border border-line bg-white px-1.5 py-0.5 text-[10px] font-semibold text-ink-500 sm:block">
          ⌘K
        </kbd>
        <FiChevronDown className="h-3.5 w-3.5 text-ink-400" />
</button>

      {/* Right cluster */}
      <div className="flex shrink-0 items-center gap-1">
        <div
          className="mr-1 hidden items-center gap-2 px-2 py-1.5 lg:flex"
          title="64% of plan quota used this month"
        >
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-brand-600 transition-all"
              style={{ width: `${usage}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          aria-label="Help"
          title="Help"
          className="focusable flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-canvas hover:text-ink-900"
        >
          <FiHelpCircle className="h-[18px] w-[18px]" />
        </button>

        <button
          type="button"
          aria-label="Notifications (2 unread)"
          title="Notifications"
          className="focusable relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-canvas hover:text-ink-900"
        >
          <FiBell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-600 ring-2 ring-white" />
        </button>

        <div className="mx-1 hidden h-6 w-px bg-line sm:block" />

        {/* User / avatar */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={userOpen}
            className="focusable flex items-center gap-2 rounded-lg p-1 pr-1.5 transition-colors hover:bg-canvas"
          >
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-[12px] font-semibold text-brand-800">
                SJ
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div className="hidden text-left leading-tight sm:block">
              <div className="text-[12px] font-semibold text-ink-900">Sarah Johnson</div>
              <div className="text-[10px] text-ink-400">Data Analyst</div>
            </div>
            <FiChevronDown className="hidden h-3.5 w-3.5 text-ink-400 sm:block" />
          </button>

          {userOpen && (
            <>
              <div
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setUserOpen(false)}
              />
              <div
                role="menu"
                className="anim-fade-scale absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-xl border border-line bg-white shadow-xl shadow-ink-900/10"
              >
                <div className="border-b border-line px-3 py-2.5">
                  <div className="text-[12px] font-semibold text-ink-900">Sarah Johnson</div>
                  <div className="text-[11px] text-ink-400">sarah@spatic.io</div>
                </div>
                {["Account", "Billing", "Preferences", "Sign out"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    role="menuitem"
                    onClick={() => setUserOpen(false)}
                    className="focusable block w-full px-3 py-2 text-left text-[13px] text-ink-700 transition-colors hover:bg-canvas"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}