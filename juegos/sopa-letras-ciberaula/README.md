# Sopa de Letras — CiberAula

Juego estático e independiente para incorporar **manualmente** a CiberAula. Este paquete no contiene, reemplaza ni modifica el paquete completo vigente.

## Contenido de la carpeta

```text
sopa-letras-ciberaula/
├── index.html
├── README.md
├── tarjeta-portada.html
└── assets/
    ├── anonymous-sopa-letras.webp
    ├── card-sopa-letras.webp
    ├── game.css
    └── game.js
```

## Funciones incluidas

- Cuatro niveles: 20, 30, 40 o 50 palabras.
- Banco de 50 términos relacionados con ciberseguridad.
- Selección en ocho direcciones, hacia adelante o en sentido inverso.
- Arrastre con mouse, lápiz o dedo; en celular también permite tocar la primera y la última letra.
- Las palabras encontradas quedan marcadas en la matriz y tachadas en la lista.
- No incluye pistas ni controles de ayuda.
- Captura el nombre del jugador y recuerda el último nombre con `ciberaula:last-player`.
- Registra la victoria y los puntos en `ciberaula:score:v1`.
- Aviso de misión completada a pantalla completa, con animación y resumen de resultados.
- Diseño adaptable para computador y celular.
- Imagen original de Anonymous creada específicamente para este juego y almacenada localmente.
- Sin dependencias externas, servidor, base de datos ni proceso de compilación.
- Compatible con GitHub Pages.

> En la matriz, las palabras se muestran en mayúsculas y sin tildes, como es habitual en una sopa de letras. La lista conserva la ortografía española.

## Instalación manual en CiberAula

1. **No elimines ni reemplaces ningún archivo o carpeta del paquete vigente.**
2. Descomprime el ZIP entregado.
3. Copia la carpeta completa `sopa-letras-ciberaula/` dentro de:

   ```text
   juegos/sopa-letras-ciberaula/
   ```

4. Comprueba que el archivo principal quede en:

   ```text
   juegos/sopa-letras-ciberaula/index.html
   ```

5. Abre `tarjeta-portada.html` y copia el fragmento dentro del contenedor de tarjetas de la portada, por ejemplo `#gameGrid`.
6. Publica los cambios en GitHub Pages.
7. Abre la portada, entra a **Sopa de Letras** y prueba una partida de 20 palabras.

## Si la portada usa `games-config.js`

Si las tarjetas se generan desde `window.CIBERAULA_GAMES`, agrega un objeto nuevo al arreglo existente. **No sustituyas el archivo completo.**

```js
{
  id: "juego-09",
  numero: "09",
  titulo: "Sopa de Letras",
  descripcion: "Encuentra 20, 30, 40 o 50 conceptos de seguridad digital arrastrando sobre la matriz.",
  etiqueta: "CIBERSEGURIDAD",
  imagen: "juegos/sopa-letras-ciberaula/assets/card-sopa-letras.webp",
  href: "juegos/sopa-letras-ciberaula/index.html"
}
```

Si en tu portada el número 09 ya está ocupado, cambia `id` y `numero` tanto en este objeto como en `tarjeta-portada.html`; la lógica del juego no depende de ese número.

## Integración con jugador y score

### Último jugador

El nombre se lee y escribe en:

```text
ciberaula:last-player
```

### Score compartido

El juego usa exactamente esta clave de `localStorage`:

```text
ciberaula:score:v1
```

Conserva la estructura de los demás juegos de CiberAula:

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

Al completar la matriz se registra una partida, una victoria, el score obtenido y un resultado de 100 %. La partida incompleta no modifica el score compartido.

### Cálculo del score

- Cada palabra: `100 + (5 × número de letras)` puntos.
- Bono por completar: `25 × cantidad de palabras`.
- Bono de rapidez: disminuye gradualmente según el tiempo empleado y nunca resta puntos.
- No existen pistas ni penalizaciones por pedir ayuda.

El botón **Consultar score** muestra el registro compartido de jugadores guardado en ese navegador. Como no hay servidor, cada navegador o dispositivo conserva su propio registro.

## Prueba local

Se recomienda servir los archivos por HTTP en lugar de abrirlos con `file://`.

Desde la carpeta que contiene `sopa-letras-ciberaula/`:

```bash
python3 -m http.server 8000
```

Después abre:

```text
http://localhost:8000/sopa-letras-ciberaula/
```

## Compatibilidad

Funciona en versiones modernas de Chrome, Edge, Firefox y Safari con soporte para Pointer Events y `localStorage`. Todos los recursos usan rutas relativas y se sirven directamente en GitHub Pages.

## Personalización controlada

- Fondo del juego: `assets/anonymous-sopa-letras.webp`.
- Imagen de la tarjeta: `assets/card-sopa-letras.webp`.
- Estilos: `assets/game.css`.
- Banco de palabras y lógica: `assets/game.js`.
- Fragmento de portada: `tarjeta-portada.html`.

Si cambias el banco de palabras, conserva 50 términos únicos y evita expresiones de más de 16 letras sin espacios para mantener la generación estable en todos los niveles.
