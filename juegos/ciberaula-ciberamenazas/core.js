(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CiberAmenazasCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function key(row, col) { return `${row},${col}`; }
  function inside(board, row, col) { return row >= 0 && col >= 0 && row < board.rows && col < board.cols; }
  function neighbors(board, row, col) {
    const cells = [];
    for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) {
      if ((dr || dc) && inside(board, row + dr, col + dc)) cells.push([row + dr, col + dc]);
    }
    return cells;
  }

  function createBoard(rows, cols) {
    if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 2 || cols < 2) throw new Error("Dimensiones inválidas");
    return {
      rows, cols, placed: false, threatCount: 0,
      cells: Array.from({ length: rows }, (_, row) => Array.from({ length: cols }, (_, col) => ({
        row, col, threat: false, adjacent: 0, revealed: false, flagged: false, threatIndex: 0
      })))
    };
  }

  function placeThreats(board, count, firstRow, firstCol, rng = Math.random, safeRadius = 1) {
    if (board.placed) return board;
    if (!inside(board, firstRow, firstCol)) throw new Error("Primer toque fuera del tablero");
    const candidates = [];
    for (let row = 0; row < board.rows; row += 1) for (let col = 0; col < board.cols; col += 1) {
      if (Math.abs(row - firstRow) > safeRadius || Math.abs(col - firstCol) > safeRadius) candidates.push([row, col]);
    }
    if (count < 1 || count > candidates.length) throw new Error("Cantidad de amenazas incompatible con la zona inicial segura");
    for (let i = candidates.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    candidates.slice(0, count).forEach(([row, col], index) => {
      const cell = board.cells[row][col]; cell.threat = true; cell.threatIndex = index;
    });
    for (let row = 0; row < board.rows; row += 1) for (let col = 0; col < board.cols; col += 1) {
      board.cells[row][col].adjacent = neighbors(board, row, col).filter(([r, c]) => board.cells[r][c].threat).length;
    }
    board.placed = true; board.threatCount = count;
    return board;
  }

  function reveal(board, row, col) {
    if (!inside(board, row, col)) return [];
    const start = board.cells[row][col];
    if (start.revealed || start.flagged) return [];
    if (start.threat) { start.revealed = true; return [[row, col]]; }
    const revealed = [], queue = [[row, col]], queued = new Set([key(row, col)]);
    while (queue.length) {
      const [r, c] = queue.shift(), cell = board.cells[r][c];
      if (cell.revealed || cell.flagged || cell.threat) continue;
      cell.revealed = true; revealed.push([r, c]);
      if (cell.adjacent === 0) neighbors(board, r, c).forEach(([nr, nc]) => {
        const next = board.cells[nr][nc], id = key(nr, nc);
        if (!next.revealed && !next.flagged && !next.threat && !queued.has(id)) { queued.add(id); queue.push([nr, nc]); }
      });
    }
    return revealed;
  }

  function toggleFlag(board, row, col, maxFlags = Infinity) {
    if (!inside(board, row, col)) return false;
    const cell = board.cells[row][col];
    if (cell.revealed) return cell.flagged;
    if (!cell.flagged && countFlags(board) >= maxFlags) return false;
    cell.flagged = !cell.flagged;
    return cell.flagged;
  }

  function countFlags(board) { return board.cells.flat().filter(cell => cell.flagged).length; }
  function countRevealedSafe(board) { return board.cells.flat().filter(cell => cell.revealed && !cell.threat).length; }
  function safeCellCount(board) { return board.rows * board.cols - board.threatCount; }
  function hasWon(board) { return board.placed && countRevealedSafe(board) === safeCellCount(board); }
  function revealThreats(board) { board.cells.flat().filter(cell => cell.threat).forEach(cell => { cell.revealed = true; }); }
  function correctFlags(board) { return board.cells.flat().filter(cell => cell.flagged && cell.threat).length; }
  function firstZoneIsSafe(board, row, col, radius = 1) {
    for (let r = row - radius; r <= row + radius; r += 1) for (let c = col - radius; c <= col + radius; c += 1) {
      if (inside(board, r, c) && board.cells[r][c].threat) return false;
    }
    return true;
  }

  return { createBoard, placeThreats, reveal, toggleFlag, countFlags, countRevealedSafe, safeCellCount, hasWon, revealThreats, correctFlags, firstZoneIsSafe, neighbors };
});
