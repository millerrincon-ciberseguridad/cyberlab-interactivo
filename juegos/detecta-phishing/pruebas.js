/*
╔══════════════════════════════════════════════════════════════════════╗
║  ZONA EDITABLE — AGREGA AQUÍ TUS PROPIAS PRUEBAS                  ║
║  1. Copia una prueba completa. 2. Pégala antes del cierre ];       ║
║  3. Cambia el id y los textos. 4. Conserva las comas y comillas.   ║
╚══════════════════════════════════════════════════════════════════════╝
AVISO: este archivo se deja legible a propósito para que el docente pueda
ampliar el banco. El motor del juego sí se entrega minificado/ofuscado.
Todos los dominios potencialmente peligrosos usan .example y no son reales.
*/
window.PRUEBAS_PHISHING = [
  {
    id: "DP-001", canal: "Correo", remitente: "Seguridad Microsoft <alertas@m1crosoft-seguridad.example>",
    asunto: "URGENTE: su cuenta será eliminada hoy", mensaje: "Detectamos actividad inusual. Confirme inmediatamente su contraseña para evitar el cierre.",
    enlace: "https://m1crosoft-seguridad.example/verificar", adjunto: "Ninguno", resultado: "phishing",
    senales: ["Dominio que imita a Microsoft con el número 1", "Amenaza y urgencia extrema", "Solicita confirmar la contraseña desde un enlace"],
    explicacion: "La suplantación usa un dominio parecido y presión para provocar un clic impulsivo.",
    accion: "No abras el enlace. Entra a tu cuenta escribiendo la dirección oficial o usando la aplicación y reporta el mensaje."
  },
  {
    id: "DP-002", canal: "Correo", remitente: "Talento Humano <talentohumano@empresa.example>",
    asunto: "Actualización anual de datos", mensaje: "La actualización estará disponible desde el portal interno. Ingresa por el marcador habitual de la intranet; no respondas con datos personales.",
    enlace: "Sin enlace", adjunto: "Ninguno", resultado: "legitimo",
    senales: ["No pide contraseñas ni datos por correo", "Remite al acceso interno ya conocido", "No contiene amenaza ni recompensa"],
    explicacion: "El mensaje orienta a usar un canal conocido y no incluye enlaces ni solicitudes sensibles.",
    accion: "Puedes acceder desde tu marcador habitual. Si el mensaje era inesperado, confirma con Talento Humano por el directorio institucional."
  },
  {
    id: "DP-003", canal: "SMS", remitente: "+57 301 555 0188", asunto: "Paquete retenido",
    mensaje: "Su paquete no pudo entregarse. Pague $4.900 en las próximas 2 horas para evitar devolución.",
    enlace: "https://envios-colombia.example/pago", adjunto: "Ninguno", resultado: "phishing",
    senales: ["Remitente desconocido", "Cobro pequeño y urgente", "Enlace que no identifica a una transportadora real"],
    explicacion: "Los fraudes de paquetería explotan la curiosidad y solicitan pagos pequeños para capturar datos bancarios.",
    accion: "No pulses el enlace. Consulta el envío en la aplicación o web oficial usando un número de guía que ya tengas."
  },
  {
    id: "DP-004", canal: "Correo", remitente: "Biblioteca <biblioteca@universidad.example>", asunto: "Préstamo próximo a vencer",
    mensaje: "El libro Introducción a redes vence el viernes. Puedes renovarlo desde el catálogo al que accedes normalmente.",
    enlace: "Sin enlace", adjunto: "Ninguno", resultado: "legitimo",
    senales: ["Da contexto específico", "No solicita credenciales ni pagos", "Indica usar el acceso habitual"],
    explicacion: "Es una notificación informativa que evita dirigir al usuario a un sitio desconocido.",
    accion: "Abre el catálogo desde el portal oficial guardado. Ante dudas, llama a la biblioteca usando el directorio público."
  },
  {
    id: "DP-005", canal: "Teams", remitente: "Director General (usuario externo)", asunto: "Compra confidencial",
    mensaje: "Estoy en reunión. Compra 10 tarjetas de regalo y envíame los códigos. No llames; es confidencial.",
    enlace: "Sin enlace", adjunto: "Ninguno", resultado: "phishing",
    senales: ["Cuenta externa que suplanta autoridad", "Petición atípica de tarjetas de regalo", "Orden de no verificar por otro canal"],
    explicacion: "Es fraude del directivo: combina autoridad, secreto y un medio de pago difícil de recuperar.",
    accion: "Detén la conversación y confirma con el directivo por un número o chat corporativo ya conocido. Reporta la cuenta."
  },
  {
    id: "DP-006", canal: "Correo", remitente: "Mesa de servicio <soporte@empresa.example>", asunto: "Caso 48217 cerrado",
    mensaje: "Tu solicitud sobre la impresora fue cerrada. Si el problema continúa, abre el portal de soporte desde la intranet y cita el caso 48217.",
    enlace: "Sin enlace", adjunto: "Ninguno", resultado: "legitimo",
    senales: ["Incluye un número de caso esperado", "No pide instalar software", "Remite al portal interno conocido"],
    explicacion: "El mensaje coincide con un trámite identificable y no intenta capturar información.",
    accion: "Verifica el caso entrando desde la intranet. No compartas credenciales por respuesta de correo."
  },
  {
    id: "DP-007", canal: "Correo", remitente: "Facturación <cobros@proveedor-facturas.example>", asunto: "Factura vencida — última notificación",
    mensaje: "Abra la factura protegida y habilite macros para visualizar el saldo pendiente.",
    enlace: "Sin enlace", adjunto: "Factura_2026.xlsm", resultado: "phishing",
    senales: ["Archivo con macros .xlsm", "Orden de habilitar contenido activo", "Factura inesperada y presión de cobro"],
    explicacion: "Las macros pueden ejecutar código malicioso. Una factura inesperada que exige habilitarlas es una alerta grave.",
    accion: "No abras ni habilites macros. Comprueba la factura con Compras y el proveedor mediante datos de contacto ya registrados."
  },
  {
    id: "DP-008", canal: "WhatsApp", remitente: "Ana — compañera conocida", asunto: "Cambio de número",
    mensaje: "Hola, cambié de número. ¿Me haces una transferencia urgente? Luego te explico.",
    enlace: "Sin enlace", adjunto: "Ninguno", resultado: "phishing",
    senales: ["Número nuevo no verificado", "Petición urgente de dinero", "Evita dar contexto comprobable"],
    explicacion: "Un atacante puede usar foto y nombre públicos para hacerse pasar por un contacto.",
    accion: "Llama a Ana al número que ya tenías o verifica en persona. Nunca transfieras basándote solo en el mensaje nuevo."
  },
  {
    id: "DP-009", canal: "Correo", remitente: "Banco Ejemplo <notificaciones@banco.example>", asunto: "Resumen mensual disponible",
    mensaje: "Tu resumen de octubre ya está disponible. Por seguridad no adjuntamos archivos ni enlaces. Consúltalo en la app oficial.",
    enlace: "Sin enlace", adjunto: "Ninguno", resultado: "legitimo",
    senales: ["No incluye enlaces ni adjuntos", "Indica usar la app instalada", "No solicita claves ni códigos"],
    explicacion: "El aviso reduce el riesgo al dirigir al cliente hacia un canal que ya controla.",
    accion: "Abre la app desde tu dispositivo, no desde respuestas o enlaces recibidos."
  },
  {
    id: "DP-010", canal: "Correo", remitente: "Servicio de nube <documentos@sharepoint-acceso.example>", asunto: "Miller compartió un documento contigo",
    mensaje: "El documento está protegido. Inicia sesión con tu correo y contraseña para descargarlo.",
    enlace: "https://sharepoint-acceso.example/login", adjunto: "Ninguno", resultado: "phishing",
    senales: ["Dominio no oficial que imita un servicio de nube", "Página externa solicita credenciales", "Documento no esperado"],
    explicacion: "Las falsas notificaciones de archivos compartidos llevan a portales que roban credenciales.",
    accion: "No uses el enlace. Abre el servicio de nube desde su aplicación o dirección oficial y busca allí el archivo compartido."
  },
  {
    id: "DP-011", canal: "QR", remitente: "Cartel en un parqueadero", asunto: "Pague aquí",
    mensaje: "Un adhesivo con QR está pegado encima del código original de la máquina. Ofrece 50 % de descuento por pago inmediato.",
    enlace: "URL oculta dentro del QR", adjunto: "Ninguno", resultado: "phishing",
    senales: ["Adhesivo superpuesto", "Descuento inusual", "El QR oculta el destino hasta escanearlo"],
    explicacion: "El quishing usa códigos QR para esconder enlaces maliciosos y puede reemplazar físicamente códigos legítimos.",
    accion: "No escanees. Usa la aplicación oficial, digita la web conocida o avisa al operador del parqueadero."
  },
  {
    id: "DP-012", canal: "Correo", remitente: "Coordinación académica <coordinacion@instituto.example>", asunto: "Cambio de salón — sesión del jueves",
    mensaje: "La sesión del jueves será en el salón 204. El cambio también aparece en el calendario institucional.",
    enlace: "Sin enlace", adjunto: "Ninguno", resultado: "legitimo",
    senales: ["Información verificable en otro sistema", "No solicita acciones sensibles", "Lenguaje normal y sin presión"],
    explicacion: "Es un aviso operativo verificable en el calendario institucional.",
    accion: "Consulta el calendario desde el acceso habitual si necesitas confirmar el cambio."
  },
  {
    id: "DP-013", canal: "Llamada", remitente: "Supuesto soporte técnico", asunto: "Virus detectado",
    mensaje: "El técnico afirma que tu equipo envía virus y pide instalar una herramienta de acceso remoto y dictarle el código.",
    enlace: "https://soporte-remoto.example/descarga", adjunto: "Ninguno", resultado: "phishing",
    senales: ["Llamada no solicitada", "Solicita acceso remoto", "Usa miedo y exige actuar durante la llamada"],
    explicacion: "El falso soporte busca controlar el equipo para robar información o dinero.",
    accion: "Cuelga. Contacta a la mesa de ayuda mediante la extensión oficial y no reveles códigos de acceso remoto."
  },
  {
    id: "DP-014", canal: "Correo", remitente: "Plataforma de formación <aula@instituto.example>", asunto: "Inscripción confirmada: Ciberseguridad",
    mensaje: "Tu inscripción fue registrada. La sesión aparece en el aula virtual. No necesitas responder a este mensaje.",
    enlace: "Sin enlace", adjunto: "Ninguno", resultado: "legitimo",
    senales: ["Confirma una acción previa", "No pide iniciar sesión mediante enlace", "Permite verificar desde el aula conocida"],
    explicacion: "La notificación corresponde a una actividad esperada y no exige una acción riesgosa.",
    accion: "Ingresa al aula desde tu marcador o portal institucional para comprobar la inscripción."
  },
  {
    id: "DP-015", canal: "SMS", remitente: "ALERTA-BANCO", asunto: "Compra por $2.450.000",
    mensaje: "Si NO reconoce la compra, confirme su identidad y código SMS aquí en 5 minutos.",
    enlace: "https://seguridad-banco.example/cancelar", adjunto: "Ninguno", resultado: "phishing",
    senales: ["Provoca miedo con una compra alta", "Solicita código de autenticación", "Enlace genérico y plazo de cinco minutos"],
    explicacion: "Los códigos de un solo uso son secretos. Un banco no debería pedirlos mediante un enlace recibido por SMS.",
    accion: "No compartas el código. Abre la app bancaria o llama al número impreso en tu tarjeta."
  },
  {
    id: "DP-016", canal: "Correo", remitente: "Compras <compras@empresa.example>", asunto: "Orden OC-9841 aprobada",
    mensaje: "La orden OC-9841 fue aprobada en el sistema. Revísala entrando al ERP desde la intranet. Este correo no contiene adjuntos.",
    enlace: "Sin enlace", adjunto: "Ninguno", resultado: "legitimo",
    senales: ["Referencia interna verificable", "No adjunta documentos inesperados", "Indica usar el ERP conocido"],
    explicacion: "El mensaje permite validación independiente y evita enlaces o adjuntos.",
    accion: "Comprueba la orden directamente en el ERP. Si no participas en esa compra, informa a Compras."
  },
  {
    id: "DP-017", canal: "Correo", remitente: "Agencia Tributaria <devoluciones@impuestos-gov.example>", asunto: "Tiene una devolución pendiente",
    mensaje: "Complete hoy el formulario con su tarjeta para recibir una devolución de $680.000.",
    enlace: "https://impuestos-gov.example/reembolso", adjunto: "Formulario.html", resultado: "phishing",
    senales: ["Dominio que imita una entidad pública", "Promesa de dinero", "Solicita datos de tarjeta y adjunta un HTML"],
    explicacion: "Las devoluciones falsas combinan recompensa, suplantación y formularios para capturar datos.",
    accion: "No abras el adjunto. Consulta el trámite escribiendo tú mismo la dirección oficial de la entidad."
  },
  {
    id: "DP-018", canal: "Teams", remitente: "Mesa de ayuda — canal oficial", asunto: "Mantenimiento programado",
    mensaje: "El servicio estará en mantenimiento de 8:00 p. m. a 9:00 p. m. El estado puede consultarse en el panel de la intranet.",
    enlace: "Sin enlace", adjunto: "Ninguno", resultado: "legitimo",
    senales: ["Publicado en canal corporativo conocido", "No pide credenciales", "Ventana de mantenimiento concreta y verificable"],
    explicacion: "Es una comunicación operativa sin solicitud sensible ni redirección externa.",
    accion: "Confirma en el panel interno si el mantenimiento afecta tu trabajo."
  },
  {
    id: "DP-019", canal: "Correo", remitente: "Candidato <hoja.vida2026@correo.example>", asunto: "Hoja de vida solicitada",
    mensaje: "Adjunto mi hoja de vida. Para verla, descomprima el archivo y ejecute el visor incluido.",
    enlace: "Sin enlace", adjunto: "HV_Candidato.zip.exe", resultado: "phishing",
    senales: ["Doble extensión .zip.exe", "Pide ejecutar un programa", "Archivo ejecutable disfrazado de documento"],
    explicacion: "Los atacantes ocultan ejecutables con nombres que parecen documentos o archivos comprimidos.",
    accion: "No ejecutes el archivo. Repórtalo y solicita documentos en un formato permitido, como PDF, mediante el canal oficial."
  },
  {
    id: "DP-020", canal: "Correo", remitente: "Proveedor habitual <contacto@proveedor.example>", asunto: "Confirmación de reunión del martes",
    mensaje: "Confirmamos la reunión del martes a las 10:00 a. m. en el enlace que ya aparece en la invitación del calendario.",
    enlace: "Sin enlace", adjunto: "Ninguno", resultado: "legitimo",
    senales: ["Refiere a una invitación ya existente", "No agrega enlaces alternativos", "No solicita pagos ni credenciales"],
    explicacion: "El correo confirma un evento conocido y dirige a la invitación original.",
    accion: "Abre la reunión desde tu calendario, no desde enlaces alternativos enviados después."
  },
  {
    id: "DP-021", canal: "Red social", remitente: "Cuenta verificada-premios", asunto: "Ganaste un sorteo",
    mensaje: "Fuiste elegido aunque no participaste. Envía foto de tu documento y paga el seguro del premio.",
    enlace: "https://premio-seguro.example/reclamar", adjunto: "Ninguno", resultado: "phishing",
    senales: ["Premio no solicitado", "Pago anticipado", "Pide copia de documento de identidad"],
    explicacion: "Un premio inesperado que exige dinero o identificación es una forma común de fraude.",
    accion: "No envíes datos ni dinero. Reporta la cuenta en la plataforma y bloquea el contacto."
  },
  {
    id: "DP-022", canal: "Correo", remitente: "Calendario <calendario@empresa.example>", asunto: "Recordatorio: Comité de seguridad",
    mensaje: "Recordatorio automático del evento que aceptaste ayer. Ábrelo desde tu calendario corporativo para ver los detalles.",
    enlace: "Sin enlace", adjunto: "Ninguno", resultado: "legitimo",
    senales: ["Corresponde a un evento aceptado", "No incorpora un enlace nuevo", "La información está en el calendario corporativo"],
    explicacion: "El recordatorio se puede verificar sin interactuar con contenido externo.",
    accion: "Usa el calendario corporativo y revisa allí organizador, asistentes y enlace de reunión."
  },
  {
    id: "DP-023", canal: "Correo", remitente: "Gerencia <gerencia.empresa@gmail.example>", asunto: "Transferencia antes del cierre",
    mensaje: "Necesito que cambies hoy la cuenta bancaria del proveedor y pagues esta nueva cuenta. Estoy viajando; no me llames.",
    enlace: "Sin enlace", adjunto: "nueva_cuenta.pdf", resultado: "phishing",
    senales: ["Dirección externa inusual", "Cambio urgente de datos bancarios", "Impide la verificación por llamada"],
    explicacion: "El fraude de correo empresarial busca desviar pagos mediante instrucciones falsas de última hora.",
    accion: "Suspende el pago y aplica el procedimiento de doble validación con contactos registrados del proveedor y la gerencia."
  },
  {
    id: "DP-024", canal: "Correo", remitente: "Seguridad de la información <seguridad@empresa.example>", asunto: "Simulacro de continuidad — viernes",
    mensaje: "El viernes habrá un simulacro. Las instrucciones están publicadas en la intranet; no se solicitarán contraseñas ni códigos.",
    enlace: "Sin enlace", adjunto: "Ninguno", resultado: "legitimo",
    senales: ["Anuncia explícitamente que no pedirá secretos", "Información disponible en intranet", "Actividad programada y verificable"],
    explicacion: "El mensaje establece límites seguros y permite verificar el anuncio en un canal interno.",
    accion: "Consulta la intranet desde el acceso habitual y sigue el protocolo del simulacro."
  }

  /*
  ====================================================================
  AGREGA NUEVAS PRUEBAS JUSTO ENCIMA DE ESTE COMENTARIO.
  Recuerda poner una coma después de la prueba anterior.

  PLANTILLA:
  ,{
    id: "DP-025", canal: "Correo", remitente: "Nombre <correo@dominio>",
    asunto: "Asunto", mensaje: "Texto visible para el estudiante",
    enlace: "Sin enlace", adjunto: "Ninguno", resultado: "phishing",
    senales: ["Señal 1", "Señal 2"],
    explicacion: "Por qué es phishing o legítimo.",
    accion: "Qué debe hacer la persona."
  }
  ====================================================================
  */
];
