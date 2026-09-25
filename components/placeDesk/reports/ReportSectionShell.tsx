"use client";

/**
 * Anchor wrapper for a report section.
 *
 * Every section lives on the same page; this shell gives it a stable DOM id
 * (`report-section-<id>`), a coloured heading and a "back to sections" action
 * so deep links (`?section=<id>`) and long scrolling both stay usable.
 */

import type { ReactNode } from "react";
import { FiArrowUp } from "react-icons/fi";
import {
  SCHEME_CLASSES,
  sectionAnchor,
  sectionMeta,
  type ReportSectionKey,
} from "./sectionMeta";

export default function ReportSectionShell({
  id,
  actions,
  children,
}: {
  id: ReportSectionKey;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const meta = sectionMeta(id);
  const scheme = SCHEME_CLASSES[meta.scheme];

  return (
    <section
      id={sectionAnchor(id)}
      aria-label={meta.label}
      className="scroll-mt-24"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${scheme.icon}`}
          >
            {meta.icon}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-[16px] font-semibold tracking-tight text-ink-900">
              {meta.label}
            </h2>
            <p className="truncate text-[11.5px] text-ink-500">{meta.blurb}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actions}
          <button
            type="button"
            onClick={() =>
              document
                .getElementById("report-sections")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className="focusable inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700"
          >
            <FiArrowUp className="h-3.5 w-3.5" />
            All sections
          </button>
        </div>
      </div>

      {children}
    </section>
  );
}
