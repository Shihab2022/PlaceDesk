"use client";

/**
 * StreetViewProvider abstraction.
 *
 * Lets us plug in different street-level imagery providers (Google Street View,
 * Mapillary, etc.) without coupling the Location Inspector to a specific API.
 *
 * The active provider is selected at runtime via `resolveStreetViewProvider()`.
 * The default provider is a no-op that surfaces a graceful "unavailable" UI
 * unless a configuration is provided via:
 *   - data-sv-key / data-sv-url attributes on <html>
 *   - NEXT_PUBLIC_STREETVIEW_API_KEY / NEXT_PUBLIC_STREETVIEW_URL env vars
 *   - NEXT_PUBLIC_GOOGLE_MAPS_KEY (Google Street View)
 */

export interface StreetViewParams {
  lat: number;
  lng: number;
  address?: string;
  name?: string;
}

export interface StreetViewResult {
  /** Stable provider id */
  id: string;
  /** Whether the provider has the necessary configuration to function. */
  available: boolean;
  /** Optional URL to render in an iframe (browser-based providers). */
  iframeUrl?: string;
  /** Optional URL that verifies imagery exists at the coordinate (JSON). */
  checkUrl?: string;
  /** Optional keyless/fallback embed used when the primary embed fails. */
  fallbackUrl?: string;
  /** Human-readable name for the provider. */
  displayName?: string;
  /** Optional external URL to open in a new tab. */
  externalUrl?: string;
  /** Optional note for the UI ("configured", "unconfigured", etc.). */
  reason?: string;
}

export interface StreetViewProvider {
  id: string;
  displayName: string;
  resolve(params: StreetViewParams): StreetViewResult;
}

/* ---- NoOp provider (default) ---- */
class NoOpStreetViewProvider implements StreetViewProvider {
  readonly id = "noop";
  readonly displayName = "None";
  resolve(): StreetViewResult {
    return {
      id: this.id,
      available: false,
      displayName: this.displayName,
      reason:
        "Street-level imagery is not available. Configure a Street View provider to enable this feature.",
    };
  }
}

/* ---- Generic configurable iframe provider ---- */
class ConfigurableStreetViewProvider implements StreetViewProvider {
  readonly id = "configurable";
  readonly displayName = "Configurable Street View";

  resolve(params: StreetViewParams): StreetViewResult {
    const key =
      (typeof document !== "undefined" && document.documentElement.dataset.svKey) ||
      process.env.NEXT_PUBLIC_STREETVIEW_API_KEY ||
      "";
    const tpl =
      (typeof document !== "undefined" && document.documentElement.dataset.svUrl) ||
      process.env.NEXT_PUBLIC_STREETVIEW_URL ||
      "";
    if (!key || !tpl) {
      return {
        id: this.id,
        available: false,
        displayName: this.displayName,
        reason:
          "Street-level imagery is not available. Configure NEXT_PUBLIC_STREETVIEW_URL + NEXT_PUBLIC_STREETVIEW_API_KEY to enable this feature.",
      };
    }
    const iframeUrl = tpl
      .replace("{lat}", String(params.lat))
      .replace("{lng}", String(params.lng))
      .replace("{key}", encodeURIComponent(key));
    return {
      id: this.id,
      available: true,
      iframeUrl,
      displayName: this.displayName,
    };
  }
}

/* ---- Google Street View ----
 *   Primary:  official Google Maps Embed API streetview mode (interactive pano
 *             inside an iframe). Requires NEXT_PUBLIC_GOOGLE_MAPS_KEY and the
 *             "Maps Embed API" enabled in the Google Cloud Console.
 *   Precheck: the Street View metadata endpoint tells us whether imagery
 *             actually exists at the coordinate, so the UI can show a graceful
 *             "no imagery here" state instead of Google's error page.
 *   Fallback: Google's keyless output=svembed Street View embed, which needs
 *             no API activation at all — keeps the feature functional even when
 *             the official Embed API is not enabled on the project.
 */
class GoogleStreetViewProvider implements StreetViewProvider {
  readonly id = "google";
  readonly displayName = "Google Street View";

  resolve(params: StreetViewParams): StreetViewResult {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";
    const { lat, lng } = params;
    const externalUrl =
      "https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=" + lat + "," + lng;
    const keylessUrl =
      "https://maps.google.com/maps?layer=c&cbll=" + lat + "," + lng + "&output=svembed";

    if (!key) {
      return {
        id: "google-keyless",
        available: true,
        iframeUrl: keylessUrl,
        displayName: this.displayName,
        externalUrl,
        reason:
          "Keyless Street View embed (no API key configured). Set NEXT_PUBLIC_GOOGLE_MAPS_KEY and enable the Maps Embed API for the official interactive viewer.",
      };
    }

    return {
      id: this.id,
      available: true,
      iframeUrl:
        "https://www.google.com/maps/embed/v1/streetview?key=" + key +
        "&location=" + lat + "," + lng + "&fov=90&heading=0&pitch=0",
      checkUrl:
        "https://maps.googleapis.com/maps/api/streetview/metadata?location=" +
        lat + "," + lng + "&key=" + key,
      fallbackUrl: keylessUrl,
      displayName: this.displayName,
      externalUrl,
    };
  }
}

/* ---- Mapillary (free, no key required for basic usage) ---- */
class MapillaryStreetViewProvider implements StreetViewProvider {
  readonly id = "mapillary";
  readonly displayName = "Mapillary";
  resolve(params: StreetViewParams): StreetViewResult {
    const url =
      "https://www.mapillary.com/embed?lat=" + params.lat + "&lng=" + params.lng + "&z=17";
    return {
      id: this.id,
      available: true,
      iframeUrl: url,
      externalUrl:
        "https://www.mapillary.com/app/?lat=" + params.lat + "&lng=" + params.lng + "&z=17",
      displayName: this.displayName,
    };
  }
}

const REGISTRY: StreetViewProvider[] = [
  new GoogleStreetViewProvider(),
  new ConfigurableStreetViewProvider(),
  new MapillaryStreetViewProvider(),
  new NoOpStreetViewProvider(),
];

/**
 * Returns the first provider that resolves as available for the given params.
 * Falls back to NoOp when nothing is configured.
 */
export function resolveStreetViewProvider(
  params?: StreetViewParams,
): StreetViewProvider & { result: StreetViewResult } {
  const p = params ?? { lat: 0, lng: 0 };
  for (const prov of REGISTRY) {
    const r = prov.resolve(p);
    if (r.available) {
      return Object.assign(prov, { result: r });
    }
  }
  const fallback = REGISTRY[REGISTRY.length - 1];
  return Object.assign(fallback, { result: fallback.resolve(p) });
}

/**
 * Convenience: returns just the StreetViewResult for the given params.
 */
export function getStreetViewResult(params: StreetViewParams): StreetViewResult {
  return resolveStreetViewProvider(params).result;
}

/**
 * Back-compat with the existing exported surface.
 */
export interface LegacyStreetViewProvider {
  isAvailable(): boolean;
  openLocation(params: StreetViewParams): void;
  displayName?: string;
}

const legacy: LegacyStreetViewProvider = {
  isAvailable: () =>
    Boolean(
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
        (process.env.NEXT_PUBLIC_STREETVIEW_API_KEY &&
          process.env.NEXT_PUBLIC_STREETVIEW_URL),
    ),
  openLocation: (params) => {
    const r = resolveStreetViewProvider(params).result;
    if (r.externalUrl) {
      window.open(r.externalUrl, "_blank", "noopener,noreferrer,width=900,height=650");
    }
  },
  displayName: "Google Street View",
};

export const STREET_VIEW_PROVIDERS = {
  default: legacy,
  noop: legacy,
} as Record<string, LegacyStreetViewProvider>;

export function getStreetViewProvider(): LegacyStreetViewProvider {
  return legacy;
}

export default getStreetViewProvider;
