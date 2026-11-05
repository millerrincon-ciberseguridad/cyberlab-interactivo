# CiberCrucigrama para Ciberaula

Juego web estático e incorporable de crucigrama sobre ciberseguridad. La carpeta es autónoma: **no reemplaza ni modifica el paquete vigente de Ciberaula**.

## Contenido de la carpeta

- `index.html`: punto de entrada y enlace visible **Regresar a la portada**.
- `styles.css`: interfaz responsive para computador y celular.
- `words.js`: banco acumulativo de 50 términos y pistas.
- `app.js`: generador, lógica del juego, temporizador, score e integración.
- `assets/anonymous-crossword-cyber-bg.jpg`: imagen original de Anonymous y crucigrama usada como fondo visible.
- `tarjeta-portada.html`: fragmento HTML de la tarjeta para la portada.

## Instalación en GitHub Pages

La ruta prevista es:

```text
/ (raíz publicada de Ciberaula)
├── index.html
└── juegos/
    └── ciberaula-crucigrama/
        ├── index.html
        ├── styles.css
        ├── app.js
        ├── words.js
        ├── tarjeta-portada.html
        ├── README.md
        └── assets/
            └── anonymous-crossword-cyber-bg.jpg
```

1. Descomprima el ZIP recibido.
2. Copie **únicamente** la carpeta `ciberaula-crucigrama` dentro de `/juegos/` en la raíz publicada del repositorio.
3. No sobrescriba archivos existentes de Ciberaula.
4. Abra `tarjeta-portada.html` y copie el fragmento en la cuadrícula o sección de juegos de la portada.
5. Publique normalmente. No requiere npm, compilación, servidor de aplicación ni dependencias externas.

Con esta estructura:

- La tarjeta abre `./juegos/ciberaula-crucigrama/index.html`.
- El botón del juego vuelve a `../../index.html`.
- El fondo del juego carga `assets/anonymous-crossword-cyber-bg.jpg`.
- El fondo de la tarjeta carga `./juegos/ciberaula-crucigrama/assets/anonymous-crossword-cyber-bg.jpg`.

Las rutas son relativas y conservan el subdirectorio del repositorio, por lo que son compatibles con una dirección de GitHub Pages del tipo:

```text
https://USUARIO.github.io/REPOSITORIO/
```

> Si la portada principal no se llama `index.html` o el juego se instala fuera de `/juegos/ciberaula-crucigrama/`, ajuste los `href` indicados antes de publicar.

## Prueba local recomendada

Desde la raíz que contiene `index.html` y la carpeta `juegos/`:

```bash
python3 -m http.server 8000
```

Abra:

```text
http://localhost:8000/juegos/ciberaula-crucigrama/
```

Compruebe lo siguiente:

1. El fondo de Anonymous y crucigrama es visible, sin impedir leer el tablero, las pistas ni los controles.
2. `Regresar a la portada` abre `http://localhost:8000/index.html`.
3. La tarjeta abre el juego y muestra la misma imagen.
4. El formulario solicita nombre, permite seleccionar 10, 20, 30, 40 o 50 palabras y deja desactivar el temporizador.
5. Al resolver una palabra, sus casillas y su pista quedan marcadas como descubiertas.
6. `Revelar letra` completa una casilla y descuenta 25 puntos.
7. Al completar el tablero aparece el aviso de misión cumplida y se emite `game_complete`.
8. Repita la revisión en una pantalla de computador y con emulación o dispositivo celular.

## Funcionalidad conservada

- Niveles acumulativos de 10, 20, 30, 40 y 50 palabras de ciberseguridad.
- Captura y persistencia local del nombre del jugador.
- Temporizador opcional e inhabilitable antes de iniciar la partida.
- Marcación visual de palabras, pistas y casillas descubiertas.
- Pistas horizontales/verticales y revelado de letra con penalización de 25 puntos.
- Aviso vistoso de finalización con score, tiempo y opción de nueva misión.
- Uso por teclado, desplazamiento táctil y adaptación responsive.
- Sin llamadas de red ni dependencias de terceros.

## Integración `ciberaula:score:v1`

El juego mantiene tres mecanismos compatibles con una portada contenedora.

### 1. Evento DOM

```js
window.addEventListener('ciberaula:score:v1', (event) => {
  console.log(event.detail);
});
```

### 2. `postMessage` cuando se incorpora en un `iframe`

```js
window.addEventListener('message', (event) => {
  if (event.data?.type === 'ciberaula:score:v1') {
    console.log(event.data.payload);
  }
});
```

### 3. Persistencia local

```text
ciberaula:score:v1:cibercrucigrama
```

Se emiten `game_start`, `score_update`, `hint_used` y `game_complete`. El payload contiene protocolo, juego, evento, fecha, jugador, sesión, resultado y estadísticas.

La portada puede solicitar el estado del juego incorporado:

```js
iframe.contentWindow.postMessage({
  type: 'ciberaula:score:v1',
  action: 'request_state'
}, '*');
```

También se expone, dentro del contexto del juego:

```js
window.CiberaulaScoreV1.getState();
```

> Si portada y juego se publican en orígenes distintos, restrinja `postMessage` al origen autorizado en la integración de producción.

## Reglas de score

- Palabra descubierta: `100 + número de palabras del nivel`.
- Letra revelada: `−25`, sin bajar de cero.
- Finalización: bono de `nivel × 10`.
- Con temporizador: bono adicional de hasta 600 puntos, decreciente por segundo.
- Por jugador se guardan partidas, victorias, score total y mejor score.

## Privacidad

El nombre y las estadísticas permanecen en `localStorage` del navegador. El juego no envía datos a servicios externos; solo comparte el estado con la portada mediante `ciberaula:score:v1` cuando existe un contenedor que lo recibe.
