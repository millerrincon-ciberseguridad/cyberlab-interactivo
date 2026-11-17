"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Engine = require("../board-engine.js");

const HEIGHT = 18;
const WIDTH = 10;
const RULES = { height: HEIGHT, width: WIDTH, validValues: new Set([0, 1, 2, 3, 4, 5, 6, 7]) };
const empty = () => Engine.createBoard(HEIGHT, WIDTH);
const deepCopy = board => board.map(row => row.slice());

function fillRows(board, rows, id = 1) {
  rows.forEach(y => { board[y] = Array(WIDTH).fill(id); });
  return board;
}

function assertInvariants(board) {
  assert.equal(board.length, HEIGHT, "la altura debe permanecer constante");
  board.forEach((row, y) => {
    assert.equal(row.length, WIDTH, `la fila ${y} debe conservar el ancho exacto`);
    row.forEach(value => assert.ok(RULES.validValues.has(value), `valor válido en fila ${y}`));
  });
  assert.equal(Engine.assertBoard(board, RULES), true);
}

test("crea una matriz rectangular independiente y válida", () => {
  const board = empty();
  assertInvariants(board);
  board[0][0] = 7;
  assert.equal(board[1][0], 0, "las filas no deben compartir referencias");
});

for (const count of [1, 2, 3, 4]) {
  test(`detecta y elimina ${count} ${count === 1 ? "línea" : "líneas"} simultáneamente`, () => {
    const board = empty();
    const rows = Array.from({ length: count }, (_, i) => HEIGHT - 1 - i);
    fillRows(board, rows, count);
    board[HEIGHT - count - 1][2] = 7; // bloque superviviente para comprobar el colapso
    const before = deepCopy(board);
    const detected = Engine.detectCompleteRows(board, RULES);
    assert.deepEqual([...detected], [...rows].sort((a, b) => a - b));
    const result = Engine.collapseRows(board, [...detected], RULES);
    assert.deepEqual(result.removedRows, [...rows].sort((a, b) => b - a), "el orden canónico es de abajo hacia arriba");
    assert.equal(result.removedCells, count * WIDTH);
    assert.equal(result.beforeFilled - result.afterFilled, count * WIDTH);
    assert.equal(result.board[HEIGHT - 1][2], 7, "el bloque superviviente baja exactamente el número de líneas retiradas");
    assertInvariants(result.board);
    assert.deepEqual(board, before, "la compactación no debe mutar la copia estable de origen");
  });
}

test("elimina líneas no consecutivas completadas por una misma fijación", () => {
  const board = empty();
  // Filas 13 y 15 tienen el mismo hueco; la barra vertical completa ambas.
  for (const y of [13, 15]) board[y] = Array(WIDTH).fill(2);
  board[13][4] = 0;
  board[15][4] = 0;
  board[14][0] = 3; // fila intermedia incompleta que debe sobrevivir
  const piece = { id: 1, x: 4, y: 12, matrix: [[1], [1], [1], [1]] };
  const tx = Engine.beginLockTransaction(board, piece, RULES);
  assert.equal(tx.overflow, false);
  assert.deepEqual([...tx.completeRows], [13, 15]);
  const result = Engine.collapseRows(tx.lockedBoard, [...tx.completeRows], RULES);
  assert.deepEqual(result.removedRows, [15, 13]);
  assert.equal(result.board[15][0], 3, "la fila 14 baja una posición por la línea retirada debajo de ella");
  assert.equal(result.board[15][4], 1, "la celda fijada en la fila superviviente se conserva");
  assertInvariants(result.board);
});

test("detecta y colapsa una fila superior sin desplazar celdas fuera de rango", () => {
  const board = empty();
  fillRows(board, [0], 4);
  board[1][6] = 5;
  const rows = Engine.detectCompleteRows(board, RULES);
  assert.deepEqual([...rows], [0]);
  const result = Engine.collapseRows(board, [...rows], RULES);
  assert.equal(result.board[0].every(value => value === 0), true);
  assert.equal(result.board[1][6], 5, "las filas inferiores conservan coordenadas al retirar la fila superior");
  assertInvariants(result.board);
});

test("rechaza atómicamente una pieza parcialmente fuera de la zona visible", () => {
  const board = empty();
  board[10][3] = 6;
  const before = deepCopy(board);
  const piece = { id: 2, x: 4, y: -1, matrix: [[1, 1], [1, 1]] };
  const tx = Engine.beginLockTransaction(board, piece, RULES);
  assert.equal(tx.overflow, true);
  assert.equal(tx.lockedCells, 0);
  assert.deepEqual(tx.lockedBoard, before, "no debe quedar una fijación parcial u huérfana");
  assert.deepEqual(board, before, "el tablero original permanece intacto");
});

test("la fijación válida escribe exactamente las celdas de la pieza reservada", () => {
  const board = empty();
  const reservedPiece = { id: 6, x: 3, y: 15, matrix: [[0, 1, 0], [1, 1, 1], [0, 0, 0]] };
  const beforeCount = Engine.countFilled(board);
  const tx = Engine.beginLockTransaction(board, reservedPiece, RULES);
  assert.equal(tx.overflow, false);
  assert.equal(tx.lockedCells, 4);
  assert.equal(Engine.countFilled(tx.lockedBoard), beforeCount + 4);
  assert.deepEqual([...tx.completeRows], []);
  assert.equal(board.every(row => row.every(value => value === 0)), true, "la matriz original no se modifica");
  assertInvariants(tx.lockedBoard);
});

test("la detección usa una copia estable y no cambia si se muta la lista devuelta", () => {
  const board = fillRows(empty(), [16, 17], 5);
  const detected = Engine.detectCompleteRows(board, RULES);
  assert.equal(Object.isFrozen(detected), true);
  assert.deepEqual([...detected], [16, 17]);
  assert.throws(() => detected.push(3), TypeError);
  assertInvariants(board);
});

test("la compactación conserva el orden y no crea bloques huérfanos", () => {
  const board = empty();
  board[9][0] = 1;
  board[10][1] = 2;
  fillRows(board, [11], 3);
  board[12][2] = 4;
  fillRows(board, [13], 5);
  board[14][3] = 6;
  const beforeFilled = Engine.countFilled(board);
  const result = Engine.collapseRows(board, [13, 11], RULES);
  assert.equal(result.afterFilled, beforeFilled - 2 * WIDTH);
  assert.equal(result.board[11][0], 1);
  assert.equal(result.board[12][1], 2);
  assert.equal(result.board[13][2], 4);
  assert.equal(result.board[14][3], 6);
  assert.equal(Engine.countFilled(result.board), 4);
  assertInvariants(result.board);
});

test("rechaza filas que no estaban completas en la instantánea", () => {
  const board = empty();
  board[17][0] = 1;
  assert.throws(() => Engine.collapseRows(board, [17], RULES), /ya no está completa/);
  assertInvariants(board);
});

test("rechaza valores inválidos y dimensiones irregulares", () => {
  const badValue = empty();
  badValue[0][0] = 99;
  assert.throws(() => Engine.assertBoard(badValue, RULES), /Valor inválido/);
  const badWidth = empty();
  badWidth[4].pop();
  assert.throws(() => Engine.assertBoard(badWidth, RULES), /Ancho inválido/);
  const badHeight = empty();
  badHeight.pop();
  assert.throws(() => Engine.assertBoard(badHeight, RULES), /Altura inválida/);
});

test("evita solapamientos durante la fijación", () => {
  const board = empty();
  board[17][4] = 7;
  const piece = { id: 4, x: 4, y: 17, matrix: [[1]] };
  assert.throws(() => Engine.beginLockTransaction(board, piece, RULES), /celda ocupada/);
  assert.equal(board[17][4], 7);
});
