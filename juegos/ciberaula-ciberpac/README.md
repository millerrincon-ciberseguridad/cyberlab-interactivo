# CiberPAC — carpeta independiente para Ciberaula

## Instalación

1. Descomprime el ZIP.
2. Copia la carpeta completa `ciberaula-ciberpac` dentro de `juegos/`.
3. Conserva los nombres y la estructura de todos los archivos.
4. Si la portada todavía no tiene la tarjeta del juego, abre `tarjeta-portada.html` y copia el fragmento en el contenedor de tarjetas del `index.html` principal.
5. Publica los cambios y recarga GitHub Pages con `Ctrl + F5`.

La ruta final prevista es:

```text
/juegos/ciberaula-ciberpac/index.html
```

El botón **Regresar a la portada** utiliza `../../index.html`.

## Cambios de esta versión

- Cuando CiberPAC neutraliza un fantasma, desaparece la figura y **solo el letrero con el nombre del riesgo** —PHISHING, VISHING, RANSOMWARE, SPYWARE, TROYANO o SMISHING— recorre el laberinto hasta la cárcel.
- El letrero en retorno incluye una marca de verificación y conserva el color del riesgo para hacer gráfica su eliminación.
- Tablero lógico de 408 × 456 px y presentación móvil reducida a un máximo de 332 px de ancho en teléfonos.
- Sin desplazamiento horizontal; controles táctiles, por deslizamiento, flechas y WASD.
- Imagen local de Anonymous con máscara de Guy Fawkes visible detrás de la interfaz y dentro del tablero, con desenfoque y contraste controlados.
- Cinco niveles, dificultad progresiva, seis riesgos y seis fortalezas.
- Captura y persistencia del nombre del jugador.
- Puntaje compartido mediante `ciberaula:score:v1`, evento DOM, `postMessage`, `localStorage` y `window.CiberaulaScoreV1.getState()`.
- Resultado imprimible o guardable como PDF al completar los cinco niveles.

## Archivos

```text
ciberaula-ciberpac/
├── index.html
├── styles.css
├── app.js
├── tarjeta-portada.html
├── README.md
├── assets/
│   ├── anonymous-fondo.webp
│   └── logo.png
└── tests/
    └── test_ciberpac.py
```

## Verificación rápida

1. Escribe un nombre e inicia la misión.
2. Confirma que los seis fantasmas salen de la cárcel y recorren pasillos válidos.
3. Recoge un rombo de fortaleza; los fantasmas deben ponerse azules.
4. Toca uno mientras esté vulnerable: debe convertirse en un letrero con el nombre del riesgo y regresar a la cárcel.
5. Reduce el navegador a aproximadamente 390 × 844 px y verifica que el tablero y los controles no produzcan desplazamiento horizontal.
6. Comprueba que se vea la figura de Anonymous en el fondo.

## Nota técnica

El juego funciona como sitio estático y no requiere servidores, bibliotecas externas ni conexión después de haber cargado sus archivos. Como todo contenido publicado en GitHub Pages, su HTML, CSS, JavaScript e imágenes deben descargarse al navegador y no pueden ocultarse por completo.
