# CiberArkanoid para Ciberaula

Juego incorporable e independiente inspirado en la mecánica de romper tabiques. No necesita compilación, dependencias ni servicios externos.

## Contenido de la carpeta

```text
ciberaula-ciberarkanoid/
├── index.html
├── styles.css
├── app.js
├── tarjeta-portada.html
├── README.md
└── assets/
    └── anonymous-cyber-breaker-bg.jpg
```

- `index.html`: punto de entrada del juego.
- `styles.css`: diseño responsive y adaptación a computador/celular.
- `app.js`: mecánica, cinco niveles, estadísticas y protocolo de integración.
- `tarjeta-portada.html`: fragmento listo para copiar manualmente en la portada.
- `assets/anonymous-cyber-breaker-bg.jpg`: imagen original creada para este juego; no depende de una URL externa.

## Instalación en GitHub Pages

1. Descomprima el ZIP.
2. Copie **solo la carpeta `ciberaula-ciberarkanoid`** dentro de la carpeta `juegos` del proyecto vigente:

```text
raiz-del-sitio/
├── index.html
└── juegos/
    └── ciberaula-ciberarkanoid/
        └── index.html
```

3. No reemplace ningún archivo del paquete principal de Ciberaula.
4. Abra `ciberaula-ciberarkanoid/tarjeta-portada.html` y copie su contenido en la cuadrícula o sección de juegos de la portada.
5. Publique los cambios con el flujo normal de GitHub Pages.

La tarjeta abre:

```text
./juegos/ciberaula-ciberarkanoid/index.html
```

El botón **Regresar a la portada** usa:

```text
../../index.html
```

Esta ruta es compatible cuando el juego se instala en `/juegos/ciberaula-ciberarkanoid/`.

> Si la portada principal no se llama `index.html` o la carpeta se instala en otra ubicación, ajuste ambos `href` antes de publicar.

## Prueba local

Desde la raíz del sitio (no desde dentro de la carpeta del juego), ejecute por ejemplo:

```bash
python3 -m http.server 8000
```

Después abra:

```text
http://localhost:8000/juegos/ciberaula-ciberarkanoid/
```

Compruebe que:

1. el nombre del jugador es obligatorio;
2. la barra responde al mouse, a las flechas y al arrastre táctil;
3. tocar o hacer clic lanza la esfera;
4. los tabiques verdes `◆ DEFENSA` sueltan poderes y los rojos `! INFECTADO` sueltan amenazas;
5. se muestra un aviso de nivel completado en cada uno de los cinco niveles;
6. el botón de portada abre `http://localhost:8000/index.html`;
7. las estadísticas persisten al recargar la página.

## Mecánica educativa

### Poderes buenos

- **Escudo antimalware**: neutraliza la siguiente amenaza capturada.
- **MFA**: amplía temporalmente la barra.
- **VPN**: reduce temporalmente la velocidad de la esfera.
- **Parche de seguridad**: recupera una vida, hasta un máximo de cinco.

### Amenazas que deben evadirse

- **Malware**: reduce temporalmente la barra.
- **Phishing**: descuenta score.
- **Ransomware**: descuenta score y una vida.

La exigencia aumenta mediante más filas y columnas, mayor velocidad, barra más estrecha, más tabiques reforzados y más amenazas.

## Integración `ciberaula:score:v1`

El juego usa el mismo patrón de integración mediante evento DOM, `postMessage` y persistencia local.

### Evento DOM

```js
window.addEventListener('ciberaula:score:v1', (event) => {
  console.log(event.detail);
});
```

### `postMessage` al incorporarlo en un `iframe`

```js
window.addEventListener('message', (event) => {
  if (event.data?.type === 'ciberaula:score:v1') {
    console.log(event.data.payload);
  }
});
```

### Persistencia local

```text
ciberaula:score:v1:ciberarkanoid
```

Por jugador se conservan:

- `games`: partidas iniciadas;
- `wins`: partidas que completaron los cinco niveles;
- `score`: score acumulado de partidas finalizadas;
- `bestScore`: mejor score de una partida;
- `lastPlayedAt`: fecha ISO de la última actividad.

Se emiten estos eventos:

```text
game_start
level_start
score_update
power_collect
threat_hit
life_lost
level_complete
game_complete
game_over
```

La portada puede solicitar el estado actual:

```js
iframe.contentWindow.postMessage({
  type: 'ciberaula:score:v1',
  action: 'request_state'
}, '*');
```

También se expone dentro del contexto del juego:

```js
window.CiberaulaScoreV1.getState();
```

> Si la portada y el juego se publican en orígenes distintos, restrinja `postMessage` al origen autorizado en la integración de producción.

## Privacidad y funcionamiento sin conexión

El nombre y las estadísticas se guardan únicamente en `localStorage` del navegador. El juego no envía datos a servicios externos y, una vez instalado, funciona sin conexión. Borrar los datos del navegador elimina las estadísticas locales.

## Accesibilidad y compatibilidad

- Canvas con etiqueta accesible y foco visible.
- Controles por mouse, tacto y teclado (`←`, `→`, `A`, `D`, espacio y `Esc`).
- Pausa automática al ocultar la pestaña.
- Contraste reforzado sobre el fondo y soporte de `prefers-reduced-motion`.
- Sin bibliotecas, fuentes ni recursos remotos.
- Compatible con navegadores modernos de escritorio y móvil.
