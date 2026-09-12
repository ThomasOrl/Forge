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
    totalVolume: 0,
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

      const { data: workouts } = await supabase
        .from("workouts")
        .select(
          `
        id,
        name,
        date,
        total_volume,
        workout_exercises (
          id,
          sets (
            id,
            weight,
            repetitions
          )
        )
      `,
        )
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("date", { ascending: false });

      if (!mounted) return;

      const workoutCount = workouts?.length || 0;

      const totalVolume =
        workouts?.reduce((sum, w) => sum + (Number(w.total_volume) || 0), 0) ||
        0;

      const setCount =
        workouts?.reduce(
          (sum, w) =>
            sum +
            (w.workout_exercises || []).reduce(
              (exerciseSum, exercise) =>
                exerciseSum + (exercise.sets?.length || 0),
              0,
            ),
          0,
        ) || 0;

      const bestLift =
        workouts?.reduce(
          (max, w) =>
            Math.max(
              max,
              ...(w.workout_exercises || []).flatMap((exercise) =>
                (exercise.sets || []).map((set) => Number(set.weight) || 0),
              ),
            ),
          0,
        ) || 0;

      setStats({
        workoutCount,
        totalVolume,
        setCount,
        bestLift,
      });

      if (workouts && workouts.length > 0) {
        const latest = workouts[0];

        const exerciseCount = latest.workout_exercises?.length || 0;

        const latestSetCount =
          latest.workout_exercises?.reduce(
            (sum, exercise) => sum + (exercise.sets?.length || 0),
            0,
          ) || 0;

        setLastWorkout({
          ...latest,
          exerciseCount,
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
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">
          {t("dashboard.greeting")}, {firstName} 👋
        </h1>
        <p className="text-secondary mt-1">{t("dashboard.subtitle")}</p>
        <p className="text-xs text-secondary mt-1 capitalize">{today}</p>
      </div>

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

      <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-3">
        {t("dashboard.stats")}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard
          label={t("dashboard.totalWorkouts")}
          value={stats.workoutCount}
        />
        <StatCard
          label={t("dashboard.totalVolume")}
          value={formatVolume(stats.totalVolume)}
          unit={t("common.kg")}
        />
        <StatCard label={t("dashboard.totalSets")} value={stats.setCount} />
        <StatCard
          label={t("dashboard.bestLift")}
          value={formatVolume(stats.bestLift)}
          unit={t("common.kg")}
        />
      </div>

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
                { day: "numeric", month: "short" },
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
