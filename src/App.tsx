import { useState, useEffect, useRef } from "react";
import { Board } from "./components/Board/Board";
import { GameControls } from "./components/Game/GameControls";
import { MoveHistory } from "./components/Game/MoveHistory";
import { ScorePanel } from "./components/Game/ScorePanel";
import { Timer } from "./components/Game/Timer";
import { WinScreen } from "./components/Game/WinScreen";
import { LoginModal } from "./components/Auth/LoginModal";
import { SignupModal } from "./components/Auth/SignupModal";
import { StatsPage } from "./components/Profile/StatsPage";
import { ThemeToggle } from "./components/UI/ThemeToggle";
import { useGameStore } from "./store/gameStore";
import { useAI } from "./hooks/useAI";
import { useSupabase } from "./hooks/useSupabase";
import s from "./App.module.css";

type AuthModal = "none" | "login" | "signup";

export default function App() {
  useAI();

  const {
    theme,
    gameStatus,
    winner,
    gameMode,
    difficulty,
    moveHistory,
    redTime,
    whiteTime,
  } = useGameStore();
  const {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    saveGame,
    fetchGames,
  } = useSupabase();

  const [authModal, setAuthModal] = useState<AuthModal>("none");
  const [showStats, setShowStats] = useState(false);
  const gameSaved = useRef(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (gameStatus === "playing") gameSaved.current = false;
  }, [gameStatus]);

  if (loading) return <div className={s.loading}>Loading...</div>;

  async function handleSaveGame() {
    if (!winner || gameSaved.current) return;
    const opponent = gameMode === "ai" ? `AI (${difficulty})` : "Player 2";
    await saveGame(opponent, winner, moveHistory.length, redTime + whiteTime);
    gameSaved.current = true;
  }

  return (
    <div className={s.app}>
      <header className={s.header}>
        <div className={s.headerBrand}>
          <span className={s.headerIcon}>♟</span>
          <div>
            <h1 className={s.headerTitle}>Checkers</h1>
            <p className={s.headerSub}>Russian Draughts</p>
          </div>
        </div>
        <div className={s.headerActions}>
          {user && (
            <button className={s.profileBtn} onClick={() => setShowStats(true)}>
              <div className={s.profileAvatar}>
                {profile?.username?.[0]?.toUpperCase() ?? "?"}
              </div>
              <span>{profile?.username ?? "Profile"}</span>
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>

      <main className={s.main}>
        <div className={s.boardWrapper}>
          <Board />
        </div>

        <div className={s.sidePanel}>
          <div className={s.card}>
            <div className={s.cardStack}>
              <Timer />
              <ScorePanel />
            </div>
          </div>

          <div className={s.card}>
            <GameControls
              onOpenAuth={() => setAuthModal("login")}
              isLoggedIn={!!user}
              username={profile?.username}
              onOpenStats={() => setShowStats(true)}
            />
          </div>

          <div className={s.card}>
            <MoveHistory />
          </div>
        </div>
      </main>

      {gameStatus === "won" && (
        <WinScreen
          onNewGame={() => useGameStore.getState().resetGame()}
          onSaveGame={user ? handleSaveGame : undefined}
          isLoggedIn={!!user}
        />
      )}

      <LoginModal
        open={authModal === "login"}
        onClose={() => setAuthModal("none")}
        onLogin={async (e, p) => {
          const r = await signIn(e, p);
          return { error: r.error };
        }}
        onGoogle={signInWithGoogle}
        onSwitchToSignup={() => setAuthModal("signup")}
      />
      <SignupModal
        open={authModal === "signup"}
        onClose={() => setAuthModal("none")}
        onSignup={async (e, p, u) => {
          const r = await signUp(e, p, u);
          return { error: r.error ?? null };
        }}
        onSwitchToLogin={() => setAuthModal("login")}
      />

      <StatsPage
        open={showStats}
        onClose={() => setShowStats(false)}
        profile={profile}
        onFetchGames={fetchGames}
        onSignOut={async () => {
          await signOut();
          setShowStats(false);
        }}
      />
    </div>
  );
}
