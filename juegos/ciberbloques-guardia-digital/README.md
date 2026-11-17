# CiberBloques: Guardia Digital

**Versión 2.0.0 — motor determinista de líneas**

Juego web educativo independiente de bloques descendentes para **Ciberaula**. Funciona sin servidor, sin dependencias externas y sin proceso de compilación.

## Instalación en GitHub Pages

1. Descomprime el ZIP.
2. Copia la carpeta completa `ciberbloques-guardia-digital/` dentro de `/juegos/`.
3. La URL resultante será:

   ```text
   /juegos/ciberbloques-guardia-digital/
   ```

4. Agrega a la portada el contenido de `card-snippet.html` o adapta sus clases a la plantilla de Ciberaula.
5. Publica normalmente con GitHub Pages.

El juego no reemplaza ni modifica archivos existentes. Todos sus recursos se encuentran dentro de su propia carpeta.

## Configuración rápida

Edita `config.js`:

- `logo`: ruta del logo institucional. Puede ser SVG, PNG, JPG o WebP.
- `homeUrl`: ruta del botón **Regresar a la portada**. Por defecto: `../../index.html`.
- `title`: título visible del juego.
- `linesPerLevel`: líneas necesarias para subir de nivel.
- `initialDropMs`, `minimumDropMs`, `speedStepMs`: progresión de velocidad.
- `lineAnimationMs`: duración de la animación de filas detectadas antes del colapso.
- `leaderboardSize`: cantidad de mejores puntuaciones locales.

También puedes reemplazar `assets/logo-ciberaula.svg` conservando el mismo nombre.

## Puntuación e integración Ciberaula

El juego integra `ciberaula:score:v1` de tres formas:

1. Emite un `CustomEvent` en `window` con ese nombre.
2. Si está incorporado en un `iframe`, envía al contenedor:

   ```js
   {
     type: "ciberaula:score:v1",
     payload: { version, gameId, player, score, lines, level, reason, timestamp }
   }
   ```

3. Al terminar o reiniciar una partida con puntuación, acumula el resultado en `localStorage` bajo la clave `ciberaula:score:v1`.

El marcador local del juego usa `ciberbloques-guardia-digital:leaderboard:v1` y conserva hasta 8 resultados por defecto.

### Bonificaciones por líneas simultáneas

| Líneas | Identidad visual | Base × nivel |
|---:|---|---:|
| 1 | Línea segura · verde | 120 |
| 2 | Doble defensa · cian | 360 |
| 3 | Triple escudo · violeta | 720 |
| 4 | Muralla digital · dorado | 1.400 |

Las eliminaciones consecutivas añaden una bonificación de racha. La caída manual y la caída rápida también suman puntos.

## Motor determinista de tablero

La versión 2 separa la matriz lógica (`board-engine.js`) de la pieza activa, la proyección fantasma y la capa visual de animación. Cada fijación sigue una sola secuencia:

1. Copiar la pieza activa y fijarla atómicamente en una copia de la matriz.
2. Rechazar por completo la fijación si alguna celda ocupada queda fuera de la zona visible superior.
3. Detectar todas las filas completas sobre una instantánea estable.
4. Retirar la pieza activa y congelar movimientos, giro, descenso y reserva durante la animación.
5. Dibujar exclusivamente las filas detectadas en la capa de animación; el render no modifica la matriz.
6. Eliminar las filas detectadas simultáneamente, con orden canónico de abajo hacia arriba.
7. Insertar exactamente el mismo número de filas vacías arriba y compactar una sola vez.
8. Validar dimensiones, valores y número de celdas antes de generar la siguiente pieza.

### Pruebas automatizadas

Con Node.js instalado, desde la carpeta del juego ejecuta:

```bash
npm test
```

La suite incluida verifica 1, 2, 3 y 4 líneas; líneas no consecutivas completadas en una fijación; fila superior; pieza parcialmente fuera del área visible; pieza reservada; dimensiones constantes; valores permitidos; recuento de celdas; orden del colapso; ausencia de celdas huérfanas; instantáneas inmutables y rechazo de solapamientos.

## Controles

### Teclado

- `←` / `A`: mover a la izquierda.
- `→` / `D`: mover a la derecha.
- `↑` / `W`: girar.
- `↓` / `S`: descenso controlado.
- `Espacio`: caída rápida.
- `C`: reservar o intercambiar pieza.
- `P` / `Esc`: pausa.
- `R`: reiniciar.

### Mouse

- Clic en el tercio izquierdo o derecho del tablero: mover.
- Clic en el centro: girar.
- Clic derecho: caída rápida.
- Rueda hacia abajo: bajar; hacia arriba: girar.
- Los botones de interfaz también son utilizables con mouse.

### Pantalla táctil

En pantallas pequeñas aparece una barra táctil con movimiento, giro, reserva, descenso y caída rápida. Mantener pulsados izquierda, derecha o abajo activa repetición.

## Resultado imprimible / PDF

El botón **Resultado / PDF** abre el diálogo de impresión del navegador. Para guardar:

1. Pulsa el botón.
2. Selecciona **Guardar como PDF** como destino.
3. Confirma la ubicación y el nombre del archivo.

El reporte incluye jugador, puntuación, nivel, líneas, mejor combinación y fecha.

## Recursos y originalidad

- El nombre, interfaz, logo predeterminado, piezas, colores, animaciones y sonidos sintetizados fueron creados para este juego.
- El fondo es una imagen nueva generada para el proyecto y suavizada para mantener legible el tablero.
- No se incluyen marcas, música, sonidos, código, capturas ni activos del videojuego comercial de referencia.
- La mecánica se presenta como un juego original de ordenamiento de módulos descendentes con finalidad educativa.

## Archivos

```text
ciberbloques-guardia-digital/
├── index.html
├── styles.css
├── game.js
├── board-engine.js
├── config.js
├── card-snippet.html
├── README.md
├── CHANGELOG-v2.md
├── RECURSOS-Y-LICENCIA.md
├── package.json
├── tests/
│   └── board-engine.test.js
└── assets/
    ├── favicon.svg
    ├── fondo-anonymous.webp
    └── logo-ciberaula.svg
```

## Compatibilidad

Probado para navegadores modernos con Canvas, Dialog, Web Audio, `localStorage`, eventos personalizados y diseño responsivo. El juego pausa automáticamente cuando la pestaña pierde visibilidad.
