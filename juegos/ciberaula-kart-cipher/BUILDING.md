# Editar y regenerar Kart Cipher v7

## Requisitos

- Node.js 18 o posterior.
- No se requiere instalar paquetes ni ejecutar `npm install`.

## Qué archivo editar

Edite únicamente:

```text
src/game.source.js
```

La fuente editable conserva nombres descriptivos. No edite manualmente `game.js` ni `dist/game.js`, porque son archivos generados.

Para estilos, estructura y recursos puede editar:

```text
index.html
styles.css
portal-card.html
assets/
```

## Generar la versión publicada

Desde `ciberaula-kart-cipher/` ejecute:

```bash
npm run build
```

El constructor `tools/build.mjs`:

1. lee `src/game.source.js`;
2. elimina comentarios y espacios prescindibles;
3. cambia de forma determinista nombres internos seleccionados;
4. genera `game.js` en la raíz;
5. vuelve a crear `dist/` con HTML, CSS, JavaScript y recursos listos para publicar.

El proceso no necesita acceso a Internet.

## Probar fuente y distribución

```bash
npm run verify
```

También puede ejecutar por separado:

```bash
npm test
npm run test:dist
```

- `npm test` prueba la fuente editable.
- `npm run test:dist` prueba el JavaScript publicado.

## Publicar en GitHub Pages

Opción recomendada:

1. ejecute `npm run verify`;
2. copie el **contenido** de `dist/` en la ruta publicada `/juegos/ciberaula-kart-cipher/`;
3. conserve en su repositorio de desarrollo `src/`, `tools/` y `tests/`;
4. publique el sitio.

Si el repositorio ya usa la carpeta raíz del juego como ubicación pública, puede publicar directamente `index.html`, `styles.css`, `game.js` y `assets/` de la raíz; contienen la misma versión generada.

## Alcance de la protección

La minificación y el cambio de identificadores dificultan la lectura y copia casual del código desplegado. **No proporcionan secreto ni imposibilidad de copia.** Cualquier aplicación web entrega al navegador los recursos necesarios para ejecutarse. No coloque contraseñas, tokens, secretos ni datos sensibles en el código fuente o la distribución.

## Flujo recomendado

```text
Editar src/game.source.js
        ↓
npm run verify
        ↓
Revisar dist/
        ↓
Publicar el contenido de dist/
```
