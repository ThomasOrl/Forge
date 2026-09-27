import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";

export default function ProgressChart({
  data,
  dataKey = "value",
  label,
  unit = "kg",
  color = "#A855F7",
}) {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const gradientId = `progress-fill-${useId().replace(/:/g, "")}`;
  const isLight =
    theme === "light" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: light)").matches);
  const axisColor = isLight ? "#77736C" : "#8A8A8A";
  const gridColor = isLight ? "#DDD9D2" : "#262626";
  const numberFormat = new Intl.NumberFormat(language, {
    maximumFractionDigits: 1,
  });

  if (!data?.length) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-app bg-accent/[0.03] px-6 text-center">
        <ChartEmptyIcon />
        <p className="mt-3 max-w-sm text-sm text-secondary">{t("progress.noData")}</p>
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full min-w-0 sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="95%" stopColor={color} stopOpacity={0.015} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke={gridColor}
            strokeDasharray="4 5"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: axisColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickMargin={12}
            minTickGap={24}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: axisColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            width={52}
            domain={["auto", "auto"]}
            tickFormatter={(value) => numberFormat.format(value)}
          />
          <Tooltip
            content={
              <ChartTooltip
                label={label}
                unit={unit}
                isLight={isLight}
                numberFormat={numberFormat}
              />
            }
            cursor={{ stroke: color, strokeDasharray: "4 4", strokeOpacity: 0.45 }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.8}
            fill={`url(#${gradientId})`}
            activeDot={{ r: 6, fill: color, stroke: isLight ? "#F7F5F0" : "#111", strokeWidth: 2 }}
            dot={{ r: 3, fill: isLight ? "#F7F5F0" : "#111", stroke: color, strokeWidth: 2 }}
            isAnimationActive
            animationDuration={650}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartTooltip({ active, payload, label, unit, isLight, numberFormat }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="min-w-32 rounded-xl border px-3.5 py-3 shadow-cardHover"
      style={{
        backgroundColor: isLight ? "#F7F5F0" : "#111111",
        borderColor: isLight ? "#DDD9D2" : "#303030",
      }}
    >
      <p className="mb-1 text-xs font-medium text-secondary">{label}</p>
      <p className="text-sm font-bold text-primary">
        {numberFormat.format(payload[0].value)} {unit}
      </p>
    </div>
  );
}

function ChartEmptyIcon() {
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-accent/5 text-accent">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M3.5 19.5h17M5.5 16l4-4 3 2.5 6-7" />
        <path d="M15.5 7.5h3v3" />
      </svg>
    </span>
  );
}
