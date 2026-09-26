import { useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useMenstrualCycles } from "../hooks/useMenstrualCycles";

import {
  getCurrentCycleStatus,
  getCycleLengths,
} from "../utils/cycleCalculations";
import Button from "../components/ui/Button";
import CycleFlower from "../components/cycle/CycleFlowerTemp";
import DatePicker from "../components/ui/DatePicker";

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <rect x="3" y="4.5" width="18" height="16" rx="3" />
      <path d="M7 2.5v4M17 2.5v4M3 9h18" />
    </svg>
  );
}

function DropletIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path d="M12 3.5C12 3.5 6.5 10 6.5 14.5a5.5 5.5 0 0 0 11 0C17.5 10 12 3.5 12 3.5Z" />
      <path d="M9.5 15.5a2.8 2.8 0 0 0 2.5 2" />
    </svg>
  );
}

function OvulationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path d="M5 20V10M12 20V4M19 20v-7" />
      <path d="M3 20h18" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10.5v5M12 7.5h.01" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M5 12h13M13 7l5 5-5 5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" />
    </svg>
  );
}

function CycleProgress({ cycleDay, cycleLength }) {
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
        <span className="text-xs text-secondary">Jour</span>

        <span className="text-3xl sm:text-4xl font-bold text-primary leading-none mt-1">
          {cycleDay}
        </span>

        <span className="text-xs text-secondary mt-1">
          sur {safeCycleLength}
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
      range: `Jours 1–${periodEndDay}`,
      start: 1,
      end: periodEndDay,
      className: "bg-pink-400/70",
    },
    {
      key: "follicular",
      label: t("cycle.phases.follicular"),
      range: `Jours ${periodEndDay + 1}–${follicularEnd}`,
      start: periodEndDay + 1,
      end: follicularEnd,
      className: "bg-accent/70",
    },
    {
      key: "ovulation",
      label: t("cycle.phases.ovulation"),
      range: `Jours ${ovulationStart}–${ovulationEnd}`,
      start: ovulationStart,
      end: ovulationEnd,
      className: "bg-violet-300/80",
    },
    {
      key: "luteal",
      label: t("cycle.phases.luteal"),
      range: `Jours ${lutealStart}–${safeCycleLength}`,
      start: lutealStart,
      end: safeCycleLength,
      className: "bg-purple-400/60",
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
          style={{
            left: `calc(${markerPosition}% - 8px)`,
          }}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4 mt-4">
        {phases.map((phase) => (
          <div key={phase.key} className="min-w-0">
            <p className="text-xs font-medium text-primary truncate">
              {phase.label}
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

export default function Cycle() {
  const { profile } = useAuth();
  const { t, language } = useLanguage();

  const { cycles, loading, error, addCycle, deleteCycle } =
    useMenstrualCycles();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const isMale = profile?.sex === "male";
  const hasNoSex = !profile?.sex;

  const cycleStatus = useMemo(() => getCurrentCycleStatus(cycles), [cycles]);

  const cycleLengths = useMemo(() => getCycleLengths(cycles), [cycles]);

  const locale =
    language === "fr" ? "fr-FR" : language === "es" ? "es-ES" : "en-US";

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(`${date}T00:00:00`).toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getPhaseLabel = (phase) => {
    if (!phase) return t("cycle.noPhase");

    return t(`cycle.phases.${phase}`);
  };

  const getConfidenceLabel = (confidence) => {
    return t(`cycle.confidence.${confidence}`);
  };

  const getCycleDuration = (cycle) => {
    if (!cycle.end_date) return null;

    const start = new Date(`${cycle.start_date}T00:00:00`);

    const end = new Date(`${cycle.end_date}T00:00:00`);

    return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getPreviousCycleLength = (index) => {
    if (index >= cycles.length - 1) return null;

    const current = new Date(`${cycles[index].start_date}T00:00:00`);

    const previous = new Date(`${cycles[index + 1].start_date}T00:00:00`);

    return Math.round((current - previous) / (1000 * 60 * 60 * 24));
  };

  const getPeriodEndDay = () => {
    if (!cycles[0]?.end_date) return 5;

    const start = new Date(`${cycles[0].start_date}T00:00:00`);

    const end = new Date(`${cycles[0].end_date}T00:00:00`);

    return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    if (!startDate) {
      setFormError(t("cycle.errors.startDateRequired"));
      return;
    }

    if (endDate && endDate < startDate) {
      setFormError(t("cycle.errors.endDateBeforeStart"));
      return;
    }
    if (endDate) {
      const start = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T00:00:00`);

      const duration = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

      if (duration > 10) {
        setFormError(t("cycle.errors.endDateTooLate"));
        return;
      }
    }

    setSaving(true);

    const { error: addError } = await addCycle({
      startDate,
      endDate: endDate || null,
    });

    if (addError) {
      setFormError(t("cycle.errors.save"));
      setSaving(false);
      return;
    }

    setStartDate("");
    setEndDate("");
    setSaving(false);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(t("cycle.confirmDelete"));

    if (!confirmed) return;

    await deleteCycle(id);
  };

  if (isMale) {
    return (
      <div className="animate-fadeIn max-w-5xl mx-auto">
        <div className="mb-7">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">
            {t("cycle.title")}
          </h1>

          <p className="text-secondary mt-1">{t("cycle.subtitle")}</p>
        </div>

        <div className="card p-6">
          <p className="text-secondary text-sm">{t("cycle.notAvailable")}</p>
        </div>
      </div>
    );
  }

  if (hasNoSex) {
    return (
      <div className="animate-fadeIn max-w-5xl mx-auto">
        <div className="mb-7">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">
            {t("cycle.title")}
          </h1>

          <p className="text-secondary mt-1">{t("cycle.subtitle")}</p>
        </div>

        <div className="card p-6">
          <p className="text-secondary text-sm">{t("cycle.sexRequired")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative animate-fadeIn max-w-5xl mx-auto pb-8 overflow-visible">
      <CycleFlower />
      {/* Fleur organique décorative */}

      {/* Header */}
      <div className="relative mb-7">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">
          {t("cycle.title")}
        </h1>

        <p className="text-secondary mt-1">{t("cycle.subtitle")}</p>
      </div>

      {loading ? (
        <div className="card p-6">
          <p className="text-secondary text-sm">{t("common.loading")}</p>
        </div>
      ) : (
        <>
          {/* Cycle actuel */}
          <section className="relative overflow-hidden card p-5 sm:p-7 mb-5">
            {/* Forme organique décorative */}
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
                    cycleLength={cycleStatus.averageCycleLength || 28}
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
                  cycleLength={cycleStatus.averageCycleLength || 28}
                  periodEndDay={getPeriodEndDay()}
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

          {/* Statistiques */}
          {cycleStatus.cycleDay && (
            <section className="relative grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
              <StatCard
                icon={<CalendarIcon />}
                label={t("cycle.averageLength")}
                value={
                  cycleStatus.averageCycleLength
                    ? `${cycleStatus.averageCycleLength} ${t("cycle.days")}`
                    : "—"
                }
                description={
                  cycleLengths.length > 0
                    ? getConfidenceLabel(cycleStatus.confidence)
                    : null
                }
              />

              <StatCard
                icon={<DropletIcon />}
                iconClassName="text-pink-300"
                label={t("cycle.nextPeriod")}
                value={formatDate(cycleStatus.estimatedNextPeriod)}
                description={
                  cycleStatus.estimatedNextPeriod
                    ? getConfidenceLabel(cycleStatus.confidence)
                    : null
                }
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
                description={
                  cycleStatus.estimatedOvulationDay
                    ? getConfidenceLabel(cycleStatus.confidence)
                    : null
                }
              />
            </section>
          )}

          {/* Enregistrer un cycle */}
          <section className="relative overflow-visible card p-5 sm:p-7 mb-5">
            <div
              className="pointer-events-none absolute -right-24 -bottom-28 w-64 h-64 rounded-full blur-3xl opacity-[0.055]"
              style={{
                background:
                  "radial-gradient(circle, rgba(236,72,153,0.9), rgba(168,85,247,0.6), transparent 70%)",
              }}
            />

            <div className="relative">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  <CalendarIcon />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-primary">
                    {t("cycle.addTitle")}
                  </h2>

                  <p className="text-sm text-secondary mt-1">
                    {t("cycle.addDescription")}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="cycle-start-date"
                      className="block text-sm font-medium text-secondary mb-2"
                    >
                      {t("cycle.startDate")}
                    </label>

                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
                        <CalendarIcon />
                      </div>

                      <DatePicker
                        id="cycle-start-date"
                        value={startDate}
                        onChange={setStartDate}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="cycle-end-date"
                      className="block text-sm font-medium text-secondary mb-2"
                    >
                      {t("cycle.endDate")}
                    </label>

                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
                        <CalendarIcon />
                      </div>

                      <DatePicker
                        id="cycle-end-date"
                        value={endDate}
                        min={startDate || undefined}
                        onChange={setEndDate}
                      />
                    </div>
                  </div>
                </div>

                {formError && (
                  <p className="text-sm text-red-400 mt-4">{formError}</p>
                )}

                {error && !formError && (
                  <p className="text-sm text-red-400 mt-4">
                    {t("cycle.errors.generic")}
                  </p>
                )}

                <div className="flex justify-end mt-5">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto min-w-[200px]"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      {saving ? t("common.loading") : t("cycle.save")}

                      {!saving && <ArrowRightIcon />}
                    </span>
                  </Button>
                </div>

                <p className="flex items-center gap-2 text-xs text-secondary mt-3">
                  <InfoIcon />
                  <span>{t("cycle.endDateHint")}</span>
                </p>
              </form>
            </div>
          </section>

          {/* Historique */}
          <section className="relative overflow-hidden card p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  <HistoryIcon />
                </div>

                <h2 className="text-lg font-bold text-primary">
                  {t("cycle.history")}
                </h2>
              </div>

              <span className="text-xs text-secondary bg-app rounded-full px-3 py-1">
                {cycles.length}
              </span>
            </div>

            {cycles.length === 0 ? (
              <div className="py-7 flex flex-col items-center text-center">
                <div className="w-11 h-11 rounded-full bg-app text-secondary flex items-center justify-center mb-4">
                  <HistoryIcon />
                </div>

                <p className="text-sm font-medium text-primary">
                  {t("cycle.emptyHistory")}
                </p>

                <p className="text-xs text-secondary mt-2 max-w-sm leading-relaxed">
                  {t("cycle.noData")}
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-pink-400/50 via-accent/40 to-accent/10" />

                <div className="flex flex-col gap-5">
                  {cycles.map((cycle, index) => {
                    const periodDuration = getCycleDuration(cycle);

                    const previousCycleLength = getPreviousCycleLength(index);

                    return (
                      <div key={cycle.id} className="relative flex gap-4">
                        <div className="relative z-10 w-4 h-4 rounded-full bg-accent border-4 border-app shrink-0 mt-1 shadow-[0_0_10px_rgba(168,85,247,0.35)]" />

                        <div className="flex-1 min-w-0 flex items-start justify-between gap-4 pb-1">
                          <div className="min-w-0">
                            <p className="font-medium text-primary">
                              {formatDate(cycle.start_date)}

                              {cycle.end_date && (
                                <>
                                  <span className="text-secondary mx-2">→</span>

                                  {formatDate(cycle.end_date)}
                                </>
                              )}
                            </p>

                            <p className="text-xs text-secondary mt-1">
                              {previousCycleLength
                                ? `${t("cycle.cycleDuration")} ${previousCycleLength} ${t("cycle.days")}`
                                : periodDuration
                                  ? `${periodDuration} ${t("cycle.periodDuration")}`
                                  : t("cycle.endDateNotProvided")}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDelete(cycle.id)}
                            aria-label={`${t("cycle.delete")} ${formatDate(
                              cycle.start_date,
                            )}`}
                            className="shrink-0 w-9 h-9 rounded-xl border border-app bg-app text-secondary hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-all flex items-center justify-center"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
