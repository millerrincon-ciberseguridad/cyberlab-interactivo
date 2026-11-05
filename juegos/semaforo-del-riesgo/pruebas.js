/*
╔══════════════════════════════════════════════════════════════════════════════╗
║ ZONA EDITABLE — PRUEBAS DE “SEMÁFORO DEL RIESGO”                           ║
║                                                                            ║
║ Para agregar una prueba:                                                   ║
║ 1. Copia una prueba completa y pégala JUSTO ANTES del comentario final.    ║
║ 2. Usa un id único (por ejemplo, SR-025).                                   ║
║ 3. nivel solo admite: "bajo", "medio" o "alto".                          ║
║ 4. Incluye escenario, explicación educativa y acción recomendada.          ║
║ 5. Conserva la coma entre pruebas. No insertes HTML en los textos.          ║
║                                                                            ║
║ PLANTILLA:                                                                 ║
║ {                                                                          ║
║   id: "SR-025", icono: "📶", nivel: "medio",                            ║
║   titulo: "Situación nueva",                                               ║
║   escenario: "Describe aquí lo que ocurre.",                               ║
║   explicacion: "Explica por qué corresponde a ese nivel.",                 ║
║   accion: "Indica la conducta segura."                                     ║
║ },                                                                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

window.PRUEBAS_SEMAFORO_RIESGO = [
  {
    id: "SR-001", icono: "🏢", nivel: "bajo", titulo: "Wi‑Fi corporativo administrado",
    escenario: "Te conectas a la red institucional indicada por TI, con autenticación individual, cifrado vigente y certificado válido.",
    explicacion: "Los controles institucionales reducen la posibilidad de suplantación y permiten administrar el acceso. Riesgo bajo no significa riesgo cero: aún debes verificar el nombre y el certificado.",
    accion: "Usa únicamente la red oficial y reporta cualquier alerta de certificado o cambio inesperado."
  },
  {
    id: "SR-002", icono: "🔒", nivel: "bajo", titulo: "Bluetooth apagado cuando no se usa",
    escenario: "El Bluetooth del celular permanece desactivado y solo se enciende para conectar un accesorio conocido.",
    explicacion: "Reducir el tiempo de exposición limita solicitudes de conexión, rastreo y aprovechamiento de fallas cercanas.",
    accion: "Mantén Bluetooth apagado cuando no sea necesario y elimina dispositivos antiguos de la lista."
  },
  {
    id: "SR-003", icono: "📲", nivel: "bajo", titulo: "Emparejamiento verificado",
    escenario: "Vas a enlazar audífonos propios, compruebas el nombre del dispositivo y confirmas que el código coincide en ambos equipos.",
    explicacion: "Verificar identidad y código disminuye el riesgo de enlazar por error un dispositivo ajeno.",
    accion: "Empareja en un lugar controlado y rechaza solicitudes que no hayas iniciado."
  },
  {
    id: "SR-004", icono: "🔄", nivel: "bajo", titulo: "Router actualizado y endurecido",
    escenario: "El router doméstico tiene firmware vigente, clave de administración única, WPA2 o WPA3 y WPS desactivado.",
    explicacion: "Actualizar y cambiar configuraciones predeterminadas corrige fallas conocidas y dificulta accesos no autorizados.",
    accion: "Revisa periódicamente actualizaciones, usuarios conectados y opciones de seguridad."
  },
  {
    id: "SR-005", icono: "📡", nivel: "bajo", titulo: "Punto de acceso propio protegido",
    escenario: "Compartes datos desde tu teléfono con una contraseña robusta, límite de dispositivos y desactivación automática.",
    explicacion: "Un punto de acceso controlado por ti y protegido ofrece menos exposición que una red pública desconocida.",
    accion: "Cambia la contraseña periódicamente y apaga el punto de acceso al terminar."
  },
  {
    id: "SR-006", icono: "🧳", nivel: "bajo", titulo: "Conectividad desactivada en viaje",
    escenario: "Durante un desplazamiento mantienes apagados Wi‑Fi y Bluetooth hasta que realmente necesitas una conexión.",
    explicacion: "Evitar búsquedas y conexiones automáticas reduce el rastreo y el contacto con redes o dispositivos falsos.",
    accion: "Activa cada conexión solo cuando la vayas a usar y comprueba su destino."
  },
  {
    id: "SR-007", icono: "🛡️", nivel: "bajo", titulo: "VPN institucional en red conocida",
    escenario: "Trabajas desde una red doméstica protegida y utilizas la VPN institucional aprobada para acceder a recursos internos.",
    explicacion: "La combinación de una red controlada y una VPN autorizada protege el tránsito y el acceso a servicios internos.",
    accion: "Verifica que la VPN esté conectada antes de abrir información institucional."
  },
  {
    id: "SR-008", icono: "🚫", nivel: "bajo", titulo: "Compartición inalámbrica restringida",
    escenario: "AirDrop, Nearby Share o la función equivalente está configurada en «solo contactos» y se desactiva al terminar.",
    explicacion: "Restringir quién puede descubrirte o enviarte archivos reduce contactos no solicitados y exposición del dispositivo.",
    accion: "Evita el modo «todos» y acepta archivos únicamente de personas verificadas."
  },
  {
    id: "SR-009", icono: "☕", nivel: "medio", titulo: "Consulta pública en Wi‑Fi de cafetería",
    escenario: "Usas la red del local para leer noticias, sin iniciar sesión ni consultar información personal o laboral.",
    explicacion: "Aunque la actividad no es sensible, una red pública puede observar metadatos, manipular tráfico o dirigir a sitios falsos.",
    accion: "Prefiere datos móviles; si debes usarla, evita cuentas y verifica HTTPS."
  },
  {
    id: "SR-010", icono: "🏨", nivel: "medio", titulo: "Wi‑Fi del hotel confirmado",
    escenario: "Recepción confirma el nombre de la red y la clave, pero todos los huéspedes comparten el mismo acceso.",
    explicacion: "Confirmar el nombre reduce la suplantación, pero una red compartida mantiene exposición frente a otros usuarios y configuraciones débiles.",
    accion: "Usa VPN institucional, evita operaciones sensibles y activa el firewall."
  },
  {
    id: "SR-011", icono: "📱", nivel: "medio", titulo: "Hotspot de un compañero",
    escenario: "Un compañero conocido comparte temporalmente los datos de su teléfono para una tarea no confidencial.",
    explicacion: "El origen es conocido, pero no controlas por completo la configuración, los equipos conectados ni la protección del teléfono.",
    accion: "Confirma la red directamente, limita la tarea y desconéctate al finalizar."
  },
  {
    id: "SR-012", icono: "🚗", nivel: "medio", titulo: "Bluetooth del vehículo alquilado",
    escenario: "Emparejas el celular con un automóvil alquilado para usar el audio y las llamadas.",
    explicacion: "El sistema puede copiar contactos, historial o mensajes, y conservarlos después de entregar el vehículo.",
    accion: "Niega permisos innecesarios y borra tu perfil y datos del vehículo antes de devolverlo."
  },
  {
    id: "SR-013", icono: "⌚", nivel: "medio", titulo: "Reloj inteligente con permisos amplios",
    escenario: "Un reloj propio solicita acceso a contactos, ubicación, notificaciones y micrófono para habilitar todas sus funciones.",
    explicacion: "El dispositivo es legítimo, pero los permisos amplios aumentan la información expuesta si se pierde o se compromete.",
    accion: "Concede solo los permisos necesarios, actualiza el firmware y configura bloqueo."
  },
  {
    id: "SR-014", icono: "🖨️", nivel: "medio", titulo: "Impresora inalámbrica compartida",
    escenario: "Debes imprimir un documento interno en una impresora Wi‑Fi autorizada que usan varias áreas.",
    explicacion: "El equipo está autorizado, pero la cola, la bandeja y la red compartida pueden exponer el documento.",
    accion: "Usa impresión segura, confirma el dispositivo exacto y recoge el documento de inmediato."
  },
  {
    id: "SR-015", icono: "📶", nivel: "medio", titulo: "Red de invitados para equipo personal",
    escenario: "Conectas tu teléfono personal a la red oficial de invitados, separada de los sistemas internos.",
    explicacion: "La segmentación reduce el impacto sobre la red institucional, pero el dispositivo personal sigue sujeto a las reglas y riesgos del acceso compartido.",
    accion: "Mantén el equipo actualizado, evita compartir archivos y no uses esa red para información sensible."
  },
  {
    id: "SR-016", icono: "🎧", nivel: "medio", titulo: "Accesorio nuevo de proveedor conocido",
    escenario: "Unos audífonos nuevos y originales aparecen con un nombre genérico entre varios dispositivos Bluetooth cercanos.",
    explicacion: "El accesorio es confiable, pero el nombre genérico puede llevarte a emparejar el equipo equivocado.",
    accion: "Aísla o identifica el accesorio, verifica el código y cambia su nombre después de enlazarlo."
  },
  {
    id: "SR-017", icono: "⚠️", nivel: "alto", titulo: "Wi‑Fi abierto con nombre institucional",
    escenario: "Aparece una red abierta con el nombre de tu organización y el teléfono se conecta automáticamente.",
    explicacion: "Un atacante puede crear una red gemela para interceptar tráfico, robar credenciales o presentar portales falsos.",
    accion: "Desconéctate, olvida la red y confirma con TI el nombre y la autenticación oficiales."
  },
  {
    id: "SR-018", icono: "🏦", nivel: "alto", titulo: "Operación sensible en red pública",
    escenario: "Desde el Wi‑Fi gratuito de un aeropuerto vas a entrar a banca, correo laboral y repositorios institucionales.",
    explicacion: "La combinación de una red no confiable con cuentas y datos sensibles puede facilitar interceptación, suplantación y robo de sesión.",
    accion: "Usa datos móviles o una conexión aprobada; evita la operación hasta contar con un canal seguro."
  },
  {
    id: "SR-019", icono: "🔵", nivel: "alto", titulo: "Solicitud Bluetooth inesperada",
    escenario: "En un lugar concurrido recibes una petición de emparejamiento Bluetooth que no iniciaste.",
    explicacion: "Aceptar conexiones no solicitadas puede exponer servicios, archivos, audio o información del dispositivo.",
    accion: "Rechaza la solicitud, apaga Bluetooth y revisa los dispositivos emparejados."
  },
  {
    id: "SR-020", icono: "🔑", nivel: "alto", titulo: "Router con credenciales de fábrica",
    escenario: "El router conserva el usuario y la contraseña de administración impresos en la etiqueta y tiene WPS activo.",
    explicacion: "Las credenciales predeterminadas y WPS facilitan que un tercero tome control del equipo y cambie la red o el DNS.",
    accion: "Cambia las credenciales, desactiva WPS, actualiza el firmware y usa cifrado robusto."
  },
  {
    id: "SR-021", icono: "📥", nivel: "alto", titulo: "Archivo recibido por proximidad",
    escenario: "Una persona desconocida te envía por AirDrop o Nearby Share un archivo llamado «actualización_seguridad».",
    explicacion: "Los archivos inesperados pueden contener software malicioso, enlaces de engaño o contenido diseñado para explotar fallas.",
    accion: "Rechaza y elimina la transferencia; configura la recepción solo para contactos."
  },
  {
    id: "SR-022", icono: "▦", nivel: "alto", titulo: "QR para configurar Wi‑Fi",
    escenario: "Un adhesivo pegado sobre un aviso oficial ofrece un QR que instala automáticamente una red y un certificado.",
    explicacion: "Un QR manipulado puede agregar una red controlada por un atacante, instalar perfiles o dirigir a un portal de robo de credenciales.",
    accion: "No lo escanees; reporta el adhesivo y usa la configuración publicada por el canal oficial."
  },
  {
    id: "SR-023", icono: "💻", nivel: "alto", titulo: "Compartición de archivos en red pública",
    escenario: "El portátil mantiene activada la detección de red y comparte carpetas mientras está conectado al Wi‑Fi de un centro comercial.",
    explicacion: "Otros equipos de la red pueden descubrir servicios, intentar acceder a archivos o explorar vulnerabilidades.",
    accion: "Marca la red como pública, desactiva compartición y usa el firewall con el perfil más restrictivo."
  },
  {
    id: "SR-024", icono: "📡", nivel: "alto", titulo: "Conexión automática a redes recordadas",
    escenario: "El celular se conecta sin preguntar a nombres de Wi‑Fi usados antes, incluso en ciudades y lugares distintos.",
    explicacion: "Un atacante puede imitar un nombre conocido y lograr que el equipo se conecte a una red gemela.",
    accion: "Desactiva la conexión automática, elimina redes innecesarias y verifica cada punto de acceso."
  }

  // ===== AGREGA NUEVAS PRUEBAS JUSTO ENCIMA DE ESTE COMENTARIO =====
];
