# Informe de validación · CiberAmenazas v1.1.0

Fecha: 24 de noviembre de 2026.

## Resultado

- **15/15 pruebas funcionales superadas** con `node tests/qa.js`.
- Sintaxis válida en `app.js`, `core.js` y `config.js` mediante `node --check`.
- **300 distribuciones adicionales** verificadas: 100 por cada dificultad.
- **9/9 recursos principales** cargaron con HTTP 200 desde un servidor estático local.
- HTML analizado sin errores de lectura y rutas locales comprobadas.
- No hay dependencias externas, llamadas `fetch`, CDN ni requisitos de compilación.

## Casos verificados

1. Fácil: 9×9 y 10 amenazas.
2. Medio: 16×16 y 40 amenazas.
3. Difícil: 16×30 y 99 amenazas.
4. Cantidad exacta de amenazas en todas las distribuciones.
5. Primer toque libre de amenazas.
6. Zona inmediata 3×3 libre de amenazas, también en bordes y esquinas.
7. El primer toque tiene contador cero y permite revelado expansivo.
8. La expansión nunca abre una amenaza.
9. Las banderas bloquean la revelación y respetan el contador disponible.
10. La victoria exige revelar todas las casillas seguras.
11. Núcleo lógico modular e independiente del DOM.
12. Controles de mouse, clic derecho, toque, pulsación larga y modo bandera.
13. Pausa manual con `Esc` y pausa automática al ocultar la pestaña.
14. Temporizador opcional y detenido durante la pausa.
15. Reinicio y nueva misión.
16. Diseño adaptativo con tablero desplazable, sin reducir 16×30 en móvil.
17. Victoria con diálogo de resultado e impresión o guardado como PDF.
18. Derrota sin diálogo modal: el tablero permanece visible.
19. Revelación de todas las amenazas ocultas después de activar una amenaza.
20. Distinción visual entre casilla detonada, amenazas ocultas, banderas correctas y banderas incorrectas.
21. Opciones de reintento, cambio de nivel, impresión/PDF y portada en la parte superior del tablero.
22. Impresión del tablero revelado después de una derrota.
23. Captura de jugador y estadísticas persistentes.
24. Integración, consulta y eventos `ciberaula:score:v1`.
25. Configuración reunida y señalizada en `config.js`.
26. Rutas de regreso a portada, logo, fondo y tarjeta del portal.
27. Ausencia de URLs y recursos de red dentro del juego publicable.

## Recurso visual

El fondo local reutiliza el recurso aprobado de Ciberaula con representación realista de Anonymous y máscara de Guy Fawkes, aplicado con desenfoque, oscurecimiento y paneles de contraste. El logo institucional se conserva como recurso local configurable.

## Ejecución

```bash
npm test
```

No requiere instalación de paquetes: el comando usa únicamente Node.js y módulos integrados.
