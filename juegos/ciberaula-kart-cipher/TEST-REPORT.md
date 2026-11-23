# Informe de pruebas · Kart Cipher v8

Fecha: 20 de noviembre de 2026.

## Resultado

- **25/25 pruebas superadas en la fuente editable.**
- **25/25 pruebas superadas en la distribución minificada.**
- Sintaxis validada con `node --check`.
- Construcción reproducible mediante `npm run build`.
- Raíz y `dist/` conservan la estructura autónoma, los recursos y las rutas relativas.

## Correcciones verificadas

1. La profundidad lógica del jugador corresponde a la altura a la que se representa visualmente en la pista.
2. Las hitboxes del jugador y los rivales son más compactas que las cajas anteriores y excluyen márgenes transparentes.
3. Los siete tipos de obstáculo tienen perfiles de ancho y profundidad propios.
4. La comprobación usa simultáneamente carril y profundidad.
5. La posición lateral y longitudinal se captura antes del movimiento, se actualiza y se evalúa después.
6. El barrido continuo detecta un cruce aun cuando un cuadro avance más que el espesor del obstáculo.
7. Un obstáculo que ya quedó detrás al inicio del cuadro no puede generar una colisión tardía.
8. Un roce marginal conserva más del 90 % de la marcha, no activa animación de choque total y solo corrige lateralmente.
9. Un impacto central penaliza velocidad y control, pero no aplica una parada total.
10. Los contactos kart contra kart usan la misma profundidad visual sincronizada.

## Regresión funcional

Las pruebas también confirman que permanecen operativos:

- parrilla de seis posiciones y cuenta regresiva;
- IA, incorporación, distancia de seguridad, adelantamiento y defensa;
- cinco rivales y clasificación completa;
- drift, turbo, Parche Activo y proyectiles;
- minimapa, vueltas, sectores, score y progreso local;
- impresión/guardado en PDF, portada y tarjeta del portal;
- controles de teclado y táctiles;
- sprites PNG transparentes, sombras elípticas, ruedas, dirección y suspensión.

## Cobertura automatizada

Se ejecutan los mismos 25 casos contra:

- `src/game.source.js`;
- `dist/game.js` generado.

El entorno de pruebas usa DOM/Canvas determinista y simulaciones prolongadas. No había un navegador gráfico instalado en el contenedor; la validación visual se complementó con inspección de dimensiones/alfa de los sprites y comprobación de las fórmulas que relacionan pantalla, carril y profundidad.

## Repetición

```bash
npm run verify
```
