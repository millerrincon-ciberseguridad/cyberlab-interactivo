# CiberAmenazas · Protocolo Buscaminas

Juego web estático, autónomo e incorporable para Ciberaula. El ZIP contiene **una sola carpeta independiente** y no elimina, sustituye ni modifica archivos existentes.

## Instalación en GitHub Pages

1. Descomprima el ZIP.
2. Copie la carpeta `ciberaula-ciberamenazas` completa dentro de `/juegos/`.
3. No sobrescriba otras carpetas o archivos.
4. Abra `portal-card.html` y copie manualmente su fragmento en la cuadrícula de juegos de la portada.
5. Publique el sitio. No requiere npm, compilación, base de datos ni servicios externos.

Estructura esperada:

```text
/ (raíz publicada)
├── index.html
└── juegos/
    └── ciberaula-ciberamenazas/
        ├── index.html
        ├── styles.css
        ├── config.js
        ├── core.js
        ├── app.js
        ├── portal-card.html
        ├── README.md
        ├── TEST-REPORT.md
        ├── package.json
        ├── tests/qa.js
        └── assets/
            ├── anonymous-ciberamenazas.webp
            └── logo.png
```

La ruta prevista del juego es `./juegos/ciberaula-ciberamenazas/` y el botón **Regresar a la portada** abre `../../index.html`. Las rutas relativas funcionan en proyectos de GitHub Pages publicados bajo un subdirectorio.

## ZONA EDITABLE — configuración

Toda la configuración de uso frecuente está claramente reunida al comienzo de `config.js`:

- `homeHref`: ruta de regreso a la portada.
- `logo` y `logoAlt`: logo configurable. Puede reemplazar `assets/logo.png` o apuntar a otro archivo local.
- `background`: fondo local. Se recomienda conservar una imagen horizontal con la máscara de Guy Fawkes correctamente representada.
- `theme`: colores principales.
- `levels`: nombres, dimensiones, amenazas y multiplicadores.
- `threats`: nombres e iconos de amenazas digitales.
- `defenses`: buenas prácticas y consejos revelados.
- `scoring`: valores de puntuación.
- `longPressMs`: duración de la pulsación larga táctil.

Los niveles entregados son:

| Nivel | Tablero | Amenazas | Multiplicador |
|---|---:|---:|---:|
| Fácil | 9×9 | 10 | ×1 |
| Medio | 16×16 | 40 | ×2 |
| Difícil | 16×30 | 99 | ×3 |

No es necesario editar `app.js` ni `core.js` para cambiar contenido, logo o rutas.

## Mecánica y seguridad del primer toque

- Las amenazas se colocan **después** del primer toque.
- La casilla inicial y todas las casillas adyacentes dentro de un radio de una celda quedan excluidas de las amenazas.
- Por tanto, el primer toque nunca es una amenaza, tiene contador cero y despliega una zona inicial segura mediante revelado expansivo.
- Clic o toque revela una casilla.
- Clic derecho, pulsación larga o **Modo bandera** marca una amenaza potencial.
- El contador indica cuántas banderas quedan disponibles.
- Las casillas seguras muestran números, zonas defensivas y recomendaciones educativas.

## Revisión visual después de una derrota

Si el jugador activa una amenaza, **no aparece una pantalla modal que tape el juego**. El tablero permanece visible y se transforma en una revisión del incidente:

- `💥` marca exactamente la casilla que provocó la derrota.
- `💣` revela cada amenaza que seguía oculta.
- `🚩` conserva las amenazas que fueron marcadas correctamente.
- Un borde rojo identifica las banderas colocadas sobre casillas seguras.
- Un resumen superior informa cuántas amenazas había, cuántas permanecían ocultas y cuántas banderas fueron correctas o incorrectas.

En la parte superior del tablero aparecen las opciones **Reintentar nivel**, **Cambiar nivel**, **Imprimir / PDF** y **Portada**, sin ocultar la ubicación de las amenazas.

## Controles

### Computador

- Clic principal: revelar.
- Clic derecho: poner o retirar bandera.
- Botón **Modo bandera**: alternar el comportamiento del clic.
- `Esc`: pausar o continuar.
- Durante la partida: pausa, reinicio y regreso a portada.
- Después de una derrota: reintentar nivel, cambiar nivel, imprimir/PDF y regresar a portada, todos en la parte superior del tablero.

### Celular o tableta

- Toque: revelar.
- Pulsación larga: poner o retirar bandera.
- **Modo bandera**: alternativa accesible a la pulsación larga.
- El tablero mantiene todas sus filas y columnas. En nivel difícil se desplaza horizontalmente; la lógica de 16×30 y 99 amenazas no se reduce.

## Temporizador, pausa y estadísticas

El temporizador puede desactivarse antes de iniciar. La pausa detiene el conteo y bloquea el tablero. Si la pestaña pasa a segundo plano, la partida se pausa automáticamente. Se guardan por jugador: partidas, victorias, derrotas, score acumulado, mejor score, mejor tiempo y última fecha de juego.

## Score `ciberaula:score:v1`

El juego usa la clave compartida `ciberaula:score:v1`, conserva datos preexistentes que reconoce y mantiene respaldo específico en `ciberaula:score:v1:ciberaula-ciberamenazas`.

Emite:

```js
window.addEventListener('ciberaula:score:v1', event => {
  console.log(event.detail);
});
```

Si está incorporado en un `iframe`, también publica:

```js
{ type: 'ciberaula:score:v1', payload: { /* estado */ } }
```

La portada puede consultar el estado con:

```js
iframe.contentWindow.postMessage({
  type: 'ciberaula:score:v1',
  action: 'request_state'
}, '*');
```

Dentro del juego también está disponible:

```js
window.CiberaulaScoreV1.getState();
```

Se emiten `game_start`, `score_update` y `game_complete`. El resultado final se suma una sola vez al score acumulado.

## Puntuación entregada

- Casilla segura: `10 × multiplicador`.
- Bandera correcta al ganar: `25 × multiplicador`.
- Bono de victoria: `50 × amenazas × multiplicador`.
- Con temporizador: bono decreciente de hasta `600 × multiplicador`.
- Una derrota conserva los puntos obtenidos por análisis seguro, pero no entrega bonos de victoria.

## Impresión o PDF

Al ganar, el aviso de resultado incluye **Imprimir / Guardar PDF** y genera una ficha limpia con jugador, dificultad, tiempo, score y consejo final. Al perder, la opción **Imprimir / PDF** de la barra superior conserva el resumen y el tablero revelado para documentar dónde estaban las amenazas. En el diálogo de impresión del navegador elija **Guardar como PDF**.

## Prueba local y validación

Desde la carpeta que contiene `/juegos/`:

```bash
python3 -m http.server 8000
```

Abra `http://localhost:8000/juegos/ciberaula-ciberamenazas/`.

Pruebas automatizadas opcionales:

```bash
cd juegos/ciberaula-ciberamenazas
npm test
```

Verifican niveles, cantidades de amenazas, zona inicial 3×3 segura, revelado expansivo, banderas, victoria, revelación completa de amenazas al perder, revisión sin modal, controles superiores, modularidad y ausencia de dependencias de red.

## Privacidad

El nombre y las estadísticas permanecen en `localStorage` del navegador. El juego no transmite datos a servicios externos. Solo comparte estado con la portada contenedora mediante eventos locales y `postMessage` cuando existe un contenedor.
