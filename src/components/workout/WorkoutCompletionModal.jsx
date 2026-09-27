import Button from "../ui/Button";
import Confetti from "../ui/Confetti";

export default function WorkoutCompletionModal({
  open,
  exerciseCount,
  setCount,
  onClose,
  t,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="workout-completion-title"
    >
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      <Confetti />

      <div className="relative z-[101] w-full max-w-md rounded-2xl border border-accent/30 bg-dark-card p-8 text-center shadow-2xl animate-completionPop">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 border border-accent/30 animate-completionIcon">
          <span className="text-5xl" aria-hidden="true">
            🎉
          </span>
        </div>

        <p className="text-sm uppercase tracking-widest text-accent font-semibold mb-2">
          {t("workout.completionEyebrow")}
        </p>

        <h2
          id="workout-completion-title"
          className="text-2xl sm:text-3xl font-bold text-primary mb-3"
        >
          {t("workout.completionTitle")} 💪
        </h2>

        <p className="text-secondary mb-6">{t("workout.completionMessage")}</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl bg-dark-cardAlt border border-app p-3">
            <p className="text-xs text-secondary mb-1">
              {t("common.exercises")}
            </p>
            <p className="text-xl font-bold text-primary">{exerciseCount}</p>
          </div>

          <div className="rounded-xl bg-dark-cardAlt border border-app p-3">
            <p className="text-xs text-secondary mb-1">{t("common.sets")}</p>
            <p className="text-xl font-bold text-primary">{setCount}</p>
          </div>
        </div>

        <Button className="w-full" onClick={onClose}>
          {t("workout.viewSummary")}
        </Button>
      </div>
    </div>
  );
}
