# CiberAula — portada general + Juego 01 “Detecta el Phishing”

Proyecto estático listo para GitHub Pages. Incluye una portada general con siete tarjetas y el primer juego completamente conectado.

## Publicar en GitHub Pages

1. Descomprime el ZIP.
2. Sube **el contenido de la carpeta**, no la carpeta contenedora, a la raíz de tu repositorio.
3. Comprueba que `index.html`, `assets/` y `juegos/` queden en la raíz.
4. En GitHub abre **Settings → Pages**.
5. En **Build and deployment**, selecciona **Deploy from a branch**.
6. Elige la rama `main` y la carpeta `/ (root)`. Guarda.

La portada se abrirá mediante `index.html`. El botón principal y la primera tarjeta abren automáticamente:

`juegos/detecta-phishing/index.html`

## DÓNDE ENLAZAR EL SIGUIENTE JUEGO

Abre:

`assets/js/games-config.js`

Busca este marcador:

`MODIFICA ESTE BLOQUE PARA ENLAZAR EL SIGUIENTE JUEGO`

Dentro del bloque `id: "juego-02"`, cambia:

```js
href: ""
```

por la ruta del siguiente juego, por ejemplo:

```js
href: "juegos/nombre-del-juego/index.html"
```

También puedes cambiar en el mismo bloque `titulo`, `descripcion` y `etiqueta`. Mientras `href` permanezca vacío, la tarjeta muestra **Próximamente** y no se puede abrir.

## Poner tu logo

La portada usa:

`assets/images/logo.png`

El Juego 01 usa:

`juegos/detecta-phishing/assets/logo.png`

Reemplaza ambos archivos por tu logo PNG usando exactamente esos nombres. Se recomienda una imagen cuadrada y transparente, de al menos 300 × 300 px.

## Agregar nuevas pruebas al Juego 01

Abre:

`juegos/detecta-phishing/pruebas.js`

El archivo conserva las **24 pruebas existentes**. Al final busca el bloque:

`AGREGA NUEVAS PRUEBAS JUSTO ENCIMA DE ESTE COMENTARIO`

Allí encontrarás una plantilla completa. Cópiala antes del cierre `];`, asigna un `id` nuevo —por ejemplo, `DP-025`— y conserva la coma entre pruebas.

Valores permitidos en `resultado`:

- `"phishing"`
- `"legitimo"` (sin tilde dentro del código)

No insertes HTML en los textos.

## Imágenes de Anonymous

Las siete imágenes adjuntas fueron recortadas antes del recuadro gris. Por eso los archivos del portal solo conservan la zona ilustrada de Anonymous y no contienen el panel gris:

`assets/images/cards/`

El juego usa además:

`juegos/detecta-phishing/assets/anonymous-phishing.webp`

## Contenido conservado en “Detecta el Phishing”

- 24 pruebas integradas y aleatorizadas.
- Partidas de 10, 20 o todas las pruebas.
- Casos por correo, SMS, Teams, WhatsApp, llamada, QR y red social.
- Pistas, temporizador, racha, puntaje, retroalimentación y repaso de errores.
- Atajos: `I` inspeccionar, `P` phishing, `L` legítimo y `N` siguiente.
- Diseño adaptable a computador, proyector y celular.
- Botón para volver a la portada general.
- Sin bases de datos ni servidor: funciona como sitio estático.

## Estructura principal

```text
index.html                         ← portada general
assets/
  css/portal.css
  js/games-config.js              ← EDITA AQUÍ EL ENLACE DEL SIGUIENTE JUEGO
  js/portal.js
  images/logo.png                 ← logo de la portada
  images/cards/                   ← imágenes sin recuadro gris
juegos/
  detecta-phishing/
    index.html                    ← Juego 01
    pruebas.js                    ← 24 pruebas + zona para agregar más
    assets/logo.png               ← logo del juego
```

© 2026 Miller Rincón Tautiva. Consulta `LICENCIA.txt`.
