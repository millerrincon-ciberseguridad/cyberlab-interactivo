# CiberEscuadrón 1942 · juego incorporable para Ciberaula

Juego HTML5 autónomo de combate aéreo y ciberseguridad. Esta edición conserva la presentación uniforme de Ciberaula, el fondo local de Anonymous con casco de piloto, la captura del nombre, el regreso a la portada, los controles con mouse/táctil/teclado, los superpoderes y la integración `ciberaula:score:v1`.

## Contenido de la carpeta independiente

```text
ciberaula-ciberescuadron-1942/
├── index.html
├── styles.css
├── game-config.js
├── app.js
├── tarjeta-portada.html
├── README.md
├── package.json
├── tests/
│   └── verify-game.mjs
└── assets/
    └── anonymous-piloto-fondo.jpg
```

No usa bibliotecas, compilación, servidor ni recursos remotos. `package.json` solo facilita ejecutar las pruebas; el juego funciona abriendo `index.html` o publicando la carpeta tal cual.

## Instalación en GitHub Pages

1. Descomprima el ZIP.
2. Copie **únicamente** la carpeta `ciberaula-ciberescuadron-1942` dentro de `/juegos/` del repositorio vigente.
3. Copie el fragmento de `tarjeta-portada.html` al contenedor de tarjetas de la portada.
4. Publique el sitio normalmente.

El botón **Regresar a la portada** usa `../../index.html`, por lo que funciona en `/juegos/ciberaula-ciberescuadron-1942/` incluso cuando GitHub Pages publica el repositorio bajo un subdirectorio.

> El paquete es independiente: no reemplaza ni modifica archivos del paquete general vigente de Ciberaula.

## Diez niveles y duración

Cada nivel contiene una cantidad exacta de aeronaves enemigas. Solo se crean hasta ese total; si una aeronave sobrevive una pasada o colisiona, sale del área, regresa por la parte superior y sigue disparando hasta ser destruida. Esto evita que una amenaza desaparezca sin contabilizarse y prolonga realmente cada nivel.

| Nivel | Operación | Enemigos | Intervalo inicial | Velocidad | HP base | Simultáneos | Pesado cada |
|---:|---|---:|---:|---:|---:|---:|---:|
| 1 | Radar básico | 20 | 1200 ms | 64 | 1 | 4 | — |
| 2 | Perímetro activo | 40 | 1080 ms | 72 | 1 | 5 | 10 |
| 3 | Tráfico sospechoso | 60 | 970 ms | 80 | 1 | 6 | 9 |
| 4 | Emboscada digital | 80 | 870 ms | 90 | 2 | 7 | 8 |
| 5 | Zona botnet | 100 | 780 ms | 100 | 2 | 8 | 7 |
| 6 | Bombardeo troyano | 120 | 700 ms | 112 | 2 | 9 | 6 |
| 7 | Cerco de gusanos | 140 | 630 ms | 124 | 2 | 10 | 5 |
| 8 | Asalto ransomware | 160 | 570 ms | 137 | 3 | 11 | 5 |
| 9 | Tormenta polimórfica | 180 | 510 ms | 151 | 3 | 12 | 4 |
| 10 | Cielo cero confianza | 200 | 460 ms | 166 | 3 | 13 | 3 |

Las cantidades verificadas son **20, 40, 60, 80, 100, 120, 140, 160, 180 y 200**.

La dificultad aumenta también mediante proyectiles progresivamente más rápidos, mayor frecuencia de disparo, más amenazas simultáneas, resistencia adicional por tramo y bombarderos pesados grandes. Los pesados tienen una silueta propia, mayor tamaño, disparo doble en niveles avanzados y entre 4 y 8 puntos de resistencia adicionales según el nivel.

## Aeronaves y avisos de malware

- El avión del jugador tiene fuselaje, alas, cola, cabina, paneles y dos estelas de motor definidos por vectores.
- Los cazas hostiles y bombarderos pesados usan siluetas diferentes, contorno, sombreado, cabina, paneles y barra de integridad.
- Cada enemigo lleva un aviso visible unido a su cola con el tipo completo: `PHISHING`, `MALWARE`, `SPYWARE`, `BOTNET`, `TROYANO`, `GUSANO` o `RANSOMWARE`.
- El Canvas adapta su resolución hasta `devicePixelRatio = 2` para mejorar la nitidez visual sin alterar las coordenadas de juego.

## Controles y superpoderes

- **Computador:** mouse, `WASD` o flechas.
- **Celular/tableta:** arrastre de un dedo mediante Pointer Events.
- **Disparo:** automático.
- **Pausa:** `P`, `Esc` o botón visible.
- **MFA:** triple disparo temporal.
- **Firewall:** absorbe impactos.
- **VPN:** ralentiza amenazas y proyectiles.
- **Parche:** recupera integridad.
- **Respaldo:** elimina proyectiles y daña amenazas visibles.

## Integración `ciberaula:score:v1`

Se mantienen:

- evento DOM `ciberaula:score:v1`;
- `postMessage` para integración en `iframe`;
- `window.CiberaulaScoreV1.getState()`;
- persistencia local `ciberaula:score:v1:ciberescuadron-1942`;
- nombre compartido en `ciberaula:last-player`;
- eventos `game_start`, `level_start`, `score_update`, `enemy_destroyed`, `power_collect`, `life_lost`, `level_complete`, `game_complete` y `game_over`.

El estado reporta nivel actual, total de 10 niveles, nombre del nivel, objetivo, derribos, integridad, poderes, score y estadísticas acumuladas.

## Pruebas incluidas

Desde esta carpeta, con Node.js 18 o posterior:

```bash
npm test
```

La prueba comprueba automáticamente:

1. que hay exactamente 10 niveles;
2. que los objetivos son exactamente 20, 40, 60, 80, 100, 120, 140, 160, 180 y 200;
3. que velocidad, frecuencia de ataque, proyectiles y concurrencia aumentan nivel a nivel;
4. que el intervalo de aparición disminuye progresivamente;
5. que existen enemigos pesados y avisos completos de malware;
6. que los enemigos que salen se reciclan y vuelven;
7. que se conservan el protocolo de score, Pointer Events, el fondo, las rutas de portada, la tarjeta HTML y este README.

## Privacidad, compatibilidad y accesibilidad

El nombre y las estadísticas se guardan solo en `localStorage`; no hay solicitudes de red. Compatible con versiones actuales de Chrome, Edge, Firefox y Safari en computador y móvil. Incluye Canvas responsive, foco visible, regiones de estado, etiquetas accesibles, contraste reforzado y compatibilidad con `prefers-reduced-motion`.
