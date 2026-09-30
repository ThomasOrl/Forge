export function getMaximumWeight(workoutExercises = []) {
  return workoutExercises.reduce((maximum, exercise) => {
    const exerciseMaximum = (exercise.sets || []).reduce(
      (setMaximum, set) => Math.max(setMaximum, Number(set.weight) || 0),
      0,
    );

    return Math.max(maximum, exerciseMaximum);
  }, 0);
}

export function getExerciseProgressSamples(workoutExercises = []) {
  return workoutExercises
    .filter((item) => item.workouts?.date)
    .map((item) => ({
      date: item.workouts.date,
      value: getMaximumWeight([{ sets: item.sets }]),
    }))
    .sort((first, second) => new Date(first.date) - new Date(second.date));
}

export function getWeeklyVolume(workouts = []) {
  const totalsByWeek = new Map();

  workouts.forEach((workout) => {
    const date = new Date(workout.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());

    const key = weekStart.toISOString().slice(0, 10);
    totalsByWeek.set(
      key,
      (totalsByWeek.get(key) || 0) + (Number(workout.total_volume) || 0),
    );
  });

  return [...totalsByWeek.entries()]
    .sort(([first], [second]) => new Date(first) - new Date(second))
    .slice(-8)
    .map(([key, value]) => ({ key, value: Math.round(value) }));
}

export function getPreviousWeekStart(referenceDate = new Date()) {
  const date = new Date(referenceDate);
  const daysSinceMonday = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - daysSinceMonday - 7);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
