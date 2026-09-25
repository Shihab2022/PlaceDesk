"use client";

/** Overview: site/catchment facts, high-street clusters and projects. */

import { useState } from "react";
import type { ReportModel } from "../types";
import {
  formatArea,
  formatCoordinates,
  formatDate,
  formatDistanceKm,
  formatInt,
  formatNumber,
} from "../parse";
import { EmptyState, KeyValueList, PaginationBar, SectionCard } from "../ui";

const CLUSTER_PAGE_SIZE = 10;
const PROJECT_PAGE_SIZE = 20;

export default function OverviewTab({ model }: { model: ReportModel }) {
  const [clusterPage, setClusterPage] = useState(0);
  const [projectPage, setProjectPage] = useState(0);

  const siteFacts = [
    { label: "Site name", value: model.siteName },
    { label: "Location", value: model.location ?? "N/A" },
    {
      label: "Coordinates",
      value:
        model.lat !== null && model.lng !== null
          ? formatCoordinates(model.lat, model.lng)
          : "N/A",
    },
    { label: "Catchment", value: model.catchmentLabel },
    { label: "Catchment code", value: model.catchmentType ?? "N/A" },
    { label: "Area", value: formatArea(model.areaM2) },
    {
      label: "Distance from city centre",
      value: formatDistanceKm(model.distanceFromCityCenterKm),
    },
    { label: "Orientation from city centre", value: model.orientation ?? "N/A" },
    { label: "Cluster growth rate", value: formatNumber(model.clusterGrowthRate) },
    { label: "Report generated", value: formatDate(model.createdAt) },
    { label: "Report ID", value: model.reportId },
    { label: "Entity ID", value: model.entityId ?? "N/A" },
  ];

  return (
    <div className="space-y-4">
      <SectionCard title="Site overview" subtitle="Identity and catchment facts">
        <KeyValueList items={siteFacts} columns={3} />
      </SectionCard>

      <SectionCard
        title="High street clusters"
        subtitle={`${formatInt(model.highStreets.length)} clusters around the site`}
      >
        {model.highStreets.length ? (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-[12.5px]">
                <thead>
                  <tr className="border-b border-line text-[10.5px] uppercase tracking-wide text-ink-400">
                    <th className="px-3 py-2 font-semibold">Cluster</th>
                    <th className="px-3 py-2 font-semibold">Locality</th>
                    <th className="px-3 py-2 text-right font-semibold">Area</th>
                    <th className="px-3 py-2 text-right font-semibold">Distance</th>
                    <th className="px-3 py-2 text-right font-semibold">Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {model.highStreets
                    .slice(
                      clusterPage * CLUSTER_PAGE_SIZE,
                      (clusterPage + 1) * CLUSTER_PAGE_SIZE,
                    )
                    .map((street, i) => (
                      <tr
                        key={`${street.name}-${clusterPage * CLUSTER_PAGE_SIZE + i}`}
                        className="hover:bg-canvas/60"
                      >
                        <td className="px-3 py-2 font-medium text-ink-900">
                          {street.name}
                        </td>
                        <td className="px-3 py-2 text-ink-500">
                          {street.locality ?? "N/A"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-ink-700">
                          {formatArea(street.areaM2)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-ink-700">
                          {formatDistanceKm(street.distanceKm)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {street.growthRate !== null ? (
                            <span
                              className={
                                street.growthRate >= 0
                                  ? "font-semibold text-emerald-600"
                                  : "font-semibold text-rose-600"
                              }
                            >
                              {street.growthRate >= 0 ? "+" : ""}
                              {street.growthRate.toFixed(2)}%
                            </span>
                          ) : (
                            "N/A"
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <PaginationBar
              page={clusterPage}
              totalItems={model.highStreets.length}
              pageSize={CLUSTER_PAGE_SIZE}
              onPageChange={setClusterPage}
            />
          </div>
        ) : (
          <EmptyState title="No high-street data" message="Not included in this report." />
        )}
      </SectionCard>

      <SectionCard
        title="Residential projects"
        subtitle={
          model.projects
            ? `${formatInt(model.projects.count)} projects · ${formatNumber(model.projects.units)} units`
            : "No project data"
        }
      >
        {model.projects && model.projects.projects.length ? (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-[12.5px]">
                <thead>
                  <tr className="border-b border-line text-[10.5px] uppercase tracking-wide text-ink-400">
                    <th className="px-3 py-2 font-semibold">Project</th>
                    <th className="px-3 py-2 text-right font-semibold">Units</th>
                    <th className="px-3 py-2 text-right font-semibold">Distance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {model.projects.projects
                    .slice(
                      projectPage * PROJECT_PAGE_SIZE,
                      (projectPage + 1) * PROJECT_PAGE_SIZE,
                    )
                    .map((project) => (
                      <tr key={project.id} className="hover:bg-canvas/60">
                        <td className="px-3 py-2 font-medium text-ink-900">
                          {project.name}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-ink-700">
                          {formatNumber(project.units)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-ink-700">
                          {formatDistanceKm(project.distance)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <PaginationBar
              page={projectPage}
              totalItems={model.projects.projects.length}
              pageSize={PROJECT_PAGE_SIZE}
              onPageChange={setProjectPage}
            />
          </div>
        ) : (
          <EmptyState title="No residential projects listed" message="Data not available." />
        )}
      </SectionCard>
    </div>
  );
}
