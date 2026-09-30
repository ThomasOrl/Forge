import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, username, first_name, avatar_url, created_at, sex")
      .eq("id", userId)
      .single();
    if (!error) setProfile(data);
    return data;
  }, []);

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    if (!user) {
      setProfile(null);
      return;
    }

    fetchProfile(user.id).then((data) => {
      if (mounted) {
        setProfile(data);
      }
    });

    return () => {
      mounted = false;
    };
  }, [user, fetchProfile]);

  const signUp = useCallback(
    async ({ email, password, username, firstName, language }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, first_name: firstName, language },
        },
      });
      return { data, error };
    },
    [],
  );

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (email) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  }, []);

  const updatePassword = useCallback(async (password) => {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    return { data, error };
  }, []);

  const updateProfile = useCallback(
    async (updates) => {
      if (!user) return { error: new Error("Non authentifié") };
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();
      if (!error) setProfile(data);
      return { data, error };
    },
    [user],
  );

  const refreshProfile = useCallback(async () => {
    if (user) return fetchProfile(user.id);
  }, [user, fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
}
