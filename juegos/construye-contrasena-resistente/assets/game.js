(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const STORAGE_KEY = 'ciberaula:score:v1';
  const LAST_PLAYER_KEY = 'ciberaula:last-player';
  const WIN_PERCENT = 75;
  const CHALLENGE_PASS = 75;

  const els = {
    intro: $('#intro'), game: $('#game'), results: $('#results'), start: $('#startBtn'), restart: $('#restartBtn'), print: $('#printBtn'),
    playerName: $('#playerName'), roundSize: $('#roundSize'), nameError: $('#nameError'), snapshot: $('#playerSnapshot'),
    snapshotLabel: $('#snapshotLabel'), snapshotBar: $('#snapshotBar'), snapshotMeta: $('#snapshotMeta'), hudPlayer: $('#hudPlayer'),
    progressText: $('#progressText'), scoreText: $('#scoreText'), strongText: $('#strongText'), progressBar: $('#progressBar'),
    challengeId: $('#challengeId'), challengeType: $('#challengeType'), challengeTitle: $('#challengeTitle'), challengeContext: $('#challengeContext'),
    palette: $('#palette'), buildZone: $('#buildZone'), emptyBuild: $('#emptyBuild'), custom: $('#customFragment'), addCustom: $('#addCustomBtn'),
    undo: $('#undoBtn'), clear: $('#clearBtn'), visibility: $('#visibilityBtn'), passwordPreview: $('#passwordPreview'), lengthBadge: $('#lengthBadge'),
    uniqueCheck: $('#uniqueCheck'), mfaCheck: $('#mfaCheck'), evaluate: $('#evaluateBtn'), feedback: $('#feedback'),
    strengthText: $('#strengthText'), strengthBar: $('#strengthBar'), feedbackTitle: $('#feedbackTitle'), feedbackSummary: $('#feedbackSummary'),
    criteriaList: $('#criteriaList'), educationText: $('#educationText'), continueBtn: $('#continueBtn'), quit: $('#quitBtn'),
    resultPlayer: $('#resultPlayer'), resultRing: $('#resultRing'), percentText: $('#percentText'), resultTitle: $('#resultTitle'),
    resultMessage: $('#resultMessage'), victoryNotice: $('#victoryNotice'), correctText: $('#correctText'), wrongText: $('#wrongText'),
    finalScoreText: $('#finalScoreText'), review: $('#review'), scoreBtn: $('#scoreBtn'), resultScoreBtn: $('#resultScoreBtn'),
    scorePanel: $('#scorePanel'), closeScore: $('#closeScoreBtn'), scoreList: $('#scoreList'), emptyScore: $('#emptyScore'),
    scaleLegend: $('#scoreScaleLegend'), full: $('#fullBtn')
  };

  let state = { tests: [], index: 0, player: '', built: [], score: 0, strong: 0, answers: [], evaluated: false, visible: false };
  let draggedIndex = null;
  let lastFocus = null;

  const safeText = (element, value) => { if (element) element.textContent = String(value ?? ''); };
  const normalizeName = (name) => name.trim().replace(/\s+/g, ' ').slice(0, 40);
  const normalizeToken = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
  const playerKey = (name) => normalizeName(name).toLocaleLowerCase('es');
  const shuffle = (items) => {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const random = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[random]] = [copy[random], copy[index]];
    }
    return copy;
  };
  const validTest = (test) => test && test.id && test.titulo && test.tipo && test.contexto && Number(test.min) >= 12 &&
    Array.isArray(test.personales) && Array.isArray(test.comunes) && Array.isArray(test.fragmentos) && test.fragmentos.length >= 6 && test.consejo;

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

  const currentTest = () => state.tests[state.index];
  const password = () => state.built.map((item) => item.t).join('');
  const updateHud = () => {
    safeText(els.progressText, `${Math.min(state.index + (state.evaluated ? 1 : 0), state.tests.length)} / ${state.tests.length}`);
    safeText(els.scoreText, state.score);
    safeText(els.strongText, state.strong);
    els.progressBar.style.width = `${state.tests.length ? (Math.min(state.index + (state.evaluated ? 1 : 0), state.tests.length) / state.tests.length) * 100 : 0}%`;
  };

  const renderPreview = () => {
    const value = password();
    const test = currentTest();
    const shown = state.visible ? value : '•'.repeat(Math.max(8, Math.min(32, value.length)));
    safeText(els.passwordPreview, value ? shown : '••••••••');
    safeText(els.lengthBadge, `${value.length} / ${test?.min || 0}`);
    els.lengthBadge.classList.toggle('ok', Boolean(test && value.length >= Number(test.min)));
    els.emptyBuild.hidden = state.built.length > 0;
    els.undo.disabled = state.built.length === 0 || state.evaluated;
    els.clear.disabled = state.built.length === 0 || state.evaluated;
  };

  const removeBuilt = (index) => {
    if (state.evaluated) return;
    state.built.splice(index, 1);
    renderBuild();
  };

  const renderBuild = () => {
    els.buildZone.querySelectorAll('.built-fragment').forEach((item) => item.remove());
    state.built.forEach((item, index) => {
      const chip = document.createElement('span');
      chip.className = 'built-fragment';
      chip.setAttribute('role', 'listitem');
      const label = document.createElement('span'); label.textContent = item.t;
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '×';
      remove.setAttribute('aria-label', `Quitar fragmento ${item.t}`);
      remove.disabled = state.evaluated;
      remove.addEventListener('click', () => removeBuilt(index));
      chip.append(label, remove);
      els.buildZone.append(chip);
    });
    renderPreview();
  };

  const addFragment = (fragment) => {
    if (state.evaluated || !fragment?.t || state.built.length >= 10) return;
    state.built.push({ t: String(fragment.t).slice(0, 24), r: fragment.r || '' });
    renderBuild();
    els.buildZone.focus({ preventScroll: true });
  };

  const renderPalette = (test) => {
    els.palette.replaceChildren();
    test.fragmentos.forEach((fragment, index) => {
      const item = document.createElement('div');
      item.className = 'fragment'; item.draggable = true; item.tabIndex = -1;
      item.dataset.index = String(index);
      const text = document.createElement('span'); text.textContent = fragment.t;
      const button = document.createElement('button'); button.type = 'button'; button.textContent = 'AGREGAR';
      button.setAttribute('aria-label', `Agregar fragmento ${fragment.t}`);
      button.addEventListener('click', () => addFragment(fragment));
      item.addEventListener('dragstart', (event) => {
        draggedIndex = index; item.classList.add('dragging');
        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData('text/plain', String(index));
      });
      item.addEventListener('dragend', () => { draggedIndex = null; item.classList.remove('dragging'); });
      item.append(text, button); els.palette.append(item);
    });
  };

  const resetChallenge = () => {
    const test = currentTest();
    state.built = []; state.evaluated = false; state.visible = false;
    safeText(els.challengeId, test.id);
    safeText(els.challengeType, test.tipo.toUpperCase());
    safeText(els.challengeTitle, test.titulo);
    safeText(els.challengeContext, test.contexto);
    els.uniqueCheck.checked = false; els.mfaCheck.checked = false;
    els.uniqueCheck.disabled = false; els.mfaCheck.disabled = false;
    els.custom.value = ''; els.custom.disabled = false; els.addCustom.disabled = false;
    els.evaluate.disabled = false; els.evaluate.hidden = false;
    els.feedback.hidden = true;
    els.visibility.setAttribute('aria-pressed', 'false'); safeText(els.visibility, 'MOSTRAR');
    renderPalette(test); renderBuild(); updateHud();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const start = () => {
    const name = normalizeName(els.playerName.value);
    if (!name) {
      els.nameError.hidden = false; els.playerName.setAttribute('aria-invalid', 'true'); els.playerName.focus(); return;
    }
    const bank = (window.PRUEBAS_CONTRASENA || []).filter(validTest);
    if (bank.length < 20) { window.alert('El juego necesita al menos 20 pruebas válidas en pruebas.js.'); return; }
    const count = els.roundSize.value === 'all' ? bank.length : Math.min(Number(els.roundSize.value), bank.length);
    state = { tests: shuffle(bank).slice(0, count), index: 0, player: name, built: [], score: 0, strong: 0, answers: [], evaluated: false, visible: false };
    try { localStorage.setItem(LAST_PLAYER_KEY, name); } catch (_) { /* almacenamiento opcional */ }
    els.playerName.removeAttribute('aria-invalid'); els.nameError.hidden = true; safeText(els.hudPlayer, name);
    showScreen('game'); resetChallenge();
  };

  const buildCriteria = (test) => {
    const value = password();
    const normalized = normalizeToken(value);
    const tokens = state.built.map((item) => normalizeToken(item.t));
    const hasTagged = (risk) => state.built.some((item) => item.r === risk);
    const containsAny = (list) => list.some((word) => word && normalized.includes(normalizeToken(word)));
    const special = /[^\p{L}\p{N}\s]/u.test(value);
    const distinctTokens = new Set(tokens.filter(Boolean));
    return [
      { name: 'Longitud', ok: value.length >= Number(test.min), detail: value.length >= Number(test.min) ? `${value.length} caracteres: supera el mínimo.` : `Tiene ${value.length}; necesita al menos ${test.min}.` },
      { name: 'Unicidad interna', ok: state.built.length >= 3 && distinctTokens.size === state.built.length && !/(.)\1{3,}/u.test(value), detail: 'Usa tres o más fragmentos sin repetir bloques ni caracteres en serie.' },
      { name: 'Palabras comunes', ok: !hasTagged('comun') && !containsAny(test.comunes), detail: 'Evita claves filtradas, secuencias y palabras obvias del servicio.' },
      { name: 'Datos personales', ok: !hasTagged('personal') && !containsAny(test.personales), detail: 'No debe contener nombres, fechas, lugares ni datos investigables.' },
      { name: 'No reutilización', ok: els.uniqueCheck.checked, detail: 'Declara y aplica una credencial distinta para cada servicio.' },
      { name: 'Símbolos', ok: !test.simbolo || special, detail: test.simbolo ? 'Este desafío requiere al menos un símbolo.' : (special ? 'Incluiste un símbolo.' : 'En esta frase, la longitud extra puede compensar el símbolo.') },
      { name: 'MFA', ok: els.mfaCheck.checked, detail: 'Activa un segundo factor para reducir el impacto de una clave robada.' }
    ];
  };

  const renderCriteria = (criteria) => {
    els.criteriaList.replaceChildren();
    criteria.forEach((criterion) => {
      const card = document.createElement('article'); card.className = `criterion${criterion.ok ? ' ok' : ''}`;
      const icon = document.createElement('i'); icon.textContent = criterion.ok ? '✓' : '×';
      const body = document.createElement('div'); const name = document.createElement('b'); const detail = document.createElement('small');
      name.textContent = criterion.name; detail.textContent = criterion.detail; body.append(name, detail); card.append(icon, body); els.criteriaList.append(card);
    });
  };

  const evaluate = () => {
    if (state.evaluated) return;
    if (state.built.length < 3) { window.alert('Agrega al menos tres fragmentos antes de evaluar.'); els.buildZone.focus(); return; }
    const test = currentTest();
    const criteria = buildCriteria(test);
    const okCount = criteria.filter((item) => item.ok).length;
    const strength = Math.round((okCount / criteria.length) * 100);
    const passed = strength >= CHALLENGE_PASS;
    state.evaluated = true;
    state.score += strength + (passed ? 25 : 0);
    if (passed) state.strong += 1;
    state.answers.push({ id: test.id, titulo: test.titulo, passed, strength, failed: criteria.filter((item) => !item.ok).map((item) => item.name), consejo: test.consejo });
    els.uniqueCheck.disabled = true; els.mfaCheck.disabled = true; els.custom.disabled = true; els.addCustom.disabled = true;
    els.evaluate.disabled = true; els.evaluate.hidden = true;
    els.palette.querySelectorAll('button').forEach((button) => { button.disabled = true; });
    safeText(els.strengthText, `${strength}%`); els.strengthBar.style.width = `${strength}%`;
    safeText(els.feedbackTitle, passed ? '✓ CONSTRUCCIÓN RESISTENTE' : '⚠ NECESITA REFUERZO');
    safeText(els.feedbackSummary, passed ? `Superaste ${okCount} de 7 controles. Esta propuesta resiste mejor ataques comunes.` : `Superaste ${okCount} de 7 controles. Revisa los puntos marcados antes de usar una clave real.`);
    safeText(els.educationText, test.consejo); renderCriteria(criteria); els.feedback.hidden = false; renderBuild(); updateHud();
    els.feedback.scrollIntoView({ behavior: 'smooth', block: 'start' }); els.continueBtn.focus({ preventScroll: true });
  };

  const next = () => {
    if (!state.evaluated) return;
    if (state.index + 1 >= state.tests.length) { finish(); return; }
    state.index += 1; resetChallenge();
  };

  const finish = () => {
    const total = state.tests.length;
    const percent = Math.round((state.strong / total) * 100);
    safeText(els.resultPlayer, state.player); safeText(els.percentText, `${percent}%`); els.resultRing.style.setProperty('--p', percent);
    safeText(els.correctText, `${state.strong}/${total}`); safeText(els.wrongText, total - state.strong); safeText(els.finalScoreText, state.score);
    let title; let message;
    if (percent >= 90) { title = 'Arquitecto de credenciales'; message = 'Diseñas defensas largas, únicas y reforzadas con MFA.'; }
    else if (percent >= 75) { title = 'Bóveda resistente'; message = 'Tus decisiones protegen la mayoría de los accesos. Repasa los pocos controles pendientes.'; }
    else if (percent >= 60) { title = 'Cerrojo incompleto'; message = 'Hay buenas bases, pero algunas claves todavía pueden predecirse o reutilizarse.'; }
    else { title = 'Acceso vulnerable'; message = 'Repite la misión y prioriza longitud, exclusividad, ausencia de datos personales y MFA.'; }
    safeText(els.resultTitle, title); safeText(els.resultMessage, message);
    const saved = registerResult(state.player, percent, state.score);
    els.victoryNotice.className = `victory-notice ${saved.won ? 'won' : 'practice'}`;
    safeText(els.victoryNotice, saved.won ? `VICTORIA REGISTRADA · ${saved.record.wins} ganadas` : `PARTIDA REGISTRADA · alcanza ${WIN_PERCENT}% para sumar una victoria`);
    els.review.replaceChildren();
    const missed = state.answers.filter((answer) => !answer.passed);
    if (missed.length) {
      const heading = document.createElement('h3'); heading.textContent = 'Desafíos para repasar'; els.review.append(heading);
      missed.forEach((answer) => {
        const article = document.createElement('article'); const name = document.createElement('b'); const text = document.createElement('p');
        name.textContent = `${answer.id} · ${answer.titulo} · ${answer.strength}%`;
        text.textContent = `Refuerza: ${answer.failed.join(', ')}. ${answer.consejo}`;
        article.append(name, text); els.review.append(article);
      });
    }
    showScreen('results');
  };

  const renderScore = () => {
    const records = Object.values(loadScore()).filter((record) => record && record.name)
      .sort((a, b) => (Number(b.wins || 0) - Number(a.wins || 0)) || (Number(b.totalPoints || 0) - Number(a.totalPoints || 0)));
    els.scoreList.replaceChildren(); els.emptyScore.hidden = records.length > 0;
    const maxWins = Math.max(0, ...records.map((record) => Number(record.wins || 0))); const milestone = milestoneFor(maxWins);
    els.scaleLegend.replaceChildren();
    for (let value = 0; value <= milestone; value += 1) {
      if (value === 0 || value === milestone || value % 5 === 0) {
        const tick = document.createElement('span'); tick.textContent = String(value); tick.style.left = `${(value / milestone) * 100}%`; els.scaleLegend.append(tick);
      }
    }
    records.forEach((record, index) => {
      const row = document.createElement('article'); row.className = 'score-row';
      const rank = document.createElement('span'); rank.className = 'score-rank'; rank.textContent = String(index + 1).padStart(2, '0');
      const body = document.createElement('div'); body.className = 'score-body'; const top = document.createElement('div'); top.className = 'score-row-top';
      const name = document.createElement('strong'); name.textContent = record.name; const wins = document.createElement('b'); wins.textContent = `${record.wins || 0} ${Number(record.wins) === 1 ? 'victoria' : 'victorias'}`;
      top.append(name, wins); const track = document.createElement('div'); track.className = 'victory-scale'; track.setAttribute('aria-label', `${record.name}: ${record.wins || 0} de ${milestone} victorias en la escala`);
      const fill = document.createElement('i'); fill.style.width = `${Math.min(100, (Number(record.wins || 0) / milestone) * 100)}%`; track.append(fill);
      const meta = document.createElement('small'); meta.textContent = `${record.games || 0} partidas · ${record.totalPoints || 0} puntos · mejor ${record.bestPercent || 0}%`;
      body.append(top, track, meta); row.append(rank, body); els.scoreList.append(row);
    });
  };

  const openScore = () => { lastFocus = document.activeElement; renderScore(); els.scorePanel.hidden = false; els.scorePanel.setAttribute('aria-hidden', 'false'); document.body.classList.add('modal-open'); els.closeScore.focus(); };
  const closeScore = () => { els.scorePanel.hidden = true; els.scorePanel.setAttribute('aria-hidden', 'true'); document.body.classList.remove('modal-open'); lastFocus?.focus(); };

  els.start.addEventListener('click', start);
  els.restart.addEventListener('click', () => { showScreen('intro'); updateSnapshot(); els.playerName.focus(); });
  els.playerName.addEventListener('input', updateSnapshot);
  els.playerName.addEventListener('keydown', (event) => { if (event.key === 'Enter') start(); });
  els.addCustom.addEventListener('click', () => { const value = els.custom.value.trim(); if (value) { addFragment({ t: value }); els.custom.value = ''; } });
  els.custom.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); els.addCustom.click(); } });
  els.undo.addEventListener('click', () => removeBuilt(state.built.length - 1));
  els.clear.addEventListener('click', () => { if (!state.evaluated) { state.built = []; renderBuild(); } });
  els.visibility.addEventListener('click', () => { state.visible = !state.visible; els.visibility.setAttribute('aria-pressed', String(state.visible)); safeText(els.visibility, state.visible ? 'OCULTAR' : 'MOSTRAR'); renderPreview(); });
  els.buildZone.addEventListener('dragover', (event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; els.buildZone.classList.add('drag-over'); });
  els.buildZone.addEventListener('dragleave', () => els.buildZone.classList.remove('drag-over'));
  els.buildZone.addEventListener('drop', (event) => { event.preventDefault(); els.buildZone.classList.remove('drag-over'); const index = Number(event.dataTransfer.getData('text/plain') || draggedIndex); const fragment = currentTest()?.fragmentos[index]; if (fragment) addFragment(fragment); });
  els.evaluate.addEventListener('click', evaluate); els.continueBtn.addEventListener('click', next);
  els.quit.addEventListener('click', () => { if (window.confirm('¿Salir de la misión actual? El intento no se registrará.')) showScreen('intro'); });
  els.print.addEventListener('click', () => window.print());
  [els.scoreBtn, els.resultScoreBtn].forEach((button) => button.addEventListener('click', openScore));
  els.closeScore.addEventListener('click', closeScore); els.scorePanel.addEventListener('click', (event) => { if (event.target === els.scorePanel) closeScore(); });
  els.full.addEventListener('click', () => { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !els.scorePanel.hidden) closeScore(); });

  try { els.playerName.value = localStorage.getItem(LAST_PLAYER_KEY) || ''; } catch (_) { /* almacenamiento opcional */ }
  updateSnapshot();
})();
