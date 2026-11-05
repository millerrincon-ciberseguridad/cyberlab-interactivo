/*
╔══════════════════════════════════════════════════════════════════════╗
║  ZONA EDITABLE — PRUEBAS DE “CONSTRUYE UNA CONTRASEÑA RESISTENTE” ║
║                                                                      ║
║  Para agregar una prueba:                                           ║
║  1. Copia un objeto completo del arreglo.                            ║
║  2. Asígnale un id único (por ejemplo, CR-021).                      ║
║  3. Ajusta contexto, longitud, datos, palabras y fragmentos.         ║
║  4. Pégalo JUSTO ENCIMA del comentario final indicado.              ║
║                                                                      ║
║  Formato de cada fragmento: { t: "texto", r: "riesgo opcional" } ║
║  Riesgos admitidos: "personal", "comun" y "repetido".            ║
║  Deja r vacío u omítelo para un fragmento seguro.                    ║
╚══════════════════════════════════════════════════════════════════════╝
*/

window.PRUEBAS_CONTRASENA = [
  {
    id: "CR-001", titulo: "Correo institucional", tipo: "Frase de acceso",
    contexto: "Protege el correo donde recibes enlaces de restablecimiento y conversaciones de trabajo.",
    min: 16, simbolo: true, personales: ["ana", "1990", "bogota"], comunes: ["correo", "password", "123456"],
    fragmentos: [{t:"Faro"},{t:"Niebla"},{t:"7"},{t:"!"},{t:"Linterna"},{t:"Ana",r:"personal"},{t:"1990",r:"personal"},{t:"Correo",r:"comun"},{t:"123456",r:"comun"}],
    consejo: "Una frase larga, exclusiva y acompañada de MFA protege mejor el servicio que concentra tus recuperaciones."
  },
  {
    id: "CR-002", titulo: "Banca móvil", tipo: "Contraseña",
    contexto: "Crea una credencial distinta para una aplicación financiera de alto impacto.",
    min: 15, simbolo: true, personales: ["carlos", "medellin", "1987"], comunes: ["banco", "qwerty", "admin"],
    fragmentos: [{t:"Cobre"},{t:"Selva"},{t:"48"},{t:"#"},{t:"Laguna"},{t:"Carlos",r:"personal"},{t:"1987",r:"personal"},{t:"Banco",r:"comun"},{t:"qwerty",r:"comun"}],
    consejo: "Para finanzas, combina una clave única con el segundo factor y alertas de acceso."
  },
  {
    id: "CR-003", titulo: "Red social", tipo: "Frase de acceso",
    contexto: "Evita que una filtración de entretenimiento afecte tus cuentas importantes.",
    min: 16, simbolo: false, personales: ["laura", "gato", "2001"], comunes: ["instagram", "teamo", "1234"],
    fragmentos: [{t:"Bosque"},{t:"Orbita"},{t:"52"},{t:"_"},{t:"Ceniza"},{t:"Laura",r:"personal"},{t:"Gato",r:"personal"},{t:"TeAmo",r:"comun"},{t:"1234",r:"comun"}],
    consejo: "La exclusividad limita el daño: una clave filtrada no debería abrir ninguna otra cuenta."
  },
  {
    id: "CR-004", titulo: "Nube de documentos", tipo: "Frase de acceso",
    contexto: "Protege archivos personales y copias de seguridad almacenadas en la nube.",
    min: 18, simbolo: true, personales: ["maria", "julio", "2020"], comunes: ["drive", "clave", "abc123"],
    fragmentos: [{t:"Brújula"},{t:"Granito"},{t:"26"},{t:"%"},{t:"Velero"},{t:"Maria",r:"personal"},{t:"Julio",r:"personal"},{t:"Drive",r:"comun"},{t:"abc123",r:"comun"}],
    consejo: "Las frases de varias palabras son más fáciles de recordar y difíciles de adivinar cuando no forman citas conocidas."
  },
  {
    id: "CR-005", titulo: "Plataforma educativa", tipo: "Contraseña",
    contexto: "Construye una clave para un campus virtual que contiene calificaciones y datos personales.",
    min: 14, simbolo: true, personales: ["sofia", "colegio", "2012"], comunes: ["estudiante", "school", "0000"],
    fragmentos: [{t:"Quasar"},{t:"Menta"},{t:"63"},{t:"@"},{t:"Cactus"},{t:"Sofia",r:"personal"},{t:"Colegio",r:"personal"},{t:"School",r:"comun"},{t:"0000",r:"comun"}],
    consejo: "No uses el nombre del centro educativo, el curso ni el año de nacimiento."
  },
  {
    id: "CR-006", titulo: "Cuenta de videojuegos", tipo: "Frase de acceso",
    contexto: "Protege compras, inventario digital y contactos de juego.",
    min: 16, simbolo: false, personales: ["mateo", "futbol", "2010"], comunes: ["gamer", "dragon", "123"],
    fragmentos: [{t:"Cometa"},{t:"Bambú"},{t:"91"},{t:"-"},{t:"Tundra"},{t:"Mateo",r:"personal"},{t:"Futbol",r:"personal"},{t:"Gamer",r:"comun"},{t:"123",r:"comun"}],
    consejo: "Los nombres de usuario, personajes favoritos y equipos deportivos son datos fáciles de investigar."
  },
  {
    id: "CR-007", titulo: "Portal de salud", tipo: "Contraseña",
    contexto: "Resguarda información médica y citas de un portal de salud.",
    min: 16, simbolo: true, personales: ["andres", "salud", "1978"], comunes: ["doctor", "hospital", "1111"],
    fragmentos: [{t:"Ámbar"},{t:"Océano"},{t:"37"},{t:"&"},{t:"Jacinto"},{t:"Andres",r:"personal"},{t:"1978",r:"personal"},{t:"Doctor",r:"comun"},{t:"1111",r:"comun"}],
    consejo: "La información de salud es sensible: usa una clave exclusiva y activa MFA aunque la plataforma no lo sugiera."
  },
  {
    id: "CR-008", titulo: "Tienda en línea", tipo: "Frase de acceso",
    contexto: "Asegura una cuenta que conserva direcciones y medios de pago.",
    min: 16, simbolo: true, personales: ["paula", "abril", "cali"], comunes: ["compras", "tienda", "welcome"],
    fragmentos: [{t:"Tiza"},{t:"Satélite"},{t:"84"},{t:"+"},{t:"Prisma"},{t:"Paula",r:"personal"},{t:"Abril",r:"personal"},{t:"Tienda",r:"comun"},{t:"welcome",r:"comun"}],
    consejo: "Evita datos de envío o cumpleaños; son visibles en facturas, redes o perfiles."
  },
  {
    id: "CR-009", titulo: "Wi‑Fi del hogar", tipo: "Frase de acceso",
    contexto: "Impide que personas no autorizadas entren a la red doméstica.",
    min: 18, simbolo: false, personales: ["familia", "torres", "301"], comunes: ["wifi", "internet", "12345678"],
    fragmentos: [{t:"Volcán"},{t:"Limonero"},{t:"59"},{t:"?"},{t:"Roble"},{t:"Familia",r:"personal"},{t:"Torres",r:"personal"},{t:"WiFi",r:"comun"},{t:"12345678",r:"comun"}],
    consejo: "No uses apellido, dirección ni número de apartamento en la clave de la red."
  },
  {
    id: "CR-010", titulo: "Panel de administración", tipo: "Contraseña",
    contexto: "Crea una credencial robusta para una cuenta con permisos elevados.",
    min: 18, simbolo: true, personales: ["admin", "empresa", "2026"], comunes: ["administrator", "root", "changeme"],
    fragmentos: [{t:"Ícaro"},{t:"Cuarzo"},{t:"73"},{t:"*"},{t:"Asteroide"},{t:"Empresa",r:"personal"},{t:"2026",r:"personal"},{t:"root",r:"comun"},{t:"changeme",r:"comun"}],
    consejo: "Las cuentas privilegiadas necesitan claves largas, exclusivas y MFA resistente al phishing."
  },
  {
    id: "CR-011", titulo: "Aplicación de mensajería", tipo: "Frase de acceso",
    contexto: "Protege conversaciones y copias de seguridad de mensajes.",
    min: 16, simbolo: false, personales: ["diego", "lucia", "300555"], comunes: ["whatsapp", "mensaje", "iloveyou"],
    fragmentos: [{t:"Río"},{t:"Mandarina"},{t:"406"},{t:"="},{t:"Campana"},{t:"Diego",r:"personal"},{t:"Lucia",r:"personal"},{t:"Mensaje",r:"comun"},{t:"iloveyou",r:"comun"}],
    consejo: "Nombres de pareja y números de teléfono son información personal predecible."
  },
  {
    id: "CR-012", titulo: "Suscripción de streaming", tipo: "Contraseña",
    contexto: "Evita compartir accidentalmente la misma clave con servicios más sensibles.",
    min: 14, simbolo: true, personales: ["natalia", "serie", "2019"], comunes: ["netflix", "pelicula", "password1"],
    fragmentos: [{t:"Píxel"},{t:"Cedro"},{t:"62"},{t:"$"},{t:"Granizo"},{t:"Natalia",r:"personal"},{t:"Serie",r:"personal"},{t:"Netflix",r:"comun"},{t:"password1",r:"comun"}],
    consejo: "Una cuenta de ocio también puede ser puerta de entrada si reutilizas la clave del correo."
  },
  {
    id: "CR-013", titulo: "Sistema de nómina", tipo: "Frase de acceso",
    contexto: "Protege comprobantes, datos bancarios e información laboral.",
    min: 18, simbolo: true, personales: ["julian", "nomina", "cc1020"], comunes: ["empresa", "pago", "123abc"],
    fragmentos: [{t:"Nebulosa"},{t:"Trigo"},{t:"35"},{t:"!"},{t:"Torreón"},{t:"Julian",r:"personal"},{t:"cc1020",r:"personal"},{t:"Pago",r:"comun"},{t:"123abc",r:"comun"}],
    consejo: "No incluyas identificación, salario, empresa ni fechas laborales en una credencial."
  },
  {
    id: "CR-014", titulo: "Acceso remoto", tipo: "Contraseña",
    contexto: "Crea una clave para conectarte desde fuera a recursos de trabajo.",
    min: 18, simbolo: true, personales: ["camila", "oficina", "2025"], comunes: ["vpn", "remote", "access"],
    fragmentos: [{t:"Esmeralda"},{t:"Norte"},{t:"47"},{t:"^"},{t:"Jazmín"},{t:"Camila",r:"personal"},{t:"Oficina",r:"personal"},{t:"remote",r:"comun"},{t:"access",r:"comun"}],
    consejo: "El acceso remoto expone recursos internos; una contraseña fuerte no sustituye MFA."
  },
  {
    id: "CR-015", titulo: "Gestor de contraseñas", tipo: "Frase maestra",
    contexto: "Construye una frase maestra memorable que proteja todas las demás credenciales.",
    min: 20, simbolo: false, personales: ["ricardo", "perro", "bucaramanga"], comunes: ["master", "password", "secreto"],
    fragmentos: [{t:"Linterna"},{t:"Glaciar"},{t:"Tambor"},{t:"82"},{t:"Océano"},{t:"Ricardo",r:"personal"},{t:"Perro",r:"personal"},{t:"Master",r:"comun"},{t:"Secreto",r:"comun"}],
    consejo: "La frase maestra debe ser única, larga y no estar guardada en lugares visibles."
  },
  {
    id: "CR-016", titulo: "Repositorio de código", tipo: "Frase de acceso",
    contexto: "Protege proyectos, secretos y flujos de despliegue en un repositorio.",
    min: 18, simbolo: true, personales: ["dev", "proyecto", "equipo7"], comunes: ["github", "codigo", "letmein"],
    fragmentos: [{t:"Circuito"},{t:"Abedul"},{t:"64"},{t:"~"},{t:"Violeta"},{t:"Proyecto",r:"personal"},{t:"Equipo7",r:"personal"},{t:"Codigo",r:"comun"},{t:"letmein",r:"comun"}],
    consejo: "Las cuentas de desarrollo deben combinar clave exclusiva, MFA y manejo seguro de tokens."
  },
  {
    id: "CR-017", titulo: "Portal tributario", tipo: "Contraseña",
    contexto: "Resguarda declaraciones, identidad e información financiera.",
    min: 16, simbolo: true, personales: ["elena", "nit900", "mayo"], comunes: ["impuestos", "dian", "clave123"],
    fragmentos: [{t:"Horizonte"},{t:"Cacao"},{t:"29"},{t:"/"},{t:"Cóndor"},{t:"Elena",r:"personal"},{t:"NIT900",r:"personal"},{t:"Impuestos",r:"comun"},{t:"clave123",r:"comun"}],
    consejo: "Identificación y datos tributarios pueden encontrarse en documentos; no los conviertas en contraseña."
  },
  {
    id: "CR-018", titulo: "Calendario compartido", tipo: "Frase de acceso",
    contexto: "Evita que terceros conozcan reuniones, enlaces y horarios internos.",
    min: 15, simbolo: false, personales: ["felipe", "lunes", "gerencia"], comunes: ["calendar", "reunion", "office"],
    fragmentos: [{t:"Páramo"},{t:"Canela"},{t:"58"},{t:"."},{t:"Arena"},{t:"Felipe",r:"personal"},{t:"Gerencia",r:"personal"},{t:"Reunion",r:"comun"},{t:"office",r:"comun"}],
    consejo: "Los nombres de áreas, jefaturas o días de reunión son contexto laboral predecible."
  },
  {
    id: "CR-019", titulo: "Portal de viajes", tipo: "Contraseña",
    contexto: "Protege itinerarios, pasaportes y puntos acumulados.",
    min: 15, simbolo: true, personales: ["valentina", "miami", "junio"], comunes: ["travel", "viaje", "vacaciones"],
    fragmentos: [{t:"Aurora"},{t:"Mármol"},{t:"31"},{t:"!"},{t:"Zafiro"},{t:"Valentina",r:"personal"},{t:"Miami",r:"personal"},{t:"Viaje",r:"comun"},{t:"Vacaciones",r:"comun"}],
    consejo: "Destinos y fechas de vacaciones suelen publicarse; elige elementos ajenos a tu biografía."
  },
  {
    id: "CR-020", titulo: "Identidad digital principal", tipo: "Frase de acceso",
    contexto: "Cierra la misión protegiendo la cuenta usada para iniciar sesión en otros servicios.",
    min: 20, simbolo: true, personales: ["daniela", "cumple", "familia"], comunes: ["microsoft", "google", "password"],
    fragmentos: [{t:"Constelación"},{t:"Olivo"},{t:"96"},{t:"#"},{t:"Crisol"},{t:"Daniela",r:"personal"},{t:"Familia",r:"personal"},{t:"Google",r:"comun"},{t:"password",r:"comun"}],
    consejo: "La identidad principal merece una frase larga, exclusiva, MFA y códigos de recuperación custodiados."
  }

  // ===== AGREGA NUEVAS PRUEBAS JUSTO ENCIMA DE ESTE COMENTARIO =====
];
