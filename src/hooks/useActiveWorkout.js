import { useCallback, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  addExerciseToWorkout as insertWorkoutExercise,
  addSet as insertSet,
  createWorkout as insertWorkout,
  deleteSet as removeSet,
  finishWorkout as completeWorkout,
  removeExerciseFromWorkout as deleteWorkoutExercise,
  updateSet as saveSet,
} from "./useWorkouts";
import { calculateWorkoutVolume } from "../utils/calculations";

export function useActiveWorkout() {
  const { user } = useAuth();
  const [workout, setWorkout] = useState(null);
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [completedSummary, setCompletedSummary] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [creating, setCreating] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState(null);
  const startTimeRef = useRef(null);

  const startWorkout = useCallback(
    async (name) => {
      if (!name.trim() || !user) return;

      setCreating(true);
      setError(null);

      try {
        const { data, error: createError } = await insertWorkout({
          userId: user.id,
          name: name.trim(),
        });

        if (createError) {
          setError(createError);
          return;
        }

        setWorkout(data);
        startTimeRef.current = Date.now();
      } catch (createError) {
        setError(createError);
      } finally {
        setCreating(false);
      }
    },
    [user],
  );

  const addExerciseToCurrentWorkout = useCallback(
    async (exercise) => {
      if (!workout || !user) return;

      setError(null);

      try {
        const { data, error: insertError } = await insertWorkoutExercise({
          workoutId: workout.id,
          exerciseId: exercise.id,
          userId: user.id,
          order: workoutExercises.length,
        });

        if (insertError) {
          setError(insertError);
          return;
        }

        setWorkoutExercises((current) => [...current, data]);
      } catch (insertError) {
        setError(insertError);
      }
    },
    [user, workout, workoutExercises.length],
  );

  const addSetToExercise = useCallback(
    async (workoutExercise) => {
      if (!user) return;

      const existingSets = workoutExercise.sets || [];
      const lastSet = existingSets[existingSets.length - 1];
      setError(null);

      try {
        const { data, error: insertError } = await insertSet({
          workoutExerciseId: workoutExercise.id,
          userId: user.id,
          setNumber: existingSets.length + 1,
          weight: lastSet?.weight || 0,
          repetitions: lastSet?.repetitions || 0,
        });

        if (insertError) {
          setError(insertError);
          return;
        }

        setWorkoutExercises((current) =>
          current.map((item) =>
            item.id === workoutExercise.id
              ? { ...item, sets: [...(item.sets || []), data] }
              : item,
          ),
        );
      } catch (insertError) {
        setError(insertError);
      }
    },
    [user],
  );

  const updateWorkoutSet = useCallback(async (updatedSet) => {
    setError(null);
    setWorkoutExercises((current) =>
      current.map((exercise) => ({
        ...exercise,
        sets: (exercise.sets || []).map((set) =>
          set.id === updatedSet.id ? updatedSet : set,
        ),
      })),
    );

    try {
      const { error: updateError } = await saveSet(updatedSet.id, {
        weight: updatedSet.weight,
        repetitions: updatedSet.repetitions,
      });

      if (updateError) setError(updateError);
    } catch (updateError) {
      setError(updateError);
    }
  }, []);

  const deleteWorkoutSet = useCallback(async (set) => {
    setError(null);

    try {
      const { error: deleteError } = await removeSet(set.id);
      if (deleteError) {
        setError(deleteError);
        return;
      }

      setWorkoutExercises((current) =>
        current.map((exercise) => ({
          ...exercise,
          sets: (exercise.sets || []).filter((item) => item.id !== set.id),
        })),
      );
    } catch (deleteError) {
      setError(deleteError);
    }
  }, []);

  const removeExercise = useCallback(async (workoutExercise) => {
    setError(null);

    try {
      const { error: deleteError } = await deleteWorkoutExercise(
        workoutExercise.id,
      );
      if (deleteError) {
        setError(deleteError);
        return;
      }

      setWorkoutExercises((current) =>
        current.filter((item) => item.id !== workoutExercise.id),
      );
    } catch (deleteError) {
      setError(deleteError);
    }
  }, []);

  const finishActiveWorkout = useCallback(async () => {
    if (!workout || finishing || workoutExercises.length === 0) return;

    setFinishing(true);
    setError(null);

    const totalVolume = calculateWorkoutVolume(workoutExercises);
    const durationSeconds = startTimeRef.current
      ? Math.round((Date.now() - startTimeRef.current) / 1000)
      : 0;

    try {
      const { data, error: finishError } = await completeWorkout({
        workoutId: workout.id,
        durationSeconds,
        totalVolume,
      });

      if (finishError) {
        setError(finishError);
        return;
      }

      setCompletedSummary(data);
      setShowCompletion(true);
    } catch (finishError) {
      setError(finishError);
    } finally {
      setFinishing(false);
    }
  }, [finishing, workout, workoutExercises]);

  const closeCompletion = useCallback(() => setShowCompletion(false), []);

  return {
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
  };
}
