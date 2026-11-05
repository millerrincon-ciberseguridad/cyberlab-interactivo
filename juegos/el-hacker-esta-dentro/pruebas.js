/*
╔══════════════════════════════════════════════════════════════════════════════╗
║ ZONA EDITABLE — PRUEBAS DE “EL HACKER ESTÁ DENTRO”                         ║
║                                                                            ║
║ Para agregar una prueba:                                                   ║
║ 1. Copia una prueba completa y pégala JUSTO ANTES del comentario final.    ║
║ 2. Usa un id único (por ejemplo, HD-025).                                   ║
║ 3. Ajusta x e y (porcentajes de 3 a 97) para ubicar el objeto en la oficina.║
║ 4. Escribe tres opciones y señala la correcta con correcta: 0, 1 o 2.       ║
║ 5. Conserva la coma entre pruebas. No insertes HTML en los textos.          ║
║                                                                            ║
║ PLANTILLA:                                                                 ║
║ {                                                                          ║
║   id: "HD-025", icono: "🔎", x: 50, y: 50, titulo: "Riesgo nuevo",       ║
║   pregunta: "¿Cuál es la acción más segura?",                             ║
║   opciones: ["Opción A", "Opción B", "Opción C"], correcta: 0,           ║
║   explicacion: "Explica por qué.",                                        ║
║   accion: "Indica la conducta segura."                                    ║
║ },                                                                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

window.PRUEBAS_HACKER_DENTRO = [
  {
    id: "HD-001", icono: "💻", x: 17, y: 55, titulo: "Equipo sin bloquear",
    pregunta: "Una persona se alejó y dejó su sesión abierta. ¿Qué conducta reduce el riesgo?",
    opciones: ["Bloquear la pantalla antes de alejarse", "Bajar el brillo", "Cerrar solo el navegador"], correcta: 0,
    explicacion: "Una sesión abierta permite leer, copiar o modificar información con la identidad del usuario.",
    accion: "Bloquea el equipo al levantarte (Windows + L o el mecanismo equivalente)."
  },
  {
    id: "HD-002", icono: "🗒️", x: 23, y: 68, titulo: "Contraseña a la vista",
    pregunta: "Hay una contraseña escrita junto al monitor. ¿Cuál es la respuesta segura?",
    opciones: ["Ocultarla bajo el teclado", "Retirarla y usar una contraseña única gestionada de forma segura", "Tomarle una foto por respaldo"], correcta: 1,
    explicacion: "Las credenciales visibles pueden ser copiadas por visitantes, cámaras o compañeros no autorizados.",
    accion: "Elimina notas con contraseñas y usa el gestor autorizado por la organización."
  },
  {
    id: "HD-003", icono: "🔌", x: 31, y: 82, titulo: "Memoria USB desconocida",
    pregunta: "Encuentras una USB sin identificar en el suelo. ¿Qué debes hacer?",
    opciones: ["Conectarla para saber de quién es", "Guardarla para usarla después", "Entregarla al canal de seguridad sin conectarla"], correcta: 2,
    explicacion: "Un dispositivo desconocido puede ejecutar código malicioso o explotar vulnerabilidades al conectarse.",
    accion: "No la conectes; repórtala y entrégala siguiendo el procedimiento interno."
  },
  {
    id: "HD-004", icono: "🚪", x: 91, y: 48, titulo: "Ingreso por seguimiento",
    pregunta: "Una persona sin identificación intenta entrar detrás de ti. ¿Cómo actúas?",
    opciones: ["Le sostienes la puerta por cortesía", "Le pides que use su credencial o pase por recepción", "Le preguntas su nombre y la dejas pasar"], correcta: 1,
    explicacion: "El seguimiento o tailgating permite evadir los controles físicos de acceso.",
    accion: "Evita prestar tu acceso y dirige a la persona al control autorizado."
  },
  {
    id: "HD-005", icono: "📄", x: 70, y: 65, titulo: "Documento en la impresora",
    pregunta: "Un informe sensible quedó en la bandeja de salida. ¿Qué control es adecuado?",
    opciones: ["Recogerlo de inmediato y usar impresión segura", "Voltearlo y dejarlo allí", "Escribir 'confidencial' encima"], correcta: 0,
    explicacion: "Los documentos abandonados pueden ser vistos o retirados por personas no autorizadas.",
    accion: "Usa liberación segura de impresión y recoge los documentos al momento."
  },
  {
    id: "HD-006", icono: "📱", x: 47, y: 76, titulo: "Teléfono desbloqueado",
    pregunta: "El teléfono corporativo está desbloqueado sobre el escritorio. ¿Qué debe configurarse?",
    opciones: ["Solo modo silencioso", "Bloqueo automático breve y autenticación segura", "Un fondo de pantalla neutro"], correcta: 1,
    explicacion: "El acceso físico al teléfono puede exponer correo, chats, contactos y códigos de autenticación.",
    accion: "Activa PIN o biometría y un tiempo corto de bloqueo automático."
  },
  {
    id: "HD-007", icono: "📷", x: 38, y: 47, titulo: "Cámara sin protección",
    pregunta: "La cámara del equipo permanece disponible fuera de las videollamadas. ¿Qué práctica es recomendable?",
    opciones: ["Cubrirla cuando no se use y revisar permisos", "Desactivar el micrófono únicamente", "Cerrar las cortinas"], correcta: 0,
    explicacion: "Una cámara comprometida puede revelar espacios, personas y documentos.",
    accion: "Usa obturador físico y limita permisos de cámara a aplicaciones autorizadas."
  },
  {
    id: "HD-008", icono: "🧾", x: 58, y: 27, titulo: "Tablero con información",
    pregunta: "El tablero muestra datos de un proyecto y será visible para visitantes. ¿Qué haces?",
    opciones: ["Dejas solo las siglas", "Fotografías el tablero", "Borras o cubres la información antes de recibirlos"], correcta: 2,
    explicacion: "Los tableros pueden revelar nombres, fechas, arquitectura, decisiones o datos personales.",
    accion: "Aplica una revisión de sala antes y después de reuniones."
  },
  {
    id: "HD-009", icono: "☁️", x: 12, y: 29, titulo: "Nube personal abierta",
    pregunta: "Un archivo laboral se está copiando a una nube personal. ¿Cuál es el problema principal?",
    opciones: ["La transferencia puede tardar", "Se pierde el control institucional sobre la información", "El archivo cambia de nombre"], correcta: 1,
    explicacion: "Servicios personales pueden carecer de autorización, retención, auditoría y controles contractuales.",
    accion: "Usa únicamente repositorios y canales aprobados por la organización."
  },
  {
    id: "HD-010", icono: "📶", x: 84, y: 19, titulo: "Red inalámbrica insegura",
    pregunta: "El punto de acceso conserva credenciales predeterminadas. ¿Qué debe hacerse?",
    opciones: ["Ocultar el nombre de la red y nada más", "Cambiar credenciales, actualizar firmware y usar cifrado robusto", "Aumentar la potencia de la señal"], correcta: 1,
    explicacion: "Credenciales predeterminadas y firmware obsoleto facilitan el control no autorizado de la red.",
    accion: "Endurece el equipo según el estándar interno y separa redes de invitados."
  },
  {
    id: "HD-011", icono: "🔋", x: 53, y: 87, titulo: "Cable de carga desconocido",
    pregunta: "Aparece un cable USB promocional sin procedencia clara. ¿Qué decisión es segura?",
    opciones: ["Usarlo solo para cargar", "Probarlo en un equipo sin información", "No conectarlo y usar accesorios autorizados"], correcta: 2,
    explicacion: "Algunos cables incorporan componentes capaces de transferir datos o ejecutar ataques.",
    accion: "Usa cargadores y cables confiables; evita accesorios encontrados o regalados sin control."
  },
  {
    id: "HD-012", icono: "🪪", x: 43, y: 35, titulo: "Credencial expuesta",
    pregunta: "Una foto pública muestra claramente la credencial de acceso. ¿Qué riesgo existe?",
    opciones: ["Puede facilitar clonación e ingeniería social", "Solo revela el color del uniforme", "Ninguno si la foto tiene baja resolución"], correcta: 0,
    explicacion: "Nombre, código, diseño y otros datos pueden ayudar a suplantar o fabricar identificaciones.",
    accion: "No publiques credenciales y repórtalas de inmediato si se pierden o exponen."
  },
  {
    id: "HD-013", icono: "👤", x: 94, y: 73, titulo: "Visitante sin acompañamiento",
    pregunta: "Un visitante camina solo por una zona de trabajo. ¿Qué corresponde?",
    opciones: ["Ignorarlo si parece seguro", "Acompañarlo o avisar al responsable y verificar su autorización", "Pedirle que espere junto a los escritorios"], correcta: 1,
    explicacion: "Los visitantes deben permanecer en zonas y horarios autorizados, con control de su recorrido.",
    accion: "Aplica el protocolo de visitantes y reporta conductas o ubicaciones inusuales."
  },
  {
    id: "HD-014", icono: "🗑️", x: 77, y: 86, titulo: "Papeles sensibles en basura común",
    pregunta: "Hay borradores con datos personales en la papelera. ¿Cómo se desechan?",
    opciones: ["Se rompen una vez por la mitad", "Se llevan a casa", "Se depositan en el contenedor seguro o se destruyen según la política"], correcta: 2,
    explicacion: "La basura común puede ser revisada y permitir reconstruir información sensible.",
    accion: "Usa trituración o contenedores de destrucción segura aprobados."
  },
  {
    id: "HD-015", icono: "💾", x: 66, y: 79, titulo: "Disco externo abandonado",
    pregunta: "Un disco de respaldo queda conectado y sin custodia. ¿Qué medida protege mejor la información?",
    opciones: ["Cifrarlo, controlar su inventario y guardarlo bajo llave", "Cambiarle la etiqueta", "Desconectarlo solo los fines de semana"], correcta: 0,
    explicacion: "Los soportes extraíbles pueden contener grandes volúmenes de información y ser sustraídos con facilidad.",
    accion: "Cifra, registra, transporta y almacena los soportes conforme al procedimiento."
  },
  {
    id: "HD-016", icono: "👀", x: 6, y: 53, titulo: "Pantalla visible desde el exterior",
    pregunta: "La pantalla puede leerse desde una ventana o zona de paso. ¿Qué control ayuda?",
    opciones: ["Aumentar el tamaño de letra", "Reubicar la pantalla y usar filtro de privacidad cuando aplique", "Cambiar el fondo de escritorio"], correcta: 1,
    explicacion: "La observación directa permite obtener información sin tocar el equipo.",
    accion: "Orienta las pantallas lejos de áreas públicas y protege contenidos sensibles."
  },
  {
    id: "HD-017", icono: "▦", x: 88, y: 34, titulo: "Código QR no verificado",
    pregunta: "Un adhesivo con QR fue colocado sobre el cartel original. ¿Qué haces?",
    opciones: ["Lo escaneas para comprobar", "Lo retiras y lo pegas en otro lugar", "No lo escaneas; verificas el cartel y lo reportas"], correcta: 2,
    explicacion: "Un QR superpuesto puede dirigir a una página de robo de credenciales o descarga maliciosa.",
    accion: "Verifica el origen de los QR y accede a servicios desde direcciones conocidas."
  },
  {
    id: "HD-018", icono: "🔊", x: 62, y: 54, titulo: "Asistente de voz en reunión",
    pregunta: "Un altavoz inteligente permanece activo durante una conversación reservada. ¿Qué medida corresponde?",
    opciones: ["Silenciar o retirar dispositivos no autorizados", "Hablar más despacio", "Cubrir únicamente la cámara"], correcta: 0,
    explicacion: "Dispositivos con micrófono pueden captar, procesar o transmitir conversaciones.",
    accion: "Controla los dispositivos presentes antes de tratar información sensible."
  },
  {
    id: "HD-019", icono: "⬆️", x: 29, y: 42, titulo: "Actualización aplazada",
    pregunta: "El equipo acumula avisos de seguridad pospuestos. ¿Qué práctica es correcta?",
    opciones: ["Esperar a que falle", "Actualizar mediante el mecanismo autorizado dentro del plazo definido", "Desinstalar las notificaciones"], correcta: 1,
    explicacion: "Las actualizaciones corrigen vulnerabilidades que pueden ser aprovechadas por atacantes.",
    accion: "Permite los parches corporativos y reporta cualquier error al soporte autorizado."
  },
  {
    id: "HD-020", icono: "🎧", x: 74, y: 38, titulo: "Conversación sensible en altavoz",
    pregunta: "Una videollamada reservada se escucha en toda la oficina. ¿Qué debes hacer?",
    opciones: ["Usar audífonos y un espacio apropiado", "Bajar el volumen solo cuando pase alguien", "Continuar si no se mencionan contraseñas"], correcta: 0,
    explicacion: "Nombres, decisiones, casos y datos operativos también pueden ser información sensible.",
    accion: "Elige un lugar privado y controla quién puede oír y ver la reunión."
  },
  {
    id: "HD-021", icono: "📓", x: 35, y: 72, titulo: "Credenciales en cuaderno",
    pregunta: "Un cuaderno contiene usuarios, contraseñas y respuestas de recuperación. ¿Qué alternativa es adecuada?",
    opciones: ["Escribirlas con lápiz", "Usar el gestor de contraseñas autorizado y eliminar la copia expuesta", "Guardar el cuaderno en el cajón durante el almuerzo"], correcta: 1,
    explicacion: "Agrupar credenciales sin protección crea un único punto de exposición.",
    accion: "Migra las credenciales a un sistema aprobado y cambia las que hayan quedado expuestas."
  },
  {
    id: "HD-022", icono: "🖱️", x: 50, y: 58, titulo: "Adaptador inalámbrico ajeno",
    pregunta: "Hay un receptor USB desconocido conectado detrás del equipo. ¿Qué procede?",
    opciones: ["Dejarlo si el mouse funciona", "Retirarlo sin avisar y desecharlo", "No manipular más de lo necesario, aislar el riesgo y reportarlo a soporte o seguridad"], correcta: 2,
    explicacion: "Un periférico no autorizado puede comportarse como teclado, red o almacenamiento y ejecutar acciones.",
    accion: "Reporta dispositivos no inventariados y sigue la guía de respuesta del área técnica."
  },
  {
    id: "HD-023", icono: "🗄️", x: 81, y: 68, titulo: "Archivo físico sin llave",
    pregunta: "Un archivador con expedientes queda abierto en un área compartida. ¿Qué control corresponde?",
    opciones: ["Cerrar con llave y limitar el acceso a personal autorizado", "Ordenar los expedientes alfabéticamente", "Cubrir el archivador con una tela"], correcta: 0,
    explicacion: "La información en papel requiere controles de acceso y custodia equivalentes a los digitales.",
    accion: "Mantén archivos sensibles cerrados y aplica registro de préstamo cuando corresponda."
  },
  {
    id: "HD-024", icono: "🖥️", x: 56, y: 42, titulo: "Pantalla compartida sin revisar",
    pregunta: "Antes de compartir pantalla aparecen notificaciones y archivos personales. ¿Qué práctica evita filtraciones?",
    opciones: ["Compartir todo el escritorio para ahorrar tiempo", "Cerrar contenido ajeno, silenciar notificaciones y compartir solo la ventana necesaria", "Minimizar el navegador después de empezar"], correcta: 1,
    explicacion: "Compartir el escritorio completo puede mostrar mensajes, nombres de archivos, datos personales o credenciales.",
    accion: "Prepara el escritorio y limita la compartición a la aplicación requerida."
  }

  // ===== AGREGA NUEVAS PRUEBAS JUSTO ENCIMA DE ESTE COMENTARIO =====
];
