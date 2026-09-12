import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../lib/supabase";
import { useExercises } from "../hooks/useExercises";
import ProgressChart from "../components/charts/ProgressChart";
import StatCard from "../components/ui/StatCard";
import { formatVolume, localeFromLang } from "../utils/calculations";

export default function Progress() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { exercises } = useExercises();

  const [workouts, setWorkouts] = useState([]);
  const [maxWeightOverall, setMaxWeightOverall] = useState(0);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [exerciseSets, setExerciseSets] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    async function load() {
      setLoading(true);

      const { data: workoutsData } = await supabase
        .from("workouts")
        .select("id, date, total_volume")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("date", { ascending: true });

      const { data: workoutExercises } = await supabase
        .from("workout_exercises")
        .select("sets(weight)")
        .eq("user_id", user.id);

      if (!mounted) return;

      setWorkouts(workoutsData || []);

      const maxWeight = (workoutExercises || []).reduce(
        (max, workoutExercise) => {
          const exerciseMax = (workoutExercise.sets || []).reduce(
            (setMax, set) => Math.max(setMax, Number(set.weight) || 0),
            0,
          );

          return Math.max(max, exerciseMax);
        },
        0,
      );

      setMaxWeightOverall(maxWeight);
      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!selectedExerciseId || !user) {
      setExerciseSets([]);
      return;
    }

    let mounted = true;

    async function loadExerciseProgress() {
      const { data: we } = await supabase
        .from("workout_exercises")
        .select("id, workouts(date), sets(weight, repetitions)")
        .eq("exercise_id", selectedExerciseId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (!mounted || !we) return;

      const points = we
        .filter((w) => w.workouts)
        .map((w) => {
          const maxWeight = (w.sets || []).reduce(
            (max, s) => Math.max(max, Number(s.weight) || 0),
            0,
          );

          return {
            date: w.workouts.date,
            value: maxWeight,
          };
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((p) => ({
          label: new Date(p.date).toLocaleDateString(localeFromLang(language), {
            day: "numeric",
            month: "short",
          }),
          value: p.value,
        }));

      setExerciseSets(points);

      const best = points.reduce((max, p) => Math.max(max, p.value), 0);

      if (best > 0) {
        setRecords([
          {
            exercise: exercises.find((e) => e.id === selectedExerciseId)?.name,
            weight: best,
          },
        ]);
      } else {
        setRecords([]);
      }
    }

    loadExerciseProgress();

    return () => {
      mounted = false;
    };
  }, [selectedExerciseId, user, language, exercises]);

  const weeklyVolume = useMemo(() => {
    const map = {};

    workouts.forEach((w) => {
      const d = new Date(w.date);
      const weekStart = new Date(d);

      weekStart.setDate(d.getDate() - d.getDay());

      const key = weekStart.toISOString().slice(0, 10);

      map[key] = (map[key] || 0) + (Number(w.total_volume) || 0);
    });

    return Object.entries(map)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-8)
      .map(([key, value]) => ({
        label: new Date(key).toLocaleDateString(localeFromLang(language), {
          day: "numeric",
          month: "short",
        }),
        value: Math.round(value),
      }));
  }, [workouts, language]);

  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-bold text-primary mb-6">
        {t("progress.title")}
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        <StatCard label={t("progress.workoutCount")} value={workouts.length} />

        <StatCard
          label={t("dashboard.totalVolume")}
          value={formatVolume(
            workouts.reduce((s, w) => s + (Number(w.total_volume) || 0), 0),
          )}
          unit={t("common.kg")}
        />

        <StatCard
          label={t("progress.maxWeight")}
          value={formatVolume(maxWeightOverall)}
          unit={t("common.kg")}
        />
      </div>

      <div className="card p-5 mb-8">
        <h3 className="font-bold text-primary mb-4">
          {t("progress.volumeOverTime")}
        </h3>

        {loading ? (
          <p className="text-sm text-secondary">{t("common.loading")}</p>
        ) : (
          <ProgressChart
            data={weeklyVolume}
            label={t("dashboard.totalVolume")}
            unit={t("common.kg")}
          />
        )}
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-primary">
            {t("progress.progressByExercise")}
          </h3>
        </div>

        <select
          value={selectedExerciseId}
          onChange={(e) => setSelectedExerciseId(e.target.value)}
          className="w-full px-4 py-3 rounded-btn bg-transparent border border-app text-primary mb-4 focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="" className="bg-dark-card">
            {t("progress.selectExercise")}
          </option>

          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id} className="bg-dark-card">
              {ex.name}
            </option>
          ))}
        </select>

        {selectedExerciseId && (
          <>
            <ProgressChart
              data={exerciseSets}
              label={t("progress.maxWeight")}
              unit={t("common.kg")}
              color="#3ECF8E"
            />

            {records.length > 0 && (
              <div className="mt-4 pt-4 border-t border-app">
                <p className="text-xs uppercase tracking-wide text-secondary mb-1">
                  {t("progress.personalRecords")}
                </p>

                {records.map((r, i) => (
                  <p key={i} className="text-sm text-primary font-semibold">
                    {r.exercise}: {r.weight} {t("common.kg")}
                  </p>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
