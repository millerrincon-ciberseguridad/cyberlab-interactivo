import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
globalThis.window = globalThis;
await import(pathToFileURL(path.join(root, "game-config.js")).href);

const { levels, threats } = globalThis.CiberEscuadronConfig;
const expectedTargets = [20, 40, 60, 80, 100, 120, 140, 160, 180, 200];
assert.equal(levels.length, 10, "Debe haber exactamente 10 niveles");
assert.deepEqual(levels.map(level => level.target), expectedTargets, "Las cantidades por nivel deben ser exactas");

for (let i = 1; i < levels.length; i += 1) {
  const previous = levels[i - 1];
  const current = levels[i];
  assert.ok(current.target > previous.target, `Nivel ${i + 1}: objetivo creciente`);
  assert.ok(current.speed > previous.speed, `Nivel ${i + 1}: velocidad creciente`);
  assert.ok(current.shoot > previous.shoot, `Nivel ${i + 1}: probabilidad/cadencia de ataque creciente`);
  assert.ok(current.bulletSpeed > previous.bulletSpeed, `Nivel ${i + 1}: proyectiles más rápidos`);
  assert.ok(current.spawn < previous.spawn, `Nivel ${i + 1}: apariciones más frecuentes`);
  assert.ok(current.maxConcurrent > previous.maxConcurrent, `Nivel ${i + 1}: más amenazas simultáneas`);
}
assert.equal(levels[0].heavyEvery, 0, "El primer nivel sirve de introducción");
assert.ok(levels.slice(1).every(level => level.heavyEvery > 0), "Los niveles avanzados incorporan aeronaves pesadas");
assert.ok(Object.values(threats).every(threat => threat.label.length >= 6), "Los avisos deben mostrar nombres legibles de malware");

const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const card = fs.readFileSync(path.join(root, "tarjeta-portada.html"), "utf8");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");

const requiredAppPatterns = [
  /state\.spawnedInLevel >= level\.target/,
  /state\.spawnedInLevel < level\.target/,
  /function recycleEnemy\(enemy/,
  /takeHit\("brecha enemiga"\);\s*recycleEnemy\(enemy\);/s,
  /fireEnemy\(enemy\)/,
  /function drawThreatTag\(enemy, info\)/,
  /info\.label/,
  /enemy\.heavy/,
  /const PROTOCOL = "ciberaula:score:v1"/,
  /addEventListener\("pointerdown"/,
  /addEventListener\("pointermove"/,
  /postMessage\(\{ type: PROTOCOL, payload \}/
];
requiredAppPatterns.forEach(pattern => assert.match(app, pattern));
assert.match(html, /<script src="game-config\.js"><\/script>\s*<script src="app\.js"><\/script>/);
assert.match(html, /anonymous-piloto-fondo\.jpg/);
assert.ok((html.match(/\.\.\/\.\.\/index\.html/g) || []).length >= 3, "Debe conservar Regresar a la portada");
assert.match(html, /1\/10/);
assert.match(html, /0\/20/);
assert.match(css, /touch-action:none/);
assert.match(card, /diez niveles progresivos/);
assert.match(readme, /20, 40, 60, 80, 100, 120, 140, 160, 180 y 200/);
assert.ok(fs.existsSync(path.join(root, "assets", "anonymous-piloto-fondo.jpg")), "Debe conservarse el fondo local");

console.log("OK: 10 niveles verificados con objetivos 20, 40, 60, 80, 100, 120, 140, 160, 180 y 200.");
console.log("OK: dificultad progresiva, retornos enemigos, disparos, aeronaves pesadas y avisos de malware verificados.");
console.log("OK: presentación, fondo, controles, score, tarjeta, README y rutas para GitHub Pages verificados.");
