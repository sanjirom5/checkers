import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Profile } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

export function useSupabase() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // Start as true only if supabase is configured — avoids sync setState in effect
  const [loading, setLoading] = useState(supabase !== null);
  // Prevent double-fetch from getSession + onAuthStateChange firing together on mount
  const initialSessionHandled = useRef(false);

  useEffect(() => {
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        // Skip the duplicate fire on initial mount
        if (!initialSessionHandled.current) {
          initialSessionHandled.current = true;
        }
        fetchProfile(currentUser.id);
      } else {
        initialSessionHandled.current = true;
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (!error) setProfile(data);
    setLoading(false);
  }

  async function signIn(email: string, password: string) {
    if (!supabase) return { error: new Error("Supabase not configured") };
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async function signUp(email: string, password: string, username: string) {
    if (!supabase) return { error: new Error("Supabase not configured") };

    // Check username uniqueness before creating auth user
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    if (existing) {
      return { error: new Error("Username is already taken") };
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error };
    if (!data.user) return { error: new Error("Sign up failed") };

    // Insert profile — only valid once the auth user row exists
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      username,
      wins: 0,
      losses: 0,
      best_streak: 0,
      current_streak: 0,
    });
    if (profileError) return { error: profileError };

    return { data, error: null };
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  async function signInWithGoogle() {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }

  async function saveGame(
    opponent: string,
    winner: string,
    moveCount: number,
    durationSeconds: number,
  ) {
    if (!supabase || !user) return;

    const { error: insertError } = await supabase.from("games").insert({
      player_id: user.id,
      opponent,
      winner,
      move_count: moveCount,
      duration_seconds: durationSeconds,
    });
    if (insertError) {
      console.error("Failed to save game:", insertError.message);
      return;
    }

    // winner is the color ("red"/"white"); human player is always red
    const won = winner === "red";

    const { data: prof, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (fetchError || !prof) return;

    const newStreak = won ? prof.current_streak + 1 : 0;
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        wins: won ? prof.wins + 1 : prof.wins,
        losses: won ? prof.losses : prof.losses + 1,
        current_streak: newStreak,
        best_streak: Math.max(prof.best_streak, newStreak),
      })
      .eq("id", user.id);
    if (!updateError) await fetchProfile(user.id);
  }

  const fetchGames = useCallback(async () => {
    if (!supabase || !user) return [];
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .eq("player_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to fetch games:", error.message);
      return [];
    }
    return data ?? [];
  }, [user]);

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    saveGame,
    fetchGames,
  };
}
