"use client";

import { Reveal } from "./util";

/** Minimal product-philosophy statement. */
export default function Philosophy() {
  return (
    <section className="relative overflow-hidden py-28 sm:py-36">
      <div className="coordinate-grid absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative mx-auto max-w-4xl px-6 text-center sm:px-8">
        <Reveal>
          <p className="text-3xl font-medium leading-snug tracking-tight text-ink-900 sm:text-5xl">
            Don't just ask what is happening.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-6 text-3xl font-medium leading-snug tracking-tight text-brand-700 sm:text-5xl">
            Ask where.
          </p>
        </Reveal>
        <Reveal delay={220}>
          <p className="mx-auto mt-8 max-w-md text-sm text-ink-500">
            Because location changes context.
          </p>
        </Reveal>
      </div>
    </section>
  );
}