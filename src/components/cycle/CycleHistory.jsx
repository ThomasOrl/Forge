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

function getPeriodDuration(cycle) {
  if (!cycle.end_date) return null;

  const start = new Date(`${cycle.start_date}T00:00:00`);
  const end = new Date(`${cycle.end_date}T00:00:00`);

  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

function getPreviousCycleLength(cycles, index) {
  if (index >= cycles.length - 1) return null;

  const current = new Date(`${cycles[index].start_date}T00:00:00`);
  const previous = new Date(`${cycles[index + 1].start_date}T00:00:00`);

  return Math.round((current - previous) / (1000 * 60 * 60 * 24));
}

export default function CycleHistory({ cycles, formatDate, onDelete, t }) {
  return (
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
              const periodDuration = getPeriodDuration(cycle);
              const previousCycleLength = getPreviousCycleLength(cycles, index);

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
                      onClick={() => onDelete(cycle.id)}
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
  );
}
