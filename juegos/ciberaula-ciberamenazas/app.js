(() => {
  "use strict";
  const cfg = window.CIBERAMENAZAS_CONFIG;
  const Core = window.CiberAmenazasCore;
  const PROTOCOL = "ciberaula:score:v1";
  const STORAGE_KEY = PROTOCOL;
  const BACKUP_KEY = `${PROTOCOL}:${cfg.gameId}`;
  const NAME_KEY = "ciberaula:jugador:v1";
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const els = Object.fromEntries([
    "setupPanel","setupForm","playerInput","timerToggle","levelOptions","gamePanel","playerLabel","levelLabel","threatsLabel","timeLabel","scoreLabel","playActions","postGameActions","flagModeButton","pauseButton","restartButton","retryButton","changeLevelButton","topPrintButton","inlineResult","inlineResultTitle","inlineResultMessage","inlineResultSummary","statusBanner","boardScroller","board","pauseLayer","defenseIcon","defenseTitle","defenseText","gamesStat","winsStat","bestStat","totalStat","resultDialog","resultCard","resultSymbol","resultKicker","resultTitle","resultMessage","resultPlayer","resultLevel","resultTime","resultScore","resultTip","playAgainButton","printButton","homeLink","brandLogo","yearLabel"
  ].map(id => [id, document.getElementById(id)]));

  let state = freshState();
  function freshState() { return { player:"", levelKey:"easy", level:null, board:null, score:0, elapsed:0, timerEnabled:true, timerId:null, started:false, completed:false, paused:false, flagMode:false, sessionId:"", stats:null, finalized:false, firstMove:false, explodedCell:null }; }
  const cleanName = value => value.trim().replace(/\s+/g," ").slice(0,40);
  const playerId = name => cleanName(name).toLocaleLowerCase("es");
  const formatTime = seconds => `${String(Math.floor(seconds/60)).padStart(2,"0")}:${String(seconds%60).padStart(2,"0")}`;
  const safeJson = (text, fallback) => { try { return JSON.parse(text) || fallback; } catch { return fallback; } };
  const defaultDb = () => ({ version:1, totalScore:0, bestScore:0, games:0, wins:0, lastPlayer:"", gamesById:{}, players:{} });

  function loadDatabase() {
    const globalDb = safeJson(localStorage.getItem(STORAGE_KEY), {});
    const backup = safeJson(localStorage.getItem(BACKUP_KEY), {});
    const db = { ...defaultDb(), ...globalDb };
    db.gamesById = { ...(globalDb.gamesById || {}), ...(backup.gamesById || {}) };
    db.players = { ...(globalDb.players || {}), ...(backup.players || {}) };
    db.totalScore = Number(db.totalScore ?? db.score ?? 0) || 0;
    db.bestScore = Number(db.bestScore ?? db.best ?? 0) || 0;
    db.games = Number(db.games ?? db.partidas ?? 0) || 0;
    db.wins = Number(db.wins ?? db.victorias ?? 0) || 0;
    return db;
  }

  function playerStats(name) {
    const db = loadDatabase(), id = playerId(name), saved = db.players[id] || {};
    return {
      name:cleanName(name), games:Number(saved.games||0), wins:Number(saved.wins||0), losses:Number(saved.losses||0),
      totalScore:Number(saved.totalScore??saved.score??0), bestScore:Number(saved.bestScore??saved.best??0),
      bestTime:saved.bestTime==null?null:Number(saved.bestTime), lastPlayedAt:saved.lastPlayedAt||null
    };
  }

  function saveDatabase(reason) {
    const db = loadDatabase(), id = playerId(state.player);
    db.players[id] = state.stats;
    db.lastPlayer = state.player;
    db.gamesById[cfg.gameId] = { player:state.player, stats:state.stats, lastScore:state.score, updatedAt:new Date().toISOString() };
    if (reason === "game_complete") {
      db.totalScore += state.score; db.bestScore = Math.max(db.bestScore,state.score); db.games += 1; if (state.completed) db.wins += 1;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      localStorage.setItem(BACKUP_KEY, JSON.stringify({ version:1, gamesById:db.gamesById, players:db.players }));
      localStorage.setItem(NAME_KEY, state.player);
    } catch (_) { /* La partida continúa aunque el almacenamiento esté bloqueado. */ }
    renderStats(); emitScore(reason, db);
  }

  function payload(eventName, db = loadDatabase()) {
    return {
      protocol:PROTOCOL, version:1, gameId:cfg.gameId, gameName:cfg.gameName, event:eventName, timestamp:new Date().toISOString(),
      player:{ name:state.player }, session:{ id:state.sessionId, difficulty:state.levelKey, rows:state.level?.rows || 0, cols:state.level?.cols || 0, threats:state.level?.threats || 0, timerEnabled:state.timerEnabled, elapsedSeconds:state.elapsed },
      result:{ completed:state.finalized, won:state.completed, score:state.score },
      stats:{ ...state.stats }, cumulative:{ totalScore:db.totalScore || 0, bestScore:db.bestScore || 0, games:db.games || 0, wins:db.wins || 0 }
    };
  }

  function emitScore(eventName, db) {
    const detail = payload(eventName, db);
    window.dispatchEvent(new CustomEvent(PROTOCOL,{ detail }));
    window.dispatchEvent(new CustomEvent("ciberaula:score",{ detail }));
    if (window.parent !== window) window.parent.postMessage({ type:PROTOCOL, payload:detail },"*");
  }

  function exposeProtocol() {
    window.CiberaulaScoreV1 = window.CiberaulaScoreV1 || {};
    window.CiberaulaScoreV1.getState = () => payload("state_request");
    window.addEventListener("message", event => {
      if (event.data?.type === PROTOCOL && event.data?.action === "request_state") event.source?.postMessage({ type:PROTOCOL, payload:payload("state_response") },"*");
    });
  }

  function applyConfig() {
    document.documentElement.style.setProperty("--cyan",cfg.theme.cyan);
    document.documentElement.style.setProperty("--green",cfg.theme.green);
    document.documentElement.style.setProperty("--red",cfg.theme.red);
    document.documentElement.style.setProperty("--amber",cfg.theme.amber);
    document.body.style.setProperty("--game-bg",`url('${cfg.background}')`);
    els.brandLogo.src = cfg.logo; els.brandLogo.alt = cfg.logoAlt;
    els.homeLink.href = cfg.homeHref; $$('[data-home-link]').forEach(link => link.href = cfg.homeHref);
    els.yearLabel.textContent = new Date().getFullYear();
    els.levelOptions.innerHTML = Object.entries(cfg.levels).map(([key,level],index) => `<div class="level-option"><input id="level-${key}" type="radio" name="level" value="${key}" ${index===0?"checked":""}><label for="level-${key}"><strong>${level.label}</strong><span>${level.rows}×${level.cols} · ${level.threats} amenazas</span><small>${level.description}</small></label></div>`).join("");
    try { els.playerInput.value = localStorage.getItem(NAME_KEY) || loadDatabase().lastPlayer || ""; } catch (_) {}
  }

  function renderStats() {
    const s = state.stats || { games:0,wins:0,bestScore:0,totalScore:0 };
    els.gamesStat.textContent = s.games || 0; els.winsStat.textContent = s.wins || 0;
    els.bestStat.textContent = Number(s.bestScore || 0).toLocaleString("es-CO");
    els.totalStat.textContent = Number(s.totalScore || 0).toLocaleString("es-CO");
  }

  function startGame(player, levelKey, timerEnabled) {
    stopTimer(); const level = cfg.levels[levelKey];
    state = { ...freshState(), player, levelKey, level, timerEnabled, board:Core.createBoard(level.rows,level.cols), started:true, sessionId:`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`, stats:playerStats(player) };
    document.body.classList.remove("loss-review"); els.inlineResult.hidden=true; els.postGameActions.hidden=true; els.playActions.hidden=false;
    els.pauseButton.textContent="⏸ Pausa"; els.pauseLayer.hidden=true; els.flagModeButton.classList.remove("active"); els.flagModeButton.setAttribute("aria-pressed","false");
    els.playerLabel.textContent = player; els.levelLabel.textContent = level.label; els.setupPanel.hidden = true; els.gamePanel.hidden = false;
    renderStats(); renderBoard(); updateHud(); showDefense(0); setBanner("Toca una casilla para desplegar la zona inicial segura.");
    els.gamePanel.scrollIntoView({ behavior:"smooth", block:"start" }); emitScore("game_start");
  }

  function renderBoard() {
    const { rows,cols } = state.level;
    els.board.style.gridTemplateColumns = `repeat(${cols}, var(--cell))`;
    els.board.setAttribute("aria-rowcount",rows); els.board.setAttribute("aria-colcount",cols);
    els.board.dataset.level = state.levelKey; els.board.innerHTML = "";
    const fragment = document.createDocumentFragment();
    for (let row=0; row<rows; row+=1) for (let col=0; col<cols; col+=1) {
      const button = document.createElement("button"); button.type="button"; button.className="cell"; button.dataset.row=row; button.dataset.col=col; button.setAttribute("role","gridcell"); button.setAttribute("aria-label",`Fila ${row+1}, columna ${col+1}: oculta`); fragment.appendChild(button);
    }
    els.board.appendChild(fragment);
  }

  function cellElement(row,col) { return els.board.querySelector(`[data-row="${row}"][data-col="${col}"]`); }
  function syncCell(row,col) {
    const cell = state.board.cells[row][col], element = cellElement(row,col); if (!element) return;
    element.className="cell"; element.textContent="";
    if (cell.revealed) {
      element.classList.add("revealed");
      if (cell.threat) {
        const threat = cfg.threats[cell.threatIndex % cfg.threats.length]; element.classList.add("threat");
        const exploded=state.explodedCell&&state.explodedCell.row===row&&state.explodedCell.col===col;
        if(state.finalized&&!state.completed&&exploded){element.classList.add("exploded");element.textContent="💥";element.title=`${threat.name}: casilla detonada`;element.setAttribute("aria-label",`${threat.name}: casilla detonada que provocó el incidente`);}
        else if(state.finalized&&!state.completed&&cell.flagged){element.classList.add("correct-flag");element.textContent="🚩";element.title=`${threat.name}: amenaza correctamente marcada`;element.setAttribute("aria-label",`${threat.name}: amenaza correctamente marcada`);}
        else if(state.finalized&&!state.completed){element.classList.add("hidden-threat");element.textContent="💣";element.title=`${threat.name}: amenaza que permanecía oculta`;element.setAttribute("aria-label",`${threat.name}: amenaza oculta revelada al finalizar`);}
        else {element.textContent=threat.icon;element.title=threat.name;element.setAttribute("aria-label",`${threat.name}: amenaza activada`);}
      } else if (cell.adjacent) {
        element.classList.add(`n${cell.adjacent}`); element.textContent=cell.adjacent; element.setAttribute("aria-label",`${cell.adjacent} amenazas cercanas`);
      } else {
        const showShield=(row*31+col*17)%7===0; if(showShield){element.classList.add("defense");element.textContent="🛡";} element.setAttribute("aria-label",showShield?"Zona segura con defensa revelada":"Zona segura");
      }
    } else if (cell.flagged) { element.classList.add("flagged"); element.textContent="🚩"; element.setAttribute("aria-label","Casilla marcada como amenaza"); }
    else element.setAttribute("aria-label",`Fila ${row+1}, columna ${col+1}: oculta`);
  }

  function updateHud() {
    const flags = state.board ? Core.countFlags(state.board) : 0;
    els.threatsLabel.textContent = state.level ? Math.max(0,state.level.threats-flags) : 0;
    els.timeLabel.textContent = state.timerEnabled ? formatTime(state.elapsed) : "Sin límite";
    els.scoreLabel.textContent = state.score.toLocaleString("es-CO");
  }
  function setBanner(text, alert=false) { els.statusBanner.textContent=text; els.statusBanner.classList.toggle("alert",alert); }
  function showDefense(index) { const defense=cfg.defenses[Math.abs(index)%cfg.defenses.length]; els.defenseIcon.textContent=defense.icon; els.defenseTitle.textContent=defense.title; els.defenseText.textContent=defense.text; return defense; }
  function startTimer() { if (!state.timerEnabled || state.timerId) return; state.timerId=setInterval(()=>{ if(!state.paused&&!state.finalized){state.elapsed+=1;updateHud();}},1000); }
  function stopTimer() { if(state.timerId) clearInterval(state.timerId); state.timerId=null; }

  function revealCell(row,col) {
    if (!state.started || state.paused || state.finalized) return;
    const cell=state.board.cells[row][col]; if(cell.flagged||cell.revealed) return;
    if(!state.board.placed){ Core.placeThreats(state.board,state.level.threats,row,col); state.firstMove=true; startTimer(); setBanner("Zona inicial segura desplegada. Continúa el análisis."); }
    const changed=Core.reveal(state.board,row,col); changed.forEach(([r,c])=>syncCell(r,c));
    if(cell.threat){ finishGame(false,cell); return; }
    if(changed.length){ state.score += changed.length*cfg.scoring.safeCell*state.level.multiplier; const defense=showDefense(row*state.level.cols+col); setBanner(`${defense.icon} ${defense.title}: ${defense.text}`); updateHud(); emitScore("score_update"); }
    if(Core.hasWon(state.board)) finishGame(true);
  }

  function flagCell(row,col) {
    if (!state.started || state.paused || state.finalized) return;
    const before=state.board.cells[row][col].flagged;
    const after=Core.toggleFlag(state.board,row,col,state.level.threats); syncCell(row,col); updateHud();
    if(before===after&&!after&&Core.countFlags(state.board)>=state.level.threats) setBanner("Ya utilizaste todas las banderas disponibles.",true);
    else setBanner(after?"Amenaza potencial marcada. Verifica con las casillas cercanas.":"Bandera retirada; la casilla vuelve a análisis.");
  }

  function togglePause() {
    if(!state.started||state.finalized) return; state.paused=!state.paused; els.pauseLayer.hidden=!state.paused;
    els.pauseButton.textContent=state.paused?"▶ Continuar":"⏸ Pausa"; setBanner(state.paused?"Misión en pausa.":"Misión reanudada.",state.paused);
  }

  function calculateWinBonus() {
    const correct=Core.correctFlags(state.board)*cfg.scoring.correctFlagOnWin*state.level.multiplier;
    const threatBonus=state.level.threats*cfg.scoring.winThreatBonus*state.level.multiplier;
    const timeBonus=state.timerEnabled?Math.max(0,cfg.scoring.maxTimeBonus-state.elapsed)*state.level.multiplier:0;
    return correct+threatBonus+timeBonus;
  }

  function finishGame(won,triggerCell) {
    if(state.finalized) return; state.finalized=true; state.completed=won; stopTimer();
    if(won){ state.score+=calculateWinBonus(); state.board.cells.flat().filter(c=>c.threat&&!c.flagged).forEach(c=>{c.flagged=true;syncCell(c.row,c.col);}); }
    else { state.explodedCell={row:triggerCell.row,col:triggerCell.col}; Core.revealThreats(state.board); state.board.cells.flat().forEach(c=>{syncCell(c.row,c.col);const el=cellElement(c.row,c.col);if(c.flagged&&!c.threat)el.classList.add("wrong-flag");}); }
    state.stats.games+=1; state.stats.wins+=won?1:0; state.stats.losses=(state.stats.losses||0)+(won?0:1); state.stats.totalScore+=state.score; state.stats.bestScore=Math.max(state.stats.bestScore||0,state.score); state.stats.lastPlayedAt=new Date().toISOString();
    if(won&&(state.stats.bestTime==null||state.elapsed<state.stats.bestTime)) state.stats.bestTime=state.elapsed;
    saveDatabase("game_complete"); updateHud(); if(won)showResult(true,triggerCell);else showLossReview(triggerCell);
  }

  function showLossReview(triggerCell) {
    const threat=cfg.threats[triggerCell.threatIndex%cfg.threats.length];
    const correctFlags=Core.correctFlags(state.board), wrongFlags=Core.countFlags(state.board)-correctFlags;
    const hiddenThreats=state.level.threats-correctFlags-1;
    document.body.classList.add("loss-review"); els.playActions.hidden=true; els.postGameActions.hidden=false; els.inlineResult.hidden=false;
    els.inlineResultTitle.textContent=`${threat.name} activó el incidente`;
    els.inlineResultMessage.textContent="El tablero permanece visible para que puedas revisar dónde te equivocaste. Se muestran todas las amenazas que seguían ocultas.";
    els.inlineResultSummary.textContent=`${state.level.threats} amenazas en total · 1 detonada · ${Math.max(0,hiddenThreats)} ocultas reveladas · ${correctFlags} banderas correctas${wrongFlags?` · ${wrongFlags} banderas incorrectas`:""}.`;
    setBanner("Revisión activa: 💥 indica tu error, 💣 muestra las amenazas ocultas, 🚩 conserva los aciertos y el borde rojo señala banderas incorrectas.",true);
  }

  function showResult(won,triggerCell) {
    const defense=showDefense(state.score+state.elapsed); els.resultCard.classList.toggle("loss",!won); els.resultSymbol.textContent=won?"✓":"!";
    els.resultKicker.textContent=won?"MISIÓN COMPLETADA":"INCIDENTE DETECTADO"; els.resultTitle.textContent=won?"Red protegida":"Amenaza activada";
    const threat=triggerCell?cfg.threats[triggerCell.threatIndex%cfg.threats.length]:null;
    els.resultMessage.textContent=won?`Neutralizaste ${state.level.threats} amenazas sin comprometer la red.`:`${threat?.name||"Una amenaza"} atravesó el perímetro. Revisa las señales y vuelve a intentarlo.`;
    els.resultPlayer.textContent=state.player; els.resultLevel.textContent=`${state.level.label} · ${state.level.rows}×${state.level.cols}`; els.resultTime.textContent=state.timerEnabled?formatTime(state.elapsed):"Sin límite"; els.resultScore.textContent=state.score.toLocaleString("es-CO"); els.resultTip.textContent=`${defense.icon} ${defense.title}: ${defense.text}`;
    els.resultDialog.showModal();
  }

  function restartCurrent() { if(!state.player)return; if(els.resultDialog.open)els.resultDialog.close(); startGame(state.player,state.levelKey,state.timerEnabled); }
  function returnToSetup() { stopTimer(); if(els.resultDialog.open)els.resultDialog.close(); document.body.classList.remove("loss-review"); els.inlineResult.hidden=true; els.postGameActions.hidden=true; els.playActions.hidden=false; els.gamePanel.hidden=true; els.setupPanel.hidden=false; els.playerInput.value=state.player; els.setupPanel.scrollIntoView({behavior:"smooth"}); }

  function bindBoardInput() {
    let longPressTimer=null, longPressed=false, pointerCell=null, suppressClickUntil=0, startX=0, startY=0, moved=false;
    els.board.addEventListener("contextmenu",event=>{const cell=event.target.closest(".cell");if(!cell)return;event.preventDefault();flagCell(+cell.dataset.row,+cell.dataset.col);});
    els.board.addEventListener("pointerdown",event=>{const cell=event.target.closest(".cell");if(!cell||event.pointerType==="mouse")return;longPressed=false;moved=false;startX=event.clientX;startY=event.clientY;pointerCell=cell;longPressTimer=setTimeout(()=>{if(moved)return;longPressed=true;flagCell(+cell.dataset.row,+cell.dataset.col);if(navigator.vibrate)navigator.vibrate(35);},cfg.longPressMs);});
    const clearLong=()=>{clearTimeout(longPressTimer);longPressTimer=null;};
    els.board.addEventListener("pointermove",event=>{if(event.pointerType!=="mouse"&&Math.hypot(event.clientX-startX,event.clientY-startY)>12){moved=true;clearLong();}});
    els.board.addEventListener("pointercancel",()=>{moved=true;clearLong();}); els.board.addEventListener("pointerleave",event=>{if(event.pointerType!=="mouse")clearLong();});
    els.board.addEventListener("pointerup",event=>{const cell=event.target.closest(".cell");if(!cell)return;clearLong();if(event.pointerType!=="mouse"){event.preventDefault();suppressClickUntil=Date.now()+700;if(!longPressed&&!moved&&cell===pointerCell)(state.flagMode?flagCell:revealCell)(+cell.dataset.row,+cell.dataset.col);pointerCell=null;}});
    els.board.addEventListener("click",event=>{if(event.detail===0||Date.now()<suppressClickUntil)return;const cell=event.target.closest(".cell");if(!cell)return;(state.flagMode?flagCell:revealCell)(+cell.dataset.row,+cell.dataset.col);});
  }

  els.setupForm.addEventListener("submit",event=>{event.preventDefault();const player=cleanName(els.playerInput.value);if(!player){els.playerInput.focus();return;}const levelKey=new FormData(els.setupForm).get("level")||"easy";startGame(player,levelKey,els.timerToggle.checked);});
  els.flagModeButton.addEventListener("click",()=>{state.flagMode=!state.flagMode;els.flagModeButton.classList.toggle("active",state.flagMode);els.flagModeButton.setAttribute("aria-pressed",String(state.flagMode));setBanner(state.flagMode?"Modo bandera activo: toca una casilla para marcarla.":"Modo revelar activo: toca una casilla para analizarla.");});
  els.pauseButton.addEventListener("click",togglePause); els.restartButton.addEventListener("click",restartCurrent); els.retryButton.addEventListener("click",restartCurrent); els.changeLevelButton.addEventListener("click",returnToSetup); els.topPrintButton.addEventListener("click",()=>window.print()); els.playAgainButton.addEventListener("click",returnToSetup); els.printButton.addEventListener("click",()=>window.print());
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&state.started&&!state.finalized){event.preventDefault();togglePause();}});
  document.addEventListener("visibilitychange",()=>{if(document.hidden&&state.started&&!state.paused&&!state.finalized)togglePause();});

  applyConfig(); bindBoardInput(); exposeProtocol(); renderStats();
})();
