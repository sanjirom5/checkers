import type { Board, Color, Move } from "./checkers";
import { getAllFullMoves, applyMove, cloneBoard } from "./checkers";

function countPieces(board: Board, color: Color): number {
  let regular = 0,
    kings = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell?.color === color) {
        if (cell.isKing) kings++;
        else regular++;
      }
    }
  }
  return regular + kings * 3;
}

function positionalBonus(board: Board, color: Color): number {
  let bonus = 0;
  const startRow = color === "red" ? 7 : 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = board[row][col];
      if (!cell || cell.color !== color) continue;
      if (cell.isKing) continue;
      const advance = Math.abs(row - startRow);
      bonus += advance * 0.1;
      // center columns bonus
      const centerDist = Math.abs(col - 3.5);
      bonus += (3.5 - centerDist) * 0.05;
    }
  }
  return bonus;
}

export function evaluateBoard(board: Board, color: Color): number {
  const opponent: Color = color === "red" ? "white" : "red";
  const myScore = countPieces(board, color) + positionalBonus(board, color);
  const theirScore =
    countPieces(board, opponent) + positionalBonus(board, opponent);
  return myScore - theirScore;
}

export function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  color: Color,
): number {
  const currentColor: Color = maximizing
    ? color
    : color === "red"
      ? "white"
      : "red";
  const moves = getAllFullMoves(board, currentColor);

  if (depth === 0 || moves.length === 0) {
    return evaluateBoard(board, color);
  }

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = applyMove(cloneBoard(board), move);
      const ev = minimax(newBoard, depth - 1, alpha, beta, false, color);
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = applyMove(cloneBoard(board), move);
      const ev = minimax(newBoard, depth - 1, alpha, beta, true, color);
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function getBestMove(
  board: Board,
  color: Color,
  depth: number,
): Move | null {
  const moves = getAllFullMoves(board, color);
  if (moves.length === 0) return null;

  if (depth === 0) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const newBoard = applyMove(cloneBoard(board), move);
    const score = minimax(
      newBoard,
      depth - 1,
      -Infinity,
      Infinity,
      false,
      color,
    );
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

export function getAIDepth(difficulty: "easy" | "medium" | "hard"): number {
  switch (difficulty) {
    case "easy":
      return 0;
    case "medium":
      return 3;
    case "hard":
      return 6;
  }
}
