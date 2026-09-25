"use client";

/**
 * Report data access for `Dashboard -> Reports`.
 *
 * Fetching goes through the **existing** `/api/pois?path=...` route (same
 * GitHub-backed pipeline the map layers use) driven by
 * `reportDataLayerConfig`. Results are cached module-wide so switching tabs,
 * remounting or revisiting Reports never re-downloads multi-MB report files.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { reportDataLayerConfig } from "@/constant/mapConfilg";
import { getReportModel, reportKey } from "./normalize";
import { parseJsonField, toNumber, toText } from "./parse";
import type { RawReportPayload, ReportModel, ReportOption } from "./types";

/* ------------------------------------------------------------------ */
/* Module-level caches                                                 */
/* ------------------------------------------------------------------ */

interface RegistryEntry {
  raw: RawReportPayload;
  key: string;
  reportId: string;
  path: string;
  sourceName: string;
}

/** path -> in-flight/resolved file promise (deduplicates concurrent calls). */
const fileCache = new Map<string, Promise<RawReportPayload[]>>();
/** reportKey -> normalized raw report (accumulates across every file). */
const registry = new Map<string, RegistryEntry>();

function isReportLike(value: unknown): value is RawReportPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return (
    row.report_id !== undefined ||
    row.site_name !== undefined ||
    row.geometry !== undefined ||
    row.catchment_type !== undefined ||
    row.top_brands !== undefined ||
    (row.lat !== undefined && row.lng !== undefined)
  );
}

/** Accepts the shapes the API route can return and yields report rows. */
function extractReports(json: unknown): RawReportPayload[] {
  if (Array.isArray(json)) return json.filter(isReportLike);
  if (!json || typeof json !== "object") return [];
  const obj = json as Record<string, unknown>;
  if (Array.isArray(obj.data)) return obj.data.filter(isReportLike);
  if (isReportLike(obj.data)) return [obj.data];
  if (isReportLike(obj)) return [obj];
  return [];
}

/**
 * Rough "how much data does this row carry" score.
 *
 * Sample files ship **two rows per site**: a lightweight summary and the full
 * payload (thousands of brands/POIs/projects). Both share the same
 * `report_id`, so the registry must keep the richer one — otherwise every
 * section would render empty tables.
 */
function reportRichness(raw: RawReportPayload): number {
  const len = (value: unknown): number => {
    const parsed = parseJsonField<unknown>(value, null);
    if (Array.isArray(parsed)) return parsed.length;
    if (parsed && typeof parsed === "object") {
      const obj = parsed as Record<string, unknown>;
      if (Array.isArray(obj.data)) return obj.data.length;
      if (Array.isArray(obj.pois)) return obj.pois.length;
      if (Array.isArray(obj.projects)) return obj.projects.length;
      return Object.keys(obj).length;
    }
    return 0;
  };

  return (
    len(raw.top_brands) * 4 +
    len(raw.pois) * 4 +
    len(raw.competition) * 2 +
    len(raw.projects) * 2 +
    len(raw.high_streets) * 2 +
    len(raw.shopping_malls) +
    len(raw.apartments) +
    len(raw.demand_generators) +
    len(raw.grouped_indexes) +
    len(raw.indexes_from_counts) +
    len(raw.location_score_weights) +
    len(raw.competitors_domains) +
    Object.keys(raw).length
  );
}

function registerReports(
  rows: RawReportPayload[],
  path: string,
  sourceName: string,
) {
  for (const raw of rows) {
    const key = reportKey(raw);
    const entry: RegistryEntry = {
      raw,
      key,
      reportId: toText(raw.report_id) ?? toText(raw.id) ?? key,
      path,
      sourceName,
    };
    const existing = registry.get(key);
    // Keep whichever row carries more of the payload.
    if (existing && reportRichness(existing.raw) >= reportRichness(raw)) {
      continue;
    }
    registry.set(key, entry);
  }
}

/** Pick the registry key to select for a fetched file + target report id. */
function resolveTargetKey(
  rows: RawReportPayload[],
  reportId: string,
): string | null {
  const keys = rows.map((row) => reportKey(row));
  return (
    keys.find((key) => registry.get(key)?.reportId === reportId) ??
    keys.find((key) => registry.has(key)) ??
    null
  );
}

/**
 * Load a report file through the existing API route.
 * Retries once under `sample/` when a config path is missing at the repo root.
 */
async function loadReportFile(
  path: string,
  sourceName: string,
): Promise<RawReportPayload[]> {
  const cached = fileCache.get(path);
  if (cached) return cached;

  const promise = (async () => {
    let res = await fetch(`/api/pois?path=${encodeURIComponent(path)}`);

    if (!res.ok && res.status === 404 && !path.startsWith("sample/")) {
      const fileName = path.split("/").pop() ?? path;
      res = await fetch(
        `/api/pois?path=${encodeURIComponent(`sample/${fileName}`)}`,
      );
    }

    if (!res.ok) {
      let detail = "";
      try {
        const body = (await res.json()) as { error?: string };
        detail = body?.error ?? "";
      } catch {
        /* non-JSON error body */
      }
      throw new Error(
        detail || `Failed to load report data (HTTP ${res.status})`,
      );
    }

    const json: unknown = await res.json();
    const rows = extractReports(json);
    if (!rows.length) {
      throw new Error("The selected file does not contain any report data");
    }
    registerReports(rows, path, sourceName);
    return rows;
  })();

  fileCache.set(path, promise);
  // Never cache failures — a retry must hit the network again.
  promise.catch(() => fileCache.delete(path));
  return promise;
}

/** Drop cached responses for a path (used by the retry button). */
function invalidateFile(path: string) {
  fileCache.delete(path);
}

/** Options derived from the config + whatever has been discovered so far. */
function buildOptions(): ReportOption[] {
  const options: ReportOption[] = [];
  const emitted = new Set<string>();

  const toOption = (entry: RegistryEntry, sourceName: string): ReportOption => {
    const raw = entry.raw;
    return {
      key: entry.key,
      reportId: entry.reportId,
      path: entry.path,
      sourceName,
      loaded: true,
      siteName:
        toText(raw.site_name) ?? toText(raw.location) ?? "Reported Site",
      location: toText(raw.location),
      catchmentType: toText(raw.catchment_type),
      createdAt: toNumber(raw.created_at),
      lat: toNumber(raw.lat),
      lng: toNumber(raw.lng),
    };
  };

  for (const cfg of reportDataLayerConfig) {
    const hits = [...registry.values()].filter(
      (entry) => entry.reportId === cfg.id || entry.path === cfg.targetPath,
    );
    hits.sort((a, b) =>
      a.reportId === cfg.id ? -1 : b.reportId === cfg.id ? 1 : 0,
    );
    if (hits.length) {
      for (const hit of hits) {
        if (emitted.has(hit.key)) continue;
        emitted.add(hit.key);
        options.push(toOption(hit, cfg.name));
      }
    } else {
      // Not loaded yet — offer it with the config metadata.
      options.push({
        key: `pending:${cfg.id}`,
        reportId: cfg.id,
        path: cfg.targetPath,
        sourceName: cfg.name,
        loaded: false,
        siteName: cfg.name,
        location: null,
        catchmentType: null,
        createdAt: null,
        lat: null,
        lng: null,
      });
    }
  }

  // Reports discovered from files that no config entry names explicitly.
  for (const entry of registry.values()) {
    if (emitted.has(entry.key)) continue;
    emitted.add(entry.key);
    options.push(toOption(entry, entry.sourceName));
  }

  return options;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

export type ReportStatus = "loading" | "ready" | "error";

export interface UseReportsResult {
  /** Config entries + discovered reports (loaded ones carry live metadata). */
  options: ReportOption[];
  selectedKey: string | null;
  /** Parsed model of the selected report (memoized — safe to render). */
  selected: ReportModel | null;
  status: ReportStatus;
  error: string | null;
  select: (key: string) => void;
  /** Re-fetch the selected report's file after a failure. */
  retry: () => void;
}

function makePendingOption(reportId: string, path: string, sourceName: string): ReportOption {
  return {
    key: `pending:${reportId}`,
    reportId,
    path,
    sourceName,
    loaded: false,
    siteName: sourceName,
    location: null,
    catchmentType: null,
    createdAt: null,
    lat: null,
    lng: null,
  };
}

export function useReports(initialReportId?: string | null): UseReportsResult {
  /* Pre-seed selection when the report is already cached
     (e.g. a revisit or explicit ID requested) — initial state, so no setState inside the effect. */
  const [initial] = useState(() => {
    const cfg = initialReportId
      ? reportDataLayerConfig.find((c) => c.id === initialReportId) ?? reportDataLayerConfig[0]
      : reportDataLayerConfig[0];
    if (!cfg) return null;
    const existing = [...registry.values()].find((e) => e.reportId === cfg.id);
    return existing
      ? {
          key: existing.key,
          option: makePendingOption(cfg.id, cfg.targetPath, cfg.name),
        }
      : null;
  });

  const [selectedKey, setSelectedKey] = useState<string | null>(
    () => initial?.key ?? null,
  );
  const [requested, setRequested] = useState<ReportOption | null>(
    () => initial?.option ?? null,
  );
  const [status, setStatus] = useState<ReportStatus>(() =>
    initial || !reportDataLayerConfig[0] ? "ready" : "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const bootstrapped = useRef(false);

  const bump = useCallback(() => setRevision((v) => v + 1), []);

  const selectOption = useCallback(
    async (option: ReportOption) => {
      setRequested(option);
      setError(null);

      if (!option.key.startsWith("pending:") && registry.has(option.key)) {
        setSelectedKey(option.key);
        setStatus("ready");
        return;
      }

      setStatus("loading");
      try {
        const rows = await loadReportFile(option.path, option.sourceName);
        bump();
        const targetKey = resolveTargetKey(rows, option.reportId);
        if (!targetKey) {
          throw new Error("The selected file does not contain this report");
        }
        setSelectedKey(targetKey);
        setStatus("ready");
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setStatus("error");
      }
    },
    [bump],
  );

  /* Bootstrap: fetch the target report on first mount.
     State updates live in the promise callbacks (async by nature). */
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const cfg = initialReportId
      ? reportDataLayerConfig.find((c) => c.id === initialReportId) ?? reportDataLayerConfig[0]
      : reportDataLayerConfig[0];
    if (!cfg || initial) return;
    const option = makePendingOption(cfg.id, cfg.targetPath, cfg.name);

    loadReportFile(option.path, option.sourceName)
      .then((rows) => {
        setRevision((v) => v + 1);
        setRequested(option);
        const targetKey = resolveTargetKey(rows, option.reportId);
        if (!targetKey) {
          setError("The selected file does not contain this report");
          setStatus("error");
          return;
        }
        setSelectedKey(targetKey);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        setRequested(option);
        setError(err instanceof Error ? err.message : String(err));
        setStatus("error");
      });
  }, [initial, initialReportId]);

  const options = useMemo(() => {
    void revision; // registry grows as files load — rebuild the option list
    return buildOptions();
  }, [revision]);

  const select = useCallback(
    (key: string) => {
      const option = options.find((o) => o.key === key);
      if (!option) return;
      void selectOption(option);
    },
    [options, selectOption],
  );

  const retry = useCallback(() => {
    if (!requested) return;
    invalidateFile(requested.path);
    void selectOption(requested);
  }, [requested, selectOption]);

  const selected = useMemo(() => {
    void revision; // freshly registered reports must resolve after a fetch
    if (!selectedKey) return null;
    const entry = registry.get(selectedKey);
    if (!entry) return null;
    return getReportModel(entry.raw);
  }, [selectedKey, revision]);

  const configured = reportDataLayerConfig.length > 0;
  const effectiveStatus: ReportStatus =
    error !== null || !configured ? "error" : status;
  const effectiveError = error ?? (!configured ? "No report data sources are configured." : null);

  return {
    options,
    selectedKey,
    selected,
    status: effectiveStatus,
    error: effectiveError,
    select,
    retry,
  };
}


