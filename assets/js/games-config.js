/*
╔══════════════════════════════════════════════════════════════════════╗
║  CONTROL DE PUBLICACIÓN DE TARJETAS                                 ║
║                                                                      ║
║  Para bloquear una tarjeta cambia:  habilitado: true                ║
║  por:                              habilitado: false               ║
║                                                                      ║
║  No borres href. Así puedes habilitarla de nuevo cambiando solo      ║
║  false por true. Los juegos bloqueados no cuentan como disponibles.  ║
╚══════════════════════════════════════════════════════════════════════╝
*/
/*
╔══════════════════════════════════════════════════════════════════════╗
║  ZONA EDITABLE — ENLACES DE LOS JUEGOS                             ║
║                                                                      ║
║                                                                      ║
║  Para cambiar una tarjeta, edita titulo, descripcion, etiqueta,      ║
║  imagen y href. Usa siempre rutas relativas para GitHub Pages.       ║
║  Para añadir un Juego 08, copia un bloque, cambia su id y numero,    ║
║  agrega la imagen en assets/images/cards/ y apunta href a su HTML.   ║
╚══════════════════════════════════════════════════════════════════════╝
*/

window.CIBERAULA_GAMES = [
  {
    id: "juego-01",
    numero: "01",
    titulo: "Detecta el Phishing",
    descripcion: "Analiza mensajes simulados, descubre señales de engaño y elige la respuesta segura.",
    etiqueta: "24 PRUEBAS",
    imagen: "assets/images/cards/juego-01-phishing.webp",
    href: "juegos/detecta-phishing/index.html",
    habilitado: true
  },

  {
    id: "juego-02",
    numero: "02",
    titulo: "El hacker Vigila",
    descripcion: "Explora una oficina, encuentra riesgos ocultos y elige cómo neutralizarlos antes de que sean aprovechados.",
    etiqueta: "24 PRUEBAS",
    imagen: "assets/images/cards/juego-02.webp",
    href: "juegos/el-hacker-esta-dentro/index.html",
    habilitado: false
  },

  {
    id: "juego-03",
    numero: "03",
    titulo: "Construye una contraseña resistente",
    descripcion: "Combina fragmentos, evita patrones predecibles y refuerza cada acceso con una clave única y MFA.",
    etiqueta: "20 PRUEBAS",
    imagen: "assets/images/cards/juego-03.webp",
    href: "juegos/construye-contrasena-resistente/index.html",
    habilitado: false
  },

  {
    id: "juego-04",
    numero: "04",
    titulo: "Escape Room: recupera los archivos",
    descripcion: "Abre la bóveda comprometida, toma decisiones seguras y recupera archivos sin perder evidencia ni propagar el incidente.",
    etiqueta: "24 PRUEBAS",
    imagen: "assets/images/cards/juego-04.webp",
    href: "juegos/escape-room-recupera-los-archivos/index.html",
    habilitado: false
  },
  {
    id: "juego-05",
    numero: "05",
    titulo: "Semáforo del riesgo",
    descripcion: "Clasifica situaciones de Wi‑Fi, Bluetooth y conexiones en riesgo bajo, medio o alto, y aprende con cada decisión.",
    etiqueta: "24 PRUEBAS",
    imagen: "assets/images/cards/juego-05.webp",
    href: "juegos/semaforo-del-riesgo/index.html",
    habilitado: false
  },
  {
    id: "juego-06",
    numero: "06",
    titulo: "Ordena la respuesta al incidente",
    descripcion: "Ordena protocolos ante incidentes reales simulados, contiene el impacto y aprende qué acción debe ocurrir primero.",
    etiqueta: "24 PRUEBAS",
    imagen: "assets/images/cards/juego-06.webp",
    href: "juegos/ordena-respuesta-incidente/index.html",
    habilitado: false
  },
  {
    id: "juego-07",
    numero: "07",
    titulo: "Puesto Cero: incidente ransomware",
    descripcion: "Explora un puesto cifrado, resuelve 24 interacciones, reúne evidencia y reconstruye el código de recuperación.",
    etiqueta: "24 INTERACCIONES",
    imagen: "assets/images/cards/juego-07.webp",
    href: "juegos/puesto-cero-ransomware/index.html",
    habilitado: false
  },
 {
    id: "juego-08",
    numero: "08",
    titulo: "Arma tu Identidad Digital",
    descripcion: "Reconstruye la imagen de Anonymous, las redes sociales y CiberAula. Elige la dificultad, juega con o sin tiempo y solicita pistas cuando las necesites.",
    etiqueta: "1 INTERACCIÓN",
    imagen: "assets/images/cards/juego-08.webp",
    href: "juegos/rompecabezas-ciberaula/index.html",
    habilitado: false
  },
 {
    id: "juego-09",
    numero: "09",
    titulo: "Sopa de Letras",
    descripcion: "Encuentra terminología clave de seguridad digital.",
    etiqueta: "1 INTERACCIÓN",
    imagen: "assets/images/cards/juego-09.webp",
    href: "juegos/sopa-letras-ciberaula/index.html",
    habilitado: false
  },
 {
    id: "juego-10",
    numero: "10",
    titulo: "Crucigrama - Decifra la Red",
    descripcion: "Relaciona conceptos con sus definiciones de seguridad digital.",
    etiqueta: "1 INTERACCIÓN",
    imagen: "assets/images/cards/juego-10.webp",
    href: "juegos/ciberaula-crucigrama/index.html",
    habilitado: false
  },
 {
    id: "juego-11",
    numero: "11",
    titulo: "Arkanoid - Activa tu Defensa",
    descripcion: "Destruye todos los bloques y evita caer en la trampa del Ciberdelincuente.",
    etiqueta: "1 INTERACCIÓN",
    imagen: "assets/images/cards/juego-11.webp",
    href: "juegos/ciberaula-ciberarkanoid/index.html",
    habilitado: false
  },
 {
    id: "juego-12",
    numero: "12",
    titulo: "CiberEscuadrón - 1942",
    descripcion: "Realiza el giro evasivo perfecto y sobrevive a la batalla del Ciberespacio.",
    etiqueta: "10 INTERACCIONES",
    imagen: "assets/images/cards/juego-12.webp",
    href: "juegos/ciberaula-ciberescuadron-1942/index.html",
    habilitado: false
  },
 {
    id: "juego-13",
    numero: "13",
    titulo: "PacMan - Neutraliza el Riesgo",
    descripcion: "Adquiere protección y evita que el Malware te consuma.",
    etiqueta: "1 INTERACCIÓN",
    imagen: "assets/images/cards/juego-13.webp",
    href: "juegos/ciberaula-ciberpac/index.html",
    habilitado: false
  },
 {
    id: "juego-14",
    numero: "14",
    titulo: "2048 - Combina defensas - Desbloquea conocimiento.",
    descripcion: "Adquiere protección y evita que el Malware te consuma.",
    etiqueta: "1 INTERACCIÓN",
    imagen: "assets/images/cards/juego-14.webp",
    href: "juegos/ciberaula-2048-ciber/index.html",
    habilitado: true
  }

];
