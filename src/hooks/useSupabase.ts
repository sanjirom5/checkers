import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Profile } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

export function useSupabase() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (data.session?.user) fetchProfile(data.session.user.id);
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    if (!supabase) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
    setLoading(false);
  }

  async function signIn(email: string, password: string) {
    if (!supabase) return { error: new Error("Supabase not configured") };
    return supabase.auth.signInWithPassword({ email, password });
  }

  async function signUp(email: string, password: string, username: string) {
    if (!supabase) return { error: new Error("Supabase not configured") };
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) return { error };
    await supabase.from("profiles").insert({ id: data.user.id, username });
    return { data, error: null };
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  async function signInWithGoogle() {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({ provider: "google" });
  }

  async function saveGame(
    opponent: string,
    winner: string,
    moveCount: number,
    durationSeconds: number,
  ) {
    if (!supabase || !user) return;
    await supabase.from("games").insert({
      player_id: user.id,
      opponent,
      winner,
      move_count: moveCount,
      duration_seconds: durationSeconds,
    });
    const won = winner === "red";
    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (prof) {
      const newStreak = won ? prof.current_streak + 1 : 0;
      await supabase
        .from("profiles")
        .update({
          wins: won ? prof.wins + 1 : prof.wins,
          losses: won ? prof.losses : prof.losses + 1,
          current_streak: newStreak,
          best_streak: Math.max(prof.best_streak, newStreak),
        })
        .eq("id", user.id);
      fetchProfile(user.id);
    }
  }

  async function fetchGames() {
    if (!supabase || !user) return [];
    const { data } = await supabase
      .from("games")
      .select("*")
      .eq("player_id", user.id)
      .order("created_at", { ascending: false });
    return data ?? [];
  }

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
