import { useId, useMemo } from "react";
import { formatCompactNumber } from "../../utils/content";

const CHART_WIDTH = 640;
const DEFAULT_HEIGHT = 240;
const PADDING = { top: 24, right: 18, bottom: 38, left: 18 };

function createLinePath(points = []) {
  if (!points.length) return "";
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function createAreaPath(points = [], baseline) {
  if (!points.length) return "";
  const linePath = createLinePath(points);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  return `${linePath} L ${lastPoint.x} ${baseline} L ${firstPoint.x} ${baseline} Z`;
}

export default function AnalyticsLineChart({
  ariaLabel,
  data = [],
  series = [],
  labelKey = "label",
  height = DEFAULT_HEIGHT,
}) {
  const chartId = useId().replace(/:/g, "");
  const safeSeries = useMemo(() => series.filter((entry) => entry?.key), [series]);
  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerHeight = height - PADDING.top - PADDING.bottom;
  const maxValue = Math.max(
    1,
    ...data.flatMap((point) => safeSeries.map((entry) => Number(point?.[entry.key] || 0))),
  );
  const labelStep = Math.max(1, Math.ceil(data.length / 6));
  const yAxisLabels = [maxValue, Math.round(maxValue / 2), 0];

  const plottedSeries = safeSeries.map((entry, seriesIndex) => {
    const points = data.map((point, index) => {
      const value = Number(point?.[entry.key] || 0);
      const x = PADDING.left + (data.length === 1 ? innerWidth / 2 : (index / Math.max(data.length - 1, 1)) * innerWidth);
      const y = PADDING.top + innerHeight - ((value / maxValue) * innerHeight);

      return {
        x,
        y,
        value,
        label: point?.[labelKey] || `${index + 1}`,
      };
    });

    return {
      ...entry,
      points,
      gradientId: `${chartId}-${seriesIndex}`,
      linePath: createLinePath(points),
      areaPath: createAreaPath(points, PADDING.top + innerHeight),
    };
  });

  return (
    <div className="rounded-[1.5rem] bg-white px-4 py-4 dark:bg-[#171717]">
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate500 dark:text-slate200">
        {plottedSeries.map((entry) => (
          <span key={entry.key} className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.label}
          </span>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-[1.25rem] bg-[#FCFCFC] px-2 py-2 dark:bg-[#111111]">
        <svg viewBox={`0 0 ${CHART_WIDTH} ${height}`} role="img" aria-label={ariaLabel} className="h-full w-full">
          <defs>
            {plottedSeries.map((entry) => (
              <linearGradient key={entry.gradientId} id={entry.gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={entry.color} stopOpacity="0.28" />
                <stop offset="100%" stopColor={entry.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {yAxisLabels.map((value, index) => {
            const y = PADDING.top + ((innerHeight / Math.max(yAxisLabels.length - 1, 1)) * index);
            return (
              <g key={`grid-${value}-${index}`}>
                <line x1={PADDING.left} x2={CHART_WIDTH - PADDING.right} y1={y} y2={y} stroke="currentColor" strokeOpacity="0.08" />
                <text x={PADDING.left} y={Math.max(12, y - 6)} fill="currentColor" opacity="0.5" fontSize="11">
                  {formatCompactNumber(value)}
                </text>
              </g>
            );
          })}

          {plottedSeries.map((entry, index) => (
            <g key={`series-${entry.key}`}>
              {index === 0 ? <path d={entry.areaPath} fill={`url(#${entry.gradientId})`} /> : null}
              <path d={entry.linePath} fill="none" stroke={entry.color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
              {entry.points.map((point) => (
                <circle key={`${entry.key}-${point.label}`} cx={point.x} cy={point.y} r={3.5} fill={entry.color} stroke="#fff" strokeWidth={1.5} />
              ))}
            </g>
          ))}

          {data.map((point, index) => {
            if (index % labelStep !== 0 && index !== data.length - 1) return null;
            const x = PADDING.left + (data.length === 1 ? innerWidth / 2 : (index / Math.max(data.length - 1, 1)) * innerWidth);
            return (
              <text key={`label-${point?.[labelKey] || index}`} x={x} y={height - 10} fill="currentColor" opacity="0.62" fontSize="11" textAnchor="middle">
                {point?.[labelKey] || `${index + 1}`}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}