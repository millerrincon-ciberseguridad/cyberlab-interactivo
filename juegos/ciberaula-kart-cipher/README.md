# CiberAula: Kart Cipher · Neon Protocol

Juego web de carreras futuristas y ciberseguridad, autónomo y sin dependencias externas. Esta versión sustituye totalmente el concepto anterior mediante un motor de carretera seudotridimensional, horizonte tecnológico, kart táctico negro y rojo y piloto Anonymous coherente en todos los estados.

## Instalación

1. Descomprima `ciberaula-kart-cipher.zip`.
2. Copie **la carpeta completa** `ciberaula-kart-cipher/` dentro de `/juegos/` del repositorio CiberAula.
3. La ruta final debe ser `/juegos/ciberaula-kart-cipher/index.html`.
4. Inserte o adapte el bloque de `portal-card.html` en la cuadrícula de la portada.
5. Publique el repositorio. No se requiere compilación, CDN ni servidor externo.

El botón **Portada** usa `../../index.html`, correspondiente a la ruta solicitada.

## Controles

### Computador

- `W` o `↑`: acelerar.
- `S` o `↓`: frenar.
- `A/D` o `←/→`: girar y cambiar de carril.
- `Shift` + dirección: derrape controlado.
- `Espacio`: activar el protocolo de ciberseguridad disponible.
- `Escape`: pausar o continuar.
- Mouse: mantener presionado sobre la pista para acelerar y arrastrar a izquierda o derecha para dirigir.

### Teléfono y tableta

- Botones táctiles independientes para giro, derrape, freno, acelerador y protocolo.
- Distribución adaptable a orientación vertical u horizontal.
- La carrera se pausa si la pestaña pierde visibilidad.

## Sistema visual y animación

La vista de juego usa un recurso fotorrealista específico del kart del jugador, construido a partir de la referencia visual entregada. El personaje Anonymous está **sentado y visible dentro del kart desde atrás**: capucha, espalda del traje táctico negro y rojo, hombros y brazos permanecen integrados con el vehículo, bajo el alerón trasero.

La animación se calcula en tiempo real mediante `requestAnimationFrame` e incluye:

- rebote de suspensión y oscilación de la carrocería;
- inclinación progresiva al girar, esquivar y derrapar;
- movimiento óptico de neumáticos y reflejos de velocidad;
- aceleración, escape, humo, chispas, daño y escudo;
- salto, impacto y giro completo de recuperación;
- cinco rivales con sprites fotorrealistas independientes, pilotos visibles y siluetas propias.

Estados implementados: conducción, choque, esquiva, derrape, salto de rampa, celebración de victoria y giro de recuperación tras una colisión.

## Circuitos

1. **Neo Bogotá Firewall**: avenidas amplias, rampas y barreras de phishing.
2. **Distrito Zero Trust**: chicanas, drones botnet y rivales más agresivos.
3. **Bóveda Cuántica**: curvas enlazadas, saltos y malware polimórfico.

Cada circuito utiliza una placa panorámica 16:9 propia, con arquitectura plausible, iluminación físicamente coherente, profundidad atmosférica y acabado cinematográfico: ciudad Neo Bogotá, distrito Zero Trust y Bóveda Cuántica. El motor aplica paralaje, gradación, niebla luminosa y perspectiva de pista sin sacrificar el contraste de conducción.

## Rivales controlados por el juego

Cinco rivales usan un sistema adaptativo que incluye:

- lectura anticipada de curvas y reducción natural de velocidad;
- detección de obstáculos próximos;
- selección gradual de carril seguro;
- adelantamiento de vehículos más lentos;
- compensación moderada de distancia para conservar competencia;
- colisiones entre rivales y con el jugador;
- pérdida de velocidad, separación lateral y recuperación progresiva.

## Amenazas y protocolos

Amenazas: phishing, ransomware, botnet y malware. Protocolos disponibles: Firewall, Turbo VPN, Pulso MFA y Parche 0-Day.

## Integración de score

Al terminar una carrera, el juego acumula y publica el score con el contrato `ciberaula:score:v1`:

```js
window.dispatchEvent(new CustomEvent('ciberaula:score:v1', { detail }));
window.parent.postMessage(detail, '*');
```

También guarda el acumulado por jugador en `localStorage` con una clave derivada de:

```text
ciberaula:score:v1:ciberaula-kart-cipher:<jugador>
```

La carga útil contiene `gameId`, nombre del jugador, score de carrera, score acumulado, fecha ISO y metadatos de pista, posición, tiempo, objetos recogidos y golpes.

## Resultado e impresión

La pantalla final presenta piloto, circuito, posición, tiempo, score de carrera, score acumulado y clasificación. El botón **Imprimir / Guardar PDF** abre el diálogo del navegador con una hoja limpia preparada para impresión o PDF.

## Estructura

```text
ciberaula-kart-cipher/
├── index.html
├── styles.css
├── game.js
├── portal-card.html
├── README.md
└── assets/
    ├── anonymous-driver.png
    ├── character-reference.png
    ├── player_rear_kart.png
    ├── rival_blue.png
    ├── rival_red.png
    ├── rival_lime.png
    ├── rival_amber.png
    ├── rival_violet.png
    ├── skyline-neobogota.webp
    ├── skyline-zerotrust.webp
    ├── skyline-quantum.webp
    ├── kart-cipher-keyart.webp
    └── icon.svg
```

## Privacidad, originalidad y compatibilidad

- El nombre, el progreso y el score permanecen en el navegador.
- No se transmiten datos a servidores externos.
- No se cargan bibliotecas, fuentes, sonidos ni recursos desde CDN.
- Los sonidos se sintetizan localmente mediante Web Audio.
- La interfaz, el código, las pistas, los vehículos y los recursos visuales son originales para CiberAula.
- No contiene activos, nombres, personajes, marcas, música ni código de Nintendo.
- Requiere un navegador moderno compatible con Canvas 2D, Pointer Events, Web Audio, `localStorage` y `requestAnimationFrame`.

## Prueba local

Desde la carpeta que contiene `/juegos/`, ejecute:

```bash
python3 -m http.server 8000
```

Abra `http://localhost:8000/juegos/ciberaula-kart-cipher/` y pruebe teclado/mouse en computador y controles táctiles/orientaciones en las herramientas responsivas del navegador.
