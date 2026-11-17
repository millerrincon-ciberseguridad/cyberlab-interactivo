# Ciberaula — Detecta el Phishing (edición avanzada)

Juego web estático, independiente y sin dependencias externas. Incluye **36 pruebas** de ingeniería social organizadas en cuatro niveles progresivos.

## Contenido del ZIP

```text
ciberaula-detecta-phishing/
├── index.html
├── manifest.webmanifest
├── tarjeta-portada.html
├── README.md
├── assets/
│   ├── anonymous-bg.svg
│   └── logo-configurable.svg
├── css/
│   └── styles.css
├── js/
│   ├── config.js
│   ├── tests.js          ← banco editable de pruebas
│   └── app.js
└── tests/
    └── validate.mjs
```

## Instalación en Ciberaula

1. Descomprima el ZIP.
2. Copie la carpeta completa `ciberaula-detecta-phishing` dentro de `/juegos/`.
3. Para reemplazar una edición anterior con la misma carpeta, conserve una copia de seguridad y sustituya solo esa carpeta.
4. Pegue el contenido de `tarjeta-portada.html` en la cuadrícula de juegos del `index.html` general.
5. Compruebe esta ruta:

   ```text
   /juegos/ciberaula-detecta-phishing/index.html
   ```

6. Publique normalmente en GitHub Pages. No requiere servidor, base de datos, compilación, CDN ni claves.

Este paquete **no modifica** el índice ni otros juegos de Ciberaula.

## Configuración rápida

Edite `js/config.js`:

- `homeUrl`: ruta del botón **Volver a la portada**. El valor predeterminado es `../../index.html`.
- `logoUrl`: ruta del logotipo. Sustituya `assets/logo-configurable.svg` por su logo o cambie la ruta.
- `logoAlt`: texto alternativo del logo.
- `backgroundUrl`: imagen de fondo difuminada.
- `shuffleWithinLevel`: mezcla las pruebas dentro de cada nivel sin romper la progresión.
- `scoreKey`: debe conservarse como `ciberaula:score:v1` para la integración compartida.

Se recomienda usar imágenes locales con rutas relativas para mantener compatibilidad con GitHub Pages.

## Score acumulable

El juego lee y actualiza `localStorage` con la clave:

```text
ciberaula:score:v1
```

El dato se guarda como un objeto JSON tolerante con puntajes previos:

```json
{
  "version": 1,
  "total": 1250,
  "updatedAt": "...",
  "games": {
    "detecta-phishing": {
      "lastPlayer": "Nombre",
      "lastDelta": 150,
      "lastPlayedAt": "..."
    }
  }
}
```

Por cada respuesta correcta también se emite en `window` el evento `ciberaula:score:v1`, con `gameId`, `player`, `delta` y `total` en `event.detail`.

## Cómo agregar nuevas pruebas

El único archivo que debe editarse es **`js/tests.js`**. Al comienzo del archivo también hay instrucciones.

1. Copie un objeto completo existente dentro de `window.PHISHING_TESTS`.
2. Cambie `id`; debe ser único. Use, por ejemplo, `L3-10`.
3. Asigne `level` entre 1 y 4.
4. Elija `type`: `email`, `sms`, `qr`, `call`, `chat`, `login`, `push` o `calendar`.
5. Defina `answer` como `phishing` o `legit`.
6. Incluya `title`, `senderName`, `sender`, `subject`, `body`, `signals`, `explanation` y `action`.
7. Agregue al menos tres señales. Use:
   - `danger`: evidencia sospechosa;
   - `safe`: evidencia legítima;
   - `context`: matiz o distractor que no decide por sí solo.
8. Para enlaces simulados, agregue `links: [{ label, url }]`. Los enlaces se muestran pero nunca son navegables.
9. Para adjuntos, use `attachment: { name, note }`.
10. Para QR, use `qr: { label, payload }`; el juego genera el patrón visual localmente.

Ejemplo mínimo:

```js
{
  id: "L2-10",
  level: 2,
  type: "email",
  answer: "phishing",
  points: 150,
  title: "Título visible",
  senderName: "Nombre mostrado",
  sender: "cuenta@dominio.example",
  subject: "Asunto",
  time: "09:30",
  body: ["Primer párrafo", "Segundo párrafo"],
  links: [{ label: "Abrir", url: "https://destino.example/acceso" }],
  signals: [
    { kind: "danger", label: "Señal", detail: "Explicación concreta." },
    { kind: "danger", label: "Otra señal", detail: "Por qué importa." },
    { kind: "context", label: "Distractor", detail: "Por qué no prueba legitimidad." }
  ],
  explanation: "Conclusión educativa del caso.",
  action: "Conducta segura recomendada."
}
```

### Validación del banco

Con Node.js 18 o posterior, desde la carpeta del juego:

```bash
node tests/validate.mjs
```

El validador comprueba cantidad mínima, IDs únicos, niveles, respuestas y señales educativas.

## Funciones incluidas

- Captura y recuerdo local del nombre del jugador.
- 36 pruebas en cuatro niveles progresivos.
- Correo, SMS/smishing, QR/quishing, vishing, MFA, OAuth, BEC, Unicode, adjuntos, calendarios, chats, clonación de voz, AiTM y técnicas modernas.
- Inspector técnico de remitente, dominio, enlaces, QR y adjuntos.
- Pistas opcionales con penalización de 30%.
- Rachas, bonificaciones y score acumulable.
- Retroalimentación detallada de señales sospechosas, legítimas y contextuales.
- Avisos visuales, sonidos opcionales y atajos de teclado.
- Diseño responsivo para computador y celular.
- Accesibilidad básica: foco visible, regiones ARIA, teclado y reducción de movimiento.
- Resultado imprimible o guardable como PDF mediante el diálogo del navegador.
- Fondo local difuminado de Anonymous y logo configurable.
- Enlaces simulados no navegables y dominios reservados `.example`.

## Guardar resultado como PDF

Al finalizar, pulse **Imprimir o guardar como PDF** y seleccione “Guardar como PDF” en el diálogo del navegador. La hoja de impresión oculta el juego y muestra únicamente el informe final.

## Pruebas recomendadas antes de publicar

- Computador: Chrome, Edge o Firefox actual.
- Celular: orientación vertical, ancho aproximado de 360 px.
- Completar al menos una respuesta de cada tipo de canal.
- Probar pista, inspector técnico, sonido, reinicio y resultado impreso.
- Confirmar que “Volver a la portada” resuelve correctamente según la ubicación final.
- Confirmar que el score aparece en `localStorage` bajo `ciberaula:score:v1`.

## Seguridad y privacidad

No se recopilan ni transmiten datos. Todo funciona localmente en el navegador. Los dominios `.example` son reservados para documentación y las direcciones se muestran como texto no navegable.
