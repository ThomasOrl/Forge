import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../lib/supabase";
import WorkoutCard from "../components/WorkoutCard";
import EmptyState from "../components/ui/EmptyState";
import PageTitle from "../components/ui/PageTitle";

const PAGE_SIZE = 25;

export default function History() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [page, setPage] = useState(0);

  const loadPage = useCallback(async (pageToLoad, append) => {
    if (!user) return;
    append ? setLoadingMore(true) : setLoading(true);
    setLoadError(false);

    const start = pageToLoad * PAGE_SIZE;
    const { data: rawWorkouts, count, error } = await supabase
      .from("workouts")
      .select("id, name, date, total_volume, is_demo", { count: "exact" })
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .range(start, start + PAGE_SIZE - 1);

    if (error || !rawWorkouts) {
      setLoadError(true);
      append ? setLoadingMore(false) : setLoading(false);
      return;
    }

    const workoutIds = rawWorkouts.map(({ id }) => id);
    let allWorkoutExercises = [];

    if (workoutIds.length) {
      const { data, error: exercisesError } = await supabase
        .from("workout_exercises")
        .select("id, workout_id, sets(id)")
        .eq("user_id", user.id)
        .in("workout_id", workoutIds);

      if (exercisesError) {
        setLoadError(true);
        append ? setLoadingMore(false) : setLoading(false);
        return;
      }
      allWorkoutExercises = data || [];
    }

    const countsByWorkout = new Map();
    allWorkoutExercises.forEach((exercise) => {
      const counts = countsByWorkout.get(exercise.workout_id) || {
        exercise_count: 0,
        set_count: 0,
      };
      counts.exercise_count += 1;
      counts.set_count += exercise.sets?.length || 0;
      countsByWorkout.set(exercise.workout_id, counts);
    });

    const enriched = rawWorkouts.map((workout) => ({
      ...workout,
      ...(countsByWorkout.get(workout.id) || { exercise_count: 0, set_count: 0 }),
    }));

    setWorkouts((current) => (append ? [...current, ...enriched] : enriched));
    if (!append) setTotalCount(count || 0);
    setPage(pageToLoad);
    append ? setLoadingMore(false) : setLoading(false);
  }, [user]);

  useEffect(() => {
    setWorkouts([]);
    setTotalCount(0);
    setPage(0);
    if (user) loadPage(0, false);
  }, [user, loadPage]);

  const hasMore = workouts.length < totalCount;

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <PageTitle icon="/ForgeIcons/Historique.png">
          {t("history.title")}
        </PageTitle>
        {!loading && totalCount > 0 && (
          <span className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full border border-accent/20 bg-accent/5 px-3.5 py-2 text-sm text-secondary">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="font-semibold text-accent">{totalCount}</span>
            {t("dashboard.totalWorkouts")}
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-secondary text-sm" role="status">{t("common.loading")}</p>
      ) : loadError && workouts.length === 0 ? (
        <div className="text-sm text-red-400" role="alert">
          <p>{t("history.loadError")}</p>
          <button
            type="button"
            onClick={() => loadPage(0, false)}
            className="mt-2 underline underline-offset-2"
          >
            {t("common.retry")}
          </button>
        </div>
      ) : workouts.length === 0 ? (
        <EmptyState
          title={t("history.emptyTitle")}
          text={t("history.emptyText")}
          actionLabel={t("history.startFirstWorkout")}
          onAction={() => navigate("/workout")}
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {workouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
          {loadError && <p className="mt-4 text-red-400 text-sm" role="alert">{t("history.loadError")}</p>}
          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => loadPage(page + 1, true)}
                disabled={loadingMore}
                className="rounded-xl border border-accent/30 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-accent/10 disabled:opacity-60"
              >
                {loadingMore ? t("history.loadingMore") : t("history.loadMore")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
