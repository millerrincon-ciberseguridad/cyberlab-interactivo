/*
 * Motor lógico puro de CiberBloques: Guardia Digital v2.
 * No conoce Canvas, DOM, pieza fantasma, audio ni animaciones.
 * Puede ejecutarse en navegador y con Node.js para pruebas automatizadas.
 */
(function exposeBoardEngine(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.CiberBlocksEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBoardEngine() {
  "use strict";

  function createBoard(height, width) {
    requirePositiveInteger(height, "height");
    requirePositiveInteger(width, "width");
    return Array.from({ length: height }, () => Array(width).fill(0));
  }

  function cloneBoard(board) {
    return board.map(row => row.slice());
  }

  function requirePositiveInteger(value, name) {
    if (!Number.isInteger(value) || value <= 0) throw new TypeError(`${name} debe ser un entero positivo.`);
  }

  function assertBoard(board, options) {
    const { height, width, validValues } = options;
    requirePositiveInteger(height, "height");
    requirePositiveInteger(width, "width");
    if (!Array.isArray(board) || board.length !== height) {
      throw new Error(`Altura inválida: se esperaban ${height} filas.`);
    }
    const allowed = validValues instanceof Set ? validValues : new Set(validValues || [0]);
    board.forEach((row, y) => {
      if (!Array.isArray(row) || row.length !== width) {
        throw new Error(`Ancho inválido en la fila ${y}: se esperaban ${width} celdas.`);
      }
      row.forEach((value, x) => {
        if (!allowed.has(value)) throw new Error(`Valor inválido ${String(value)} en (${x}, ${y}).`);
      });
    });
    return true;
  }

  function countFilled(board) {
    return board.reduce((total, row) => total + row.reduce((sum, value) => sum + (value === 0 ? 0 : 1), 0), 0);
  }

  function occupiedCells(piece) {
    if (!piece || !Array.isArray(piece.matrix)) throw new TypeError("La pieza debe incluir una matriz.");
    const cells = [];
    piece.matrix.forEach((row, localY) => {
      if (!Array.isArray(row)) throw new TypeError("Cada fila de la pieza debe ser una matriz.");
      row.forEach((value, localX) => {
        if (value) cells.push({ x: piece.x + localX, y: piece.y + localY, localX, localY });
      });
    });
    return cells;
  }

  function collides(board, piece, options) {
    const { height, width } = options;
    for (const cell of occupiedCells(piece)) {
      if (cell.x < 0 || cell.x >= width || cell.y >= height) return true;
      if (cell.y >= 0 && board[cell.y][cell.x] !== 0) return true;
    }
    return false;
  }

  /*
   * Fija una pieza sobre una copia. Si alguna celda queda por encima del área
   * visible, la operación completa se rechaza para impedir fijaciones parciales.
   */
  function lockPiece(board, piece, options) {
    assertBoard(board, options);
    const cells = occupiedCells(piece);
    const overflow = cells.some(cell => cell.y < 0);
    if (overflow) {
      return { board: cloneBoard(board), overflow: true, lockedCells: 0 };
    }
    const next = cloneBoard(board);
    for (const cell of cells) {
      if (cell.x < 0 || cell.x >= options.width || cell.y >= options.height) {
        throw new Error(`La pieza intenta fijarse fuera del tablero en (${cell.x}, ${cell.y}).`);
      }
      if (next[cell.y][cell.x] !== 0) {
        throw new Error(`La pieza intenta fijarse sobre una celda ocupada en (${cell.x}, ${cell.y}).`);
      }
      next[cell.y][cell.x] = piece.id;
    }
    assertBoard(next, options);
    return { board: next, overflow: false, lockedCells: cells.length };
  }

  /* Detecta sobre una copia estable, nunca sobre una matriz que esté colapsando. */
  function detectCompleteRows(board, options) {
    assertBoard(board, options);
    const stable = cloneBoard(board);
    const rows = [];
    stable.forEach((row, y) => {
      if (row.every(value => value !== 0)) rows.push(y);
    });
    return Object.freeze(rows);
  }

  function normalizeRows(rows, height) {
    if (!Array.isArray(rows)) throw new TypeError("rows debe ser una matriz de índices.");
    const unique = [...new Set(rows)];
    unique.forEach(row => {
      if (!Number.isInteger(row) || row < 0 || row >= height) throw new Error(`Índice de fila inválido: ${String(row)}.`);
    });
    // Orden canónico de eliminación: desde la fila inferior hacia la superior.
    return unique.sort((a, b) => b - a);
  }

  /*
   * Eliminación simultánea y una única compactación:
   * 1) conserva todas las filas no detectadas en su orden original;
   * 2) crea exactamente N filas vacías;
   * 3) concatena una sola vez vacías + supervivientes.
   */
  function collapseRows(board, rows, options) {
    assertBoard(board, options);
    const normalized = normalizeRows(rows, options.height);
    const completeNow = detectCompleteRows(board, options);
    const completeSet = new Set(completeNow);
    normalized.forEach(row => {
      if (!completeSet.has(row)) throw new Error(`La fila ${row} ya no está completa en la copia estable.`);
    });

    const beforeFilled = countFilled(board);
    const removedSet = new Set(normalized);
    const survivors = board.filter((_, y) => !removedSet.has(y)).map(row => row.slice());
    const emptyRows = Array.from({ length: normalized.length }, () => Array(options.width).fill(0));
    const collapsed = emptyRows.concat(survivors);
    assertBoard(collapsed, options);

    const removedCells = normalized.reduce((sum, y) => sum + board[y].filter(value => value !== 0).length, 0);
    const afterFilled = countFilled(collapsed);
    if (afterFilled !== beforeFilled - removedCells) {
      throw new Error(`Invariante de celdas incumplida: ${afterFilled} !== ${beforeFilled} - ${removedCells}.`);
    }
    return {
      board: collapsed,
      removedRows: Object.freeze(normalized),
      removedCells,
      beforeFilled,
      afterFilled
    };
  }

  /* Transacción estable usada por el juego antes de iniciar la animación. */
  function beginLockTransaction(board, piece, options) {
    const original = cloneBoard(board);
    const locked = lockPiece(original, piece, options);
    if (locked.overflow) {
      return Object.freeze({ overflow: true, lockedBoard: locked.board, completeRows: Object.freeze([]), lockedCells: 0 });
    }
    const stable = cloneBoard(locked.board);
    const rows = detectCompleteRows(stable, options);
    return Object.freeze({
      overflow: false,
      lockedBoard: stable,
      completeRows: rows,
      lockedCells: locked.lockedCells
    });
  }

  return Object.freeze({
    createBoard,
    cloneBoard,
    assertBoard,
    countFilled,
    occupiedCells,
    collides,
    lockPiece,
    detectCompleteRows,
    collapseRows,
    beginLockTransaction
  });
});
