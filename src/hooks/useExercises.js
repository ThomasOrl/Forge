import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useExercises() {
  const { user } = useAuth()
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchExercises = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })
    if (!error) setExercises(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchExercises() }, [fetchExercises])

  const addExercise = useCallback(async (exercise) => {
    if (!user) return { error: new Error('Non authentifié') }
    const { data, error } = await supabase
      .from('exercises')
      .insert({ ...exercise, user_id: user.id })
      .select()
      .single()
    if (!error) setExercises(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return { data, error }
  }, [user])

  const updateExercise = useCallback(async (id, updates) => {
    const { data, error } = await supabase.from('exercises').update(updates).eq('id', id).select().single()
    if (!error) setExercises(prev => prev.map(e => (e.id === id ? data : e)))
    return { data, error }
  }, [])

  const deleteExercise = useCallback(async (id) => {
    const { error } = await supabase.from('exercises').delete().eq('id', id)
    if (!error) setExercises(prev => prev.filter(e => e.id !== id))
    return { error }
  }, [])

  return { exercises, loading, addExercise, updateExercise, deleteExercise, refetch: fetchExercises }
}
