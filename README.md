# CiberAula — portada general + Juegos 01 a 07

Proyecto estático completo y listo para GitHub Pages. Incluye una portada con siete tarjetas y siete juegos funcionales:

1. **Detecta el Phishing** — 24 pruebas.
2. **El hacker está dentro** — 24 pruebas.
3. **Construye una contraseña resistente** — 20 pruebas.
4. **Escape Room: recupera los archivos** — 24 pruebas.
5. **Semáforo del riesgo** — 24 pruebas con arrastrar y soltar y alternativa táctil.
6. **Ordena la respuesta al incidente** — 24 incidentes con arrastrar y soltar, botones táctiles y retroalimentación educativa.
7. **Puesto Cero: incidente ransomware** — 24 interacciones explorables, inventario, ayudas progresivas, temporizador y código final.

## Funciones conservadas e incorporadas

- Nombre del jugador en los siete juegos.
- Score local compartido por jugador con partidas, victorias, puntos acumulados y mejor porcentaje.
- Clave de almacenamiento compartida: `ciberaula:score:v1`.
- Escala gráfica de victorias y botones **CONSULTAR SCORE**.
- Una victoria se registra al obtener **75 % o más**.
- Fondo difuminado de Anonymous dentro de los juegos; la portada no lo usa.
- Logo configurable en la portada y en los siete juegos.
- **Semáforo del riesgo** permite arrastrar tarjetas en computador o tocar categorías amplias en celular, incorpora 24 situaciones de Wi‑Fi, Bluetooth y conexiones, y ofrece retroalimentación educativa inmediata.
- Diseño adaptable a computador, proyector y celular.
- Rutas relativas, archivo `.nojekyll`, sin dependencias externas, base de datos ni servidor.
- **Escape Room: recupera los archivos** incluye selección de 10, 20 o todas las pruebas, 24 expedientes, cinco sectores de aprendizaje, pistas con penalización, puntaje, tiempo, retroalimentación, repaso final y guardado local de la misión en curso.
- **Ordena la respuesta al incidente** incluye selección de 10, 20 o las 24 pruebas; ordenamiento por arrastrar y soltar en computador; botones ↑ y ↓ para celular, teclado o tecnologías de apoyo; explicación y secuencia recomendada después de cada intento; y repaso final.
- **Puesto Cero** es una experiencia original: explora cuatro zonas de un puesto afectado por ransomware mediante 24 objetos; resuelve opciones, entradas y secuencias; reúne hallazgos y cuatro fragmentos en un inventario; usa dos ayudas progresivas; y reconstruye un código final antes de que termine el temporizador. Los puntos interactivos tienen una lista táctil y de teclado equivalente.

> El score y la misión en curso permanecen únicamente en `localStorage` del navegador; no se envían datos a un servidor.

## Publicar en GitHub Pages

1. Descomprime el ZIP.
2. Sube **el contenido de la carpeta**, no la carpeta contenedora, a la raíz del repositorio.
3. Comprueba que `.nojekyll`, `index.html`, `assets/` y `juegos/` queden en la raíz.
4. En GitHub abre **Settings → Pages**.
5. En **Build and deployment**, selecciona **Deploy from a branch**.
6. Elige la rama `main` y la carpeta `/ (root)`. Guarda.

Rutas de los juegos:

- `juegos/detecta-phishing/index.html`
- `juegos/el-hacker-esta-dentro/index.html`
- `juegos/construye-contrasena-resistente/index.html`
- `juegos/escape-room-recupera-los-archivos/index.html`
- `juegos/semaforo-del-riesgo/index.html`
- `juegos/ordena-respuesta-incidente/index.html`
- `juegos/puesto-cero-ransomware/index.html`

## Poner tu logo

Reemplaza estos ocho archivos por el mismo PNG, conservando exactamente los nombres y rutas:

- `assets/images/logo.png` — portada.
- `juegos/detecta-phishing/assets/logo.png` — Juego 01.
- `juegos/el-hacker-esta-dentro/assets/logo.png` — Juego 02.
- `juegos/construye-contrasena-resistente/assets/logo.png` — Juego 03.
- `juegos/escape-room-recupera-los-archivos/assets/logo.png` — Juego 04.
- `juegos/semaforo-del-riesgo/assets/logo.png` — Juego 05.
- `juegos/ordena-respuesta-incidente/assets/logo.png` — Juego 06.
- `juegos/puesto-cero-ransomware/assets/logo.png` — Juego 07.

Se recomienda una imagen cuadrada, transparente y de al menos 300 × 300 px.

## Agregar pruebas a “Escape Room: recupera los archivos”

Abre:

`juegos/escape-room-recupera-los-archivos/pruebas.js`

La cabecera contiene una **ZONA EDITABLE** y una plantilla. Al final del arreglo busca:

`AGREGA NUEVAS PRUEBAS JUSTO ENCIMA DE ESTE COMENTARIO`

Cada prueba necesita:

- `id`: único, por ejemplo `ER-025`.
- `icono` y `archivo`: representación y nombre simulado del expediente.
- `sector`: por ejemplo Respaldo, Cuarentena, Acceso, Integridad, Evidencia o Recuperación.
- `nivel`: número de dificultad.
- `titulo`, `escenario` y `pregunta`.
- `opciones`: mínimo tres respuestas.
- `correcta`: posición de la respuesta correcta, comenzando en 0.
- `pista`, `explicacion` y `accion`.

El motor valida el banco y exige al menos 20 pruebas válidas. Conserva la coma entre objetos y no insertes HTML en los textos.

## Agregar pruebas a los juegos anteriores

- **Construye una contraseña resistente:** edita `juegos/construye-contrasena-resistente/pruebas.js`. El motor exige al menos 20 pruebas válidas.
- **El hacker está dentro:** edita `juegos/el-hacker-esta-dentro/pruebas.js`. Cada prueba incluye coordenadas `x` e `y` para ubicar su objeto.
- **Detecta el Phishing:** edita `juegos/detecta-phishing/pruebas.js`. Los valores permitidos en `resultado` son `"phishing"` y `"legitimo"`.
- **Semáforo del riesgo:** edita `juegos/semaforo-del-riesgo/pruebas.js`. Los valores permitidos en `nivel` son `"bajo"`, `"medio"` y `"alto"`.
- **Ordena la respuesta al incidente:** edita `juegos/ordena-respuesta-incidente/pruebas.js`. La cabecera contiene la plantilla y el motor exige al menos 20 pruebas válidas con 4 a 7 pasos escritos en el orden correcto.
- **Puesto Cero:** edita `juegos/puesto-cero-ransomware/pruebas.js`. La cabecera contiene la **ZONA EDITABLE**, la plantilla, la duración, el mínimo de interacciones para abrir el decodificador, el umbral de victoria y el código final. Admite pruebas de tipo `choice`, `input` y `sequence`, inventario y fragmentos opcionales.

Los archivos contienen una zona editable y la marca `AGREGA NUEVAS PRUEBAS JUSTO ENCIMA DE ESTE COMENTARIO`.

## Conectar los siguientes juegos

La portada ya tiene conectados los juegos 01 a 07. Para añadir el Juego 08, copia un bloque de `assets/js/games-config.js`, cambia `id`, `numero`, textos, imagen y `href`, y conserva rutas relativas. Si `href` queda vacío, la tarjeta se mostrará como **Próximamente**.

## Estructura principal

```text
.nojekyll
index.html
assets/
  css/portal.css
  js/games-config.js
  js/portal.js
  images/logo.png
  images/cards/
juegos/
  detecta-phishing/
  el-hacker-esta-dentro/
  construye-contrasena-resistente/
  escape-room-recupera-los-archivos/
  semaforo-del-riesgo/
    index.html
    pruebas.js                    ← 24 pruebas + ZONA EDITABLE
    assets/
      game.js
      game.css
      anonymous-background.png
      anonymous-connections.webp
      logo.png
  ordena-respuesta-incidente/
    index.html
    pruebas.js                    ← 24 pruebas + ZONA EDITABLE
    assets/
      game.js
      game.css
      anonymous-background.png
      anonymous-incident-response.webp
      logo.png
  puesto-cero-ransomware/
    index.html
    pruebas.js                    ← 24 interacciones + ZONA EDITABLE
    assets/
      game.js
      game.css
      anonymous-background.png
      anonymous-ransomware.webp
      logo.png
```

© 2026 Miller Rincón Tautiva. Consulta `LICENCIA.txt`.
