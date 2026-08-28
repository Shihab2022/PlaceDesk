"use client";

import Link from "next/link";
import BrandLogo from "@/components/placeDesk/layout/BrandLogo";

const COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Platform", href: "#platform" },
      { label: "Maps", href: "/dashboard" },
      { label: "Layers", href: "#platform" },
      { label: "Analytics", href: "/dashboard" },
      { label: "Data", href: "#data" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Retail", href: "#solutions" },
      { label: "Real Estate", href: "#solutions" },
      { label: "Healthcare", href: "#solutions" },
      { label: "Logistics", href: "#solutions" },
      { label: "Market Research", href: "#solutions" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/dashboard" },
      { label: "Guides", href: "/dashboard" },
      { label: "API", href: "/dashboard" },
      { label: "Support", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

/** Enterprise SaaS footer. */
export default function Footer() {
  return (
    <footer>
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <BrandLogo size={32} />
              <span className="flex flex-col leading-none">
                <span className="text-base font-semibold tracking-tight text-ink-900">
                  PlaceDesk
                </span>
                <span className="text-[9px] uppercase tracking-[0.18em] text-ink-400">
                  Spatial Intelligence
                </span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500">
              Turn location data into spatial intelligence — one map, many
              layers, intelligent analysis.
            </p>
          </div>

          {COLS.map((col) => (
            <nav
              key={col.title}
              aria-label={col.title}
              className="flex flex-col gap-3"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-ink-400">
                {col.title}
              </span>
              {col.links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="focusable text-sm text-ink-600 transition-colors hover:text-brand-700"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line/70 pt-6 sm:flex-row">
          <p className="text-xs text-ink-400">
            © {new Date().getFullYear()} PlaceDesk — Location Intelligence
            Platform
          </p>
          <p className="text-xs text-ink-400">
            Turn Location Into Intelligence.
          </p>
        </div>
      </div>
    </footer>
  );
}
