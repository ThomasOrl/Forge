import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../lib/supabase";
import { useExercises } from "../hooks/useExercises";
import ProgressChart from "../components/charts/ProgressChart";
import StatCard from "../components/ui/StatCard";
import PageTitle from "../components/ui/PageTitle";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { formatVolume, localeFromLang } from "../utils/calculations";
import { fetchAllRows } from "../utils/fetchAllRows";
import {
  getExerciseProgressSamples,
  getMaximumWeight,
  getPreviousWeekStart,
  getWeeklyVolume,
} from "../utils/progressCalculations";

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
  const [loadError, setLoadError] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [cleanupOpen, setCleanupOpen] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupCount, setCleanupCount] = useState(null);
  const [cleanupConfirmation, setCleanupConfirmation] = useState("");
  const [cleanupError, setCleanupError] = useState("");
  const [cleaning, setCleaning] = useState(false);
  const [cleanupSucceeded, setCleanupSucceeded] = useState(false);
  const cleanupBeforeDate = useMemo(getPreviousWeekStart, []);
  const cleanupBeforeLabel = new Date(`${cleanupBeforeDate}T00:00:00`).toLocaleDateString(
    localeFromLang(language),
    { day: "numeric", month: "long", year: "numeric" },
  );

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    async function load() {
      setLoading(true);
      setLoadError(false);

      const [workoutsResult, exercisesResult] = await Promise.all([
        fetchAllRows(() => supabase
          .from("workouts")
          .select("id, date, total_volume")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("date", { ascending: true })),
        fetchAllRows(() => supabase
          .from("workout_exercises")
          .select("sets(weight)")
          .eq("user_id", user.id)),
      ]);

      if (!mounted) return;

      if (workoutsResult.error || exercisesResult.error) {
        setLoadError(true);
        setLoading(false);
        return;
      }

      const workoutsData = workoutsResult.data;
      const workoutExercises = exercisesResult.data;

      setWorkouts(workoutsData || []);

      setMaxWeightOverall(getMaximumWeight(workoutExercises));
      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [user, refreshVersion]);

  useEffect(() => {
    if (!selectedExerciseId || !user) {
      setExerciseSets([]);
      return;
    }

    let mounted = true;

    async function loadExerciseProgress() {
      setLoadError(false);
      const { data: we, error } = await fetchAllRows(() => supabase
        .from("workout_exercises")
        .select("id, workouts(date), sets(weight, repetitions)")
        .eq("exercise_id", selectedExerciseId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }));

      if (!mounted) return;
      if (error) {
        setLoadError(true);
        setExerciseSets([]);
        setRecords([]);
        return;
      }

      const points = getExerciseProgressSamples(we)
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
  }, [selectedExerciseId, user, language, exercises, refreshVersion]);

  const handleOpenCleanup = async () => {
    setCleanupOpen(true);
    setCleanupLoading(true);
    setCleanupCount(null);
    setCleanupConfirmation("");
    setCleanupError("");

    const { count, error } = await supabase
      .from("workouts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "completed")
      .lt("date", cleanupBeforeDate);

    if (error) {
      setCleanupError(t("progress.cleanupError"));
    } else {
      setCleanupCount(count || 0);
    }

    setCleanupLoading(false);
  };

  const handleCleanup = async () => {
    if (!user || cleaning || cleanupCount < 1) return;

    setCleaning(true);
    setCleanupError("");

    const { error } = await supabase
      .from("workouts")
      .delete()
      .eq("user_id", user.id)
      .eq("status", "completed")
      .lt("date", cleanupBeforeDate);

    if (error) {
      setCleanupError(t("progress.cleanupError"));
      setCleaning(false);
      return;
    }

    setCleanupOpen(false);
    setCleanupSucceeded(true);
    setCleanupConfirmation("");
    setRefreshVersion((version) => version + 1);
    setCleaning(false);
  };

  const cleanupConfirmationMatches =
    cleanupConfirmation.trim().toLocaleUpperCase() ===
    t("progress.cleanupConfirmationWord").toLocaleUpperCase();

  const weeklyVolume = useMemo(() => {
    return getWeeklyVolume(workouts).map(({ key, value }) => ({
      label: new Date(key).toLocaleDateString(localeFromLang(language), {
        day: "numeric",
        month: "short",
      }),
      value,
    }));
  }, [workouts, language]);

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto">
      <div className="mb-7">
        <PageTitle icon="/ForgeIcons/Progression.png">
          {t("progress.title")}
        </PageTitle>
      </div>

      {loadError && (
        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400" role="alert">
          <p>{t("progress.loadError")}</p>
          <button
            type="button"
            className="mt-2 underline underline-offset-2"
            onClick={() => setRefreshVersion((version) => version + 1)}
          >
            {t("common.retry")}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        <StatCard
          label={t("progress.workoutCount")}
          value={workouts.length}
          icon={<ProgressMetricIcon type="workouts" />}
        />

        <StatCard
          label={t("dashboard.totalVolume")}
          value={formatVolume(
            workouts.reduce((s, w) => s + (Number(w.total_volume) || 0), 0),
          )}
          unit={t("common.kg")}
          icon={<ProgressMetricIcon type="volume" />}
        />

        <StatCard
          label={t("progress.maxWeight")}
          value={formatVolume(maxWeightOverall)}
          unit={t("common.kg")}
          icon={<ProgressMetricIcon type="weight" />}
        />
      </div>

      <section className="card relative isolate overflow-hidden p-5 sm:p-6 mb-6 border-accent/15">
        <div className="absolute -right-16 -top-24 -z-10 w-56 h-56 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="relative">
          <ChartSectionHeading>{t("progress.volumeOverTime")}</ChartSectionHeading>

          {loading ? (
            <ChartLoading label={t("common.loading")} />
          ) : (
            <ProgressChart
              data={weeklyVolume}
              label={t("dashboard.totalVolume")}
              unit={t("common.kg")}
            />
          )}
        </div>
      </section>

      <section className="card relative isolate overflow-hidden p-5 sm:p-6 border-accent/15">
        <div className="absolute -right-16 -top-24 -z-10 w-56 h-56 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <ChartSectionHeading>{t("progress.progressByExercise")}</ChartSectionHeading>

            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              aria-label={t("progress.selectExercise")}
              className="w-full sm:max-w-xs px-4 py-3 rounded-btn bg-transparent border border-app text-primary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
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
          </div>

          {selectedExerciseId ? (
            <ProgressChart
              data={exerciseSets}
              label={t("progress.maxWeight")}
              unit={t("common.kg")}
            />
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-app bg-accent/[0.03] px-6 text-center">
              <ChartPromptIcon />
              <p className="mt-3 text-sm text-secondary">
                {t("progress.selectExercise")}
              </p>
            </div>
          )}

          {selectedExerciseId && records.length > 0 && (
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-secondary mb-1">
                  {t("progress.personalRecords")}
                </p>
                {records.map((record) => (
                  <p key={record.exercise} className="font-semibold text-primary">
                    {record.exercise}
                  </p>
                ))}
              </div>
              <div className="text-xl font-bold text-accent">
                {formatVolume(records[0].weight)} {t("common.kg")}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="card mt-6 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-red-400">
              {t("progress.cleanupTitle")}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-secondary">
              {t("progress.cleanupDescription")}
            </p>
            {cleanupSucceeded && (
              <p className="mt-2 text-sm text-green-400" role="status">
                {t("progress.cleanupSuccess")}
              </p>
            )}
          </div>
          <Button
            variant="danger"
            onClick={handleOpenCleanup}
            disabled={!user}
            className="shrink-0 self-start sm:self-auto"
          >
            {t("progress.cleanupButton")}
          </Button>
        </div>
      </section>

      <Modal
        open={cleanupOpen}
        onClose={() => {
          if (cleaning) return;
          setCleanupOpen(false);
          setCleanupConfirmation("");
          setCleanupError("");
        }}
        title={t("progress.cleanupDialogTitle")}
      >
        {cleanupLoading ? (
          <p className="text-sm text-secondary">
            {t("progress.cleanupLoading")}
          </p>
        ) : cleanupError && cleanupCount === null ? (
          <p className="text-sm text-red-400" role="alert">
            {cleanupError}
          </p>
        ) : cleanupCount === 0 ? (
          <p className="text-sm text-secondary">
            {t("progress.cleanupEmpty")}
          </p>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-secondary">
              {t("progress.cleanupDialogDescription")
                .replace("{count}", String(cleanupCount))
                .replace("{date}", cleanupBeforeLabel)}
            </p>

            <div className="mt-5 flex flex-col gap-4">
              <div>
                <p className="mb-1.5 text-sm font-medium text-secondary">
                  {t("progress.cleanupConfirmationPrompt")} {" "}
                  <span className="font-bold tracking-wide text-primary">
                    {t("progress.cleanupConfirmationWord")}
                  </span>
                </p>
                <Input
                  value={cleanupConfirmation}
                  onChange={(event) =>
                    setCleanupConfirmation(event.target.value)
                  }
                  aria-label={t("progress.cleanupConfirmationPrompt")}
                  autoComplete="off"
                />
              </div>

              {cleanupError && (
                <p className="text-sm text-red-400" role="alert">
                  {cleanupError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setCleanupOpen(false);
                    setCleanupConfirmation("");
                    setCleanupError("");
                  }}
                  disabled={cleaning}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="danger"
                  onClick={handleCleanup}
                  disabled={
                    cleaning ||
                    !cleanupConfirmationMatches ||
                    cleanupCount < 1
                  }
                >
                  {cleaning
                    ? t("common.loading")
                    : t("progress.cleanupConfirmButton")}
                </Button>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

function ChartSectionHeading({ children }) {
  return (
    <h2 className="flex items-center gap-3 font-bold text-primary">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/5 text-accent">
        <ChartPromptIcon />
      </span>
      {children}
    </h2>
  );
}

function ChartLoading({ label }) {
  return (
    <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-app text-sm text-secondary sm:h-[320px]">
      {label}
    </div>
  );
}

function ChartPromptIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M3.5 19.5h17M5.5 16l4-4 3 2.5 6-7" />
      <path d="M15.5 7.5h3v3" />
    </svg>
  );
}

function ProgressMetricIcon({ type }) {
  const icons = {
    workouts: <path d="M5 7h14M7 4v6m10-6v6M6 12h12v8H6z" />,
    volume: <path d="M5 19V9m7 10V5m7 14v-7M3 19.5h18" />,
    weight: <path d="M12 3.5v17m-6-6 6 6 6-6M5 4.5h14" />,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-accent"
      aria-hidden="true"
    >
      {icons[type]}
    </svg>
  );
}
