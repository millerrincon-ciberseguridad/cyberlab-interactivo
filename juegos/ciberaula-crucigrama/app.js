(() => {
  "use strict";

  const GAME_ID = "cibercrucigrama";
  const PROTOCOL = "ciberaula:score:v1";
  const STORAGE_KEY = `${PROTOCOL}:${GAME_ID}`;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const keyOf = (r, c) => `${r},${c}`;
  const cleanLetter = value => (value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-ZÑ]/g, "").slice(-1);
  const escapeText = value => String(value ?? "").replace(/[<>]/g, "");

  const els = {
    board: $("#tablero"), boardScroller: $("#boardScroller"), clueList: $("#clueList"),
    playerLabel: $("#playerLabel"), levelLabel: $("#levelLabel"), timerLabel: $("#timerLabel"), scoreLabel: $("#scoreLabel"),
    progressText: $("#progressText"), progressBar: $("#progressBar"), progressTrack: $(".progress-track"),
    setup: $("#setupDialog"), setupForm: $("#setupForm"), playerInput: $("#playerInput"), timerToggle: $("#timerToggle"), cancelSetup: $("#cancelSetup"),
    victory: $("#victoryDialog"), victoryMessage: $("#victoryMessage"), victoryScore: $("#victoryScore"),
    gamesStat: $("#gamesStat"), winsStat: $("#winsStat"), totalScoreStat: $("#totalScoreStat"),
    hintButton: $("#hintButton"), menuButton: $("#menuButton"), closeVictory: $("#closeVictory"), playAgain: $("#playAgain"), toast: $("#toast")
  };

  let state = {
    player: "", level: 10, timerEnabled: true, startedAt: 0, elapsed: 0, timerId: null,
    sessionId: "", score: 0, hints: 0, words: [], placements: [], cells: new Map(),
    selectedWord: null, completed: false, stats: null
  };

  function mulberry32(seed) {
    return () => { let t = seed += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }

  function canPlace(word, row, col, dir, grid, size, relaxed = false) {
    const dr = dir === "V" ? 1 : 0, dc = dir === "H" ? 1 : 0;
    const before = keyOf(row - dr, col - dc), after = keyOf(row + dr * word.length, col + dc * word.length);
    if (row < 1 || col < 1 || row + dr * (word.length - 1) >= size - 1 || col + dc * (word.length - 1) >= size - 1) return null;
    if (grid.has(before) || grid.has(after)) return null;
    let crossings = 0, newCells = 0;
    for (let i = 0; i < word.length; i++) {
      const r = row + dr * i, c = col + dc * i, existing = grid.get(keyOf(r, c));
      if (existing && existing.char !== word[i]) return null;
      if (existing) crossings++;
      else {
        newCells++;
        if (!relaxed) {
          const neighbors = dir === "H" ? [keyOf(r - 1, c), keyOf(r + 1, c)] : [keyOf(r, c - 1), keyOf(r, c + 1)];
          if (neighbors.some(k => grid.has(k))) return null;
        }
      }
    }
    return crossings > 0 ? { crossings, newCells } : null;
  }

  function candidatesFor(item, grid, size, relaxed = false, random = Math.random) {
    const found = [];
    for (const [cellKey, cell] of grid) {
      const [r, c] = cellKey.split(",").map(Number);
      for (let i = 0; i < item.answer.length; i++) {
        if (item.answer[i] !== cell.char) continue;
        for (const dir of ["H", "V"]) {
          const row = r - (dir === "V" ? i : 0), col = c - (dir === "H" ? i : 0);
          const valid = canPlace(item.answer, row, col, dir, grid, size, relaxed);
          if (!valid) continue;
          const center = Math.abs(row + (dir === "V" ? item.answer.length / 2 : 0) - size / 2) + Math.abs(col + (dir === "H" ? item.answer.length / 2 : 0) - size / 2);
          found.push({ row, col, dir, score: valid.crossings * 120 - valid.newCells * .3 - center + random() * 3 });
        }
      }
    }
    return found.sort((a, b) => b.score - a.score);
  }

  function addPlacement(item, placement, grid, placed) {
    const dr = placement.dir === "V" ? 1 : 0, dc = placement.dir === "H" ? 1 : 0;
    const record = { ...item, ...placement, solved: false, cells: [] };
    for (let i = 0; i < item.answer.length; i++) {
      const r = placement.row + dr * i, c = placement.col + dc * i, k = keyOf(r, c);
      const cell = grid.get(k) || { char: item.answer[i], words: [] };
      cell.words.push(item.index); grid.set(k, cell); record.cells.push(k);
    }
    placed.push(record);
  }

  function generateCrossword(items) {
    const totalLetters = items.reduce((sum, w) => sum + w.answer.length, 0);
    const size = Math.max(29, Math.ceil(Math.sqrt(totalLetters) * 3.15) + 8);
    let best = null;

    for (let attempt = 0; attempt < 22; attempt++) {
      const random = mulberry32(137 + items.length * 97 + attempt * 811);
      const grid = new Map(), placed = [];
      const remaining = items.map((w, index) => ({ ...w, index })).sort((a, b) => b.answer.length - a.answer.length || random() - .5);
      const first = remaining.shift();
      const firstDir = attempt % 2 ? "V" : "H";
      addPlacement(first, { row: firstDir === "V" ? Math.floor((size - first.answer.length) / 2) : Math.floor(size / 2), col: firstDir === "H" ? Math.floor((size - first.answer.length) / 2) : Math.floor(size / 2), dir: firstDir, score: 0 }, grid, placed);

      while (remaining.length) {
        let chosenIndex = -1, chosenCandidate = null;
        for (let i = 0; i < remaining.length; i++) {
          const candidate = candidatesFor(remaining[i], grid, size, false, random)[0];
          if (candidate && (!chosenCandidate || candidate.score > chosenCandidate.score)) {
            chosenIndex = i; chosenCandidate = candidate;
          }
        }
        if (chosenIndex < 0) break;
        addPlacement(remaining.splice(chosenIndex, 1)[0], chosenCandidate, grid, placed);
      }
      if (!best || placed.length > best.placed.length) best = { grid, placed, remaining, size, random };
      if (!remaining.length) break;
    }

    // Segunda pasada menos restrictiva: conserva los cruces y garantiza mejor densidad.
    let stalled = 0;
    while (best.remaining.length && stalled < best.remaining.length * 2) {
      const item = best.remaining.shift();
      const candidate = candidatesFor(item, best.grid, best.size, true, best.random)[0];
      if (candidate) { addPlacement(item, candidate, best.grid, best.placed); stalled = 0; }
      else { best.remaining.push(item); stalled++; }
    }

    // Garantía final: si un término no comparte un cruce viable, se agrega al mismo tablero en una banda separada.
    let maxRow = Math.max(...[...best.grid.keys()].map(k => Number(k.split(",")[0])));
    for (const item of best.remaining) {
      maxRow += 2;
      addPlacement(item, { row: maxRow, col: 2, dir: "H", score: -999 }, best.grid, best.placed);
    }

    best.placed.sort((a, b) => a.row - b.row || a.col - b.col || a.dir.localeCompare(b.dir));
    let number = 0, lastStart = "";
    for (const word of best.placed) {
      const start = keyOf(word.row, word.col);
      if (start !== lastStart) { number++; lastStart = start; }
      word.number = number;
    }
    return { grid: best.grid, placements: best.placed };
  }

  function loadDatabase() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { players: {} }; }
    catch { return { players: {} }; }
  }

  function playerStats(name) {
    const db = loadDatabase();
    const id = name.trim().toLocaleLowerCase("es");
    return db.players[id] || { name: name.trim(), games: 0, wins: 0, score: 0, bestScore: 0, lastPlayedAt: null };
  }

  function saveStats() {
    const db = loadDatabase();
    db.players[state.player.trim().toLocaleLowerCase("es")] = state.stats;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    renderStats();
  }

  function protocolPayload(eventName) {
    return {
      protocol: PROTOCOL,
      version: 1,
      gameId: GAME_ID,
      gameName: "CiberCrucigrama",
      event: eventName,
      timestamp: new Date().toISOString(),
      player: { name: state.player },
      session: {
        id: state.sessionId, level: state.level, timerEnabled: state.timerEnabled,
        elapsedSeconds: state.elapsed, wordsTotal: state.words.length,
        wordsSolved: state.placements.filter(w => w.solved).length, hintsUsed: state.hints
      },
      result: { completed: state.completed, score: state.score },
      stats: { games: state.stats?.games || 0, wins: state.stats?.wins || 0, score: state.stats?.score || 0, bestScore: state.stats?.bestScore || 0 }
    };
  }

  function emitScore(eventName) {
    const payload = protocolPayload(eventName);
    window.dispatchEvent(new CustomEvent(PROTOCOL, { detail: payload }));
    if (window.parent !== window) window.parent.postMessage({ type: PROTOCOL, payload }, "*");
  }

  function renderStats() {
    const stats = state.stats || { games: 0, wins: 0, score: 0 };
    els.gamesStat.textContent = stats.games;
    els.winsStat.textContent = stats.wins;
    els.totalScoreStat.textContent = stats.score.toLocaleString("es-CO");
  }

  function startGame(player, level, timerEnabled) {
    clearInterval(state.timerId);
    const stats = playerStats(player);
    stats.name = player.trim(); stats.games += 1; stats.lastPlayedAt = new Date().toISOString();
    state = {
      ...state, player: player.trim(), level, timerEnabled, stats,
      startedAt: Date.now(), elapsed: 0, sessionId: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      score: 0, hints: 0, words: window.CYBER_WORDS.slice(0, level), placements: [], cells: new Map(), selectedWord: null, completed: false, timerId: null
    };
    saveStats();
    const generated = generateCrossword(state.words);
    state.placements = generated.placements;
    state.cells = generated.grid;
    renderGame();
    if (state.timerEnabled) state.timerId = setInterval(tick, 1000);
    else els.timerLabel.textContent = "Sin límite";
    emitScore("game_start");
  }

  function renderGame() {
    els.playerLabel.textContent = state.player;
    els.levelLabel.textContent = state.level;
    els.scoreLabel.textContent = "0";
    renderStats();
    const coords = [...state.cells.keys()].map(k => k.split(",").map(Number));
    const minR = Math.min(...coords.map(x => x[0])), maxR = Math.max(...coords.map(x => x[0]));
    const minC = Math.min(...coords.map(x => x[1])), maxC = Math.max(...coords.map(x => x[1]));
    const starts = new Map(state.placements.map(w => [keyOf(w.row, w.col), w.number]));
    els.board.innerHTML = "";
    els.board.style.gridTemplateColumns = `repeat(${maxC - minC + 1}, var(--cell))`;
    els.board.style.gridTemplateRows = `repeat(${maxR - minR + 1}, var(--cell))`;

    for (const [k, data] of state.cells) {
      const [r, c] = k.split(",").map(Number);
      const wrapper = document.createElement("label");
      wrapper.className = "cell"; wrapper.style.gridRow = r - minR + 1; wrapper.style.gridColumn = c - minC + 1; wrapper.dataset.key = k;
      if (starts.has(k)) { const n = document.createElement("span"); n.className = "cell-number"; n.textContent = starts.get(k); wrapper.append(n); }
      const input = document.createElement("input");
      input.maxLength = 1; input.autocomplete = "off"; input.autocapitalize = "characters"; input.spellcheck = false; input.inputMode = "text";
      input.setAttribute("aria-label", `Casilla fila ${r - minR + 1}, columna ${c - minC + 1}`);
      input.dataset.key = k; data.element = wrapper; data.input = input; wrapper.append(input); els.board.append(wrapper);
    }

    els.clueList.innerHTML = "";
    for (const word of [...state.placements].sort((a, b) => a.number - b.number || a.dir.localeCompare(b.dir))) {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button"; button.className = "clue"; button.dataset.word = word.index; button.dataset.dir = word.dir;
      button.innerHTML = `<span class="clue-num">${word.number}</span><span class="clue-text">${escapeText(word.clue)}</span><span class="clue-dir">${word.dir}</span>`;
      button.addEventListener("click", () => selectWord(word.index, true)); li.append(button); els.clueList.append(li); word.clueElement = button;
    }
    bindBoardEvents();
    updateProgress();
    selectWord(state.placements[0].index, false);
    requestAnimationFrame(() => { els.boardScroller.scrollLeft = Math.max(0, (els.board.scrollWidth - els.boardScroller.clientWidth) / 2); els.boardScroller.scrollTop = Math.max(0, (els.board.scrollHeight - els.boardScroller.clientHeight) / 2); });
  }

  function bindBoardEvents() {
    if (els.board.dataset.bound === "true") return;
    els.board.dataset.bound = "true";
    els.board.addEventListener("focusin", event => {
      const input = event.target.closest("input"); if (!input) return;
      const words = state.cells.get(input.dataset.key).words;
      const next = words.includes(state.selectedWord) ? state.selectedWord : words[0]; selectWord(next, false);
    });
    els.board.addEventListener("input", event => {
      const input = event.target.closest("input"); if (!input) return;
      input.value = cleanLetter(input.value);
      checkCompletedWords();
      if (input.value) moveAlongWord(input.dataset.key, 1, true);
    });
    els.board.addEventListener("keydown", event => {
      const input = event.target.closest("input"); if (!input) return;
      if (event.key === "Backspace" && !input.value) { event.preventDefault(); moveAlongWord(input.dataset.key, -1, false); }
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) { event.preventDefault(); moveSpatial(input.dataset.key, event.key); }
    });
    els.board.addEventListener("click", event => {
      const cell = event.target.closest(".cell"); if (!cell) return;
      const words = state.cells.get(cell.dataset.key).words;
      if (words.length > 1 && words.includes(state.selectedWord)) selectWord(words[(words.indexOf(state.selectedWord) + 1) % words.length], false);
    });
  }

  function selectWord(index, focus) {
    state.selectedWord = Number(index);
    $$(".cell", els.board).forEach(el => el.classList.remove("related", "active"));
    $$(".clue", els.clueList).forEach(el => el.classList.remove("selected"));
    const word = state.placements.find(w => w.index === state.selectedWord); if (!word) return;
    word.cells.forEach(k => state.cells.get(k).element.classList.add("related"));
    word.clueElement?.classList.add("selected");
    if (focus) {
      const first = word.cells.find(k => !state.cells.get(k).input.value) || word.cells[0];
      state.cells.get(first).input.focus({ preventScroll: true });
      state.cells.get(first).element.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }

  function moveAlongWord(cellKey, delta, skipFilled) {
    const word = state.placements.find(w => w.index === state.selectedWord); if (!word) return;
    let pos = word.cells.indexOf(cellKey);
    for (let i = 0; i < word.cells.length; i++) {
      pos += delta; if (pos < 0 || pos >= word.cells.length) return;
      const cell = state.cells.get(word.cells[pos]);
      if (!skipFilled || !cell.input.value) { cell.input.focus(); return; }
    }
  }

  function moveSpatial(cellKey, arrow) {
    const [r, c] = cellKey.split(",").map(Number);
    const delta = { ArrowLeft: [0,-1], ArrowRight: [0,1], ArrowUp: [-1,0], ArrowDown: [1,0] }[arrow];
    let nr = r, nc = c;
    for (let i = 0; i < 30; i++) { nr += delta[0]; nc += delta[1]; const cell = state.cells.get(keyOf(nr,nc)); if (cell) { cell.input.focus(); return; } }
  }

  function checkCompletedWords() {
    let newlySolved = 0;
    for (const word of state.placements) {
      const correct = word.cells.every((k, i) => state.cells.get(k).input.value === word.answer[i]);
      if (correct && !word.solved) {
        word.solved = true; newlySolved++;
        word.clueElement.classList.add("solved");
        word.cells.forEach(k => state.cells.get(k).element.classList.add("solved"));
        state.score += 100 + state.level;
      }
    }
    if (newlySolved) {
      els.scoreLabel.textContent = state.score.toLocaleString("es-CO");
      showToast(newlySolved > 1 ? `¡${newlySolved} palabras descubiertas!` : "¡Palabra descubierta!");
      updateProgress(); emitScore("score_update");
    }
    if (!state.completed && state.placements.every(w => w.solved)) finishGame();
  }

  function updateProgress() {
    const solved = state.placements.filter(w => w.solved).length, total = state.placements.length;
    els.progressText.textContent = `${solved} / ${total} palabras`;
    els.progressBar.style.width = `${total ? solved / total * 100 : 0}%`;
    els.progressTrack.setAttribute("aria-valuemax", total); els.progressTrack.setAttribute("aria-valuenow", solved);
  }

  function revealHint() {
    if (state.completed) return;
    let word = state.placements.find(w => w.index === state.selectedWord && !w.solved) || state.placements.find(w => !w.solved);
    if (!word) return;
    const available = word.cells.map((k, i) => ({ k, i })).filter(({ k, i }) => state.cells.get(k).input.value !== word.answer[i]);
    if (!available.length) return;
    const pick = available[Math.floor(Math.random() * available.length)], cell = state.cells.get(pick.k);
    cell.input.value = word.answer[pick.i]; cell.element.classList.add("hinted");
    state.hints++; state.score = Math.max(0, state.score - 25); els.scoreLabel.textContent = state.score.toLocaleString("es-CO");
    showToast("Letra revelada · −25 puntos"); checkCompletedWords(); emitScore("hint_used");
  }

  function tick() {
    state.elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
    els.timerLabel.textContent = formatTime(state.elapsed);
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0"), s = (seconds % 60).toString().padStart(2, "0"); return `${m}:${s}`;
  }

  function finishGame() {
    state.completed = true; clearInterval(state.timerId); tick();
    const timeBonus = state.timerEnabled ? Math.max(0, 600 - state.elapsed) : 0;
    const levelBonus = state.level * 10;
    state.score += timeBonus + levelBonus;
    state.stats.wins += 1; state.stats.score += state.score; state.stats.bestScore = Math.max(state.stats.bestScore || 0, state.score); state.stats.lastPlayedAt = new Date().toISOString();
    saveStats(); els.scoreLabel.textContent = state.score.toLocaleString("es-CO");
    els.victoryScore.textContent = state.score.toLocaleString("es-CO");
    els.victoryMessage.textContent = `${state.player}, completaste ${state.level} palabras${state.timerEnabled ? ` en ${formatTime(state.elapsed)}` : " sin límite de tiempo"}.`;
    emitScore("game_complete");
    setTimeout(() => els.victory.showModal(), 450);
  }

  function showToast(message) {
    els.toast.textContent = message; els.toast.classList.add("show");
    clearTimeout(showToast.timer); showToast.timer = setTimeout(() => els.toast.classList.remove("show"), 2200);
  }

  function openSetup() {
    els.playerInput.value = state.player || localStorage.getItem(`${STORAGE_KEY}:lastPlayer`) || "";
    const levelInput = $(`input[name="level"][value="${state.level}"]`); if (levelInput) levelInput.checked = true;
    els.timerToggle.checked = state.timerEnabled;
    els.cancelSetup.hidden = !state.player;
    els.setup.showModal(); setTimeout(() => els.playerInput.focus(), 60);
  }

  els.setupForm.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(els.setupForm), player = String(data.get("player") || "").trim(), level = Number(data.get("level"));
    if (!player) { els.playerInput.focus(); return; }
    localStorage.setItem(`${STORAGE_KEY}:lastPlayer`, player);
    els.setup.close(); startGame(player, level, els.timerToggle.checked);
  });
  els.cancelSetup.addEventListener("click", () => els.setup.close());
  els.menuButton.addEventListener("click", openSetup);
  els.hintButton.addEventListener("click", revealHint);
  els.closeVictory.addEventListener("click", () => els.victory.close());
  els.playAgain.addEventListener("click", () => { els.victory.close(); openSetup(); });
  $$(".tab").forEach(tab => tab.addEventListener("click", () => {
    $$(".tab").forEach(t => { t.classList.toggle("active", t === tab); t.setAttribute("aria-selected", t === tab ? "true" : "false"); });
    $$(".clue", els.clueList).forEach(clue => clue.closest("li").hidden = tab.dataset.filter !== "all" && clue.dataset.dir !== tab.dataset.filter);
  }));

  window.addEventListener("message", event => {
    const message = event.data;
    if (message?.type === PROTOCOL && message.action === "request_state" && event.source) {
      event.source.postMessage({ type: PROTOCOL, payload: protocolPayload("state_snapshot") }, "*");
    }
  });

  window.CiberaulaScoreV1 = { getState: () => protocolPayload("state_snapshot"), storageKey: STORAGE_KEY };
  renderStats(); openSetup();
})();
