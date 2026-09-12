import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useWorkouts() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchWorkouts = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
    if (!error) setWorkouts(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchWorkouts() }, [fetchWorkouts])

  return { workouts, loading, refetch: fetchWorkouts }
}

export async function fetchWorkoutDetail(workoutId) {
  const { data: workout, error: werror } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', workoutId)
    .single()
  if (werror) return { error: werror }

  const { data: workoutExercises, error: weerror } = await supabase
    .from('workout_exercises')
    .select('*, exercises(*), sets(*)')
    .eq('workout_id', workoutId)
    .order('order', { ascending: true })
  if (weerror) return { error: weerror }

  return { data: { ...workout, workout_exercises: workoutExercises } }
}

export async function createWorkout({ userId, name }) {
  return supabase.from('workouts').insert({
    user_id: userId,
    name,
    date: new Date().toISOString().slice(0, 10),
    status: 'in_progress',
    started_at: new Date().toISOString(),
  }).select().single()
}

export async function addExerciseToWorkout({ workoutId, exerciseId, userId, order }) {
  return supabase.from('workout_exercises').insert({
    workout_id: workoutId,
    exercise_id: exerciseId,
    user_id: userId,
    order,
  }).select('*, exercises(*), sets(*)').single()
}

export async function addSet({ workoutExerciseId, userId, setNumber, weight, repetitions }) {
  return supabase.from('sets').insert({
    workout_exercise_id: workoutExerciseId,
    user_id: userId,
    set_number: setNumber,
    weight,
    repetitions,
  }).select().single()
}

export async function updateSet(setId, updates) {
  return supabase.from('sets').update(updates).eq('id', setId).select().single()
}

export async function deleteSet(setId) {
  return supabase.from('sets').delete().eq('id', setId)
}

export async function removeExerciseFromWorkout(workoutExerciseId) {
  return supabase.from('workout_exercises').delete().eq('id', workoutExerciseId)
}

export async function finishWorkout({ workoutId, durationSeconds, totalVolume }) {
  return supabase.from('workouts').update({
    status: 'completed',
    finished_at: new Date().toISOString(),
    duration_seconds: durationSeconds,
    total_volume: totalVolume,
  }).eq('id', workoutId).select().single()
}
