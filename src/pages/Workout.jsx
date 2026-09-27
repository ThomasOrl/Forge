import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useExercises } from "../hooks/useExercises";
import { useActiveWorkout } from "../hooks/useActiveWorkout";
import ExerciseCard from "../components/workout/ExerciseCard";
import ExerciseSelector from "../components/workout/ExerciseSelector";
import NewExerciseModal from "../components/workout/NewExerciseModal";
import WorkoutCompletionModal from "../components/workout/WorkoutCompletionModal";
import WorkoutSummary from "../components/workout/WorkoutSummary";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Workout() {
  const { t } = useLanguage();
  const { exercises, addExercise } = useExercises();
  const navigate = useNavigate();
  const activeWorkout = useActiveWorkout();

  const [workoutName, setWorkoutName] = useState("");
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [newExerciseModalOpen, setNewExerciseModalOpen] = useState(false);

  const {
    workout,
    workoutExercises,
    completedSummary,
    showCompletion,
    creating,
    finishing,
    error,
    startWorkout,
    addExerciseToCurrentWorkout,
    addSetToExercise,
    updateWorkoutSet,
    deleteWorkoutSet,
    removeExercise,
    finishActiveWorkout,
    closeCompletion,
  } = activeWorkout;

  const totalSets = workoutExercises.reduce(
    (sum, exercise) => sum + (exercise.sets?.length || 0),
    0,
  );

  const handleSelectExercise = async (exercise) => {
    setSelectorOpen(false);
    await addExerciseToCurrentWorkout(exercise);
  };

  const handleCreateNewExercise = () => {
    setSelectorOpen(false);
    setNewExerciseModalOpen(true);
  };

  const handleSaveNewExercise = async (form) => {
    const { data, error: createError } = await addExercise(form);

    if (!createError) {
      await addExerciseToCurrentWorkout(data);
    }

    return { data, error: createError };
  };

  if (completedSummary && !showCompletion) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <WorkoutSummary
          workout={completedSummary}
          exerciseCount={workoutExercises.length}
          setCount={totalSets}
          onClose={() => navigate("/")}
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
            onChange={(event) => setWorkoutName(event.target.value)}
            className="mb-4"
          />

          {error && (
            <p className="text-sm text-red-400 mb-4" role="alert">
              {t("auth.errors.generic")}
            </p>
          )}

          <Button
            size="lg"
            className="w-full"
            onClick={() => startWorkout(workoutName)}
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
            onClick={finishActiveWorkout}
            disabled={workoutExercises.length === 0 || finishing}
          >
            {finishing ? t("common.loading") : t("workout.finishWorkout")}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-400 mb-4" role="alert">
            {t("auth.errors.generic")}
          </p>
        )}

        <div className="flex flex-col gap-4 mb-6">
          {workoutExercises.map((workoutExercise) => (
            <ExerciseCard
              key={workoutExercise.id}
              workoutExercise={workoutExercise}
              onAddSet={addSetToExercise}
              onUpdateSet={updateWorkoutSet}
              onDeleteSet={deleteWorkoutSet}
              onRemove={removeExercise}
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

        <NewExerciseModal
          open={newExerciseModalOpen}
          onClose={() => setNewExerciseModalOpen(false)}
          onSave={handleSaveNewExercise}
          t={t}
        />
      </div>

      <WorkoutCompletionModal
        open={showCompletion && Boolean(completedSummary)}
        exerciseCount={workoutExercises.length}
        setCount={totalSets}
        onClose={closeCompletion}
        t={t}
      />
    </>
  );
}
