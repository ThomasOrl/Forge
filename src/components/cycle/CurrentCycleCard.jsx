import { DropletIcon, InfoIcon } from "./CycleIcons";

function CycleProgress({ cycleDay, cycleLength, t }) {
  const safeCycleLength = cycleLength || 28;
  const progress = Math.min(
    100,
    Math.max(0, (cycleDay / safeCycleLength) * 100),
  );

  return (
    <div
      className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center shrink-0"
      style={{
        background: `conic-gradient(
          from 220deg,
          rgb(236 72 153) 0%,
          rgb(168 85 247) ${progress}%,
          rgb(55 55 65) ${progress}% 100%
        )`,
        boxShadow: "0 0 28px rgba(168, 85, 247, 0.18)",
      }}
    >
      <div className="absolute inset-[7px] rounded-full bg-[#101012] flex flex-col items-center justify-center">
        <span className="text-xs text-secondary">{t("cycle.day")}</span>

        <span className="text-3xl sm:text-4xl font-bold text-primary leading-none mt-1">
          {cycleDay}
        </span>

        <span className="text-xs text-secondary mt-1">
          {t("cycle.of")} {safeCycleLength}
        </span>
      </div>
    </div>
  );
}

function PhaseTimeline({ cycleDay, cycleLength, periodEndDay, t }) {
  const safeCycleLength = cycleLength || 28;
  const follicularEnd = Math.max(periodEndDay + 1, safeCycleLength - 16);
  const ovulationStart = Math.max(periodEndDay + 1, safeCycleLength - 15);
  const ovulationEnd = Math.min(safeCycleLength, ovulationStart + 2);
  const lutealStart = ovulationEnd + 1;

  const phases = [
    {
      key: "menstrual",
      label: t("cycle.phases.menstrual"),
      range: `${t("cycle.phaseDays")} 1–${periodEndDay}`,
      start: 1,
      end: periodEndDay,
      className: "bg-pink-400/70",
      icon: "🩸",
    },
    {
      key: "follicular",
      label: t("cycle.phases.follicular"),
      range: `${t("cycle.phaseDays")} ${periodEndDay + 1}–${follicularEnd}`,
      start: periodEndDay + 1,
      end: follicularEnd,
      className: "bg-accent/70",
      icon: "🌸",
    },
    {
      key: "ovulation",
      label: t("cycle.phases.ovulation"),
      range: `${t("cycle.phaseDays")} ${ovulationStart}–${ovulationEnd}`,
      start: ovulationStart,
      end: ovulationEnd,
      className: "bg-violet-300/80",
      icon: "✨",
    },
    {
      key: "luteal",
      label: t("cycle.phases.luteal"),
      range: `${t("cycle.phaseDays")} ${lutealStart}–${safeCycleLength}`,
      start: lutealStart,
      end: safeCycleLength,
      className: "bg-purple-400/60",
      icon: "🌙",
    },
  ];

  const markerPosition =
    safeCycleLength > 1
      ? ((Math.min(cycleDay, safeCycleLength) - 1) / (safeCycleLength - 1)) *
        100
      : 0;

  return (
    <div className="mt-7">
      <div className="relative h-2.5 rounded-full bg-app overflow-visible">
        {phases.map((phase) => {
          const width = ((phase.end - phase.start + 1) / safeCycleLength) * 100;

          return (
            <div
              key={phase.key}
              className={`absolute top-0 h-2.5 rounded-full ${phase.className}`}
              style={{
                left: `${((phase.start - 1) / safeCycleLength) * 100}%`,
                width: `${width}%`,
              }}
            />
          );
        })}

        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-[3px] border-accent shadow-[0_0_14px_rgba(168,85,247,0.65)]"
          style={{ left: `calc(${markerPosition}% - 8px)` }}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4 mt-4">
        {phases.map((phase) => (
          <div key={phase.key} className="min-w-0">
            <p className="text-xs font-medium text-primary truncate">
              {phase.label} <span className="text-sm">{phase.icon}</span>
            </p>

            <p className="text-[10px] sm:text-xs text-secondary mt-1">
              {phase.range}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyPhaseTimeline({ t }) {
  const phases = [
    t("cycle.phases.menstrual"),
    t("cycle.phases.follicular"),
    t("cycle.phases.ovulation"),
    t("cycle.phases.luteal"),
  ];

  return (
    <div className="mt-7">
      <div className="relative h-2 rounded-full bg-app">
        <div className="absolute left-0 top-0 h-2 w-1/5 rounded-full bg-pink-400/20" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 mt-4">
        {phases.map((phase, index) => (
          <div key={phase} className="min-w-0">
            <p
              className={`text-xs font-medium truncate ${
                index === 0 ? "text-secondary" : "text-secondary/45"
              }`}
            >
              {phase}
            </p>

            {index === 0 && (
              <p className="text-[10px] sm:text-xs text-secondary/45 mt-1">
                Jour 1–5
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getPeriodEndDay(cycles) {
  if (!cycles[0]?.end_date) return 5;

  const start = new Date(`${cycles[0].start_date}T00:00:00`);
  const end = new Date(`${cycles[0].end_date}T00:00:00`);

  return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
}

export default function CurrentCycleCard({ cycleStatus, cycles, t }) {
  const getPhaseLabel = (phase) =>
    phase ? t(`cycle.phases.${phase}`) : t("cycle.noPhase");
  const getConfidenceLabel = (confidence) => t(`cycle.confidence.${confidence}`);
  const cycleLength = cycleStatus.averageCycleLength || 28;

  return (
    <section className="relative overflow-hidden card p-5 sm:p-7 mb-5">
      <div
        className="pointer-events-none absolute -left-16 -bottom-20 w-[230px] h-[130px] rounded-[55%] rotate-[18deg]"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(135deg, rgba(168,85,247,0.14), rgba(236,72,153,0.03))",
          border: "1px solid rgba(192,132,252,0.08)",
          boxShadow: "0 0 45px rgba(168,85,247,0.07)",
        }}
      />

      <div
        className="pointer-events-none absolute -left-10 -bottom-24 w-[170px] h-[100px] rounded-[55%] rotate-[-18deg]"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(135deg, rgba(236,72,153,0.10), rgba(168,85,247,0.02))",
        }}
      />

      <div className="relative flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.12em] font-medium text-secondary">
          {t("cycle.currentCycle")}
        </p>

        <span
          className="text-secondary/70"
          title={getConfidenceLabel(cycleStatus.confidence)}
        >
          <InfoIcon />
        </span>
      </div>

      {cycleStatus.cycleDay ? (
        <div className="relative mt-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
            <CycleProgress
              cycleDay={cycleStatus.cycleDay}
              cycleLength={cycleLength}
              t={t}
            />

            <div className="flex-1 min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-primary">
                {getPhaseLabel(cycleStatus.phase)}
              </p>

              <p className="text-sm text-secondary mt-2 max-w-xl">
                {getConfidenceLabel(cycleStatus.confidence)}
              </p>
            </div>
          </div>

          <PhaseTimeline
            cycleDay={cycleStatus.cycleDay}
            cycleLength={cycleLength}
            periodEndDay={getPeriodEndDay(cycles)}
            t={t}
          />
        </div>
      ) : (
        <div className="relative mt-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400/15 to-accent/10 border border-accent/10 text-accent flex items-center justify-center shrink-0">
              <DropletIcon />
            </div>

            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-semibold text-primary">
                {t("cycle.noPhase")}
              </p>

              <p className="text-sm text-secondary mt-1 max-w-xl leading-relaxed">
                {t("cycle.noData")}
              </p>
            </div>
          </div>

          <EmptyPhaseTimeline t={t} />
        </div>
      )}
    </section>
  );
}
