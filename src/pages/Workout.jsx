import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useExercises } from "../hooks/useExercises";
import {
  createWorkout,
  addExerciseToWorkout,
  addSet,
  updateSet,
  deleteSet,
  removeExerciseFromWorkout,
  finishWorkout,
} from "../hooks/useWorkouts";
import ExerciseCard from "../components/workout/ExerciseCard";
import ExerciseSelector from "../components/workout/ExerciseSelector";
import WorkoutSummary from "../components/workout/WorkoutSummary";
import Confetti from "../components/ui/Confetti";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { calculateWorkoutVolume } from "../utils/calculations";

export default function Workout() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { exercises, addExercise } = useExercises();

  const [workout, setWorkout] = useState(null);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [newExerciseModalOpen, setNewExerciseModalOpen] = useState(false);
  const [newExerciseForm, setNewExerciseForm] = useState({
    name: "",
    muscle_group: "chest",
    description: "",
  });
  const [completedSummary, setCompletedSummary] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [creating, setCreating] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const startTimeRef = useRef(null);

  const startWorkout = async () => {
    if (!workoutName.trim()) return;
    setCreating(true);
    const { data, error } = await createWorkout({
      userId: user.id,
      name: workoutName.trim(),
    });
    setCreating(false);
    if (!error) {
      setWorkout(data);
      startTimeRef.current = Date.now();
    }
  };

  const handleSelectExercise = async (exercise) => {
    setSelectorOpen(false);
    const { data, error } = await addExerciseToWorkout({
      workoutId: workout.id,
      exerciseId: exercise.id,
      userId: user.id,
      order: workoutExercises.length,
    });
    if (!error) setWorkoutExercises((prev) => [...prev, data]);
  };

  const handleCreateNewExercise = () => {
    setSelectorOpen(false);
    setNewExerciseForm({ name: "", muscle_group: "chest", description: "" });
    setNewExerciseModalOpen(true);
  };

  const handleSaveNewExercise = async () => {
    if (!newExerciseForm.name.trim()) return;
    const { data, error } = await addExercise(newExerciseForm);
    if (!error) {
      setNewExerciseModalOpen(false);
      await handleSelectExercise(data);
    }
  };

  const handleAddSet = async (workoutExercise) => {
    const existingSets = workoutExercise.sets || [];
    const lastSet = existingSets[existingSets.length - 1];
    const { data, error } = await addSet({
      workoutExerciseId: workoutExercise.id,
      userId: user.id,
      setNumber: existingSets.length + 1,
      weight: lastSet?.weight || 0,
      repetitions: lastSet?.repetitions || 0,
    });
    if (!error) {
      setWorkoutExercises((prev) =>
        prev.map((we) =>
          we.id === workoutExercise.id
            ? { ...we, sets: [...(we.sets || []), data] }
            : we,
        ),
      );
    }
  };

  const handleUpdateSet = useCallback((updatedSet) => {
    setWorkoutExercises((prev) =>
      prev.map((we) => ({
        ...we,
        sets: (we.sets || []).map((s) =>
          s.id === updatedSet.id ? updatedSet : s,
        ),
      })),
    );
    updateSet(updatedSet.id, {
      weight: updatedSet.weight,
      repetitions: updatedSet.repetitions,
    });
  }, []);

  const handleDeleteSet = useCallback(async (set) => {
    setWorkoutExercises((prev) =>
      prev.map((we) => ({
        ...we,
        sets: (we.sets || []).filter((s) => s.id !== set.id),
      })),
    );
    await deleteSet(set.id);
  }, []);

  const handleRemoveExercise = useCallback(async (workoutExercise) => {
    setWorkoutExercises((prev) =>
      prev.filter((we) => we.id !== workoutExercise.id),
    );
    await removeExerciseFromWorkout(workoutExercise.id);
  }, []);

  const handleFinish = async () => {
    if (finishing) return;

    setFinishing(true);

    const totalVolume = calculateWorkoutVolume(workoutExercises);
    const durationSeconds = startTimeRef.current
      ? Math.round((Date.now() - startTimeRef.current) / 1000)
      : 0;

    const { data, error } = await finishWorkout({
      workoutId: workout.id,
      durationSeconds,
      totalVolume,
    });

    setFinishing(false);

    if (!error) {
      setCompletedSummary(data);
      setShowCompletion(true);
    }
  };

  const handleCloseCompletion = () => setShowCompletion(false);

  const totalSets = workoutExercises.reduce(
    (sum, we) => sum + (we.sets?.length || 0),
    0,
  );

  if (completedSummary && !showCompletion) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <WorkoutSummary
          workout={completedSummary}
          exerciseCount={workoutExercises.length}
          setCount={totalSets}
          onClose={() => (window.location.href = "/")}
        />
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="max-w-md mx-auto mt-10 animate-fadeIn">
        <h1 className="text-2xl font-bold text-primary mb-6">
          {t("workout.newWorkout")}
        </h1>
        <div className="card p-6">
          <Input
            label={t("workout.workoutName")}
            placeholder={t("workout.workoutNamePlaceholder")}
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            className="mb-4"
          />
          <Button
            size="lg"
            className="w-full"
            onClick={startWorkout}
            disabled={creating || !workoutName.trim()}
          >
            {creating ? t("common.loading") : t("dashboard.startWorkout")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="animate-fadeIn pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-primary">{workout.name}</h1>
            <p className="text-xs text-secondary">{t("workout.inProgress")}</p>
          </div>
          <Button
            onClick={handleFinish}
            disabled={workoutExercises.length === 0 || finishing}
          >
            {finishing ? t("common.loading") : t("workout.finishWorkout")}
          </Button>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          {workoutExercises.map((we) => (
            <ExerciseCard
              key={we.id}
              workoutExercise={we}
              onAddSet={handleAddSet}
              onUpdateSet={handleUpdateSet}
              onDeleteSet={handleDeleteSet}
              onRemove={handleRemoveExercise}
            />
          ))}
        </div>

        <button
          onClick={() => setSelectorOpen(true)}
          className="w-full py-4 rounded-btn border border-dashed border-app text-secondary hover:text-primary hover:border-accent/40 transition-colors font-medium"
        >
          {t("workout.addExercise")}
        </button>

        <ExerciseSelector
          open={selectorOpen}
          onClose={() => setSelectorOpen(false)}
          exercises={exercises}
          onSelect={handleSelectExercise}
          onCreateNew={handleCreateNewExercise}
        />

        <Modal
          open={newExerciseModalOpen}
          onClose={() => setNewExerciseModalOpen(false)}
          title={t("exercises.addExercise")}
        >
          <div className="flex flex-col gap-4">
            <Input
              label={t("exercises.name")}
              value={newExerciseForm.name}
              onChange={(e) =>
                setNewExerciseForm((f) => ({ ...f, name: e.target.value }))
              }
            />
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                {t("exercises.muscleGroup")}
              </label>
              <select
                value={newExerciseForm.muscle_group}
                onChange={(e) =>
                  setNewExerciseForm((f) => ({
                    ...f,
                    muscle_group: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 rounded-btn bg-transparent border border-app text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {[
                  "chest",
                  "back",
                  "shoulders",
                  "biceps",
                  "triceps",
                  "legs",
                  "abs",
                  "glutes",
                  "cardio",
                  "other",
                ].map((g) => (
                  <option key={g} value={g} className="bg-dark-card">
                    {t(`exercises.muscleGroups.${g}`)}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleSaveNewExercise}
              disabled={!newExerciseForm.name.trim()}
            >
              {t("common.add")}
            </Button>
          </div>
        </Modal>
      </div>

      {showCompletion && completedSummary && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="workout-completion-title"
        >
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fadeIn"
            onClick={handleCloseCompletion}
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

            <p className="text-secondary mb-6">
              {t("workout.completionMessage")}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-xl bg-dark-cardAlt border border-app p-3">
                <p className="text-xs text-secondary mb-1">
                  {t("common.exercises")}
                </p>
                <p className="text-xl font-bold text-primary">
                  {workoutExercises.length}
                </p>
              </div>

              <div className="rounded-xl bg-dark-cardAlt border border-app p-3">
                <p className="text-xs text-secondary mb-1">
                  {t("common.sets")}
                </p>
                <p className="text-xl font-bold text-primary">{totalSets}</p>
              </div>
            </div>

            <Button className="w-full" onClick={handleCloseCompletion}>
              {t("workout.viewSummary")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
