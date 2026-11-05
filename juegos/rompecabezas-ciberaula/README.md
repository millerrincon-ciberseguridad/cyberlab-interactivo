# Rompecabezas — CiberAula

Juego estático e independiente para incorporar **manualmente** a CiberAula. No contiene ni reemplaza el paquete completo vigente.

## Contenido de esta carpeta

```text
rompecabezas-ciberaula/
├── index.html
├── README.md
├── tarjeta-portada.html
└── assets/
    ├── card-rompecabezas.webp
    ├── game.css
    ├── game.js
    └── puzzle-image.jpg
```

## Funciones incluidas

- 20, 50, 100 o 500 piezas con bordes y pestañas tradicionales de rompecabezas.
- Nombre del jugador compartido mediante `ciberaula:last-player`.
- Score compatible con `ciberaula:score:v1`.
- Guardado y reanudación automática de la partida.
- Contador de tiempo opcional: puede desactivarse antes de comenzar.
- Pistas visuales con descuento de 25 puntos.
- Bandeja paginada para manejar cómodamente hasta 500 piezas.
- Selección por toque y colocación en el tablero, además de arrastre con puntero.
- Zoom del tablero entre 75 % y 250 %, útil especialmente en celular.
- Diseño adaptable para computador y celular.
- Sin dependencias, compiladores, servidor ni recursos externos.
- Compatible con GitHub Pages.

## Instalación manual en CiberAula

1. **No elimines ni reemplaces archivos del paquete vigente.**
2. Copia esta carpeta completa en:

   ```text
   juegos/rompecabezas-ciberaula/
   ```

3. Confirma que la ruta final del juego sea:

   ```text
   juegos/rompecabezas-ciberaula/index.html
   ```

4. Abre `tarjeta-portada.html` y copia su fragmento dentro del contenedor de tarjetas de la portada, por ejemplo `#gameGrid`.
5. Publica los cambios del repositorio en GitHub Pages.
6. Abre la portada, entra a **Rompecabezas** y verifica una partida de 20 piezas.

### Si la portada se genera desde `games-config.js`

La portada vigente puede construir las tarjetas desde JavaScript. En ese caso, usa los mismos datos del fragmento HTML en un nuevo objeto de configuración, sin alterar los juegos existentes:

```js
{
  id: "juego-08",
  numero: "08",
  etiqueta: "IDENTIDAD DIGITAL",
  titulo: "Rompecabezas",
  descripcion: "Reconstruye la imagen de Anonymous, las redes sociales y CiberAula con 20, 50, 100 o 500 piezas.",
  imagen: "juegos/rompecabezas-ciberaula/assets/card-rompecabezas.webp",
  href: "juegos/rompecabezas-ciberaula/index.html"
}
```

Agrega el objeto al arreglo existente; **no sustituyas** el archivo de configuración completo.

## Integración con jugador, progreso y score

### Jugador

El último nombre utilizado se lee y escribe en:

```text
ciberaula:last-player
```

### Score compartido

El juego usa exactamente esta clave de `localStorage`:

```text
ciberaula:score:v1
```

Conserva la estructura utilizada por los demás juegos:

```js
{
  "nombre-normalizado": {
    name: "Nombre visible",
    games: 3,
    wins: 2,
    totalPoints: 5400,
    bestPercent: 100,
    lastPlayed: "fecha ISO"
  }
}
```

Al completar el rompecabezas se registra una partida, una victoria, los puntos obtenidos y un resultado de 100 %. Las pistas descuentan 25 puntos; cada pieza bien colocada suma 100 puntos.

### Partida en curso

El progreso propio del rompecabezas se guarda en:

```text
ciberaula:rompecabezas:progress:v1
```

Incluye dificultad, piezas colocadas, orden de la bandeja, puntaje, pistas, tiempo y jugador. Al terminar se elimina la partida temporal, pero el score compartido permanece.

## Prueba local

Por seguridad del navegador, se recomienda abrir el proyecto mediante un servidor local en vez de usar directamente `file://`.

Desde la carpeta que contiene `rompecabezas-ciberaula/`:

```bash
python3 -m http.server 8000
```

Después abre:

```text
http://localhost:8000/rompecabezas-ciberaula/
```

## Compatibilidad

Funciona en versiones modernas de Chrome, Edge, Firefox y Safari con soporte para Canvas, Pointer Events, `Path2D` y `localStorage`. GitHub Pages sirve todos los archivos tal como están; no se necesita proceso de construcción.

## Personalización controlada

- Imagen del juego: `assets/puzzle-image.jpg` — conservar relación 16:10 y el mismo nombre.
- Miniatura de portada: `assets/card-rompecabezas.webp` — conservar el mismo nombre.
- Textos de la tarjeta: `tarjeta-portada.html`.
- Estilos del juego: `assets/game.css`.

Si se reemplaza la imagen, usa un recurso de 1600 × 1000 px o relación 16:10 para evitar deformaciones.
