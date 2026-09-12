import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../lib/supabase";
import WorkoutCard from "../components/WorkoutCard";
import EmptyState from "../components/ui/EmptyState";

export default function History() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    async function load() {
      setLoading(true);

      const { data: rawWorkouts } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (!mounted || !rawWorkouts) {
        setLoading(false);
        return;
      }

      // Une seule requête pour récupérer les exercices de toutes les séances
      const workoutIds = rawWorkouts.map((w) => w.id);

      const { data: allWorkoutExercises } = await supabase
        .from("workout_exercises")
        .select("id, workout_id, sets(id)")
        .in("workout_id", workoutIds);

      if (!mounted) return;

      // On regroupe les exercices par séance
      const enriched = rawWorkouts.map((w) => {
        const workoutExercises = (allWorkoutExercises || []).filter(
          (we) => we.workout_id === w.id,
        );

        return {
          ...w,
          exercise_count: workoutExercises.length,
          set_count: workoutExercises.reduce(
            (sum, e) => sum + (e.sets?.length || 0),
            0,
          ),
        };
      });

      setWorkouts(enriched);
      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-bold text-primary mb-6">
        {t("history.title")}
      </h1>

      {loading ? (
        <p className="text-secondary text-sm">{t("common.loading")}</p>
      ) : workouts.length === 0 ? (
        <EmptyState
          title={t("history.emptyTitle")}
          text={t("history.emptyText")}
          actionLabel={t("history.startFirstWorkout")}
          onAction={() => navigate("/workout")}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {workouts.map((w) => (
            <WorkoutCard key={w.id} workout={w} />
          ))}
        </div>
      )}
    </div>
  );
}
