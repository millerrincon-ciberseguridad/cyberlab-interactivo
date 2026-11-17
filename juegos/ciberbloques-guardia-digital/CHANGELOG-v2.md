# Cambios — versión 2.0.0

## Corrección integral de líneas

- Nuevo `board-engine.js` sin dependencias de Canvas o DOM.
- Fijación atómica de piezas sobre una copia validada de la matriz.
- Rechazo completo de piezas parcialmente fuera de la zona visible superior; no se escriben fragmentos.
- Detección de todas las filas completas sobre una instantánea estable.
- Capa de animación independiente que contiene únicamente los índices y la copia de las filas detectadas.
- Pieza activa eliminada antes de la animación; no existe pieza fantasma mientras se resuelven líneas.
- Entradas de movimiento, giro, caída y reserva bloqueadas durante la resolución.
- Eliminación simultánea con orden canónico inferior-superior.
- Una sola compactación mediante filas vacías nuevas más filas supervivientes.
- Validación posterior de altura, ancho, valores y recuento de celdas.
- Generación de la siguiente pieza únicamente después de terminar el colapso.
- Los Canvas se limpian antes de cada render y las funciones de dibujo no reciben permiso para modificar la matriz.

## Pruebas

Se incluye una suite de 14 pruebas automatizadas que cubre:

- Eliminación de 1, 2, 3 y 4 filas.
- Filas no consecutivas resueltas por una misma fijación.
- Fila superior.
- Pieza parcialmente fuera de la zona visible.
- Fijación de una pieza procedente de reserva.
- Matriz rectangular y filas independientes.
- Valores válidos y dimensiones constantes.
- Recuento exacto de celdas antes y después del colapso.
- Orden estable de supervivientes y ausencia de bloques huérfanos.
- Instantáneas inmutables.
- Rechazo de solapamientos.

Ejecutar con:

```bash
npm test
```

## Compatibilidad conservada

Se mantienen imagen de fondo, panel educativo, nombre del jugador, marcador local, `ciberaula:score:v1`, niveles, controles de teclado/mouse/táctiles, siguiente pieza, reserva, pausa, informe imprimible/PDF, regreso a la portada, tarjeta HTML y configuración de logo.
