import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { goalMealPlans } from "../data/goalMealPlans";
import PageTitle from "../components/ui/PageTitle";

const PROGRAMS = [
  {
    id: "mass",
    icon: "/ForgeIcons/prise-de-masse.svg",
    accent: "from-violet-500/20 to-fuchsia-500/5",
  },
  {
    id: "cut",
    icon: "/ForgeIcons/seche.svg",
    accent: "from-pink-500/20 to-violet-500/5",
  },
];

const MEAL_TYPES = ["breakfast", "lunch", "snack", "dinner"];

export default function Goals() {
  const { t, language } = useLanguage();
  const [selectedProgram, setSelectedProgram] = useState("mass");
  const activeProgram = PROGRAMS.find(
    (program) => program.id === selectedProgram,
  );
  const meals = goalMealPlans[selectedProgram];
  const today = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ][new Date().getDay()];

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto pb-8">
      <header className="mb-7">
        <PageTitle
          icon="/ForgeIcons/Objectifs.png"
          className="mb-2"
        >
          {t("goals.title")}
        </PageTitle>
        <p className="text-secondary">{t("goals.subtitle")}</p>
      </header>

      <div
        className="grid grid-cols-2 gap-3 mb-5"
        role="tablist"
        aria-label={t("goals.title")}
      >
        {PROGRAMS.map((program) => {
          const isActive = selectedProgram === program.id;

          return (
            <button
              key={program.id}
              type="button"
              role="tab"
              id={`goal-program-tab-${program.id}`}
              aria-controls="goal-program-panel"
              aria-selected={isActive}
              onClick={() => setSelectedProgram(program.id)}
              className={`group relative cursor-pointer overflow-hidden rounded-card border p-4 sm:p-5 text-left transition-all ${
                isActive
                  ? "border-accent/50 bg-accent/10"
                  : "border-app bg-app hover:border-accent/25"
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${program.accent} pointer-events-none`}
              />
              <div className="relative flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-3">
                  <img
                    src={program.icon}
                    alt=""
                    aria-hidden="true"
                    className="w-8 h-8 shrink-0 object-contain"
                  />
                  <span
                    className={`font-semibold ${
                      isActive ? "text-accent" : "text-primary"
                    }`}
                  >
                    {t(`goals.${program.id}`)}
                  </span>
                </span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    isActive
                      ? "border-accent/25 text-accent"
                      : "border-app text-secondary"
                  }`}
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-4 w-4"
                  >
                    <path d="M4 10h11m-4-4 4 4-4 4" />
                  </svg>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <section
        className="relative overflow-hidden card p-5 sm:p-7 mb-7"
        role="tabpanel"
        id="goal-program-panel"
        aria-labelledby={`goal-program-tab-${selectedProgram}`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${activeProgram.accent} pointer-events-none`}
        />
        <div className="absolute -right-16 -top-20 w-56 h-56 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.16em] font-semibold text-accent mb-2">
              {t("goals.weeklyPlan")}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2">
              {t(`goals.${selectedProgram}`)}
            </h2>
            <p className="text-sm text-secondary leading-relaxed">
              {t(`goals.${selectedProgram}Description`)}
            </p>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0">
            <span className="rounded-full border border-app bg-app px-3 py-1.5 text-xs text-secondary">
              {t("goals.week")}
            </span>
            <span className="rounded-full border border-app bg-app px-3 py-1.5 text-xs text-secondary">
              {t("goals.mealsPerDay")}
            </span>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-primary">
          {t("goals.weeklyPlan")}
        </h3>
        <span className="text-xs text-secondary">{t("goals.week")}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {meals.map((day, index) => {
          const isToday = day.day === today;

          return (
          <article
            key={day.day}
            aria-current={isToday ? "date" : undefined}
            className={`card p-5 sm:p-6 overflow-hidden border transition-colors ${
              isToday
                ? "border-violet-400 ring-2 ring-violet-400/50 shadow-[0_0_18px_rgba(167,139,250,0.22)]"
                : "border-transparent"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h4 className="text-base font-bold text-primary">
                {t(`goals.days.${day.day}`)}
              </h4>
            </div>

            <div className="space-y-3">
              {MEAL_TYPES.map((mealType) => (
                <div
                  key={mealType}
                  className="grid grid-cols-[104px_1fr] sm:grid-cols-[128px_1fr] gap-3 border-t border-app pt-3 first:border-0 first:pt-0"
                >
                  <p className="text-[11px] uppercase tracking-wide text-secondary font-semibold pt-0.5">
                    {t(`goals.${mealType}`)}
                  </p>
                  <p className="text-sm text-primary leading-relaxed">
                    {day[mealType][language] || day[mealType].fr}
                  </p>
                </div>
              ))}
            </div>
          </article>
          );
        })}
      </div>

      <aside className="mt-6 rounded-card border border-accent/15 bg-accent/5 p-5 sm:p-6">
        <div className="flex gap-3">
          <span className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 10.5v5M12 7.5h.01" />
            </svg>
          </span>
          <div>
            <h3 className="font-semibold text-primary mb-1">
              {t("goals.guidanceTitle")}
            </h3>
            <p className="text-sm text-secondary leading-relaxed">
              {t("goals.guidance")}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
