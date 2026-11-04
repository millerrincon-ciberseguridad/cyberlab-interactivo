(() => {
  "use strict";

  const grid = document.getElementById("gameGrid");
  const games = Array.isArray(window.CIBERAULA_GAMES) ? window.CIBERAULA_GAMES : [];
  const available = games.filter((game) => Boolean(game.href));
  const availableCount = document.getElementById("availableCount");

  if (availableCount) availableCount.textContent = String(available.length);

  const makeCard = (game) => {
    const enabled = Boolean(game.href);
    const card = document.createElement(enabled ? "a" : "article");
    card.className = `game-card${enabled ? " is-live" : " is-locked"}`;

    if (enabled) {
      card.href = game.href;
      card.setAttribute("aria-label", `Abrir ${game.titulo}`);
    } else {
      card.setAttribute("aria-label", `${game.titulo}, próximamente`);
    }

    const media = document.createElement("div");
    media.className = "card-media";

    const image = document.createElement("img");
    image.src = game.imagen;
    image.alt = "";
    image.loading = game.numero === "01" ? "eager" : "lazy";
    media.appendChild(image);

    const number = document.createElement("span");
    number.className = "game-number";
    number.textContent = game.numero;
    media.appendChild(number);

    const status = document.createElement("span");
    status.className = "card-status";
    status.textContent = enabled ? "DISPONIBLE" : "PRÓXIMAMENTE";
    media.appendChild(status);

    const body = document.createElement("div");
    body.className = "card-body";

    const label = document.createElement("small");
    label.textContent = game.etiqueta;

    const title = document.createElement("h3");
    title.textContent = game.titulo;

    const description = document.createElement("p");
    description.textContent = game.descripcion;

    const action = document.createElement("span");
    action.className = "card-action";
    action.textContent = enabled ? "INICIAR JUEGO  →" : "EN PREPARACIÓN";

    body.append(label, title, description, action);
    card.append(media, body);
    return card;
  };

  if (!grid) return;

  if (!games.length) {
    grid.textContent = "No se encontró la configuración de juegos.";
    return;
  }

  games.forEach((game) => grid.appendChild(makeCard(game)));
})();
