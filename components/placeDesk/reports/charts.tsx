"use client";

/**
 * Lightweight SVG charts for the report dashboard.
 * No charting library — keeps the bundle small next to deck.gl and lets the
 * charts inherit PlaceDesk's colour tokens directly.
 */

import { useId } from "react";

/** Curated categorical palette (aligned with the POI layer colours). */
export const CHART_COLORS = [
  "#7C4DFF",
  "#F97316",
  "#14B8A6",
  "#EC4899",
  "#22C55E",
  "#2563EB",
  "#E63946",
  "#F59E0B",
  "#64748B",
  "#8B5CF6",
  "#0EA5E9",
  "#84CC16",
];

export interface ChartDatum {
  label: string;
  value: number;
  color?: string;
  /** Optional click payload (e.g. brand drill-down). */
  key?: string;
}

function truncate(text: string, max = 14): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function niceMax(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const scaled = value / magnitude;
  const step = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10;
  return step * magnitude;
}

/** Vertical column chart (population bands, apartment prices, indexes…). */
export function ColumnChart({
  data,
  height = 190,
  format = (v: number) => String(v),
  accent,
}: {
  data: ChartDatum[];
  height?: number;
  format?: (value: number) => string;
  accent?: string;
}) {
  const gid = useId();
  if (!data.length) return null;

  const width = 640;
  const padX = 34;
  const padTop = 14;
  const padBottom = 34;
  const plotH = height - padTop - padBottom;
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const slot = (width - padX * 2) / data.length;
  const barW = Math.min(slot * 0.6, 48);
  const ticks = [0, 0.5, 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label="Column chart"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent ?? "#7C4DFF"} />
          <stop offset="100%" stopColor={accent ?? "#7C4DFF"} stopOpacity={0.55} />
        </linearGradient>
      </defs>
      {ticks.map((t) => {
        const y = padTop + plotH * (1 - t);
        return (
          <g key={t}>
            <line
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              stroke="#E7E8EE"
              strokeDasharray="3 4"
            />
            <text
              x={padX - 6}
              y={y + 3.5}
              textAnchor="end"
              fontSize="9"
              fill="#8a8f98"
            >
              {format(Math.round(max * t))}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const x = padX + slot * i + (slot - barW) / 2;
        const h = max > 0 ? (d.value / max) * plotH : 0;
        const y = padTop + plotH - h;
        return (
          <g key={d.key ?? d.label}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(h, d.value > 0 ? 2 : 0)}
              rx="5"
              fill={d.color ?? `url(#${gid})`}
            >
              <title>{`${d.label}: ${format(d.value)}`}</title>
            </rect>
            <text
              x={x + barW / 2}
              y={height - 18}
              textAnchor="middle"
              fontSize="9.5"
              fill="#666666"
            >
              {truncate(d.label)}
            </text>
            <text
              x={x + barW / 2}
              y={height - 6}
              textAnchor="middle"
              fontSize="9"
              fill="#8a8f98"
            >
              {format(d.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Single horizontal stacked bar (weights, shares, composition). */
export function StackedBar({
  segments,
  height = 26,
  format = (v: number) => String(v),
  onSegmentClick,
}: {
  segments: ChartDatum[];
  height?: number;
  format?: (value: number) => string;
  onSegmentClick?: (key: string) => void;
}) {
  if (!segments.length) return null;
  const total = segments.reduce((sum, s) => sum + Math.max(s.value, 0), 0);
  if (total <= 0) return null;

  return (
    <div>
      <div
        className="flex w-full overflow-hidden rounded-lg"
        style={{ height }}
        role="img"
        aria-label="Composition bar"
      >
        {segments.map((seg, i) => {
          const pct = (Math.max(seg.value, 0) / total) * 100;
          if (pct <= 0) return null;
          const color = seg.color ?? CHART_COLORS[i % CHART_COLORS.length];
          const inner = (
            <span
              className="block h-full transition-[filter] hover:brightness-110"
              style={{ width: `${pct}%`, backgroundColor: color }}
              title={`${seg.label}: ${format(seg.value)} (${pct.toFixed(1)}%)`}
            />
          );
          if (!onSegmentClick) {
            return <span key={seg.key ?? seg.label}>{inner}</span>;
          }
          return (
            <button
              key={seg.key ?? seg.label}
              type="button"
              onClick={() => onSegmentClick(seg.key ?? seg.label)}
              aria-label={`${seg.label}: ${format(seg.value)}`}
              className="focusable h-full"
            >
              {inner}
            </button>
          );
        })}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((seg, i) => (
          <li
            key={seg.key ?? seg.label}
            className="flex items-center gap-1.5 text-[11.5px] text-ink-500"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{
                backgroundColor: seg.color ?? CHART_COLORS[i % CHART_COLORS.length],
              }}
            />
            <span className="truncate">{seg.label}</span>
            <span className="font-semibold text-ink-900">{format(seg.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Donut with legend (category share, brand share…). */
export function DonutChart({
  data,
  size = 150,
  thickness = 22,
  centerLabel,
  centerValue,
  format = (v: number) => String(v),
}: {
  data: ChartDatum[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
  format?: (value: number) => string;
}) {
  if (!data.length) return null;
  const total = data.reduce((sum, d) => sum + Math.max(d.value, 0), 0);
  if (total <= 0) return null;

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  // Pre-compute each arc's dash values (immutable running total).
  const arcs = data.reduce<{ list: { d: ChartDatum; dash: number; offset: number; color: string }[]; consumed: number }>(
    (acc, d, i) => {
      const share = Math.max(d.value, 0) / total;
      const dash = share * circumference;
      return {
        list: [
          ...acc.list,
          {
            d,
            dash,
            offset: -acc.consumed,
            color: d.color ?? CHART_COLORS[i % CHART_COLORS.length],
          },
        ],
        consumed: acc.consumed + dash,
      };
    },
    { list: [], consumed: 0 },
  ).list;

  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0"
        role="img"
        aria-label="Donut chart"
      >
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          <circle r={radius} fill="none" stroke="#EEF0F5" strokeWidth={thickness} />
          {arcs.map((arc) => (
            <circle
              key={arc.d.key ?? arc.d.label}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={thickness}
              strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
              strokeDashoffset={arc.offset}
              transform="rotate(-90)"
            >
              <title>{`${arc.d.label}: ${format(arc.d.value)}`}</title>
            </circle>
          ))}
          {centerValue && (
            <text
              y="2"
              textAnchor="middle"
              fontSize="17"
              fontWeight="700"
              fill="#171717"
            >
              {centerValue}
            </text>
          )}
          {centerLabel && (
            <text
              y="18"
              textAnchor="middle"
              fontSize="9.5"
              fill="#8a8f98"
            >
              {centerLabel}
            </text>
          )}
        </g>
      </svg>
      <ul className="min-w-[150px] flex-1 space-y-1.5">
        {data.map((d, i) => {
          const share = (Math.max(d.value, 0) / total) * 100;
          return (
            <li
              key={d.key ?? d.label}
              className="flex items-center gap-2 text-[12px]"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{
                  backgroundColor: d.color ?? CHART_COLORS[i % CHART_COLORS.length],
                }}
              />
              <span className="min-w-0 flex-1 truncate text-ink-500">
                {d.label}
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-ink-900">
                {format(d.value)}
              </span>
              <span className="w-11 shrink-0 text-right tabular-nums text-ink-400">
                {share.toFixed(1)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Area/line trend chart (growth curves, distance profiles…). */
export function LineAreaChart({
  points,
  height = 180,
  color = "#7C4DFF",
  format = (v: number) => String(v),
}: {
  points: { label: string; value: number }[];
  height?: number;
  color?: string;
  format?: (value: number) => string;
}) {
  const gid = useId();
  if (points.length < 2) return null;

  const width = 640;
  const padX = 36;
  const padTop = 14;
  const padBottom = 26;
  const plotH = height - padTop - padBottom;
  const values = points.map((p) => p.value);
  const max = niceMax(Math.max(...values));
  const min = Math.min(0, Math.min(...values));
  const span = max - min || 1;
  const stepX = (width - padX * 2) / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = padX + stepX * i;
    const y = padTop + plotH - ((p.value - min) / span) * plotH;
    return { ...p, x, y };
  });
  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${coords[coords.length - 1].x.toFixed(1)},${padTop + plotH} L${padX},${padTop + plotH} Z`;
  const labelEvery = Math.max(1, Math.ceil(coords.length / 8));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label="Line chart"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t) => {
        const y = padTop + plotH * (1 - t);
        return (
          <g key={t}>
            <line
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              stroke="#E7E8EE"
              strokeDasharray="3 4"
            />
            <text
              x={padX - 6}
              y={y + 3.5}
              textAnchor="end"
              fontSize="9"
              fill="#8a8f98"
            >
              {format(Math.round(min + span * t))}
            </text>
          </g>
        );
      })}
      <path d={areaPath} fill={`url(#${gid})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {coords.map((c, i) => (
        <g key={`${c.label}-${i}`}>
          <circle cx={c.x} cy={c.y} r="3.5" fill="#fff" stroke={color} strokeWidth="2">
            <title>{`${c.label}: ${format(c.value)}`}</title>
          </circle>
          {(i === 0 || i === coords.length - 1 || i % labelEvery === 0) && (
            <text
              x={c.x}
              y={height - 8}
              textAnchor="middle"
              fontSize="9"
              fill="#8a8f98"
            >
              {truncate(c.label, 8)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export interface ScatterPoint {
  x: number;
  y: number;
  label: string;
  color?: string;
  key?: string;
}

/** Scatter plot for brand performance (reviews/day vs performance score). */
export function ScatterPlot({
  points,
  xLabel,
  yLabel,
  height = 240,
  formatX = (v: number) => String(v),
  formatY = (v: number) => String(v),
  onPointClick,
}: {
  points: ScatterPoint[];
  xLabel: string;
  yLabel: string;
  height?: number;
  formatX?: (value: number) => string;
  formatY?: (value: number) => string;
  onPointClick?: (point: ScatterPoint) => void;
}) {
  if (points.length < 2) return null;
  const width = 640;
  const padX = 44;
  const padTop = 14;
  const padBottom = 34;
  const plotH = height - padTop - padBottom;
  const maxX = niceMax(Math.max(...points.map((p) => p.x)));
  const maxY = niceMax(Math.max(...points.map((p) => p.y)));
  const minY = Math.min(0, Math.min(...points.map((p) => p.y)));
  const spanY = maxY - minY || 1;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${yLabel} versus ${xLabel}`}
    >
      {[0, 0.5, 1].map((t) => {
        const y = padTop + plotH * (1 - t);
        return (
          <g key={t}>
            <line
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              stroke="#E7E8EE"
              strokeDasharray="3 4"
            />
            <text
              x={padX - 6}
              y={y + 3.5}
              textAnchor="end"
              fontSize="9"
              fill="#8a8f98"
            >
              {formatY(Math.round(minY + spanY * t))}
            </text>
          </g>
        );
      })}
      {[0, 0.5, 1].map((t) => {
        const x = padX + (width - padX * 2) * t;
        return (
          <text
            key={t}
            x={x}
            y={height - 16}
            textAnchor="middle"
            fontSize="9"
            fill="#8a8f98"
          >
            {formatX(Math.round(maxX * t))}
          </text>
        );
      })}
      <text x={width / 2} y={height - 3} textAnchor="middle" fontSize="9.5" fill="#666666">
        {xLabel}
      </text>
      {points.map((p, i) => {
        const cx = padX + (maxX > 0 ? p.x / maxX : 0) * (width - padX * 2);
        const cy = padTop + plotH - ((p.y - minY) / spanY) * plotH;
        return (
          <g
            key={p.key ?? p.label}
            className={onPointClick ? "cursor-pointer" : undefined}
            onClick={onPointClick ? () => onPointClick(p) : undefined}
          >
            <circle
              cx={cx}
              cy={cy}
              r="6"
              fill={p.color ?? CHART_COLORS[i % CHART_COLORS.length]}
              fillOpacity={0.85}
              stroke="#fff"
              strokeWidth="1.5"
            >
              <title>{`${p.label} — ${xLabel}: ${formatX(p.x)}, ${yLabel}: ${formatY(p.y)}`}</title>
            </circle>
          </g>
        );
      })}
    </svg>
  );
}

/** Radial gauge for 0–max scores (performance, affluence, revenue…). */
export function RadialGauge({
  value,
  max = 100,
  label,
  displayValue,
  size = 120,
  color = "#7C4DFF",
}: {
  value: number;
  max?: number;
  label: string;
  displayValue: string;
  size?: number;
  color?: string;
}) {
  const thickness = 11;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  // 270° arc, starting at the bottom-left.
  const arcFraction = 0.75;
  const arcLength = circumference * arcFraction;
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(value, max)) : 0;
  const ratio = max > 0 ? safeValue / max : 0;

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${label}: ${displayValue}`}
      >
        <g transform={`translate(${size / 2}, ${size / 2}) rotate(135)`}>
          <circle
            r={radius}
            fill="none"
            stroke="#EEF0F5"
            strokeWidth={thickness}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          <circle
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeDasharray={`${arcLength * ratio} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        </g>
        <text
          x="50%"
          y="50%"
          dy="0.05em"
          textAnchor="middle"
          fontSize={size * 0.19}
          fontWeight="700"
          fill="#171717"
        >
          {displayValue}
        </text>
      </svg>
      <p className="mt-1 max-w-[120px] text-center text-[11px] font-medium text-ink-500">
        {label}
      </p>
    </div>
  );
}




