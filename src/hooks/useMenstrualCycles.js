import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export function useMenstrualCycles() {
  const { user } = useAuth();

  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCycles = useCallback(async () => {
    if (!user) {
      setCycles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("menstrual_cycles")
      .select("id, start_date, end_date, created_at")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false });

    if (fetchError) {
      setError(fetchError);
      setCycles([]);
    } else {
      setCycles(data || []);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  const addCycle = useCallback(
    async ({ startDate, endDate = null }) => {
      if (!user) {
        return {
          data: null,
          error: new Error("Non authentifié"),
        };
      }

      setError(null);

      const { data, error: insertError } = await supabase
        .from("menstrual_cycles")
        .insert({
          user_id: user.id,
          start_date: startDate,
          end_date: endDate,
        })
        .select("id, start_date, end_date, created_at")
        .single();

      if (insertError) {
        setError(insertError);
        return {
          data: null,
          error: insertError,
        };
      }

      setCycles((prev) =>
        [...prev, data].sort(
          (a, b) => new Date(b.start_date) - new Date(a.start_date),
        ),
      );

      return {
        data,
        error: null,
      };
    },
    [user],
  );

  const updateCycle = useCallback(async (id, updates) => {
    setError(null);

    const { data, error: updateError } = await supabase
      .from("menstrual_cycles")
      .update(updates)
      .eq("id", id)
      .select("id, start_date, end_date, created_at")
      .single();

    if (updateError) {
      setError(updateError);
      return {
        data: null,
        error: updateError,
      };
    }

    setCycles((prev) =>
      prev
        .map((cycle) => (cycle.id === id ? data : cycle))
        .sort((a, b) => new Date(b.start_date) - new Date(a.start_date)),
    );

    return {
      data,
      error: null,
    };
  }, []);

  const deleteCycle = useCallback(async (id) => {
    setError(null);

    const { error: deleteError } = await supabase
      .from("menstrual_cycles")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError);
      return {
        error: deleteError,
      };
    }

    setCycles((prev) => prev.filter((cycle) => cycle.id !== id));

    return {
      error: null,
    };
  }, []);

  return {
    cycles,
    loading,
    error,
    addCycle,
    updateCycle,
    deleteCycle,
    refetch: fetchCycles,
  };
}
