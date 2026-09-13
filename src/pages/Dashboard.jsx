import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../lib/supabase";
import StatCard from "../components/ui/StatCard";
import EmptyState from "../components/ui/EmptyState";
import { formatVolume, localeFromLang } from "../utils/calculations";

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

  useEffect(() => {
    if (!user) return;

    let mounted = true;

    async function load() {
      setLoading(true);

      // Séances terminées
      const { data: workouts } = await supabase
        .from("workouts")
        .select("id, name, date, total_volume")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("date", { ascending: false });

      // Toutes les séries de l'utilisateur
      const { data: sets } = await supabase
        .from("sets")
        .select("weight, repetitions, workout_exercise_id")
        .eq("user_id", user.id);

      if (!mounted) return;

      const workoutCount = workouts?.length || 0;

      const setCount = sets?.length || 0;

      const bestLift =
        sets?.reduce((max, set) => Math.max(max, Number(set.weight) || 0), 0) ||
        0;

      /*
       * Nombre d'exercices différents réalisés.
       *
       * On récupère les exercise_id liés aux séances terminées,
       * puis on utilise un Set pour éliminer les doublons.
       */
      let exerciseCount = 0;

      if (workouts && workouts.length > 0) {
        const workoutIds = workouts.map((workout) => workout.id);

        const { data: workoutExercises } = await supabase
          .from("workout_exercises")
          .select("exercise_id")
          .in("workout_id", workoutIds)
          .eq("user_id", user.id);

        const uniqueExerciseIds = new Set(
          (workoutExercises || [])
            .map((exercise) => exercise.exercise_id)
            .filter(Boolean),
        );

        exerciseCount = uniqueExerciseIds.size;
      }

      setStats({
        workoutCount,
        exerciseCount,
        setCount,
        bestLift,
      });

      // Dernière séance
      if (workouts && workouts.length > 0) {
        const latest = workouts[0];

        const { data: workoutExercises } = await supabase
          .from("workout_exercises")
          .select("id, sets(id)")
          .eq("workout_id", latest.id);

        const latestExerciseCount = workoutExercises?.length || 0;

        const latestSetCount =
          workoutExercises?.reduce(
            (sum, exercise) => sum + (exercise.sets?.length || 0),
            0,
          ) || 0;

        setLastWorkout({
          ...latest,
          exerciseCount: latestExerciseCount,
          setCount: latestSetCount,
        });
      } else {
        setLastWorkout(null);
      }

      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [user]);

  const firstName = profile?.first_name || profile?.username || "";

  const today = new Date().toLocaleDateString(localeFromLang(language), {
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

      {/* Prochaine séance */}
      <div className="card p-6 mb-8 relative overflow-hidden">
        <p className="text-xs uppercase tracking-wide text-secondary mb-2">
          {t("dashboard.nextWorkout")}
        </p>

        <h2 className="text-2xl font-bold text-primary mb-1">PUSH</h2>

        <p className="text-secondary mb-5">
          {t("exercises.muscleGroups.chest")} ·{" "}
          {t("exercises.muscleGroups.shoulders")} ·{" "}
          {t("exercises.muscleGroups.triceps")}
        </p>

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

      {/* Dernière séance */}
      <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-3">
        {t("dashboard.lastWorkout")}
      </h3>

      {loading ? (
        <div className="card p-6 text-secondary text-sm">
          {t("common.loading")}
        </div>
      ) : lastWorkout ? (
        <button
          onClick={() => navigate(`/history/${lastWorkout.id}`)}
          className="card p-5 w-full text-left hover:border-accent/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-primary">{lastWorkout.name}</h4>

            <span className="text-xs text-secondary">
              {new Date(lastWorkout.date).toLocaleDateString(
                localeFromLang(language),
                {
                  day: "numeric",
                  month: "short",
                },
              )}
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
