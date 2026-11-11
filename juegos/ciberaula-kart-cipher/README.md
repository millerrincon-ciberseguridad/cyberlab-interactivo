# CiberAula: Kart Cipher · Grid & Defensive Powers v7

Esta versión se construyó exclusivamente sobre una **copia aislada** de `ciberaula-kart-cipher-contact-physics-v6.zip`. La base v6 no se elimina, mueve, renombra ni sobrescribe.

El trabajo se limitó a los puntos solicitados: transparencia y sombra del kart, parrilla de salida, prevención de amontonamientos, poderes **Turbo Seguro** y **Parche Activo**, y consistencia visual de los rivales. Se conservan las demás funciones aprobadas.

## Transparencia y sombra natural

Se revisaron el sprite del jugador y los cinco rivales:

- todos permanecen en PNG RGBA;
- los píxeles totalmente transparentes ahora tienen RGB negro neutro;
- se eliminaron residuos alfa inferiores a 10/255;
- se suavizaron únicamente los píxeles de transición del borde;
- no se dibuja ninguna capa rectangular de iluminación detrás del sprite;
- se eliminó el desenfoque de sombra aplicado directamente al rectángulo de la imagen;
- la iluminación permanece integrada en el propio sprite;
- la única sombra exterior es una elipse de contacto bajo las ruedas.

Esto elimina cuadros o bordes rectangulares sin perder la silueta del kart y del personaje Anonymous.

## Parrilla de salida

La carrera comienza con una parrilla de seis posiciones:

- jugador y cinco rivales en dos carriles alternos;
- separación longitudinal y lateral suficiente para que las cajas orientadas no se solapen;
- cuenta regresiva que mantiene todos los vehículos inmóviles;
- retardos de reacción diferentes por rival;
- respuesta inicial de acelerador diferente;
- carriles de incorporación conservados durante la primera fase de aceleración;
- convergencia progresiva a la trazada de carrera, sin teletransportes.

## Prevención de amontonamientos

La IA añade:

- distancia de seguridad proporcional a la velocidad;
- predicción de distancia futura usando velocidad de cierre;
- medición de ocupación delante y detrás de cada carril candidato;
- penalización de carriles con obstáculos o vehículos cercanos;
- reducción preventiva de velocidad antes del contacto;
- fila controlada cuando no existe espacio seguro;
- adelantamiento planificado cuando aparece un hueco;
- defensa de posición únicamente si el carril sigue siendo seguro;
- cambios laterales mediante velocidad, resorte y amortiguación.

La física OBB de v6 continúa resolviendo contactos reales. La IA no desplaza rivales instantáneamente.

## Poder Turbo Seguro

La cápsula se muestra como **TURBO SEGURO** y se almacena en el espacio de protocolo hasta ser activada.

Efectos:

- duración: 6 segundos;
- incremento de aceleración;
- velocidad máxima temporal de hasta 134 %;
- medidor visible con tiempo restante;
- estela cian de velocidad;
- regreso progresivo a la velocidad normal al terminar.

Controles:

- teclado: `Q` o `Espacio`;
- botón **ACTIVAR** del panel;
- botón táctil **PODER**.

## Poder defensivo Parche Activo

La cápsula **PARCHE ACTIVO** equipa temporalmente un lanzador no violento:

- duración del equipo: 15 segundos;
- 3 cargas por recogida, hasta un máximo de 5;
- botón de disparo visible y contador de munición;
- selección automática del rival inmediatamente adelante;
- proyectil cian con guiado lateral moderado;
- sin objetivo válido, no consume munición;
- el impacto desacelera y hace girar temporalmente al rival;
- el rival se reincorpora de manera natural;
- ningún rival se elimina ni sufre daño permanente.

Controles:

- teclado: `E`;
- botón **DISPARAR** del panel;
- botón táctil **PARCHE**.

## Apariencia de los rivales

Se conservan karts y pilotos realistas con:

- perspectiva trasera coherente;
- escala calculada exclusivamente a partir de la profundidad;
- orientación interpolada con la curva y la trazada;
- sombra elíptica de contacto;
- PNG transparente sin cuadros;
- ruedas animadas según velocidad;
- suspensión, dirección y conductor animados;
- proporciones consistentes sin cambios bruscos de escala;
- iluminación cian y roja integrada en el recurso, sin rectángulos superpuestos.

## Funciones conservadas

- Física de contacto orientada de v6.
- Minimapa, vueltas, sectores y posición.
- Carreras largas de 4–5 vueltas.
- Drift con carga, humo, chispas y turbo al soltar.
- Malware y poderes de ciberseguridad rotulados.
- Anonymous en vista trasera dentro del kart.
- Captura del nombre y progreso local.
- Score `ciberaula:score:v1`.
- Resultados e impresión/guardado como PDF.
- Regreso a portada y `portal-card.html`.
- Fuente editable y distribución `dist/` para GitHub Pages.

## Controles resumidos

### Computador

- `W`/`↑`: acelerar.
- `S`/`↓`: frenar.
- `A/D` o flechas: dirigir.
- `Shift` + giro: drift.
- `Q` o `Espacio`: activar poder almacenado.
- `E`: disparar Parche Activo.
- `Escape`: pausa.

### Táctil

- dirección, drift, freno y acelerador;
- **PODER** para activar el protocolo almacenado;
- **PARCHE** para disparar cuando existe equipo y munición.

## Pruebas

Se ejecutan 21 casos tanto sobre `src/game.source.js` como sobre `dist/game.js`:

1. ausencia de capa rectangular y sombra elíptica;
2. parrilla separada en dos carriles;
3. inmovilidad durante la cuenta regresiva;
4. reacción y aceleración inicial diferenciadas;
5. incorporación progresiva;
6. ocupación de carril;
7. fila y adelantamiento planificados;
8. distancia de seguridad;
9. carrera con cinco rivales sin teletransportes;
10. recogida y activación de Turbo Seguro;
11. estela y recuperación del turbo;
12. equipo y munición de Parche Activo;
13. selección del rival inmediatamente adelante;
14. neutralización y reincorporación;
15. expiración sin eliminación de rivales;
16. controles de teclado;
17. controles táctiles en perfil móvil;
18. regresión de física de colisión;
19. consistencia visual de rivales;
20. carrera completa con los cinco rivales y clasificación;
21. regresión de minimapa, carreras, drift, malware, score, PDF y portada.

Ejecute:

```bash
npm run verify
```

## Instalación y estructura

```text
ciberaula-kart-cipher/
├── index.html
├── styles.css
├── game.js
├── portal-card.html
├── README.md
├── BUILDING.md
├── TEST-REPORT.md
├── package.json
├── assets/
├── src/game.source.js
├── tools/build.mjs
├── tests/qa.js
└── dist/
```

Copie la carpeta completa dentro de `/juegos/`, o publique el contenido de `dist/` en `/juegos/ciberaula-kart-cipher/`.
