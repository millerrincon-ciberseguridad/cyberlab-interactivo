#!/usr/bin/env node
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const Core = require("../core.js");
let passed=0;
function test(name,fn){try{fn();passed+=1;console.log(`✓ ${name}`);}catch(error){console.error(`✗ ${name}\n  ${error.stack}`);process.exitCode=1;}}
function rng(seed=123456){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
const levels={easy:[9,9,10],medium:[16,16,40],hard:[16,30,99]};
for(const [name,[rows,cols,mines]] of Object.entries(levels)){
  test(`${name}: dimensiones y amenazas exactas`,()=>{const b=Core.createBoard(rows,cols);Core.placeThreats(b,mines,Math.floor(rows/2),Math.floor(cols/2),rng());assert.equal(b.cells.flat().filter(c=>c.threat).length,mines);assert.equal(b.rows,rows);assert.equal(b.cols,cols);});
  test(`${name}: primer toque y zona 3×3 seguros`,()=>{const r=Math.floor(rows/2),c=Math.floor(cols/2),b=Core.createBoard(rows,cols);Core.placeThreats(b,mines,r,c,rng(8));assert(Core.firstZoneIsSafe(b,r,c,1));assert.equal(b.cells[r][c].adjacent,0);const opened=Core.reveal(b,r,c);assert(opened.length>=4);});
}
test("300 distribuciones conservan cantidades y zona inicial segura",()=>{for(const [rows,cols,mines] of Object.values(levels))for(let seed=1;seed<=100;seed+=1){const r=seed%rows,c=(seed*7)%cols,b=Core.createBoard(rows,cols);Core.placeThreats(b,mines,r,c,rng(seed));assert.equal(b.cells.flat().filter(x=>x.threat).length,mines);assert(Core.firstZoneIsSafe(b,r,c,1));}});
test("la revelación expansiva nunca abre amenazas",()=>{const b=Core.createBoard(9,9);Core.placeThreats(b,10,4,4,rng(7));Core.reveal(b,4,4);assert(!b.cells.flat().some(c=>c.revealed&&c.threat));});
test("bandera bloquea revelación y respeta el límite",()=>{const b=Core.createBoard(9,9);Core.toggleFlag(b,0,0,1);Core.toggleFlag(b,0,1,1);assert.equal(Core.countFlags(b),1);assert.deepEqual(Core.reveal(b,0,0),[]);});
test("condición de victoria requiere todas las casillas seguras",()=>{const b=Core.createBoard(4,4);Core.placeThreats(b,1,0,0,rng(3));b.cells.flat().filter(c=>!c.threat).forEach(c=>{c.revealed=true;});assert(Core.hasWon(b));});
test("al perder se revelan todas las amenazas y ninguna casilla segura adicional",()=>{const b=Core.createBoard(9,9);Core.placeThreats(b,10,4,4,rng(12));const safeBefore=Core.countRevealedSafe(b);Core.revealThreats(b);assert.equal(b.cells.flat().filter(c=>c.threat&&c.revealed).length,10);assert.equal(Core.countRevealedSafe(b),safeBefore);});
test("core no depende del DOM y exporta API modular",()=>{["createBoard","placeThreats","reveal","toggleFlag","hasWon"].forEach(k=>assert.equal(typeof Core[k],"function"));});
test("paquete incluye controles, pausa, PDF, score y configuración",()=>{const root=path.join(__dirname,"..");const html=fs.readFileSync(path.join(root,"index.html"),"utf8");const app=fs.readFileSync(path.join(root,"app.js"),"utf8");const config=fs.readFileSync(path.join(root,"config.js"),"utf8");assert(html.includes("Modo bandera")&&html.includes("Pausa")&&html.includes("Imprimir / Guardar PDF"));assert(app.includes("ciberaula:score:v1")&&app.includes("pointerdown")&&app.includes("contextmenu"));assert(config.includes("ZONA EDITABLE")&&config.includes("rows: 16, cols: 30, threats: 99"));});
test("ZIP publicable no necesita llamadas de red",()=>{const root=path.join(__dirname,"..");for(const f of ["index.html","app.js","core.js","config.js","styles.css"]){const text=fs.readFileSync(path.join(root,f),"utf8");assert(!/https?:\/\//.test(text),`${f} contiene URL externa`);}});
test("la derrota conserva el tablero, revela amenazas y muestra opciones superiores",()=>{const root=path.join(__dirname,"..");const html=fs.readFileSync(path.join(root,"index.html"),"utf8");const app=fs.readFileSync(path.join(root,"app.js"),"utf8");const css=fs.readFileSync(path.join(root,"styles.css"),"utf8");assert(html.includes('id="postGameActions"')&&html.includes('id="inlineResult"')&&html.includes('id="retryButton"')&&html.includes('id="changeLevelButton"'));assert(app.includes("Core.revealThreats(state.board)")&&app.includes("showLossReview(triggerCell)")&&app.includes('else showLossReview(triggerCell)'));assert(css.includes(".cell.threat.hidden-threat")&&css.includes(".cell.threat.exploded"));});
if(!process.exitCode)console.log(`\n${passed}/${passed} pruebas superadas.`);
