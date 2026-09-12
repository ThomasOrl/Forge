-- ============================================================
-- DONNÉES DE DÉMONSTRATION (optionnel)
-- À exécuter APRÈS avoir créé un compte utilisateur.
-- Remplacez 'YOUR_USER_ID' par l'UUID de l'utilisateur
-- (visible dans Supabase > Authentication > Users).
-- Toutes les lignes sont marquées is_demo = true pour être
-- clairement distinguées des données réelles.
-- ============================================================

do $$
declare
  v_user_id uuid := 'YOUR_USER_ID'; -- <-- remplacer ici
  v_ex_bench uuid;
  v_ex_incline uuid;
  v_ex_squat uuid;
  v_ex_deadlift uuid;
  v_ex_pullup uuid;
  v_workout_push uuid;
  v_workout_legs uuid;
  v_we1 uuid;
  v_we2 uuid;
  v_we3 uuid;
  v_we4 uuid;
begin
  insert into public.exercises (user_id, name, muscle_group, description, is_demo)
  values
    (v_user_id, 'Développé couché', 'chest', 'Exercice de base pour les pectoraux', true)
    returning id into v_ex_bench;

  insert into public.exercises (user_id, name, muscle_group, description, is_demo)
  values
    (v_user_id, 'Développé incliné', 'chest', 'Variante haute du développé couché', true)
    returning id into v_ex_incline;

  insert into public.exercises (user_id, name, muscle_group, description, is_demo)
  values
    (v_user_id, 'Squat', 'legs', 'Exercice polyarticulaire pour les jambes', true)
    returning id into v_ex_squat;

  insert into public.exercises (user_id, name, muscle_group, description, is_demo)
  values
    (v_user_id, 'Soulevé de terre', 'back', 'Exercice complet chaîne postérieure', true)
    returning id into v_ex_deadlift;

  insert into public.exercises (user_id, name, muscle_group, description, is_demo)
  values
    (v_user_id, 'Tractions', 'back', 'Exercice au poids du corps', true)
    returning id into v_ex_pullup;

  insert into public.workouts (user_id, name, date, status, started_at, finished_at, duration_seconds, is_demo)
  values (v_user_id, 'Push', current_date - interval '2 days', 'completed',
          now() - interval '2 days', now() - interval '2 days' + interval '55 minutes', 3300, true)
  returning id into v_workout_push;

  insert into public.workout_exercises (workout_id, exercise_id, user_id, "order")
  values (v_workout_push, v_ex_bench, v_user_id, 0) returning id into v_we1;

  insert into public.workout_exercises (workout_id, exercise_id, user_id, "order")
  values (v_workout_push, v_ex_incline, v_user_id, 1) returning id into v_we2;

  insert into public.sets (workout_exercise_id, user_id, set_number, weight, repetitions) values
    (v_we1, v_user_id, 1, 80, 10),
    (v_we1, v_user_id, 2, 80, 9),
    (v_we1, v_user_id, 3, 75, 10);

  insert into public.sets (workout_exercise_id, user_id, set_number, weight, repetitions) values
    (v_we2, v_user_id, 1, 30, 12),
    (v_we2, v_user_id, 2, 30, 10),
    (v_we2, v_user_id, 3, 28, 10);

  insert into public.workouts (user_id, name, date, status, started_at, finished_at, duration_seconds, is_demo)
  values (v_user_id, 'Legs', current_date - interval '9 days', 'completed',
          now() - interval '9 days', now() - interval '9 days' + interval '60 minutes', 3600, true)
  returning id into v_workout_legs;

  insert into public.workout_exercises (workout_id, exercise_id, user_id, "order")
  values (v_workout_legs, v_ex_squat, v_user_id, 0) returning id into v_we3;

  insert into public.workout_exercises (workout_id, exercise_id, user_id, "order")
  values (v_workout_legs, v_ex_deadlift, v_user_id, 1) returning id into v_we4;

  insert into public.sets (workout_exercise_id, user_id, set_number, weight, repetitions) values
    (v_we3, v_user_id, 1, 100, 8),
    (v_we3, v_user_id, 2, 100, 8),
    (v_we3, v_user_id, 3, 95, 9);

  insert into public.sets (workout_exercise_id, user_id, set_number, weight, repetitions) values
    (v_we4, v_user_id, 1, 120, 5),
    (v_we4, v_user_id, 2, 120, 5),
    (v_we4, v_user_id, 3, 110, 6);

  perform public.recalculate_workout_volume(v_workout_push);
  perform public.recalculate_workout_volume(v_workout_legs);
end $$;
