"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import PlaceDeskLogo from "@/components/placeDesk/layout/PlaceDeskLogo";
import SpatialBackground from "@/components/homepage/SpatialBackground";
import GeographicNetwork from "@/components/spatial/GeographicNetwork";

const PILLARS = [
  "Explore markets.",
  "Understand places.",
  "Discover patterns.",
];

/**
 * Split-screen authentication shell: a deep-spatial left panel with the brand
 * + a subtle geographic network, and a form panel on the right.
 */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full bg-white">
      <SpatialBackground density={30} />

      {/* Left brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-10 lg:flex">
        <Link href="/" className="max-w-max">
          <PlaceDeskLogo variant="compact" size={42} />
        </Link>

        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-300/60 bg-brand-50/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(124,77,255,0.8)]" />
            Spatial Intelligence
          </span>
          <div className="relative mt-8">
            <div className="pointer-events-none absolute -inset-6 opacity-60">
              <GeographicNetwork className="h-full w-full" count={26} />
            </div>
            <h2 className="relative text-4xl font-semibold leading-tight tracking-tight text-ink-900">
              Turn Location<br />Into Intelligence.
            </h2>
            <ul className="relative mt-6 space-y-2">
              {PILLARS.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-[15px] text-ink-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-[12px] text-ink-400">
          © {new Date().getFullYear()} PlaceDesk · One map, many layers.
        </p>
      </div>

      {/* Form panel */}
      <div className="relative flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/">
              <PlaceDeskLogo variant="compact" size={38} />
            </Link>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">{title}</h1>
          <p className="mt-1.5 text-[13px] text-ink-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-center text-[13px] text-ink-500">{footer}</div>}
        </div>
      </div>
    </div>
  );
}