/*
╔══════════════════════════════════════════════════════════════════════════════╗
║ ZONA EDITABLE — PRUEBAS DE “ORDENA LA RESPUESTA AL INCIDENTE”               ║
║                                                                              ║
║ Para agregar una prueba:                                                     ║
║ 1. Copia una prueba completa y pégala JUSTO ANTES del comentario final.      ║
║ 2. Usa un id único (por ejemplo, RI-025).                                     ║
║ 3. Incluye entre 4 y 7 pasos en el ORDEN CORRECTO de respuesta.               ║
║ 4. Añade explicación educativa y acción clave.                               ║
║ 5. Conserva la coma entre pruebas. No insertes HTML en los textos.            ║
║                                                                              ║
║ PLANTILLA:                                                                   ║
║ {                                                                            ║
║   id: "RI-025", icono: "🚨", categoria: "Tipo de incidente",             ║
║   titulo: "Nombre del incidente",                                           ║
║   escenario: "Describe aquí lo que ocurre.",                                 ║
║   pasos: [                                                                   ║
║     "Primer paso correcto",                                                  ║
║     "Segundo paso correcto",                                                 ║
║     "Tercer paso correcto",                                                  ║
║     "Cuarto paso correcto"                                                   ║
║   ],                                                                          ║
║   explicacion: "Explica por qué esta secuencia reduce el impacto.",          ║
║   accion: "Resume la conducta que nunca debe omitirse."                      ║
║ },                                                                           ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

window.PRUEBAS_RESPUESTA_INCIDENTE = [
  {
    id: "RI-001", icono: "🎣", categoria: "Ingeniería social", titulo: "Credenciales entregadas en un sitio falso",
    escenario: "Una persona reconoce que abrió un enlace de correo, escribió su usuario y contraseña y luego notó que el dominio no era el oficial.",
    pasos: [
      "Cerrar el sitio falso y dejar de interactuar con el mensaje.",
      "Cambiar de inmediato la contraseña desde un equipo y portal confiables.",
      "Revocar sesiones activas y reforzar la cuenta con MFA si aún no está habilitado.",
      "Reportar el correo, la URL y la hora al equipo responsable de seguridad.",
      "Revisar actividad reciente, reglas de correo y otros accesos para detectar abuso."
    ],
    explicacion: "Primero se detiene la exposición; después se recupera el control de la cuenta. El reporte conserva indicadores para bloquear la campaña y la revisión permite descubrir persistencia o accesos ya realizados.",
    accion: "No vuelvas a abrir el enlace para comprobarlo y nunca reutilices la contraseña comprometida."
  },
  {
    id: "RI-002", icono: "🔒", categoria: "Ransomware", titulo: "Archivos que cambian de extensión",
    escenario: "Un equipo empieza a renombrar archivos, muestra una nota de rescate y las carpetas compartidas aún están accesibles.",
    pasos: [
      "Aislar el equipo de la red cableada, Wi‑Fi, Bluetooth y unidades compartidas.",
      "No pagar, no borrar archivos y no apagar el equipo salvo instrucción del equipo de respuesta.",
      "Reportar de inmediato el incidente y registrar la hora, el mensaje y los sistemas afectados.",
      "Preservar evidencias y determinar alcance, vector de entrada y cuentas comprometidas.",
      "Erradicar la causa y recuperar desde copias verificadas antes de reconectar."
    ],
    explicacion: "El aislamiento rápido limita el cifrado lateral. Mantener evidencias ayuda a identificar la variante y el punto de entrada; la restauración solo es segura después de contener y erradicar la amenaza.",
    accion: "Prioriza la contención sobre la investigación improvisada: desconecta, reporta y espera instrucciones."
  },
  {
    id: "RI-003", icono: "📎", categoria: "Malware", titulo: "Adjunto sospechoso ejecutado",
    escenario: "Se abrió un archivo adjunto inesperado; apareció una ventana breve y el equipo comenzó a funcionar lentamente.",
    pasos: [
      "Dejar de usar el equipo y desconectarlo de redes y dispositivos externos.",
      "Anotar el remitente, asunto, nombre del archivo y acciones realizadas.",
      "Reportar el incidente por un canal distinto al equipo posiblemente comprometido.",
      "Permitir que el personal autorizado capture evidencias y analice el archivo.",
      "Limpiar o reinstalar el equipo, actualizar controles y restablecer credenciales si corresponde."
    ],
    explicacion: "Seguir trabajando puede ejecutar más acciones maliciosas. Los datos básicos del mensaje aceleran la búsqueda de otras víctimas y el análisis autorizado evita destruir evidencia útil.",
    accion: "No intentes desinstalar ni borrar el archivo por tu cuenta antes del análisis."
  },
  {
    id: "RI-004", icono: "💻", categoria: "Pérdida de activo", titulo: "Portátil institucional extraviado",
    escenario: "Al terminar un desplazamiento, una persona descubre que no tiene su portátil de trabajo y no sabe si lo dejó en un vehículo o fue robado.",
    pasos: [
      "Confirmar rápidamente el último lugar y hora conocidos sin retrasar el reporte.",
      "Informar la pérdida al canal institucional y entregar identificación del activo.",
      "Solicitar bloqueo, localización o borrado remoto según el procedimiento autorizado.",
      "Cambiar credenciales y revocar sesiones o certificados asociados al equipo.",
      "Documentar los datos potencialmente expuestos y seguir el proceso legal o de privacidad aplicable."
    ],
    explicacion: "El reporte temprano permite actuar mientras el dispositivo aún puede estar conectado. Después se reduce el acceso a cuentas y se evalúa si la pérdida constituye además una exposición de información.",
    accion: "No esperes a recuperarlo por cuenta propia antes de informar; cada minuto puede aumentar la exposición."
  },
  {
    id: "RI-005", icono: "📱", categoria: "Pérdida de activo", titulo: "Teléfono con correo laboral robado",
    escenario: "Un teléfono configurado con correo, autenticador y aplicaciones institucionales fue robado en un lugar público.",
    pasos: [
      "Usar un dispositivo seguro para reportar el robo de inmediato.",
      "Bloquear la línea, el dispositivo y las aplicaciones administradas.",
      "Revocar sesiones, tokens de acceso y métodos MFA vinculados.",
      "Activar borrado remoto conforme a la política y conservar datos de localización para la autoridad.",
      "Revisar alertas de acceso y restablecer de forma segura los métodos de autenticación."
    ],
    explicacion: "El teléfono puede concentrar correo, sesiones y segundo factor. Bloquear acceso y revocar tokens evita que el atacante aproveche una sesión ya abierta aunque desconozca la contraseña.",
    accion: "No enfrentes a quien tenga el equipo; protege primero cuentas y datos mediante los canales oficiales."
  },
  {
    id: "RI-006", icono: "✉️", categoria: "Fuga de información", titulo: "Correo enviado al destinatario equivocado",
    escenario: "Un archivo con datos personales fue enviado por error a una dirección externa de nombre parecido.",
    pasos: [
      "Evitar nuevos reenvíos y comprobar exactamente qué archivo y datos salieron.",
      "Reportar el error de inmediato al responsable de seguridad o privacidad.",
      "Solicitar al destinatario, por un canal controlado, eliminación y confirmación sin ampliar la exposición.",
      "Intentar revocar el mensaje o enlace compartido si la plataforma lo permite.",
      "Documentar alcance, destinatario, respuesta y medidas para determinar notificaciones necesarias."
    ],
    explicacion: "Conocer el contenido y el destinatario permite valorar el impacto. La recuperación técnica puede ayudar, pero no sustituye el reporte ni la evaluación formal de una posible brecha.",
    accion: "No ocultes el error ni envíes más datos sensibles para explicar lo ocurrido."
  },
  {
    id: "RI-007", icono: "☁️", categoria: "Exposición en nube", titulo: "Carpeta compartida con acceso público",
    escenario: "Un enlace de almacenamiento en la nube permite abrir documentos internos sin iniciar sesión y aparece indexado en una búsqueda.",
    pasos: [
      "Restringir o deshabilitar el enlace público sin borrar los registros de actividad.",
      "Reportar la exposición e identificar al propietario y la ubicación de la carpeta.",
      "Preservar registros de acceso, fechas, permisos y evidencia de indexación.",
      "Determinar qué documentos estuvieron disponibles y quién pudo acceder.",
      "Corregir permisos, rotar secretos expuestos y aplicar las notificaciones o mejoras necesarias."
    ],
    explicacion: "Cerrar el acceso limita nuevas consultas, pero los registros deben conservarse para estimar alcance. Después se corrigen permisos y cualquier credencial que haya quedado visible.",
    accion: "No elimines la carpeta antes de preservar evidencia; primero restringe el acceso."
  },
  {
    id: "RI-008", icono: "💸", categoria: "Fraude", titulo: "Transferencia solicitada por un directivo",
    escenario: "Llega un mensaje urgente, aparentemente de un directivo, que pide cambiar la cuenta bancaria de un proveedor y realizar un pago.",
    pasos: [
      "Pausar la transferencia y no responder usando los datos del mensaje.",
      "Verificar la solicitud por un canal independiente y con contactos conocidos.",
      "Alertar a finanzas y seguridad, conservando encabezados, números y documentos recibidos.",
      "Si el pago salió, contactar de inmediato al banco para intentar retenerlo.",
      "Bloquear indicadores, revisar cuentas relacionadas y documentar la investigación."
    ],
    explicacion: "La pausa y la verificación independiente rompen la presión del fraude. Si hubo pago, la rapidez con el banco es crítica; luego se busca si una cuenta real fue comprometida.",
    accion: "Ninguna urgencia reemplaza el procedimiento de verificación financiera."
  },
  {
    id: "RI-009", icono: "🔑", categoria: "Cuenta comprometida", titulo: "Inicio de sesión desde un país inesperado",
    escenario: "El sistema de identidad alerta que una cuenta inició sesión desde una ubicación incompatible con la actividad de la persona usuaria.",
    pasos: [
      "Confirmar con la persona, por un canal confiable, si reconoce el acceso.",
      "Bloquear temporalmente la cuenta y revocar sesiones activas si no se reconoce.",
      "Restablecer contraseña y métodos MFA desde un dispositivo seguro.",
      "Revisar registros, reglas de correo, aplicaciones autorizadas y acciones realizadas.",
      "Corregir persistencia, ampliar la búsqueda a cuentas relacionadas y cerrar el incidente documentado."
    ],
    explicacion: "Primero se valida para evitar bloquear actividad legítima; si es fraude, se corta la sesión y se recupera la identidad. La revisión busca cambios que sobrevivirían a un simple cambio de contraseña.",
    accion: "Cambiar solo la contraseña no basta si quedan sesiones, reglas o aplicaciones autorizadas."
  },
  {
    id: "RI-010", icono: "🌐", categoria: "Disponibilidad", titulo: "Servicio saturado por tráfico",
    escenario: "Un portal público deja de responder y la supervisión muestra un aumento masivo de solicitudes desde múltiples orígenes.",
    pasos: [
      "Confirmar el impacto y descartar primero una falla interna o cambio reciente.",
      "Declarar el incidente y avisar a operación, seguridad y responsables del servicio.",
      "Activar protección DDoS, filtrado, límites de tasa o apoyo del proveedor.",
      "Priorizar funciones críticas y mantener comunicación de estado por canales alternos.",
      "Analizar métricas, ajustar defensas y documentar capacidad y lecciones aprendidas."
    ],
    explicacion: "La validación evita tratar una avería propia como ataque. La mitigación debe coordinarse con operación y proveedores para mantener funciones esenciales sin bloquear usuarios legítimos.",
    accion: "No improvises bloqueos amplios que puedan aumentar la indisponibilidad."
  },
  {
    id: "RI-011", icono: "🖥️", categoria: "Aplicación web", titulo: "Sitio institucional alterado",
    escenario: "La página principal muestra mensajes no autorizados y archivos que no corresponden a la versión publicada.",
    pasos: [
      "Poner el sitio en modo seguro o retirarlo de publicación sin destruir el servidor.",
      "Notificar al equipo de respuesta y preservar una copia, registros y marcas de tiempo.",
      "Identificar el punto de entrada, cuentas usadas y otros sistemas alcanzados.",
      "Eliminar persistencia, corregir la vulnerabilidad y rotar credenciales comprometidas.",
      "Restaurar contenido verificado, supervisar recaídas y comunicar el restablecimiento."
    ],
    explicacion: "Retirar la página evita daño reputacional y nuevas acciones, pero conservar el sistema permite investigar. Restaurar demasiado pronto puede publicar de nuevo una puerta trasera.",
    accion: "No reemplaces únicamente la portada: corrige primero la causa y cualquier persistencia."
  },
  {
    id: "RI-012", icono: "🔌", categoria: "Dispositivo extraíble", titulo: "Memoria USB desconocida conectada",
    escenario: "Una memoria encontrada en un pasillo fue conectada a un equipo de trabajo y el sistema mostró una ventana inesperada.",
    pasos: [
      "Dejar de interactuar y aislar el equipo de la red.",
      "No abrir más archivos, no formatear la memoria y no conectarla a otro equipo.",
      "Reportar el hecho y entregar el dispositivo siguiendo cadena de custodia.",
      "Analizar el equipo y la memoria en un entorno autorizado y controlado.",
      "Erradicar hallazgos, validar el equipo y reforzar controles sobre medios extraíbles."
    ],
    explicacion: "Mover la memoria a otros equipos propaga el riesgo y destruye trazabilidad. La cadena de custodia y el análisis controlado permiten saber qué se ejecutó y preservar evidencia.",
    accion: "Un dispositivo encontrado nunca debe probarse en un equipo de uso diario."
  },
  {
    id: "RI-013", icono: "📶", categoria: "Red inalámbrica", titulo: "Conexión a una red gemela",
    escenario: "Un portátil se conectó automáticamente a una red abierta con nombre institucional; después apareció un portal que pidió credenciales.",
    pasos: [
      "Desconectar la red falsa y desactivar la conexión automática.",
      "Si se ingresaron credenciales, cambiarlas desde una red y equipo confiables.",
      "Olvidar el perfil inalámbrico y reportar nombre, lugar, hora y capturas disponibles.",
      "Revisar sesiones, certificados o perfiles instalados durante la conexión.",
      "Bloquear indicadores, advertir a otras personas y confirmar la red oficial."
    ],
    explicacion: "La desconexión corta la interceptación. Si hubo credenciales o perfiles instalados, deben tratarse como comprometidos; el reporte ayuda a prevenir nuevas víctimas cercanas.",
    accion: "No vuelvas a conectarte para obtener más pruebas; registra lo disponible y usa un canal seguro."
  },
  {
    id: "RI-014", icono: "🗝️", categoria: "Secreto expuesto", titulo: "Clave API publicada en un repositorio",
    escenario: "Una clave de acceso a un servicio aparece en un commit de un repositorio público.",
    pasos: [
      "Revocar o deshabilitar de inmediato la clave expuesta.",
      "Crear una credencial nueva con el mínimo privilegio y almacenarla en un gestor seguro.",
      "Reportar la exposición y preservar referencias al commit y tiempos relevantes.",
      "Revisar registros de uso para detectar accesos o acciones no autorizadas.",
      "Eliminar el secreto del historial cuando corresponda y añadir controles que eviten repetirlo."
    ],
    explicacion: "Borrar el archivo visible no invalida una clave que ya pudo ser copiada. Primero se revoca; luego se rota, se investiga su uso y se limpia el historial sin perder trazabilidad.",
    accion: "Trata todo secreto publicado como comprometido aunque el repositorio haya estado público pocos minutos."
  },
  {
    id: "RI-015", icono: "🗄️", categoria: "Ataque a datos", titulo: "Alertas de inyección contra una aplicación",
    escenario: "El sistema de monitoreo detecta consultas anómalas y errores de base de datos asociados a parámetros de una aplicación web.",
    pasos: [
      "Aplicar una contención temporal al endpoint afectado y preservar la disponibilidad esencial.",
      "Declarar el incidente y conservar registros de aplicación, WAF y base de datos.",
      "Determinar si hubo acceso, modificación o extracción de información.",
      "Corregir la consulta vulnerable, validar entradas y rotar credenciales afectadas.",
      "Probar la corrección, vigilar nuevos intentos y evaluar obligaciones de notificación."
    ],
    explicacion: "Bloquear el vector reduce daño, pero los registros permiten distinguir intentos de una intrusión exitosa. La recuperación exige corregir la causa, no solo filtrar una cadena concreta.",
    accion: "No borres registros ni reinicies servicios sin preservar la evidencia necesaria."
  },
  {
    id: "RI-016", icono: "📤", categoria: "Amenaza interna", titulo: "Descarga masiva antes de una salida",
    escenario: "Una cuenta descarga miles de archivos sensibles poco antes de finalizar su relación con la organización.",
    pasos: [
      "Preservar alertas y validar con recursos humanos y responsables si la actividad está autorizada.",
      "Restringir de forma proporcional el acceso y detener nuevas transferencias.",
      "Conservar registros, equipos y evidencias con cadena de custodia.",
      "Determinar archivos, destinos, motivación y posibles terceros receptores.",
      "Aplicar medidas legales, de privacidad y de seguridad sin difundir acusaciones prematuras."
    ],
    explicacion: "La respuesta debe limitar la salida de datos y a la vez respetar procedimientos laborales y legales. La preservación rigurosa evita conclusiones basadas solo en una alerta aislada.",
    accion: "Coordina con las áreas autorizadas; no confrontes ni acuses sin validación y evidencia."
  },
  {
    id: "RI-017", icono: "🧱", categoria: "Respaldo y recuperación", titulo: "Copia de seguridad sospechosa tras un ataque",
    escenario: "Después de contener ransomware, la copia más reciente presenta archivos cifrados y no se sabe desde cuándo está afectada.",
    pasos: [
      "Mantener aislados los sistemas comprometidos y proteger las copias restantes contra escritura.",
      "Identificar una fecha confiable anterior al compromiso mediante evidencia y registros.",
      "Verificar integridad y ausencia de malware en una copia candidata dentro de un entorno aislado.",
      "Restaurar primero servicios prioritarios siguiendo el plan de continuidad.",
      "Validar funcionamiento, vigilar reinfección y documentar puntos de recuperación reales."
    ],
    explicacion: "Restaurar la copia más reciente puede reintroducir cifrado o persistencia. La verificación aislada y la priorización de servicios convierten el respaldo en recuperación segura.",
    accion: "Una copia existente no es una copia útil hasta que su restauración haya sido verificada."
  },
  {
    id: "RI-018", icono: "🚪", categoria: "Seguridad física", titulo: "Persona no autorizada en sala técnica",
    escenario: "Alguien sin identificación visible entra detrás de una persona autorizada a una zona con equipos y cableado.",
    pasos: [
      "Mantener una distancia segura y avisar de inmediato a seguridad física.",
      "Evitar confrontaciones y seguir el protocolo para acompañar o retirar a la persona.",
      "Restringir temporalmente el área y revisar si hubo manipulación de equipos.",
      "Preservar controles de acceso, video y testimonios de quienes observaron el hecho.",
      "Evaluar activos afectados, cambiar accesos si procede y corregir la falla de ingreso."
    ],
    explicacion: "La seguridad personal tiene prioridad. Una vez controlada la presencia, se preservan evidencias y se comprueba si el acceso físico produjo además un incidente lógico.",
    accion: "No pongas en riesgo tu integridad; activa al personal entrenado para la intervención."
  },
  {
    id: "RI-019", icono: "📣", categoria: "Redes sociales", titulo: "Cuenta institucional secuestrada",
    escenario: "Una cuenta oficial publica mensajes fraudulentos y el equipo de comunicaciones ya no puede iniciar sesión.",
    pasos: [
      "Usar el proceso oficial de recuperación de la plataforma y escalar la cuenta comprometida.",
      "Notificar a seguridad y comunicaciones por canales alternos.",
      "Revocar sesiones, cambiar credenciales y revisar correo y MFA asociados.",
      "Advertir al público desde canales verificados sin amplificar enlaces maliciosos.",
      "Eliminar contenido fraudulento, investigar el acceso y reforzar roles y recuperación."
    ],
    explicacion: "Recuperar el control y coordinar la comunicación reduce nuevas víctimas. La cuenta de correo asociada también debe revisarse porque puede ser la vía de persistencia.",
    accion: "Comunica hechos confirmados y no interactúes con las publicaciones desde cuentas personales."
  },
  {
    id: "RI-020", icono: "🤝", categoria: "Terceros", titulo: "Proveedor informa una brecha",
    escenario: "Un proveedor que procesa información institucional confirma acceso no autorizado a su plataforma, pero aún no conoce el alcance.",
    pasos: [
      "Activar el proceso de incidentes de terceros y registrar hora y contenido del aviso.",
      "Restringir integraciones, tokens o accesos del proveedor según el riesgo operativo.",
      "Solicitar indicadores, período afectado, datos involucrados y medidas de contención.",
      "Buscar esos indicadores y posibles impactos en los sistemas propios.",
      "Coordinar decisiones contractuales, legales, de privacidad, comunicación y seguimiento."
    ],
    explicacion: "La organización mantiene responsabilidad sobre sus riesgos aunque el origen sea externo. Limitar integraciones y correlacionar indicadores permite saber si la brecha llegó al entorno propio.",
    accion: "No esperes el informe final para proteger accesos compartidos de alto riesgo."
  },
  {
    id: "RI-021", icono: "📂", categoria: "Fuga de información", titulo: "Documentos internos en repositorio público",
    escenario: "Una búsqueda encuentra documentos de trabajo y configuraciones internas dentro de un repositorio abierto en Internet.",
    pasos: [
      "Cambiar el repositorio a privado o retirar el acceso público sin destruir evidencia.",
      "Reportar el hallazgo y conservar URL, commits, fechas y propietarios.",
      "Inventariar documentos, datos personales, credenciales y configuraciones expuestas.",
      "Revocar secretos y revisar accesos o copias realizadas durante el período de exposición.",
      "Limpiar el historial cuando proceda y aplicar revisión automática antes de publicar."
    ],
    explicacion: "Ocultar el repositorio limita exposición futura, pero no invalida secretos ni elimina copias ya hechas. El inventario guía la rotación y la evaluación de impacto.",
    accion: "No confíes en borrar el último commit; los archivos pueden permanecer en el historial o en clones."
  },
  {
    id: "RI-022", icono: "✅", categoria: "Identidad", titulo: "Bombardeo de solicitudes MFA",
    escenario: "Una persona recibe muchas aprobaciones de inicio de sesión que no solicitó y una llamada le pide aceptar una para detenerlas.",
    pasos: [
      "Rechazar todas las solicitudes y no compartir códigos ni aprobar por cansancio.",
      "Finalizar la llamada y reportar el intento por un canal oficial.",
      "Cambiar la contraseña desde un dispositivo confiable y revocar sesiones.",
      "Revisar y volver a registrar métodos MFA si existe riesgo de manipulación.",
      "Analizar los intentos, bloquear indicadores y migrar a métodos resistentes al phishing."
    ],
    explicacion: "El bombardeo busca que una sola aprobación abra la cuenta. Rechazar, recuperar la contraseña y revisar métodos corta tanto el intento actual como posibles vías de repetición.",
    accion: "El soporte legítimo nunca necesita que apruebes un acceso que tú no iniciaste."
  },
  {
    id: "RI-023", icono: "📡", categoria: "Detección de red", titulo: "Equipo contacta un servidor malicioso",
    escenario: "La supervisión detecta conexiones periódicas de un equipo interno hacia un dominio asociado con comando y control.",
    pasos: [
      "Aislar lógicamente el equipo preservando su estado para análisis.",
      "Declarar el incidente y conservar alertas, flujos de red y datos del endpoint.",
      "Buscar el mismo dominio, proceso o indicador en otros equipos.",
      "Identificar y eliminar malware, persistencia y credenciales comprometidas.",
      "Reintegrar el equipo solo después de validarlo y mantener vigilancia reforzada."
    ],
    explicacion: "La conexión periódica puede indicar control remoto. El aislamiento limita órdenes o exfiltración, y la búsqueda lateral determina si el problema es un equipo o una campaña más amplia.",
    accion: "Bloquear el dominio ayuda, pero no elimina el proceso que intentará comunicarse de nuevo."
  },
  {
    id: "RI-024", icono: "🖨️", categoria: "Privacidad", titulo: "Expediente sensible abandonado en impresora",
    escenario: "Se encuentra un documento con información personal en la bandeja de una impresora compartida y no se sabe quién lo vio.",
    pasos: [
      "Retirar y custodiar el documento para detener nuevas exposiciones.",
      "Identificar de forma discreta al propietario y reportar el hallazgo al canal correspondiente.",
      "Determinar cuánto tiempo estuvo expuesto, ubicación y posibles personas con acceso.",
      "Registrar el incidente y evaluar impacto y obligaciones de privacidad.",
      "Aplicar impresión segura, liberación con credencial y recordatorios de manejo."
    ],
    explicacion: "Custodiar primero evita que más personas accedan. La evaluación posterior establece si fue un hallazgo controlado o una brecha y qué controles preventivos deben cambiar.",
    accion: "No fotografíes ni difundas el documento para preguntar de quién es."
  }

  // ===== AGREGA NUEVAS PRUEBAS JUSTO ENCIMA DE ESTE COMENTARIO =====
];
