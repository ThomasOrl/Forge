import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSelector from "../components/ui/LanguageSelector";
import { goalMealPlans } from "../data/goalMealPlans";

const tabs = [
  { id: "home", label: "preview.tabs.home", icon: "/ForgeIcons/Home.png" },
  {
    id: "history",
    label: "preview.tabs.history",
    icon: "/ForgeIcons/Historique.png",
  },
  {
    id: "progress",
    label: "preview.tabs.progress",
    icon: "/ForgeIcons/Progression.png",
  },
  {
    id: "goals",
    label: "preview.tabs.goals",
    icon: "/ForgeIcons/Objectifs.png",
  },
  {
    id: "cycle",
    label: "preview.tabs.cycle",
    icon: "/ForgeIcons/cycle.png",
  },
];

const chartValues = [28, 39, 46, 58, 68, 82, 94];

export default function Preview() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("home");

  const demoWorkouts = [
    { name: t("preview.workoutPush"), date: t("preview.dateToday"), volume: "3 250 kg" },
    { name: t("preview.workoutLegs"), date: t("preview.dateYesterday"), volume: "4 180 kg" },
    { name: t("preview.workoutPull"), date: t("preview.dateEarlier"), volume: "2 960 kg" },
  ];

  return (
    <div className="min-h-screen bg-app px-4 py-5 text-primary sm:px-6 sm:py-7">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link to="/preview" className="flex items-center gap-3" aria-label="Forge">
          <img src="/logo-simple.png" alt="" className="h-11 w-11 object-contain" />
          <span className="text-lg font-extrabold tracking-tight">{t("common.appName")}</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="sm:hidden">
            <LanguageSelector compact />
          </div>
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>
          <Link
            to="/login"
            className="rounded-btn px-3 py-2 text-sm font-medium text-secondary transition-colors hover:text-primary sm:px-4"
          >
            {t("preview.signIn")}
          </Link>
          <Link
            to="/signup"
            className="rounded-btn bg-accent px-3 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-accent-hover sm:px-5"
          >
            {t("preview.createAccount")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl pb-8 pt-12 sm:pt-16">
        <section className="mb-8 text-center sm:mb-10">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs font-semibold text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            {t("preview.badge")}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary sm:text-5xl">
            {t("preview.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-secondary sm:text-lg">
            {t("preview.subtitle")}
          </p>
        </section>

        <div
          className="mx-auto mb-5 grid max-w-4xl grid-cols-5 gap-1 rounded-2xl border border-app bg-dark-card p-1.5 sm:mb-6 sm:gap-2 sm:p-2"
          role="tablist"
          aria-label={t("preview.tabsLabel")}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`preview-tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls="preview-panel"
              onClick={() => setActiveTab(tab.id)}
              className={`flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-1 py-2.5 text-[9px] font-medium transition-colors sm:flex-row sm:gap-2 sm:px-3 sm:py-3 sm:text-sm ${
                activeTab === tab.id
                  ? "bg-accent/20 text-accent"
                  : "text-secondary hover:bg-accent/5 hover:text-primary"
              }`}
            >
              <img src={tab.icon} alt="" className="h-6 w-6 object-contain sm:h-5 sm:w-5" />
              <span className="truncate">{t(tab.label)}</span>
            </button>
          ))}
        </div>

        <section
          id="preview-panel"
          role="tabpanel"
          aria-labelledby={`preview-tab-${activeTab}`}
          className="card relative overflow-hidden p-3 sm:p-5 lg:p-6"
        >
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent/8 blur-3xl" />
          <div className="relative grid gap-4 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-6">
            <DemoSidebar t={t} activeTab={activeTab} />
            <div className="min-w-0 py-1 sm:py-2">
              {activeTab === "home" && (
                <HomePreview t={t} demoWorkouts={demoWorkouts} />
              )}
              {activeTab === "history" && (
                <HistoryPreview t={t} demoWorkouts={demoWorkouts} />
              )}
              {activeTab === "progress" && <ProgressPreview t={t} />}
              {activeTab === "goals" && (
                <GoalsPreview t={t} language={language} />
              )}
              {activeTab === "cycle" && <CyclePreview t={t} />}
            </div>
          </div>
        </section>

        <section className="card mt-5 flex flex-col gap-4 border-accent/20 bg-gradient-to-r from-accent/[0.08] to-transparent p-4 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent" aria-hidden="true">
              <DemoIcon type="database" />
            </span>
            <div>
              <p className="font-semibold text-primary">{t("preview.demoTitle")}</p>
              <p className="mt-1 text-xs leading-relaxed text-secondary sm:text-sm">
                {t("preview.demoDescription")}
              </p>
            </div>
          </div>
          <Link
            to="/signup"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-btn bg-accent px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-accent-hover"
          >
            {t("preview.createAccount")}
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>
    </div>
  );
}

function DemoSidebar({ t, activeTab }) {
  return (
    <aside className="hidden rounded-2xl border border-app bg-app/50 p-4 lg:block">
      <div className="mb-6 flex items-center gap-2.5">
        <img src="/logo-simple.png" alt="" className="h-9 w-9 object-contain" />
        <div>
          <p className="text-sm font-bold text-primary">{t("common.appName")}</p>
          <p className="text-[11px] text-secondary">{t("preview.demoMode")}</p>
        </div>
      </div>
      <nav aria-label={t("preview.tabsLabel")} className="space-y-1">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium ${
              activeTab === tab.id
                ? "bg-accent/10 text-accent"
                : "text-secondary"
            }`}
          >
            <img src={tab.icon} alt="" className="h-6 w-6 object-contain" />
            {t(tab.label)}
          </div>
        ))}
      </nav>
    </aside>
  );
}

function HomePreview({ t, demoWorkouts }) {
  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xl font-bold text-primary sm:text-2xl">
            {t("preview.greeting")}, {t("preview.demoName")} <span aria-hidden="true">👋</span>
          </p>
          <p className="mt-1 text-sm text-secondary">{t("dashboard.subtitle")}</p>
        </div>
        <span className="rounded-full border border-app px-3 py-1.5 text-xs text-secondary">
          {t("preview.demoMode")}
        </span>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <MetricCard icon="/ForgeIcons/Entrainement.png" label={t("dashboard.totalWorkouts")} value="12" />
        <MetricCard icon="/ForgeIcons/Progression.png" label={t("dashboard.totalVolume")} value="8 450 kg" />
        <MetricCard icon="/ForgeIcons/Exercices.png" label={t("dashboard.exerciseCount")} value="18" className="col-span-2 sm:col-span-1" />
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard t={t} />
        <RecentWorkout t={t} workout={demoWorkouts[0]} />
      </div>
    </>
  );
}

function MetricCard({ icon, label, value, className = "" }) {
  return (
    <div className={`card-alt min-w-0 p-3 sm:p-4 ${className}`}>
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 p-1.5">
        <img src={icon} alt="" className="h-full w-full object-contain" />
      </div>
      <p className="truncate text-lg font-bold text-primary sm:text-2xl">{value}</p>
      <p className="mt-0.5 truncate text-[11px] text-secondary sm:text-xs">{label}</p>
    </div>
  );
}

function ChartCard({ t }) {
  const weekLabels = [
    t("preview.weeks.week1"),
    t("preview.weeks.week2"),
    t("preview.weeks.week3"),
    t("preview.weeks.week4"),
    t("preview.weeks.week5"),
    t("preview.weeks.week6"),
    t("preview.weeks.week7"),
  ];

  return (
    <div className="card-alt min-w-0 p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="font-semibold text-primary">{t("progress.volumeOverTime")}</h2>
        <p className="mt-1 text-xs text-secondary">{t("preview.chartCaption")}</p>
      </div>
      <div
        role="img"
        aria-label={t("preview.chartAccessibleLabel")}
        className="flex h-40 items-end gap-2 border-b border-l border-app px-2 sm:h-48 sm:gap-3 sm:px-3"
      >
        {chartValues.map((height, index) => (
          <div key={weekLabels[index]} className="flex h-full min-w-0 flex-1 flex-col justify-end">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-accent/55 to-accent shadow-[0_0_20px_rgba(168,85,247,0.12)]"
              style={{ height: `${height}%` }}
            />
            <span className="-mb-5 mt-2 truncate text-center text-[9px] text-secondary sm:text-[10px]">
              {weekLabels[index]}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-8 text-right text-[10px] text-secondary">{t("preview.sampleDataNote")}</p>
    </div>
  );
}

function RecentWorkout({ t, workout }) {
  return (
    <div className="card-alt min-w-0 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-semibold text-primary">{t("dashboard.lastWorkout")}</h2>
        <span className="text-xs text-accent">{t("preview.demoMode")}</span>
      </div>
      <p className="text-xs text-secondary">{workout.date}</p>
      <p className="mt-2 font-semibold text-primary">{workout.name}</p>
      <div className="mt-4 space-y-2 border-t border-app pt-3 text-xs text-secondary">
        <div className="flex justify-between gap-2"><span>{t("preview.exerciseBench")}</span><span>4 × 8</span></div>
        <div className="flex justify-between gap-2"><span>{t("preview.exerciseIncline")}</span><span>3 × 10</span></div>
        <div className="flex justify-between gap-2"><span>{t("preview.exerciseLateral")}</span><span>3 × 12</span></div>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-3 py-2 text-xs">
        <span className="text-secondary">{t("workout.workoutCompleted")}</span>
        <span className="font-semibold text-emerald-400">{workout.volume}</span>
      </div>
    </div>
  );
}

function HistoryPreview({ t, demoWorkouts }) {
  return (
    <div>
      <PreviewHeading t={t} title={t("history.title")} description={t("preview.historyCaption")} />
      <div className="space-y-3">
        {demoWorkouts.map((workout, index) => (
          <div key={workout.name} className="card-alt flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <img src="/ForgeIcons/Entrainement.png" alt="" className="h-9 w-9 shrink-0 object-contain" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-primary">{workout.name}</p>
                <p className="mt-1 text-xs text-secondary">{workout.date} · {index === 0 ? "1 h 12" : "58 min"}</p>
              </div>
            </div>
            <span className="rounded-full border border-emerald-500/15 bg-emerald-500/5 px-3 py-1.5 text-xs text-emerald-400">
              {workout.volume}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressPreview({ t }) {
  return (
    <div>
      <PreviewHeading t={t} title={t("progress.title")} description={t("preview.progressCaption")} />
      <div className="grid gap-3 xl:grid-cols-[1.3fr_0.7fr]">
        <ChartCard t={t} />
        <div className="card-alt p-4 sm:p-5">
          <h2 className="font-semibold text-primary">{t("progress.personalRecords")}</h2>
          <p className="mt-1 text-xs text-secondary">{t("preview.sampleDataNote")}</p>
          <div className="mt-5 space-y-3">
            {[
              [t("preview.exerciseBench"), "95 kg"],
              [t("preview.exerciseSquat"), "120 kg"],
              [t("preview.exerciseDeadlift"), "140 kg"],
            ].map(([name, weight]) => (
              <div key={name} className="flex items-center justify-between gap-2 border-b border-app pb-3 last:border-0">
                <span className="text-sm text-secondary">{name}</span>
                <span className="font-bold text-accent">{weight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GoalsPreview({ t, language }) {
  const languageKey = ["fr", "en", "it", "es"].includes(language)
    ? language
    : "fr";

  return (
    <div>
      <PreviewHeading t={t} title={t("goals.title")} description={t("preview.goalsCaption")} />
      <div className="grid gap-3 xl:grid-cols-2">
        {[
          { id: "mass", icon: "/ForgeIcons/prise-de-masse.svg", color: "text-accent" },
          { id: "cut", icon: "/ForgeIcons/seche.svg", color: "text-orange-400" },
        ].map((program) => {
          const meal = goalMealPlans[program.id][0];

          return (
            <article key={program.id} className="card-alt p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <img src={program.icon} alt="" className="h-10 w-10 object-contain" />
                <div>
                  <h2 className={`font-bold ${program.color}`}>{t(`goals.${program.id}`)}</h2>
                  <p className="mt-1 text-xs text-secondary">{t("preview.sampleDataNote")}</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <MealRow label={t("goals.breakfast")} value={meal.breakfast[languageKey]} />
                <MealRow label={t("goals.lunch")} value={meal.lunch[languageKey]} />
              </div>
            </article>
          );
        })}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-secondary">{t("goals.guidance")}</p>
    </div>
  );
}

function CyclePreview({ t }) {
  const phases = [
    { label: t("cycle.phases.menstrual"), width: "20%", color: "bg-rose-400" },
    { label: t("cycle.phases.follicular"), width: "34%", color: "bg-purple-400" },
    { label: t("cycle.phases.ovulation"), width: "12%", color: "bg-fuchsia-400" },
    { label: t("cycle.phases.luteal"), width: "34%", color: "bg-indigo-400" },
  ];

  return (
    <div>
      <PreviewHeading t={t} title={t("cycle.title")} description={t("preview.cycleCaption")} />
      <p className="mb-4 inline-flex items-center gap-2 rounded-lg border border-app bg-app/40 px-3 py-2 text-xs text-secondary">
        <span aria-hidden="true" className="text-accent">ⓘ</span>
        {t("preview.cycleEligibilityNote")}
      </p>
      <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="card-alt p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-primary">{t("cycle.currentCycle")}</p>
              <p className="mt-2 text-3xl font-bold text-accent">{t("preview.cycleDay")}</p>
            </div>
            <span className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs text-accent">
              {t("preview.demoMode")}
            </span>
          </div>
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-[10px] text-secondary">
              <span>{t("preview.cycleStart")}</span>
              <span>{t("preview.cycleEstimate")}</span>
            </div>
            <div className="flex h-3 overflow-hidden rounded-full bg-app">
              {phases.map((phase) => (
                <span
                  key={phase.label}
                  className={`${phase.color} opacity-80`}
                  style={{ width: phase.width }}
                />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
              {phases.map((phase) => (
                <div key={phase.label} className="flex min-w-0 items-center gap-2 text-xs text-secondary">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${phase.color}`} />
                  <span className="truncate">{phase.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card-alt flex flex-col justify-center p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
            {t("preview.cycleEstimate")}
          </p>
          <p className="mt-2 text-lg font-bold text-primary">{t("preview.cycleNextPeriod")}</p>
          <p className="mt-3 text-xs leading-relaxed text-secondary">{t("preview.cycleDisclaimer")}</p>
        </div>
      </div>
    </div>
  );
}

function MealRow({ label, value }) {
  return (
    <div className="rounded-xl border border-app bg-app/40 p-3">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-accent">{label}</p>
      <p className="leading-relaxed text-primary">{value}</p>
    </div>
  );
}

function PreviewHeading({ t, title, description }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="text-xl font-bold text-primary sm:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-secondary">{description}</p>
      </div>
      <span className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs font-medium text-accent">
        {t("preview.demoMode")}
      </span>
    </div>
  );
}

function DemoIcon({ type }) {
  if (type === "database") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5" aria-hidden="true">
        <ellipse cx="12" cy="5" rx="7" ry="3" />
        <path d="M5 5v14c0 1.7 14 1.7 14 0V5M5 12c0 1.7 14 1.7 14 0" />
      </svg>
    );
  }
  return null;
}
