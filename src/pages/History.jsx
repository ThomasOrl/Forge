import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../lib/supabase";
import WorkoutCard from "../components/WorkoutCard";
import EmptyState from "../components/ui/EmptyState";
import PageTitle from "../components/ui/PageTitle";

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
    <div className="animate-fadeIn max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <PageTitle icon="/ForgeIcons/Historique.png">
          {t("history.title")}
        </PageTitle>
        {!loading && workouts.length > 0 && (
          <span className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full border border-accent/20 bg-accent/5 px-3.5 py-2 text-sm text-secondary">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="font-semibold text-accent">{workouts.length}</span>
            {t("dashboard.totalWorkouts")}
          </span>
        )}
      </div>

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
