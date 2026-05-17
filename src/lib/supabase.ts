import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export type Profile = {
  id: string;
  username: string;
  wins: number;
  losses: number;
  best_streak: number;
  current_streak: number;
  created_at: string;
};

export type GameRecord = {
  id: string;
  player_id: string;
  opponent: string;
  winner: string;
  move_count: number;
  duration_seconds: number;
  created_at: string;
};
