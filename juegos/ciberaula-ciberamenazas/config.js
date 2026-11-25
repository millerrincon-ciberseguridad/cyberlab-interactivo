/* ╔══════════════════════════════════════════════════════════════════════════╗
   ║ ZONA EDITABLE — CONFIGURACIÓN DE CIBERAMENAZAS                         ║
   ║ Cambie textos, rutas, colores y contenido educativo en este archivo.    ║
   ║ No necesita modificar app.js ni core.js.                                ║
   ╚══════════════════════════════════════════════════════════════════════════╝ */
window.CIBERAMENAZAS_CONFIG = {
  gameId: "ciberaula-ciberamenazas",
  gameName: "CiberAmenazas · Protocolo Buscaminas",
  shortName: "CiberAmenazas",
  homeHref: "../../index.html",
  logo: "assets/logo.png",
  logoAlt: "Logo institucional configurable",
  background: "assets/anonymous-ciberamenazas.webp",
  theme: {
    cyan: "#37e6ff",
    green: "#65f5a5",
    red: "#ff416c",
    amber: "#ffbf3f"
  },
  levels: {
    easy:   { label: "Fácil",   rows: 9,  cols: 9,  threats: 10, multiplier: 1, description: "Perímetro controlado" },
    medium: { label: "Medio",   rows: 16, cols: 16, threats: 40, multiplier: 2, description: "Red corporativa" },
    hard:   { label: "Difícil", rows: 16, cols: 30, threats: 99, multiplier: 3, description: "Infraestructura crítica" }
  },
  threats: [
    { name: "Ransomware", icon: "🔒" },
    { name: "Phishing", icon: "🎣" },
    { name: "Malware", icon: "🦠" },
    { name: "Robo de credenciales", icon: "👁" },
    { name: "Botnet", icon: "🕸" },
    { name: "Fuga de datos", icon: "⚠" }
  ],
  defenses: [
    { title: "MFA activado", icon: "🛡️", text: "Activa autenticación multifactor, preferiblemente con passkeys o una aplicación autenticadora." },
    { title: "Contraseña única", icon: "🔑", text: "Usa una contraseña larga y diferente para cada servicio; apóyate en un gestor confiable." },
    { title: "Parche al día", icon: "🧩", text: "Actualiza el sistema, el navegador y las aplicaciones para cerrar vulnerabilidades conocidas." },
    { title: "Copia verificada", icon: "💾", text: "Mantén copias de seguridad separadas y prueba periódicamente que se puedan restaurar." },
    { title: "Enlace inspeccionado", icon: "🔎", text: "Antes de hacer clic, comprueba el dominio real, el contexto y cualquier señal de urgencia." },
    { title: "Datos mínimos", icon: "🔐", text: "Comparte solo la información necesaria y verifica el destinatario antes de enviarla." },
    { title: "Dispositivo bloqueado", icon: "📱", text: "Protege tus equipos con bloqueo automático, cifrado y localización remota." },
    { title: "Reporte temprano", icon: "📣", text: "Si algo parece sospechoso, repórtalo pronto. Avisar a tiempo limita el impacto." },
    { title: "Wi‑Fi protegido", icon: "📶", text: "Evita operaciones sensibles en redes públicas o utiliza una conexión corporativa segura." },
    { title: "Permiso revisado", icon: "✅", text: "Revisa los permisos de aplicaciones y las solicitudes de consentimiento OAuth antes de aceptar." }
  ],
  scoring: {
    safeCell: 10,
    correctFlagOnWin: 25,
    winThreatBonus: 50,
    maxTimeBonus: 600
  },
  longPressMs: 520
};
