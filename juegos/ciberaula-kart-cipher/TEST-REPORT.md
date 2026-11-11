# Informe de pruebas · Kart Cipher v7

Fecha: 10 de noviembre de 2026.

## Resultado

- **21/21 pruebas superadas en la fuente editable.**
- **21/21 pruebas superadas en la distribución minificada.**
- Sintaxis validada con `node --check`.
- Recursos PNG auditados y limpiados conservando transparencia alfa.
- Raíz y `dist/` verificadas mediante carga HTTP local.
- ZIP base v6 comprobado por SHA-256 antes y después del trabajo.

## Cobertura

1. Sprite del jugador sin iluminación rectangular y con sombra elíptica.
2. Parrilla de seis posiciones separadas.
3. Cuenta regresiva sin movimiento prematuro.
4. Retardos de reacción y aceleración inicial diferenciados.
5. Carriles de incorporación progresivos.
6. Ocupación y riesgo delante/detrás de cada carril.
7. Formación en fila y adelantamiento planificado.
8. Frenado preventivo por distancia de seguridad.
9. Simulación prolongada con cinco rivales sin teletransportes.
10. Recogida, almacenamiento y activación de Turbo Seguro.
11. Medidor, estela y recuperación progresiva del turbo.
12. Equipo y munición limitada de Parche Activo.
13. Selección automática del rival inmediatamente adelante.
14. Proyectil, neutralización temporal y reincorporación.
15. Expiración del arma sin eliminación de rivales.
16. Teclas `Q`/`Espacio` y `E`.
17. Botones táctiles **PODER** y **PARCHE** en perfil `390×844`.
18. Regresión de física OBB kart contra kart.
19. Escala, transparencia lógica, ruedas, suspensión y dirección de rivales.
20. Carrera completa con cinco rivales, parrilla y clasificación.
21. Regresión de minimapa, carreras largas, drift, malware, poderes, score, PDF, portada y tarjeta.

## Transparencia

Los seis sprites de carrera se verifican como RGBA con alfa entre 0 y 255. Los píxeles con alfa inferior a 10 se convirtieron en transparencia total y color RGB neutro. La composición Canvas no contiene un `fillRect` del tamaño del sprite ni una sombra desenfocada aplicada al rectángulo de la imagen.

## Limitación del entorno

Las pruebas emplean un entorno determinista de DOM/Canvas y perfiles de viewport, además de inspección de imágenes y carga HTTP. El contenedor no dispone de un navegador gráfico; por tanto no se generan capturas reales de Chromium.

## Repetición

```bash
npm run verify
```
