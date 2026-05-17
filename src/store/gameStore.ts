import { create } from "zustand";
import type { Board, Color, Move, Position } from "../utils/checkers";
import {
  createInitialBoard,
  applyMove,
  getAllFullMoves,
  checkWin,
  moveToNotation,
  getValidSquaresForSelected,
} from "../utils/checkers";

export type GameMode = "pvp" | "ai";
export type Difficulty = "easy" | "medium" | "hard";
export type GameStatus = "idle" | "playing" | "won" | "draw";

export interface GameState {
  board: Board;
  currentTurn: Color;
  selectedPos: Position | null;
  validMoves: Move[];
  validSquares: Position[];
  moveHistory: string[];
  boardHistory: Board[];
  capturedByRed: number;
  capturedByWhite: number;
  lastMove: Move | null;
  gameMode: GameMode;
  difficulty: Difficulty;
  gameStatus: GameStatus;
  winner: Color | null;
  aiThinking: boolean;
  isAnimating: boolean;
  animatingPos: Position | null;
  redTime: number;
  whiteTime: number;
  theme: "light" | "dark";
  movesSinceCapture: number;
}

export interface GameActions {
  initGame: (mode: GameMode, difficulty?: Difficulty) => void;
  selectPiece: (pos: Position) => void;
  executeMove: (move: Move) => void;
  undoMove: () => void;
  setAiThinking: (v: boolean) => void;
  tickTimer: () => void;
  setTheme: (t: "light" | "dark") => void;
  resetGame: () => void;
}

const initialState: GameState = {
  board: createInitialBoard(),
  currentTurn: "red",
  selectedPos: null,
  validMoves: [],
  validSquares: [],
  moveHistory: [],
  boardHistory: [],
  capturedByRed: 0,
  capturedByWhite: 0,
  lastMove: null,
  gameMode: "pvp",
  difficulty: "medium",
  gameStatus: "idle",
  winner: null,
  aiThinking: false,
  isAnimating: false,
  animatingPos: null,
  redTime: 0,
  whiteTime: 0,
  theme: (localStorage.getItem("theme") as "light" | "dark") ?? "dark",
  movesSinceCapture: 0,
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  initGame: (mode, difficulty = "medium") => {
    const board = createInitialBoard();
    const validMoves = getAllFullMoves(board, "red");
    set({
      ...initialState,
      board,
      validMoves,
      gameMode: mode,
      difficulty,
      gameStatus: "playing",
      boardHistory: [board],
      theme: get().theme,
    });
  },

  selectPiece: (pos) => {
    const { board, currentTurn, gameStatus, validMoves, isAnimating } = get();
    if (gameStatus !== "playing" || isAnimating) return;
    const piece = board[pos.row][pos.col];

    if (!piece || piece.color !== currentTurn) {
      const { selectedPos } = get();
      if (selectedPos) {
        const move = validMoves.find(
          (m) =>
            m.from.row === selectedPos.row &&
            m.from.col === selectedPos.col &&
            m.to.row === pos.row &&
            m.to.col === pos.col,
        );
        if (move) {
          get().executeMove(move);
          return;
        }
      }
      set({ selectedPos: null, validSquares: [] });
      return;
    }

    const squares = getValidSquaresForSelected(board, pos, validMoves);
    set({ selectedPos: pos, validSquares: squares });
  },

  executeMove: (move) => {
    const {
      board,
      currentTurn,
      moveHistory,
      boardHistory,
      capturedByRed,
      capturedByWhite,
      movesSinceCapture,
    } = get();
    const notation = moveToNotation(move);

    // Single hop — apply immediately, no animation needed
    if (!move.chain) {
      const newBoard = applyMove(board, move);
      const newCapturedByRed =
        capturedByRed + (currentTurn === "red" ? move.captures.length : 0);
      const newCapturedByWhite =
        capturedByWhite + (currentTurn === "white" ? move.captures.length : 0);
      const nextTurn: Color = currentTurn === "red" ? "white" : "red";
      const won = checkWin(newBoard, currentTurn);
      const newMovesSinceCapture =
        move.captures.length > 0 ? 0 : movesSinceCapture + 1;
      const isDraw = !won && newMovesSinceCapture >= 40;
      const nextMoves =
        won || isDraw ? [] : getAllFullMoves(newBoard, nextTurn);

      set({
        board: newBoard,
        currentTurn: nextTurn,
        selectedPos: null,
        validSquares: [],
        validMoves: nextMoves,
        moveHistory: [...moveHistory, notation],
        boardHistory: [...boardHistory, newBoard],
        capturedByRed: newCapturedByRed,
        capturedByWhite: newCapturedByWhite,
        lastMove: move,
        movesSinceCapture: newMovesSinceCapture,
        gameStatus: won ? "won" : isDraw ? "draw" : "playing",
        winner: won ? currentTurn : null,
      });
      return;
    }

    // Multi-hop chain capture — animate each step
    const chain = move.chain;
    set({ isAnimating: true, selectedPos: null, validSquares: [] });

    let stepBoard = board;
    let stepCapturedByRed = capturedByRed;
    let stepCapturedByWhite = capturedByWhite;
    let step = 0;

    const applyNextStep = () => {
      if (step >= chain.length) {
        // All hops done — finalize turn (chain captures always reset the counter)
        const nextTurn: Color = currentTurn === "red" ? "white" : "red";
        const won = checkWin(stepBoard, currentTurn);
        const nextMoves = won ? [] : getAllFullMoves(stepBoard, nextTurn);
        set({
          isAnimating: false,
          animatingPos: null,
          currentTurn: nextTurn,
          validMoves: nextMoves,
          moveHistory: [...get().moveHistory, notation],
          boardHistory: [...get().boardHistory, stepBoard],
          lastMove: move,
          movesSinceCapture: 0,
          gameStatus: won ? "won" : "playing",
          winner: won ? currentTurn : null,
        });
        return;
      }

      const subMove = chain[step];
      stepBoard = applyMove(stepBoard, subMove);

      if (currentTurn === "red") stepCapturedByRed += subMove.captures.length;
      else stepCapturedByWhite += subMove.captures.length;

      set({
        board: stepBoard,
        capturedByRed: stepCapturedByRed,
        capturedByWhite: stepCapturedByWhite,
        animatingPos: subMove.to,
        lastMove: subMove,
      });

      step++;
      setTimeout(applyNextStep, 380);
    };

    // Slight initial delay so the first hop is visually distinct from the selection state
    setTimeout(applyNextStep, 80);
  },

  undoMove: () => {
    const { boardHistory, moveHistory, gameMode, currentTurn } = get();
    if (gameMode !== "pvp" || boardHistory.length < 2) return;

    const newHistory = boardHistory.slice(0, -1);
    const prevBoard = newHistory[newHistory.length - 1];
    const prevTurn: Color = currentTurn === "red" ? "white" : "red";
    const validMoves = getAllFullMoves(prevBoard, prevTurn);

    set({
      board: prevBoard,
      boardHistory: newHistory,
      moveHistory: moveHistory.slice(0, -1),
      currentTurn: prevTurn,
      validMoves,
      selectedPos: null,
      validSquares: [],
      lastMove: null,
      gameStatus: "playing",
      winner: null,
    });
  },

  setAiThinking: (v) => set({ aiThinking: v }),

  tickTimer: () => {
    const { currentTurn, gameStatus } = get();
    if (gameStatus !== "playing") return;
    if (currentTurn === "red") set((s) => ({ redTime: s.redTime + 1 }));
    else set((s) => ({ whiteTime: s.whiteTime + 1 }));
  },

  setTheme: (t) => {
    localStorage.setItem("theme", t);
    set({ theme: t });
  },

  resetGame: () => {
    set({ ...initialState, theme: get().theme });
  },
}));
