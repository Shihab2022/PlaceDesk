"use client";

/**
 * Route: `/report/<reportId>` — the standalone, shareable report page.
 *
 * `reportId` is a configured data-source id (`reportDataLayerConfig`), which is
 * what the report cards in `Dashboard -> Reports` link to. An unknown id is
 * handled inside `ReportDetailPage` instead of throwing.
 */

import { useParams } from "next/navigation";
import ReportDetailPage from "@/components/placeDesk/reports/ReportDetailPage";

export default function ReportRoutePage() {
  const params = useParams<{ reportId?: string | string[] }>();
  const raw = params?.reportId;
  const reportId = Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");

  return <ReportDetailPage reportId={reportId} />;
}
