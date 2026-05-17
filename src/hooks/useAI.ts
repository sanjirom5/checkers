import { useEffect, useRef } from "react";
import { useGameStore } from "../store/gameStore";
import { getBestMove, getAIDepth } from "../utils/ai";

export function useAI() {
  const {
    board,
    currentTurn,
    gameMode,
    difficulty,
    gameStatus,
    aiThinking,
    isAnimating,
    executeMove,
    setAiThinking,
  } = useGameStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (
      gameMode !== "ai" ||
      currentTurn !== "white" ||
      gameStatus !== "playing" ||
      aiThinking ||
      isAnimating
    )
      return;

    setAiThinking(true);
    const depth = getAIDepth(difficulty);

    timeoutRef.current = setTimeout(() => {
      const move = getBestMove(board, "white", depth);
      if (move) executeMove(move);
      setAiThinking(false);
    }, 400);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [
    board,
    currentTurn,
    gameMode,
    gameStatus,
    difficulty,
    isAnimating,
    executeMove,
    setAiThinking,
  ]); // aiThinking intentionally omitted: including it causes the effect to cancel its own timeout
}
