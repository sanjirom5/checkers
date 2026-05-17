export type Color = "red" | "white";

export interface Piece {
  color: Color;
  isKing: boolean;
}

export type Cell = Piece | null;
export type Board = Cell[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  captures: Position[];
  chain?: Move[]; // individual hops for step-by-step animation
}

export function createInitialBoard(): Board {
  const board: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: "white", isKing: false };
      }
    }
  }

  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: "red", isKing: false };
      }
    }
  }

  return board;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function getCaptureMoves(
  board: Board,
  pos: Position,
  color: Color,
  isKing: boolean,
): Move[] {
  const moves: Move[] = [];
  const directions = isKing
    ? [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]
    : color === "red"
      ? [
          [-1, -1],
          [-1, 1],
        ]
      : [
          [1, -1],
          [1, 1],
        ];

  if (isKing) {
    for (const [dr, dc] of directions) {
      let r = pos.row + dr;
      let c = pos.col + dc;
      let foundEnemy: Position | null = null;

      while (inBounds(r, c)) {
        const cell = board[r][c];
        if (cell) {
          if (cell.color !== color && !foundEnemy) {
            foundEnemy = { row: r, col: c };
          } else {
            break;
          }
        } else if (foundEnemy) {
          moves.push({
            from: pos,
            to: { row: r, col: c },
            captures: [foundEnemy],
          });
        }
        r += dr;
        c += dc;
      }
    }
  } else {
    for (const [dr, dc] of directions) {
      const mr = pos.row + dr;
      const mc = pos.col + dc;
      const lr = pos.row + dr * 2;
      const lc = pos.col + dc * 2;

      if (
        inBounds(lr, lc) &&
        board[mr]?.[mc]?.color === (color === "red" ? "white" : "red") &&
        !board[lr][lc]
      ) {
        moves.push({
          from: pos,
          to: { row: lr, col: lc },
          captures: [{ row: mr, col: mc }],
        });
      }
    }
  }

  return moves;
}

function getSimpleMoves(
  board: Board,
  pos: Position,
  color: Color,
  isKing: boolean,
): Move[] {
  const moves: Move[] = [];
  const directions = isKing
    ? [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]
    : color === "red"
      ? [
          [-1, -1],
          [-1, 1],
        ]
      : [
          [1, -1],
          [1, 1],
        ];

  if (isKing) {
    for (const [dr, dc] of directions) {
      let r = pos.row + dr;
      let c = pos.col + dc;
      while (inBounds(r, c) && !board[r][c]) {
        moves.push({ from: pos, to: { row: r, col: c }, captures: [] });
        r += dr;
        c += dc;
      }
    }
  } else {
    for (const [dr, dc] of directions) {
      const nr = pos.row + dr;
      const nc = pos.col + dc;
      if (inBounds(nr, nc) && !board[nr][nc]) {
        moves.push({ from: pos, to: { row: nr, col: nc }, captures: [] });
      }
    }
  }

  return moves;
}

export function getValidMovesForPiece(board: Board, pos: Position): Move[] {
  const piece = board[pos.row][pos.col];
  if (!piece) return [];

  const captures = getCaptureMoves(board, pos, piece.color, piece.isKing);
  if (captures.length > 0) return captures;
  return getSimpleMoves(board, pos, piece.color, piece.isKing);
}

export function getAllValidMoves(board: Board, color: Color): Move[] {
  const allCaptures: Move[] = [];
  const allSimple: Move[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece || piece.color !== color) continue;
      const pos = { row, col };
      const caps = getCaptureMoves(board, pos, piece.color, piece.isKing);
      if (caps.length > 0) {
        allCaptures.push(...caps);
      } else {
        allSimple.push(
          ...getSimpleMoves(board, pos, piece.color, piece.isKing),
        );
      }
    }
  }

  return allCaptures.length > 0 ? allCaptures : allSimple;
}

export function applyMove(board: Board, move: Move): Board {
  const newBoard = cloneBoard(board);
  const piece = { ...newBoard[move.from.row][move.from.col]! };

  newBoard[move.from.row][move.from.col] = null;

  for (const cap of move.captures) {
    newBoard[cap.row][cap.col] = null;
  }

  const promotionRow = piece.color === "red" ? 0 : 7;
  if (move.to.row === promotionRow) {
    piece.isKing = true;
  }

  newBoard[move.to.row][move.to.col] = piece;
  return newBoard;
}

export function getChainCaptures(
  board: Board,
  pos: Position,
  color: Color,
  isKing: boolean,
): Move[][] {
  const piece = board[pos.row][pos.col];
  const effectiveKing = isKing || (piece?.isKing ?? false);
  const caps = getCaptureMoves(board, pos, color, effectiveKing);

  if (caps.length === 0) return [];

  const chains: Move[][] = [];
  for (const cap of caps) {
    const boardAfter = applyMove(board, cap);
    const piecAfter = boardAfter[cap.to.row][cap.to.col]!;
    const further = getChainCaptures(
      boardAfter,
      cap.to,
      color,
      piecAfter.isKing,
    );

    if (further.length === 0) {
      chains.push([cap]);
    } else {
      for (const chain of further) {
        chains.push([cap, ...chain]);
      }
    }
  }
  return chains;
}

export function getFullCaptureMoves(board: Board, pos: Position): Move[] {
  const piece = board[pos.row][pos.col];
  if (!piece) return [];

  const chains = getChainCaptures(board, pos, piece.color, piece.isKing);
  if (chains.length === 0) return [];

  return chains.map((chain) => ({
    from: pos,
    to: chain[chain.length - 1].to,
    captures: chain.flatMap((m) => m.captures),
    chain: chain.length > 1 ? chain : undefined,
  }));
}

export function getAllFullMoves(board: Board, color: Color): Move[] {
  const allCaptures: Move[] = [];
  const allSimple: Move[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece || piece.color !== color) continue;
      const pos = { row, col };
      const fullCaps = getFullCaptureMoves(board, pos);
      if (fullCaps.length > 0) {
        allCaptures.push(...fullCaps);
      } else {
        allSimple.push(
          ...getSimpleMoves(board, pos, piece.color, piece.isKing),
        );
      }
    }
  }

  return allCaptures.length > 0 ? allCaptures : allSimple;
}

export function getValidSquaresForSelected(
  _board: Board,
  pos: Position,
  allMoves: Move[],
): Position[] {
  return allMoves
    .filter((m) => m.from.row === pos.row && m.from.col === pos.col)
    .map((m) => m.to);
}

export function checkWin(board: Board, color: Color): boolean {
  const opponent: Color = color === "red" ? "white" : "red";
  const opponentMoves = getAllFullMoves(board, opponent);
  return opponentMoves.length === 0;
}

export function positionToNotation(pos: Position): string {
  const col = String.fromCharCode(97 + pos.col);
  const row = 8 - pos.row;
  return `${col}${row}`;
}

export function moveToNotation(move: Move): string {
  const from = positionToNotation(move.from);
  const to = positionToNotation(move.to);
  const sep = move.captures.length > 0 ? "x" : "→";
  return `${from}${sep}${to}`;
}
