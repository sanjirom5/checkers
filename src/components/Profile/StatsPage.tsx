import { useEffect, useState } from "react";
import { Modal } from "../UI/Modal";
import { Button } from "../UI/Button";
import type { GameRecord, Profile } from "../../lib/supabase";
import s from "./StatsPage.module.css";

interface StatsPageProps {
  open: boolean;
  onClose: () => void;
  profile: Profile | null;
  onFetchGames: () => Promise<GameRecord[]>;
  onSignOut: () => void;
}

export function StatsPage({
  open,
  onClose,
  profile,
  onFetchGames,
  onSignOut,
}: StatsPageProps) {
  const [games, setGames] = useState<GameRecord[] | null>(null);
  const loading = open && !!profile && games === null;

  useEffect(() => {
    if (!open || !profile) return;
    onFetchGames().then((g) => setGames(g));
  }, [open, profile, onFetchGames]);

  const winRate =
    profile && profile.wins + profile.losses > 0
      ? Math.round((profile.wins / (profile.wins + profile.losses)) * 100)
      : 0;

  return (
    <Modal open={open} onClose={onClose} title="My Stats">
      {!profile ? (
        <p className={s.loadingText}>Loading profile...</p>
      ) : (
        <div className={s.body}>
          <div className={s.profileRow}>
            <div className={s.avatar}>{profile.username[0].toUpperCase()}</div>
            <div>
              <p className={s.username}>{profile.username}</p>
              <p className={s.joined}>
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className={s.statsGrid}>
            {[
              { label: "Wins", value: profile.wins, cls: s.wins },
              { label: "Losses", value: profile.losses, cls: s.losses },
              { label: "Win Rate", value: `${winRate}%`, cls: s.winRate },
              {
                label: "Best Streak",
                value: profile.best_streak,
                cls: s.streak,
              },
            ].map(({ label, value, cls }) => (
              <div key={label} className={s.statCard}>
                <p className={`${s.statValue} ${cls}`}>{value}</p>
                <p className={s.statLabel}>{label}</p>
              </div>
            ))}
          </div>

          <div>
            <div className={s.sectionLabel}>Recent Games</div>
            {loading ? (
              <p className={s.loadingText}>Loading...</p>
            ) : !games || games.length === 0 ? (
              <p className={s.loadingText}>No games yet</p>
            ) : (
              <div className={s.gamesList}>
                {(games ?? []).slice(0, 10).map((g) => (
                  <div key={g.id} className={s.gameRow}>
                    <span className={s.gameOpponent}>
                      {g.game_mode === "ai"
                        ? `vs AI${g.difficulty ? ` (${g.difficulty})` : ""}`
                        : "vs Player 2"}
                    </span>
                    <span
                      className={
                        g.result === "win"
                          ? s.gameWin
                          : g.result === "draw"
                            ? s.gameDraw
                            : s.gameLoss
                      }
                    >
                      {g.result === "win"
                        ? "Win"
                        : g.result === "draw"
                          ? "Draw"
                          : "Loss"}
                    </span>
                    <span className={s.gameMoves}>{g.move_count} moves</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="secondary"
            onClick={onSignOut}
            style={{ width: "100%" }}
          >
            Sign Out
          </Button>
        </div>
      )}
    </Modal>
  );
}
