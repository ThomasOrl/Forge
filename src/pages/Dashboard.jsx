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
    { fr: "fr-FR", en: "en-US", es: "es-ES", it: "it-IT" }[language] ||
    "fr-FR";

  const today = new Date().toLocaleDateString(dateLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">
          {t("dashboard.greeting")}, {firstName} 👋
        </h1>

        <p className="text-secondary mt-1">{t("dashboard.subtitle")}</p>

        <p className="text-xs text-secondary mt-1 capitalize">{today}</p>
      </div>

      {/* Démarrer une séance */}
      <div className="card p-6 mb-8 relative overflow-hidden">
        <p className="text-xs uppercase tracking-wide text-secondary mb-2">
          {t("dashboard.nextWorkout")}
        </p>

        <p className="text-secondary mb-5">{t("dashboard.noNextWorkout")}</p>

        <button
          onClick={() => navigate("/workout")}
          className="px-5 py-3 rounded-btn bg-accent text-black font-semibold hover:bg-accent-hover transition-colors"
        >
          {t("dashboard.startWorkout")}
        </button>
      </div>

      {/* Statistiques */}
      <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-3">
        {t("dashboard.stats")}
      </h3>

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
          />

          <StatCard
            label={t("dashboard.exerciseCount")}
            value={stats.exerciseCount}
          />

          <StatCard label={t("dashboard.totalSets")} value={stats.setCount} />

          <StatCard
            label={t("dashboard.bestLift")}
            value={formatVolume(stats.bestLift)}
            unit={t("common.kg")}
          />
        </div>
      )}

      {/* Dernière séance */}
      <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-3">
        {t("dashboard.lastWorkout")}
      </h3>

      {loading ? (
        <div className="card p-6 text-secondary text-sm">
          {t("common.loading")}
        </div>
      ) : loadError ? null : lastWorkout ? (
        <button
          onClick={() => navigate(`/history/${lastWorkout.id}`)}
          className="card p-5 w-full text-left hover:border-accent/30 transition-colors"
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
