import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../lib/supabase";
import StatCard from "../components/ui/StatCard";
import EmptyState from "../components/ui/EmptyState";
import { formatVolume } from "../utils/calculations";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    workoutCount: 0,
    exerciseCount: 0,
    setCount: 0,
    bestLift: 0,
  });

  const [lastWorkout, setLastWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoadError(false);
      setStats({
        workoutCount: 0,
        exerciseCount: 0,
        setCount: 0,
        bestLift: 0,
      });
      setLastWorkout(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    async function load() {
      setLoading(true);
      setLoadError(false);

      try {
        const { data: workouts, error: workoutsError } = await supabase
          .from("workouts")
          .select("id, name, date, total_volume")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("date", { ascending: false })
          .order("created_at", { ascending: false });

        if (workoutsError) throw workoutsError;

        const completedWorkouts = workouts || [];
        let workoutExercises = [];

        if (completedWorkouts.length > 0) {
          const workoutIds = completedWorkouts.map((workout) => workout.id);
          const { data, error } = await supabase
            .from("workout_exercises")
            .select("id, exercise_id, workout_id, sets(id, weight)")
            .eq("user_id", user.id)
            .in("workout_id", workoutIds);

          if (error) throw error;
          workoutExercises = data || [];
        }

        if (!mounted) return;

        const completedSets = workoutExercises.flatMap(
          (exercise) => exercise.sets || [],
        );
        const uniqueExerciseIds = new Set(
          workoutExercises
            .map((exercise) => exercise.exercise_id)
            .filter(Boolean),
        );

        setStats({
          workoutCount: completedWorkouts.length,
          exerciseCount: uniqueExerciseIds.size,
          setCount: completedSets.length,
          bestLift: completedSets.reduce(
            (max, set) => Math.max(max, Number(set.weight) || 0),
            0,
          ),
        });

        const latest = completedWorkouts[0];
        if (!latest) {
          setLastWorkout(null);
          return;
        }

        const latestExercises = workoutExercises.filter(
          (exercise) => exercise.workout_id === latest.id,
        );
        const latestSetCount = latestExercises.reduce(
          (sum, exercise) => sum + (exercise.sets?.length || 0),
          0,
        );

        setLastWorkout({
          ...latest,
          exerciseCount: latestExercises.length,
          setCount: latestSetCount,
        });
      } catch {
        if (!mounted) return;
        setLoadError(true);
        setStats({
          workoutCount: 0,
          exerciseCount: 0,
          setCount: 0,
          bestLift: 0,
        });
        setLastWorkout(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [user]);

  const firstName = profile?.first_name || profile?.username || "";
  const dateLocale =
    { fr: "fr-FR", en: "en-US", es: "es-ES", it: "it-IT" }[language] || "fr-FR";

  const today = new Date().toLocaleDateString(dateLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">
            {t("dashboard.greeting")}, {firstName} 👋
          </h1>
          <p className="text-secondary mt-1">{t("dashboard.subtitle")}</p>
        </div>

        <div className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full border border-accent/20 bg-accent/5 px-3.5 py-2 text-sm text-secondary capitalize">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="w-4 h-4 text-accent"
            aria-hidden="true"
          >
            <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
            <path d="M7.5 3v4M16.5 3v4M3.5 9.5h17" />
          </svg>
          {today}
        </div>
      </div>

      {/* Démarrer une séance */}
      <div className="card relative isolate overflow-hidden p-6 sm:p-8 mb-8 border-accent/10 bg-gradient-to-br from-accent/[0.03] to-transparent">
        <div className="absolute -right-12 -top-20 -z-10 w-64 h-64 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl">
          <p className="text-xs uppercase tracking-[0.18em] font-semibold text-accent mb-3">
            {t("dashboard.nextWorkout")}
          </p>
          <p className="text-lg sm:text-xl font-semibold text-primary mb-6">
            {t("dashboard.noNextWorkout")}
          </p>

          <button
            onClick={() => navigate("/workout")}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-btn bg-accent text-black font-semibold shadow-cardHover hover:bg-accent-hover hover:-translate-y-0.5 transition-all"
          >
            {t("dashboard.startWorkout")}
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <path d="M3.5 10h12m-5-5 5 5-5 5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-sm font-semibold text-secondary uppercase tracking-wide">
          {t("dashboard.stats")}
        </h2>
        <span className="flex-1 border-t border-app" />
      </div>

      {loading ? (
        <div className="card p-6 mb-8 text-secondary text-sm">
          {t("common.loading")}
        </div>
      ) : loadError ? (
        <div className="card p-6 mb-8 text-red-400 text-sm" role="alert">
          {t("auth.errors.generic")}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard
            label={t("dashboard.totalWorkouts")}
            value={stats.workoutCount}
            icon={<StatIcon type="workouts" />}
          />

          <StatCard
            label={t("dashboard.exerciseCount")}
            value={stats.exerciseCount}
            icon={<StatIcon type="exercises" />}
          />

          <StatCard
            label={t("dashboard.totalSets")}
            value={stats.setCount}
            icon={<StatIcon type="sets" />}
          />

          <StatCard
            label={t("dashboard.bestLift")}
            value={formatVolume(stats.bestLift)}
            unit={t("common.kg")}
            icon={<StatIcon type="lift" />}
          />
        </div>
      )}

      {/* Dernière séance */}
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-sm font-semibold text-secondary uppercase tracking-wide">
          {t("dashboard.lastWorkout")}
        </h2>
        <span className="flex-1 border-t border-app" />
      </div>

      {loading ? (
        <div className="card p-6 text-secondary text-sm">
          {t("common.loading")}
        </div>
      ) : loadError ? null : lastWorkout ? (
        <button
          onClick={() => navigate(`/history/${lastWorkout.id}`)}
          className="card p-5 w-full text-left hover:border-accent/40 hover:shadow-cardHover hover:-translate-y-0.5 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-primary">{lastWorkout.name}</h4>

            <span className="text-xs text-secondary">
              {new Date(lastWorkout.date).toLocaleDateString(dateLocale, {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>

          <p className="text-sm text-secondary">
            {lastWorkout.exerciseCount} {t("common.exercises")} ·{" "}
            {lastWorkout.setCount} {t("common.sets")} ·{" "}
            <span className="font-semibold text-primary">
              {formatVolume(lastWorkout.total_volume)} {t("common.kg")}
            </span>
          </p>
        </button>
      ) : (
        <EmptyState
          title={t("history.emptyTitle")}
          text={t("history.emptyText")}
          actionLabel={t("history.startFirstWorkout")}
          onAction={() => navigate("/workout")}
        />
      )}
    </div>
  );
}

function StatIcon({ type }) {
  const paths = {
    workouts: <path d="M6 8v8m12-8v8M3.5 10v4m17-4v4M6 12h12" />,
    exercises: <>
      <rect x="5" y="4.5" width="14" height="17" rx="2" />
      <path d="M9 4.5v-1h6v1M9 10h6M9 14h6M9 18h3" />
    </>,
    sets: <>
      <rect x="4" y="5" width="16" height="4" rx="1.5" />
      <rect x="4" y="15" width="16" height="4" rx="1.5" />
    </>,
    lift: <>
      <path d="M12 3.5v17m-6-6 6 6 6-6" />
      <path d="M5 4.5h14" />
    </>,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 text-accent"
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  );
}
