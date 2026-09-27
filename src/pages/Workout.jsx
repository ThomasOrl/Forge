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
import PageTitle from "../components/ui/PageTitle";

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
      <div className="max-w-xl mx-auto mt-6 sm:mt-10 animate-fadeIn">
        <section className="card relative isolate overflow-hidden p-6 sm:p-8 border-accent/10 bg-gradient-to-br from-accent/[0.03] to-transparent">
          <div className="absolute -right-16 -top-20 -z-10 w-64 h-64 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
          <div className="relative">
            <PageTitle icon="/ForgeIcons/Entrainement.png" className="mb-6">
              {t("workout.newWorkout")}
            </PageTitle>

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
        </section>
      </div>
    );
  }

  return (
    <>
      <div className="animate-fadeIn max-w-5xl mx-auto pb-6">
        <div className="card relative isolate overflow-hidden p-5 sm:p-6 mb-6 border-accent/10 bg-gradient-to-br from-accent/[0.03] to-transparent">
          <div className="absolute -right-12 -top-20 -z-10 w-56 h-56 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <PageTitle icon="/ForgeIcons/Entrainement.png">
                {workout.name}
              </PageTitle>
              <span className="inline-flex items-center gap-2 mt-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                {t("workout.inProgress")}
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="text-right">
                <p className="text-lg font-bold text-primary">
                  {workoutExercises.length}
                  <span className="ml-1 text-xs font-medium text-secondary">
                    {t("common.exercises")}
                  </span>
                </p>
                <p className="text-xs text-secondary">
                  {totalSets} {t("common.sets")}
                </p>
              </div>
              <Button
                onClick={finishActiveWorkout}
                disabled={workoutExercises.length === 0 || finishing}
              >
                {finishing ? t("common.loading") : t("workout.finishWorkout")}
              </Button>
            </div>
          </div>
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
          className="w-full py-4 rounded-btn border border-dashed border-accent/40 bg-accent/5 text-accent hover:bg-accent/10 hover:border-accent/70 transition-colors font-semibold"
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
