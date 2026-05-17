import { useState } from "react";
import clsx from "clsx";
import { useGameStore } from "../../store/gameStore";
import type { GameMode, Difficulty } from "../../store/gameStore";
import { Button } from "../UI/Button";
import s from "./GameControls.module.css";

interface GameControlsProps {
  onOpenAuth: () => void;
  isLoggedIn: boolean;
  username?: string;
  onOpenStats: () => void;
}

export function GameControls({
  onOpenAuth,
  isLoggedIn,
  username,
  onOpenStats,
}: GameControlsProps) {
  const {
    gameMode,
    gameStatus,
    currentTurn,
    aiThinking,
    initGame,
    undoMove,
    boardHistory,
  } = useGameStore();
  const [pendingMode, setPendingMode] = useState<GameMode>("pvp");
  const [pendingDiff, setPendingDiff] = useState<Difficulty>("medium");

  const statusText = () => {
    if (gameStatus === "idle") return "Select a mode and start a new game";
    if (gameStatus === "won") return "";
    if (aiThinking) return null;
    return `${currentTurn === "red" ? "Red" : "White"}'s turn`;
  };

  return (
    <div className={s.container}>
      {/* Mode selection */}
      <div>
        <div className={s.sectionLabel}>Game Mode</div>
        <div className={s.toggleGroup}>
          {(["pvp", "ai"] as GameMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setPendingMode(m)}
              className={clsx(
                s.toggleBtn,
                pendingMode === m ? s.active : s.inactive,
              )}
            >
              {m === "pvp" ? "👥 PvP" : "🤖 vs AI"}
            </button>
          ))}
        </div>
      </div>

      {/* AI Difficulty */}
      {pendingMode === "ai" && (
        <div>
          <div className={s.sectionLabel}>Difficulty</div>
          <div className={s.toggleGroup}>
            {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setPendingDiff(d)}
                className={clsx(
                  s.diffBtn,
                  pendingDiff === d ? s.active : s.inactive,
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={() => initGame(pendingMode, pendingDiff)}
        size="lg"
        className={s.startBtn}
      >
        {gameStatus === "idle" ? "Start Game" : "New Game"}
      </Button>

      {gameStatus === "playing" && (
        <div
          className={clsx(
            s.status,
            aiThinking
              ? s.statusAI
              : currentTurn === "red"
                ? s.statusRed
                : s.statusWhite,
          )}
        >
          {aiThinking ? (
            <span className={s.thinkingLabel}>
              AI is thinking
              <span className={s.dots}>
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </span>
          ) : (
            statusText()
          )}
        </div>
      )}

      {gameMode === "pvp" &&
        gameStatus === "playing" &&
        boardHistory.length > 1 && (
          <Button
            variant="secondary"
            onClick={undoMove}
            style={{ width: "100%" }}
          >
            ↩ Undo Last Move
          </Button>
        )}

      <div className={s.authRow}>
        {isLoggedIn ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenStats}
            style={{ flex: 1 }}
          >
            📊 Stats {username ? `(${username})` : ""}
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenAuth}
            style={{ flex: 1 }}
          >
            🔑 Sign In to Save Stats
          </Button>
        )}
      </div>
    </div>
  );
}
