(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const STORAGE_KEY = 'ciberaula:score:v1';
  const LAST_PLAYER_KEY = 'ciberaula:last-player';
  const WIN_PERCENT = 75;

  const els = {
    intro: $('#intro'), game: $('#game'), results: $('#results'), start: $('#startBtn'), restart: $('#restartBtn'), print: $('#printBtn'),
    playerName: $('#playerName'), roundSize: $('#roundSize'), nameError: $('#nameError'), snapshot: $('#playerSnapshot'),
    snapshotLabel: $('#snapshotLabel'), snapshotBar: $('#snapshotBar'), snapshotMeta: $('#snapshotMeta'), hudPlayer: $('#hudPlayer'),
    progressText: $('#progressText'), scoreText: $('#scoreText'), streakText: $('#streakText'), progressBar: $('#progressBar'),
    quit: $('#quitBtn'), mix: $('#mixBtn'), check: $('#checkBtn'), stepList: $('#stepList'), caseId: $('#caseId'),
    caseCounter: $('#caseCounter'), caseIcon: $('#caseIcon'), caseCategory: $('#caseCategory'), caseTitle: $('#caseTitle'),
    caseText: $('#caseText'), feedback: $('#feedback'), feedbackMark: $('#feedbackMark'), feedbackLabel: $('#feedbackLabel'),
    feedbackTitle: $('#feedbackTitle'), feedbackText: $('#feedbackText'), actionText: $('#actionText'), correctSequence: $('#correctSequence'),
    continueBtn: $('#continueBtn'), resultPlayer: $('#resultPlayer'), resultRing: $('#resultRing'), percentText: $('#percentText'),
    resultTitle: $('#resultTitle'), resultMessage: $('#resultMessage'), victoryNotice: $('#victoryNotice'), correctText: $('#correctText'),
    wrongText: $('#wrongText'), finalScoreText: $('#finalScoreText'), review: $('#review'), scoreBtn: $('#scoreBtn'),
    resultScoreBtn: $('#resultScoreBtn'), scorePanel: $('#scorePanel'), closeScore: $('#closeScoreBtn'), scoreList: $('#scoreList'),
    emptyScore: $('#emptyScore'), scaleLegend: $('#scoreScaleLegend'), full: $('#fullBtn')
  };

  let state = { tests: [], player: '', index: 0, order: [], answers: [], score: 0, streak: 0, correct: 0, answered: false };
  let draggedStep = null;
  let lastFocus = null;

  const safeText = (element, value) => { if (element) element.textContent = String(value ?? ''); };
  const normalizeName = (name) => name.trim().replace(/\s+/g, ' ').slice(0, 40);
  const playerKey = (name) => normalizeName(name).toLocaleLowerCase('es');
  const shuffle = (items) => {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const random = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[random]] = [copy[random], copy[index]];
    }
    return copy;
  };
  const shuffledSteps = (steps) => {
    let mixed = shuffle(steps.map((text, correctIndex) => ({ id: `paso-${correctIndex}`, correctIndex, text })));
    if (mixed.every((step, index) => step.correctIndex === index) && mixed.length > 1) {
      [mixed[0], mixed[1]] = [mixed[1], mixed[0]];
    }
    return mixed;
  };
  const validTest = (test) => test && test.id && test.icono && test.categoria && test.titulo && test.escenario &&
    Array.isArray(test.pasos) && test.pasos.length >= 4 && test.pasos.length <= 7 && test.pasos.every((step) => typeof step === 'string' && step.trim()) &&
    test.explicacion && test.accion;

  const loadScore = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (_) { return {}; }
  };
  const saveScore = (score) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(score)); return true; }
    catch (_) { return false; }
  };
  const getPlayerRecord = (name) => loadScore()[playerKey(name)] || {
    name: normalizeName(name), games: 0, wins: 0, totalPoints: 0, bestPercent: 0
  };
  const registerResult = (name, percent, points) => {
    const all = loadScore();
    const key = playerKey(name);
    const previous = all[key] || { name, games: 0, wins: 0, totalPoints: 0, bestPercent: 0 };
    const won = percent >= WIN_PERCENT;
    all[key] = {
      name: normalizeName(name),
      games: Number(previous.games || 0) + 1,
      wins: Number(previous.wins || 0) + (won ? 1 : 0),
      totalPoints: Number(previous.totalPoints || 0) + points,
      bestPercent: Math.max(Number(previous.bestPercent || 0), percent),
      lastPlayed: new Date().toISOString()
    };
    saveScore(all);
    return { record: all[key], won };
  };
  const milestoneFor = (wins) => Math.max(5, Math.ceil(Math.max(1, wins) / 5) * 5);

  const showScreen = (name) => {
    [els.intro, els.game, els.results].forEach((screen) => screen.classList.remove('active'));
    els[name].classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateSnapshot = () => {
    const name = normalizeName(els.playerName.value);
    els.nameError.hidden = true;
    if (!name) { els.snapshot.hidden = true; return; }
    const record = getPlayerRecord(name);
    const milestone = milestoneFor(record.wins);
    els.snapshot.hidden = false;
    safeText(els.snapshotLabel, `${record.wins} / ${milestone} victorias`);
    els.snapshotBar.style.width = `${Math.min(100, (Number(record.wins || 0) / milestone) * 100)}%`;
    safeText(els.snapshotMeta, `${record.games || 0} partidas · ${record.totalPoints || 0} puntos acumulados · mejor resultado ${record.bestPercent || 0}%`);
  };

  const updateHud = () => {
    const answered = state.answers.length;
    const total = state.tests.length;
    safeText(els.progressText, `${answered} / ${total}`);
    safeText(els.scoreText, state.score);
    safeText(els.streakText, `${state.streak} 🔥`);
    els.progressBar.style.width = `${total ? (answered / total) * 100 : 0}%`;
  };

  const announceOrder = () => {
    els.stepList.setAttribute('aria-label', `Orden actual con ${state.order.length} pasos`);
  };

  const moveStep = (from, to, focusAfter = true) => {
    if (state.answered || from === to || from < 0 || to < 0 || from >= state.order.length || to >= state.order.length) return;
    const [moved] = state.order.splice(from, 1);
    state.order.splice(to, 0, moved);
    renderSteps();
    if (focusAfter) {
      const row = els.stepList.querySelector(`[data-step-id="${moved.id}"]`);
      row?.focus({ preventScroll: true });
    }
  };

  const makeMoveButton = (label, symbol, direction, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `move-step ${direction < 0 ? 'move-up' : 'move-down'}`;
    button.textContent = symbol;
    button.setAttribute('aria-label', label);
    button.disabled = state.answered || (direction < 0 ? index === 0 : index === state.order.length - 1);
    button.addEventListener('click', () => moveStep(index, index + direction));
    return button;
  };

  const renderSteps = () => {
    els.stepList.replaceChildren();
    state.order.forEach((step, index) => {
      const item = document.createElement('li');
      item.className = 'step-item';
      item.draggable = !state.answered;
      item.tabIndex = 0;
      item.dataset.stepId = step.id;
      item.setAttribute('aria-label', `Paso propuesto ${index + 1}: ${step.text}`);

      const number = document.createElement('span');
      number.className = 'step-position';
      number.textContent = String(index + 1).padStart(2, '0');

      const handle = document.createElement('span');
      handle.className = 'drag-handle';
      handle.textContent = '⋮⋮';
      handle.setAttribute('aria-hidden', 'true');

      const text = document.createElement('span');
      text.className = 'step-text';
      text.textContent = step.text;

      const controls = document.createElement('span');
      controls.className = 'step-controls';
      controls.append(
        makeMoveButton(`Subir el paso ${index + 1}`, '↑', -1, index),
        makeMoveButton(`Bajar el paso ${index + 1}`, '↓', 1, index)
      );

      item.append(number, handle, text, controls);
      item.addEventListener('keydown', (event) => {
        if (state.answered || event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'ArrowUp') { event.preventDefault(); moveStep(index, index - 1); }
        if (event.key === 'ArrowDown') { event.preventDefault(); moveStep(index, index + 1); }
      });
      els.stepList.append(item);
    });
    announceOrder();
  };

  const renderCase = () => {
    const test = state.tests[state.index];
    state.answered = false;
    state.order = shuffledSteps(test.pasos);
    els.feedback.hidden = true;
    els.feedback.classList.remove('is-wrong');
    els.check.disabled = false;
    els.mix.disabled = false;
    safeText(els.caseId, test.id);
    safeText(els.caseCounter, `${state.index + 1} / ${state.tests.length}`);
    safeText(els.caseIcon, test.icono);
    safeText(els.caseCategory, test.categoria.toLocaleUpperCase('es'));
    safeText(els.caseTitle, test.titulo);
    safeText(els.caseText, test.escenario);
    renderSteps();
    window.setTimeout(() => els.stepList.querySelector('.step-item')?.focus({ preventScroll: true }), 50);
  };

  const start = () => {
    const name = normalizeName(els.playerName.value);
    if (!name) {
      els.nameError.hidden = false;
      els.playerName.setAttribute('aria-invalid', 'true');
      els.playerName.focus();
      return;
    }
    const bank = (window.PRUEBAS_RESPUESTA_INCIDENTE || []).filter(validTest);
    if (bank.length < 20) {
      window.alert('El juego necesita al menos 20 pruebas válidas en pruebas.js.');
      return;
    }
    const count = els.roundSize.value === 'all' ? bank.length : Math.min(Number(els.roundSize.value), bank.length);
    state = { tests: shuffle(bank).slice(0, count), player: name, index: 0, order: [], answers: [], score: 0, streak: 0, correct: 0, answered: false };
    try { localStorage.setItem(LAST_PLAYER_KEY, name); } catch (_) { /* almacenamiento opcional */ }
    els.playerName.removeAttribute('aria-invalid');
    els.nameError.hidden = true;
    safeText(els.hudPlayer, name);
    updateHud();
    showScreen('game');
    renderCase();
  };

  const showCorrectSequence = (test) => {
    els.correctSequence.replaceChildren();
    const heading = document.createElement('b');
    heading.textContent = 'Secuencia recomendada';
    const list = document.createElement('ol');
    test.pasos.forEach((step) => {
      const item = document.createElement('li');
      item.textContent = step;
      list.append(item);
    });
    els.correctSequence.append(heading, list);
  };

  const checkSequence = () => {
    if (state.answered) return;
    const test = state.tests[state.index];
    const correctPositions = state.order.filter((step, index) => step.correctIndex === index).length;
    const ok = correctPositions === state.order.length;
    state.answered = true;
    if (ok) {
      state.correct += 1;
      state.streak += 1;
      state.score += 100 + Math.min((state.streak - 1) * 20, 100);
    } else {
      state.streak = 0;
      state.score += correctPositions * 5;
    }
    state.answers.push({ id: test.id, ok, correctPositions, totalSteps: state.order.length });
    els.check.disabled = true;
    els.mix.disabled = true;
    renderSteps();
    els.stepList.querySelectorAll('.step-item').forEach((item, index) => {
      item.classList.add(state.order[index].correctIndex === index ? 'position-correct' : 'position-wrong');
    });
    els.feedback.hidden = false;
    els.feedback.classList.toggle('is-wrong', !ok);
    safeText(els.feedbackMark, ok ? '✓' : '!');
    safeText(els.feedbackLabel, ok ? 'SECUENCIA CORRECTA' : 'SECUENCIA POR REFORZAR');
    safeText(els.feedbackTitle, ok ? 'Respuesta coordinada y segura' : `${correctPositions} de ${state.order.length} pasos estaban en su posición`);
    safeText(els.feedbackText, test.explicacion);
    safeText(els.actionText, test.accion);
    showCorrectSequence(test);
    safeText(els.continueBtn, state.answers.length === state.tests.length ? 'VER RESULTADO  →' : 'SIGUIENTE INCIDENTE  →');
    updateHud();
    els.feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    els.continueBtn.focus({ preventScroll: true });
  };

  const next = () => {
    if (!state.answered) return;
    if (state.index + 1 >= state.tests.length) finish();
    else {
      state.index += 1;
      renderCase();
      window.scrollTo({ top: Math.max(0, els.game.offsetTop - 12), behavior: 'smooth' });
    }
  };

  const finish = () => {
    const total = state.tests.length;
    const percent = Math.round((state.correct / total) * 100);
    safeText(els.resultPlayer, state.player);
    safeText(els.percentText, `${percent}%`);
    els.resultRing.style.setProperty('--p', percent);
    safeText(els.correctText, `${state.correct}/${total}`);
    safeText(els.wrongText, total - state.correct);
    safeText(els.finalScoreText, state.score);
    let title; let message;
    if (percent >= 90) { title = 'Coordinación experta'; message = 'Priorizas contención, evidencia, recuperación y aprendizaje con gran precisión.'; }
    else if (percent >= 75) { title = 'Protocolo bajo control'; message = 'Ordenas la respuesta con criterio y sabes qué acciones no deben adelantarse.'; }
    else if (percent >= 60) { title = 'Respuesta en consolidación'; message = 'Reconoces las acciones, pero algunas prioridades todavía pueden aumentar el impacto.'; }
    else { title = 'Secuencia crítica'; message = 'Repite la misión y aplica la regla: contener, reportar, preservar, erradicar y recuperar.'; }
    safeText(els.resultTitle, title);
    safeText(els.resultMessage, message);
    const saved = registerResult(state.player, percent, state.score);
    els.victoryNotice.className = `victory-notice ${saved.won ? 'won' : 'practice'}`;
    safeText(els.victoryNotice, saved.won ? `VICTORIA REGISTRADA · ${saved.record.wins} ganadas` : `PARTIDA REGISTRADA · alcanza ${WIN_PERCENT}% para sumar una victoria`);
    els.review.replaceChildren();
    const missed = state.tests.filter((test) => !state.answers.find((answer) => answer.id === test.id)?.ok);
    if (missed.length) {
      const heading = document.createElement('h3');
      heading.textContent = 'Incidentes para repasar';
      els.review.append(heading);
      missed.forEach((test) => {
        const answer = state.answers.find((item) => item.id === test.id);
        const article = document.createElement('article');
        const name = document.createElement('b');
        const text = document.createElement('p');
        name.textContent = `${test.id} · ${test.titulo} · ${answer?.correctPositions || 0}/${answer?.totalSteps || test.pasos.length} posiciones`;
        text.textContent = `${test.explicacion} ${test.accion}`;
        article.append(name, text);
        els.review.append(article);
      });
    }
    showScreen('results');
  };

  const renderScore = () => {
    const records = Object.values(loadScore()).filter((record) => record && record.name)
      .sort((a, b) => (Number(b.wins || 0) - Number(a.wins || 0)) || (Number(b.totalPoints || 0) - Number(a.totalPoints || 0)));
    els.scoreList.replaceChildren();
    els.emptyScore.hidden = records.length > 0;
    const maxWins = Math.max(0, ...records.map((record) => Number(record.wins || 0)));
    const milestone = milestoneFor(maxWins);
    els.scaleLegend.replaceChildren();
    for (let value = 0; value <= milestone; value += 1) {
      if (value === 0 || value === milestone || value % 5 === 0) {
        const tick = document.createElement('span');
        tick.textContent = String(value);
        tick.style.left = `${(value / milestone) * 100}%`;
        els.scaleLegend.append(tick);
      }
    }
    records.forEach((record, index) => {
      const row = document.createElement('article'); row.className = 'score-row';
      const rank = document.createElement('span'); rank.className = 'score-rank'; rank.textContent = String(index + 1).padStart(2, '0');
      const body = document.createElement('div'); body.className = 'score-body';
      const top = document.createElement('div'); top.className = 'score-row-top';
      const name = document.createElement('strong'); name.textContent = record.name;
      const wins = document.createElement('b'); wins.textContent = `${record.wins || 0} ${Number(record.wins) === 1 ? 'victoria' : 'victorias'}`;
      top.append(name, wins);
      const track = document.createElement('div'); track.className = 'victory-scale';
      track.setAttribute('aria-label', `${record.name}: ${record.wins || 0} de ${milestone} victorias en la escala`);
      const fill = document.createElement('i'); fill.style.width = `${Math.min(100, (Number(record.wins || 0) / milestone) * 100)}%`;
      track.append(fill);
      const meta = document.createElement('small'); meta.textContent = `${record.games || 0} partidas · ${record.totalPoints || 0} puntos · mejor ${record.bestPercent || 0}%`;
      body.append(top, track, meta); row.append(rank, body); els.scoreList.append(row);
    });
  };

  const openScore = () => {
    lastFocus = document.activeElement;
    renderScore();
    els.scorePanel.hidden = false;
    els.scorePanel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    els.closeScore.focus();
  };
  const closeScore = () => {
    els.scorePanel.hidden = true;
    els.scorePanel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    lastFocus?.focus();
  };

  els.stepList.addEventListener('dragstart', (event) => {
    const item = event.target.closest('.step-item');
    if (!item || state.answered) { event.preventDefault(); return; }
    draggedStep = item.dataset.stepId;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', draggedStep);
    item.classList.add('dragging');
  });
  els.stepList.addEventListener('dragover', (event) => {
    if (state.answered || !event.target.closest('.step-item')) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    event.target.closest('.step-item').classList.add('drag-over');
  });
  els.stepList.addEventListener('dragleave', (event) => {
    event.target.closest('.step-item')?.classList.remove('drag-over');
  });
  els.stepList.addEventListener('drop', (event) => {
    const target = event.target.closest('.step-item');
    if (!target || state.answered) return;
    event.preventDefault();
    const from = state.order.findIndex((step) => step.id === draggedStep);
    const to = state.order.findIndex((step) => step.id === target.dataset.stepId);
    target.classList.remove('drag-over');
    moveStep(from, to);
  });
  els.stepList.addEventListener('dragend', () => {
    els.stepList.querySelectorAll('.step-item').forEach((item) => item.classList.remove('dragging', 'drag-over'));
    draggedStep = null;
  });

  els.start.addEventListener('click', start);
  els.restart.addEventListener('click', () => { showScreen('intro'); updateSnapshot(); els.playerName.focus(); });
  els.playerName.addEventListener('input', updateSnapshot);
  els.playerName.addEventListener('keydown', (event) => { if (event.key === 'Enter') start(); });
  els.quit.addEventListener('click', () => { if (window.confirm('¿Salir de la misión actual? El intento no se registrará.')) showScreen('intro'); });
  els.mix.addEventListener('click', () => { if (!state.answered) { state.order = shuffledSteps(state.tests[state.index].pasos); renderSteps(); } });
  els.check.addEventListener('click', checkSequence);
  els.continueBtn.addEventListener('click', next);
  els.print.addEventListener('click', () => window.print());
  [els.scoreBtn, els.resultScoreBtn].forEach((button) => button.addEventListener('click', openScore));
  els.closeScore.addEventListener('click', closeScore);
  els.scorePanel.addEventListener('click', (event) => { if (event.target === els.scorePanel) closeScore(); });
  els.full.addEventListener('click', () => { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !els.scorePanel.hidden) closeScore(); });

  try { els.playerName.value = localStorage.getItem(LAST_PLAYER_KEY) || ''; } catch (_) { /* almacenamiento opcional */ }
  updateSnapshot();
})();
