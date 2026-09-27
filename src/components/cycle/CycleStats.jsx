import {
  CalendarIcon,
  DropletIcon,
  OvulationIcon,
} from "./CycleIcons";

function StatCard({
  label,
  value,
  description,
  icon,
  iconClassName = "text-accent",
}) {
  return (
    <div className="relative overflow-hidden card p-4 sm:p-5 group">
      <div
        className="absolute -right-10 -bottom-12 w-28 h-28 rounded-full blur-2xl opacity-10"
        style={{
          background:
            "radial-gradient(circle, rgba(236,72,153,0.8), rgba(168,85,247,0))",
        }}
      />

      <div className="relative flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 ${iconClassName}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs text-secondary">{label}</p>

          <p className="text-lg sm:text-xl font-bold text-primary mt-1 truncate">
            {value}
          </p>

          {description && (
            <p className="text-[11px] text-secondary mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CycleStats({ cycleStatus, formatDate, t }) {
  if (!cycleStatus.cycleDay) return null;

  const confidenceLabel = t(`cycle.confidence.${cycleStatus.confidence}`);

  return (
    <section className="relative grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
      <StatCard
        icon={<CalendarIcon />}
        label={t("cycle.averageLength")}
        value={
          cycleStatus.averageCycleLength
            ? `${cycleStatus.averageCycleLength} ${t("cycle.days")}`
            : "—"
        }
        description={cycleStatus.averageCycleLength ? confidenceLabel : null}
      />

      <StatCard
        icon={<DropletIcon />}
        iconClassName="text-pink-300"
        label={t("cycle.nextPeriod")}
        value={formatDate(cycleStatus.estimatedNextPeriod)}
        description={cycleStatus.estimatedNextPeriod ? confidenceLabel : null}
      />

      <StatCard
        icon={<OvulationIcon />}
        iconClassName="text-violet-300"
        label={t("cycle.ovulation")}
        value={
          cycleStatus.estimatedOvulationDay
            ? `${t("cycle.day")} ${cycleStatus.estimatedOvulationDay}`
            : "—"
        }
        description={cycleStatus.estimatedOvulationDay ? confidenceLabel : null}
      />
    </section>
  );
}
