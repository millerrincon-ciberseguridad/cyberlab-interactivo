/*
 * BANCO DE PRUEBAS — DETECTA EL PHISHING
 * =======================================
 * Para agregar una prueba:
 * 1. Copie un objeto completo del arreglo PHISHING_TESTS.
 * 2. Cambie id (debe ser único), level (1–4), contenido y answer.
 * 3. Incluya al menos 3 signals y mezcle señales danger/safe/context.
 * 4. Ejecute: node tests/validate.mjs
 *
 * answer: "phishing" o "legit"
 * type: email | sms | qr | call | chat | login | push | calendar
 */
window.PHISHING_TESTS = [
  {
    id: "L1-01", level: 1, type: "email", answer: "phishing", points: 100,
    title: "La cuenta vence hoy", senderName: "Soporte Microsoft 365", sender: "seguridad@micros0ft-soporte.example",
    recipient: "usuario@entidad.example", subject: "ACCIÓN REQUERIDA: Su buzón será eliminado en 30 minutos",
    time: "08:14", body: ["Detectamos actividad inusual. Para evitar el cierre definitivo, confirme su contraseña ahora.", "Mantener mi cuenta activa"],
    links: [{label:"Mantener mi cuenta activa", url:"https://microsoft-verificacion.example/login"}],
    signals: [
      {kind:"danger", label:"Dominio parecido, no oficial", detail:"“micros0ft” usa un cero en lugar de la letra o y termina en .example; el nombre visible no autentica al remitente."},
      {kind:"danger", label:"Urgencia y amenaza", detail:"El plazo de 30 minutos busca impedir que se verifique por otro canal."},
      {kind:"danger", label:"Solicitud de contraseña", detail:"Un servicio legítimo no pide reenviar ni confirmar la contraseña desde un enlace de correo."},
      {kind:"context", label:"Diseño y tono plausibles", detail:"La marca y el lenguaje administrativo son distractores; deben pesar menos que el dominio y el destino real."}
    ], explanation:"Es phishing de credenciales. La decisión debe basarse en la identidad técnica del remitente y el dominio del enlace, no en el logotipo ni en la apariencia.", action:"No abra el enlace. Entre al portal desde un marcador conocido y reporte el mensaje."
  },
  {
    id: "L1-02", level: 1, type: "email", answer: "legit", points: 100,
    title: "Restablecimiento solicitado", senderName: "Ciberaula", sender: "no-responder@ciberaula.example.org",
    recipient: "usuario@entidad.example", subject: "Código para restablecer tu contraseña",
    time: "09:02", body: ["Solicitaste restablecer tu contraseña desde el portal institucional.", "Código de un solo uso: 184 627. Vence en 10 minutos. Si no fuiste tú, ignora este correo y comunícate con la mesa de ayuda por el número de la intranet."],
    links: [],
    signals: [
      {kind:"safe", label:"Acción iniciada por el usuario", detail:"El mensaje coincide con una solicitud que el jugador acaba de realizar en el portal conocido."},
      {kind:"safe", label:"No pide responder ni entregar la clave", detail:"Entrega un código temporal y recomienda usar el canal institucional."},
      {kind:"safe", label:"Dominio institucional exacto", detail:"El remitente usa ciberaula.example.org, sin guiones añadidos ni sustituciones."},
      {kind:"context", label:"Un código también puede ser objetivo de fraude", detail:"Es legítimo en este contexto, pero nunca debe dictarse a alguien que llame o escriba después."}
    ], explanation:"Es legítimo dentro del escenario porque fue solicitado, no redirige a una página y usa el dominio previsto. Un mensaje similar no solicitado requeriría tratarse como alerta.", action:"Use el código únicamente en la sesión que usted inició y no lo comparta."
  },
  {
    id: "L1-03", level: 1, type: "sms", answer: "phishing", points: 100,
    title: "Paquete retenido", senderName: "Envíos Express", sender: "+57 301 555 0184",
    subject: "SMS recibido", time: "10:31", body: ["Su paquete #CO-78104 está retenido por una tasa pendiente de $4.900. Pague hoy: envi0s-co.example/p/78104"],
    links: [{label:"envi0s-co.example/p/78104", url:"https://envi0s-co.example/p/78104"}],
    signals: [
      {kind:"danger", label:"Enlace acortado o ajeno", detail:"El dominio usa un cero en “envi0s” y no coincide con un operador verificado."},
      {kind:"danger", label:"Cobro pequeño", detail:"Una suma baja reduce la cautela y busca capturar los datos completos de tarjeta."},
      {kind:"danger", label:"Mensaje no contextualizado", detail:"No identifica de forma comprobable al remitente, comercio ni guía rastreable en el portal real."},
      {kind:"context", label:"Número y referencia plausibles", detail:"El formato local y el número de paquete son fáciles de fabricar."}
    ], explanation:"Es smishing. Combina un cobro pequeño, prisa y un dominio impostor para obtener datos de pago.", action:"No pulse el enlace. Consulte la guía escribiendo manualmente la dirección oficial del transportador."
  },
  {
    id: "L1-04", level: 1, type: "qr", answer: "phishing", points: 100,
    title: "Encuesta con premio", senderName: "Afiche en la cafetería", sender: "Código QR impreso",
    subject: "Responda y reciba un bono", time: "11:10", body: ["Encuesta de bienestar institucional. Solo hoy: bono de $80.000 para las primeras 50 respuestas.", "Al escanear, la cámara muestra: forms-beneficios.example/entidad/iniciar"],
    qr: {label:"Escanear encuesta", payload:"https://forms-beneficios.example/entidad/iniciar"},
    signals: [
      {kind:"danger", label:"QR fuera de canal oficial", detail:"Un afiche puede ser reemplazado o cubierto con una etiqueta maliciosa."},
      {kind:"danger", label:"Premio y escasez", detail:"“Solo hoy” y “primeras 50” presionan para actuar sin verificar."},
      {kind:"danger", label:"Dominio genérico", detail:"forms-beneficios.example no es el dominio institucional anunciado."},
      {kind:"context", label:"Tema creíble", detail:"Las encuestas de bienestar existen; el tema legítimo no valida este QR concreto."}
    ], explanation:"Es quishing: un QR traslada el enlace fuera de la vista y aprovecha un lugar físico confiable.", action:"Busque la encuesta en la intranet o confirme con Bienestar antes de escanear."
  },
  {
    id: "L1-05", level: 1, type: "email", answer: "legit", points: 100,
    title: "Boletín sin acción sensible", senderName: "Comunicaciones Internas", sender: "comunicaciones@entidad.example.org",
    recipient: "Todos los funcionarios", subject: "Boletín semanal — actividades del 16 al 20 de noviembre",
    time: "12:06", body: ["Consulte las actividades culturales y de formación de esta semana en la intranet.", "También puede abrir la intranet escribiendo intranet.entidad.example.org en su navegador."],
    links: [{label:"Ver agenda en la intranet", url:"https://intranet.entidad.example.org/agenda"}],
    signals: [
      {kind:"safe", label:"Dominio exacto y coherente", detail:"Remitente y enlace pertenecen a entidad.example.org y usan HTTPS."},
      {kind:"safe", label:"Sin urgencia ni datos sensibles", detail:"El correo informa y ofrece una ruta alternativa; no amenaza ni solicita credenciales."},
      {kind:"safe", label:"Contenido esperado", detail:"La periodicidad y el tema coinciden con un boletín interno conocido."},
      {kind:"context", label:"Un dominio correcto no basta por sí solo", detail:"Aun así conviene vigilar cambios inusuales o cuentas internas comprometidas."}
    ], explanation:"Es legítimo según el contexto. Varias señales independientes son coherentes: origen, destino, expectativa y ausencia de una petición riesgosa.", action:"Puede consultar el contenido; para máxima seguridad, escriba la dirección de la intranet."
  },
  {
    id: "L1-06", level: 1, type: "email", answer: "phishing", points: 100,
    title: "Factura comprimida", senderName: "Proveedor Logístico", sender: "facturacion.proveedor@gmail.example",
    recipient: "tesoreria@entidad.example", subject: "Factura corregida 8841 — pago vencido",
    time: "13:22", body: ["Adjuntamos la factura rectificada solicitada. Habilite contenido para visualizarla. El pago debe salir hoy para evitar reporte."],
    attachment: {name:"Factura_8841.zip", note:"Contiene Factura_8841.xlsm"},
    signals: [
      {kind:"danger", label:"Adjunto comprimido con macro", detail:"ZIP + XLSM oculta un archivo capaz de ejecutar código; “habilite contenido” es una señal crítica."},
      {kind:"danger", label:"Remitente gratuito e inesperado", detail:"La supuesta empresa escribe desde una cuenta ajena a su dominio habitual."},
      {kind:"danger", label:"Presión de pago", detail:"La amenaza de reporte intenta saltarse la validación contable."},
      {kind:"context", label:"Número de factura específico", detail:"Los atacantes pueden obtener referencias reales de conversaciones o documentos filtrados."}
    ], explanation:"Es phishing con adjunto malicioso. La especificidad de la factura no neutraliza el riesgo del remitente y del formato ejecutable.", action:"No extraiga el ZIP. Valide la factura con el proveedor usando el contacto registrado y envíe el archivo a análisis."
  },
  {
    id: "L1-07", level: 1, type: "call", answer: "phishing", points: 100,
    title: "Llamada del banco", senderName: "Área antifraude", sender: "+57 601 390 7788",
    subject: "Llamada entrante", time: "14:05", body: ["Voz: “Vemos una compra sospechosa. Para cancelarla, dígame el código de seis dígitos que acaba de llegarle. No cuelgue o la transacción quedará aprobada”."],
    signals: [
      {kind:"danger", label:"Pide un código de autenticación", detail:"El código de un solo uso autoriza una operación; nunca debe dictarse a un interlocutor."},
      {kind:"danger", label:"Impide verificar", detail:"“No cuelgue” busca mantener el control y bloquear una llamada independiente al banco."},
      {kind:"danger", label:"Identificador de llamada falsificable", detail:"El número mostrado puede suplantarse; no demuestra que llame el banco."},
      {kind:"context", label:"Conoce parte de la operación", detail:"Datos personales o bancarios parciales pueden venir de filtraciones y se usan para ganar confianza."}
    ], explanation:"Es vishing. El objetivo es obtener el segundo factor o inducir una autorización mientras la víctima permanece en línea.", action:"Cuelgue. Llame al número impreso en la tarjeta o abra la aplicación bancaria por separado."
  },
  {
    id: "L1-08", level: 1, type: "chat", answer: "phishing", points: 100,
    title: "El jefe necesita tarjetas", senderName: "Director General", sender: "Cuenta externa · invitado",
    subject: "Chat directo", time: "15:17", body: ["Estoy entrando a una reunión. Compra 8 tarjetas de regalo de $200.000 y envíame fotos de los códigos. Es confidencial; luego legalizamos."],
    signals: [
      {kind:"danger", label:"Pago irreversible", detail:"Las tarjetas y sus códigos funcionan como efectivo y casi no permiten recuperación."},
      {kind:"danger", label:"Autoridad + secreto", detail:"La suplantación del jefe explota obediencia y evita consultar a colegas."},
      {kind:"danger", label:"Cuenta externa", detail:"El perfil tiene el nombre correcto, pero está marcado como invitado y no es la cuenta corporativa."},
      {kind:"danger", label:"Evita el proceso", detail:"“Luego legalizamos” intenta eludir compras, aprobaciones y trazabilidad."}
    ], explanation:"Es fraude del jefe o BEC por chat. El nombre visible es fácil de copiar; la solicitud y el canal rompen el proceso normal.", action:"No compre nada. Confirme por llamada a un número conocido y reporte la cuenta."
  },
  {
    id: "L1-09", level: 1, type: "push", answer: "legit", points: 100,
    title: "Inicio de sesión propio", senderName: "Aplicación Authenticator", sender: "Notificación del dispositivo administrado",
    subject: "¿Está intentando iniciar sesión?", time: "16:40", body: ["Solicitud para usuario@entidad.example desde Bogotá. Número mostrado en su computador: 42.", "Usted acaba de abrir el portal institucional desde ese computador y el número coincide."],
    signals: [
      {kind:"safe", label:"Acción simultánea iniciada por usted", detail:"La notificación llega mientras se autentica en el portal conocido."},
      {kind:"safe", label:"Coincidencia numérica", detail:"El número 42 coincide en ambos dispositivos y reduce aprobaciones accidentales."},
      {kind:"safe", label:"Ubicación esperada", detail:"Bogotá es coherente con la sesión actual; sigue siendo una señal contextual, no absoluta."},
      {kind:"context", label:"La misma notificación sería sospechosa sin intento propio", detail:"No se debe aprobar por rutina ni para detener notificaciones repetidas."}
    ], explanation:"Es legítima en este escenario porque la solicitud fue iniciada por el usuario y los datos coinciden. La legitimidad depende del contexto inmediato.", action:"Apruebe solo esta solicitud. Si aparece otra no iniciada, rechácela y cambie la contraseña."
  },

  {
    id: "L2-01", level: 2, type: "email", answer: "phishing", points: 150,
    title: "Respuesta dentro de un hilo real", senderName: "Laura Méndez — Proveedora", sender: "laura@proveed0r-logistica.example",
    recipient: "contratos@entidad.example", subject: "RE: Renovación contrato de transporte 2027",
    time: "08:27", body: ["Como acordamos abajo, adjunto el anexo final. Migramos el correo esta semana; por eso verá el nuevo dominio.", "Revise y firme antes del comité de las 10:00."],
    attachment: {name:"Anexo_final.html", note:"Página de inicio de sesión incluida como archivo"},
    quoted:"Fragmentos auténticos del hilo anterior, con fechas, firmas y valores correctos.",
    signals: [
      {kind:"danger", label:"Dominio primo", detail:"proveed0r-logistica usa cero; se parece al dominio verdadero proveedor-logistica.example."},
      {kind:"danger", label:"Adjunto HTML", detail:"Puede imitar una pantalla de Microsoft sin necesitar un sitio visible en el enlace."},
      {kind:"danger", label:"Explicación preventiva", detail:"“Migramos el correo” anticipa la discrepancia que el atacante espera que se note."},
      {kind:"context", label:"Hilo auténtico", detail:"Una cuenta o buzón comprometido permite copiar conversaciones reales; el contexto correcto no autentica al nuevo remitente."}
    ], explanation:"Es secuestro de hilo con dominio parecido. Los datos históricos son un señuelo potente, pero la identidad cambió y el adjunto es riesgoso.", action:"Contacte a Laura usando el teléfono o dominio guardado anteriormente; no use datos del mensaje."
  },
  {
    id: "L2-02", level: 2, type: "email", answer: "phishing", points: 150,
    title: "Dominio con caracteres Unicode", senderName: "Mesa de ayuda", sender: "soporte@entidаd.example.org",
    recipient: "usuario@entidad.example", subject: "Cierre de sesión obligatorio",
    time: "09:11", body: ["Por actualización de seguridad, valide su sesión SSO.", "El remitente parece decir entidad, pero la segunda “a” de entidаd es cirílica (U+0430)."],
    links: [{label:"Validar SSO", url:"https://sso.entidаd.example.org/session"}],
    signals: [
      {kind:"danger", label:"Homógrafo Unicode", detail:"La “а” cirílica se ve casi idéntica a la “a” latina, pero forma otro dominio."},
      {kind:"danger", label:"Inicio de sesión desde enlace", detail:"Solicita credenciales en una dirección visualmente engañosa."},
      {kind:"danger", label:"Cambio genérico de seguridad", detail:"No aporta ticket, ventana de mantenimiento ni canal de soporte verificable."},
      {kind:"context", label:"HTTPS presente", detail:"El candado solo cifra la conexión con el sitio impostor; no garantiza identidad legítima."}
    ], explanation:"Es phishing por homógrafo internacionalizado. Hay que comparar caracteres y, cuando exista duda, navegar desde un marcador conocido.", action:"Cierre el mensaje y abra el portal institucional manualmente. Reporte el dominio homógrafo."
  },
  {
    id: "L2-03", level: 2, type: "qr", answer: "legit", points: 150,
    title: "QR de inscripción verificado", senderName: "Escuela de Formación", sender: "Cartel dentro de la intranet",
    subject: "Inscripción a curso", time: "10:04", body: ["El QR se encuentra en una página autenticada de la intranet. La vista previa muestra https://intranet.entidad.example.org/formacion/curso-27 y existe también un botón con el mismo destino."],
    qr: {label:"Curso 27", payload:"https://intranet.entidad.example.org/formacion/curso-27"},
    links: [{label:"Abrir sin QR", url:"https://intranet.entidad.example.org/formacion/curso-27"}],
    signals: [
      {kind:"safe", label:"Origen controlado", detail:"El QR está embebido en una página autenticada conocida, no en una etiqueta física anónima."},
      {kind:"safe", label:"Destino visible y coincidente", detail:"La vista previa y el botón alternativo muestran el mismo dominio institucional exacto."},
      {kind:"safe", label:"No solicita secreto inesperado", detail:"La sesión existente identifica al usuario; no pide reenviar contraseñas o códigos."},
      {kind:"context", label:"Un QR nunca es legítimo solo por su aspecto", detail:"La confianza viene del origen y del destino comprobables, no del patrón gráfico."}
    ], explanation:"Es legítimo según las evidencias disponibles. El QR tiene ruta alternativa y un destino institucional verificable.", action:"Puede usar el botón directo o el QR; compruebe la vista previa antes de continuar."
  },
  {
    id: "L2-04", level: 2, type: "sms", answer: "phishing", points: 150,
    title: "Comparendo pendiente", senderName: "Movilidad", sender: "MOVILIDAD-INFO",
    subject: "SMS con identificador alfanumérico", time: "10:46", body: ["Último día para pagar comparendo con 50% de descuento. Consulte placa y evidencia: movilidad-gov-co.example/caso/99418"],
    links: [{label:"Consultar evidencia", url:"https://movilidad-gov-co.example/caso/99418"}],
    signals: [
      {kind:"danger", label:"Dominio que imita palabras oficiales", detail:"Incluir “gov” y “co” dentro del nombre no equivale a un dominio gubernamental real."},
      {kind:"danger", label:"Descuento con fecha límite", detail:"El beneficio económico presiona a abrir antes de revisar."},
      {kind:"danger", label:"No identifica placa", detail:"Promete datos personalizados detrás del enlace para atraer el clic."},
      {kind:"context", label:"Remitente alfanumérico", detail:"Puede falsificarse o alquilarse; no es prueba suficiente de origen."}
    ], explanation:"Es smishing temático. La autoridad aparente proviene del texto y del identificador, pero el destino no pertenece al organismo.", action:"Consulte comparendos desde el portal oficial escrito manualmente, no desde el SMS."
  },
  {
    id: "L2-05", level: 2, type: "call", answer: "legit", points: 150,
    title: "Llamada de verificación sin secretos", senderName: "Mesa de servicio", sender: "Extensión interna 7412",
    subject: "Seguimiento al ticket INC-28417", time: "11:32", body: ["Agente: “Llamo por el ticket que usted abrió hace 20 minutos. No me indique su contraseña ni códigos. Le enviaré los pasos por el portal del ticket; confirme únicamente si el equipo termina en activo 6F2”."],
    signals: [
      {kind:"safe", label:"Ticket iniciado por el usuario", detail:"Número, tiempo y problema coinciden con una gestión recién creada."},
      {kind:"safe", label:"Rechaza secretos", detail:"El agente dice explícitamente que no solicita contraseña ni códigos."},
      {kind:"safe", label:"Canal trazable", detail:"Los pasos quedarán en el portal institucional del ticket, que puede abrirse independientemente."},
      {kind:"context", label:"Una extensión interna también puede suplantarse", detail:"La legitimidad se apoya en el conjunto de señales y puede confirmarse volviendo a llamar a la mesa."
      }
    ], explanation:"Es legítima en este escenario. La llamada se relaciona con una acción reciente, evita datos sensibles y mantiene trazabilidad.", action:"Continúe sin compartir secretos. Si algo cambia, cuelgue y retome el ticket desde el portal."
  },
  {
    id: "L2-06", level: 2, type: "push", answer: "phishing", points: 150,
    title: "Fatiga de MFA", senderName: "Authenticator", sender: "12 notificaciones en 4 minutos",
    subject: "Aprobar inicio de sesión", time: "12:18", body: ["No está intentando iniciar sesión. Después de varias solicitudes, recibe una llamada: “Somos soporte; apruebe la siguiente para detener el ataque”."],
    signals: [
      {kind:"danger", label:"Solicitud no iniciada", detail:"Cualquier aprobación sin un inicio de sesión propio debe rechazarse."},
      {kind:"danger", label:"Bombardeo de notificaciones", detail:"La repetición busca cansar o provocar una aprobación accidental."},
      {kind:"danger", label:"Llamada coordinada", detail:"El atacante convierte la alerta en una falsa solución y pide exactamente la acción que necesita."},
      {kind:"context", label:"Aplicación auténtica", detail:"La notificación puede ser real, pero fue disparada por un atacante que ya conoce la contraseña."}
    ], explanation:"Es un ataque de fatiga MFA. La interfaz genuina no vuelve legítima una solicitud no iniciada.", action:"Rechace, marque como fraude, cambie la contraseña desde un dispositivo confiable y contacte a seguridad."
  },
  {
    id: "L2-07", level: 2, type: "email", answer: "legit", points: 150,
    title: "Documento compartido externamente", senderName: "Microsoft SharePoint", sender: "no-reply@sharepointonline.com",
    recipient: "usuario@entidad.example", subject: "Ana Vega compartió “Mapa de procesos v5” con usted",
    time: "13:07", body: ["Esperaba el documento después de una reunión con Ana. El enlace visible apunta al tenant entidad.sharepoint.com y al abrirlo el navegador ya muestra su sesión institucional, sin pedir credenciales nuevas."],
    links: [{label:"Abrir Mapa de procesos v5", url:"https://entidad.sharepoint.com/sites/procesos/Documentos/Mapa-v5"}],
    signals: [
      {kind:"safe", label:"Documento esperado", detail:"El archivo y la persona coinciden con una conversación previa."},
      {kind:"safe", label:"Tenant conocido", detail:"El destino es entidad.sharepoint.com, sin redireccionadores ni dominios añadidos."},
      {kind:"safe", label:"Sesión existente", detail:"No aparece una página de autenticación inesperada ni se solicitan códigos."},
      {kind:"context", label:"Las invitaciones reales también se imitan", detail:"Si el documento no fuera esperado, convendría abrir SharePoint directamente y buscarlo allí."}
    ], explanation:"Es legítimo dentro del escenario. Expectativa, remitente del servicio y tenant de destino coinciden.", action:"Puede abrirlo; para mayor seguridad, acceda a SharePoint desde el iniciador de aplicaciones."
  },
  {
    id: "L2-08", level: 2, type: "calendar", answer: "phishing", points: 150,
    title: "Invitación de calendario con soporte falso", senderName: "Mesa Microsoft", sender: "calendar@soporte-remoto.example",
    recipient: "usuario@entidad.example", subject: "URGENTE: Licencia suspendida — asistencia remota",
    time: "14:25", body: ["La invitación apareció automáticamente en el calendario. En las notas pide llamar al +57 601 555 0199 e instalar “QuickSupport_Update.exe” antes de la cita."],
    attachment: {name:"QuickSupport_Update.exe", note:"Descarga enlazada desde las notas"},
    signals: [
      {kind:"danger", label:"Evento no solicitado", detail:"Los atacantes pueden enviar invitaciones que se agregan automáticamente sin aceptación."},
      {kind:"danger", label:"Ejecutable de soporte", detail:"Pide instalar una herramienta desde una fuente no autorizada."},
      {kind:"danger", label:"Dominio externo", detail:"soporte-remoto.example no pertenece a Microsoft ni a la organización."},
      {kind:"context", label:"Aparece en una aplicación confiable", detail:"El calendario muestra contenido recibido; no valida al organizador."}
    ], explanation:"Es calendar phishing. Aprovecha que un evento puede verse oficial al aparecer dentro del calendario del usuario.", action:"No llame ni instale. Elimine o reporte la invitación y consulte licencias desde el portal oficial."
  },
  {
    id: "L2-09", level: 2, type: "chat", answer: "phishing", points: 150,
    title: "Soporte por mensajería", senderName: "TI | Verificado", sender: "Usuario externo · ti-ayuda.example",
    subject: "Mensaje de Teams", time: "15:51", body: ["Detectamos malware. Para limpiar su cuenta, abra el formulario y copie el código de recuperación que verá en aka.ms/mysecurityinfo."],
    links: [{label:"Formulario de limpieza", url:"https://ti-ayuda.example/form"}],
    signals: [
      {kind:"danger", label:"Pide un código de recuperación", detail:"Ese código permite tomar control o registrar métodos de autenticación."},
      {kind:"danger", label:"Etiqueta “Verificado” escrita en el nombre", detail:"Es texto elegido por el atacante, no una insignia del sistema."},
      {kind:"danger", label:"Usuario externo", detail:"La aplicación advierte que la cuenta no pertenece al tenant."},
      {kind:"context", label:"Incluye un enlace oficial", detail:"Mencionar aka.ms no legitima el formulario externo donde se pide copiar el resultado."}
    ], explanation:"Es phishing por chat. Combina un recurso real con instrucciones maliciosas y una falsa marca de verificación.", action:"No comparta códigos. Use el canal de mesa de ayuda publicado en la intranet."
  },

  {
    id: "L3-01", level: 3, type: "email", answer: "phishing", points: 220,
    title: "Cambio de cuenta bancaria", senderName: "Carlos Ruiz | Construcciones Andinas", sender: "c.ruiz@construcciones-andinas.co",
    recipient: "pagos@entidad.example", subject: "RE: Acta 18 — actualización para desembolso",
    time: "08:09", body: ["Por auditoría cambiamos de banco. Aplique la cuenta adjunta al pago de hoy. El interventor está copiado.", "El dominio habitual del proveedor es construccionesandinas.co (sin guion)."],
    attachment: {name:"Certificacion_bancaria.pdf", note:"PDF visualmente correcto"},
    signals: [
      {kind:"danger", label:"Dominio primo con guion", detail:"construcciones-andinas.co es distinto del dominio histórico construccionesandinas.co."},
      {kind:"danger", label:"Cambio financiero de alto impacto", detail:"Toda modificación bancaria requiere verificación fuera del correo, aunque el PDF parezca válido."},
      {kind:"danger", label:"Presión por pago del día", detail:"Reduce el tiempo disponible para el procedimiento de doble control."},
      {kind:"context", label:"Interventor copiado", detail:"El atacante puede copiar nombres reales o usar direcciones parecidas; un CC no es aprobación."}
    ], explanation:"Es BEC con dominio primo. El mensaje evita malware y se concentra en desviar un pago real.", action:"Congele el cambio y confirme con contactos registrados, doble aprobación y validación bancaria independiente."
  },
  {
    id: "L3-02", level: 3, type: "login", answer: "phishing", points: 220,
    title: "Consentimiento OAuth engañoso", senderName: "PDF Cloud Reader", sender: "Pantalla de permisos de Microsoft",
    subject: "Aplicación solicita acceso", time: "09:18", body: ["PDF Cloud Reader solicita: leer su perfil, mantener acceso a los datos, leer todo su correo y enviar correo como usted.", "El editor figura como “no verificado”. No pide contraseña porque usa la sesión real de Microsoft."],
    signals: [
      {kind:"danger", label:"Permisos excesivos", detail:"Leer y enviar todo el correo no es necesario para visualizar un PDF."},
      {kind:"danger", label:"Acceso persistente", detail:"“Mantener acceso” permite operar incluso cuando el usuario cierre sesión."},
      {kind:"danger", label:"Editor no verificado", detail:"No demuestra por sí solo malicia, pero eleva el riesgo junto con el alcance solicitado."},
      {kind:"context", label:"Dominio de Microsoft real", detail:"La autorización ocurre en una página legítima; el abuso está en la aplicación y sus permisos."}
    ], explanation:"Es phishing de consentimiento OAuth. No roba la contraseña: persuade al usuario para conceder acceso legítimo a una aplicación maliciosa.", action:"Cancele. Reporte la aplicación y revise consentimientos existentes con el equipo de identidad."
  },
  {
    id: "L3-03", level: 3, type: "email", answer: "legit", points: 220,
    title: "Cambio bancario correctamente verificado", senderName: "Construcciones Andinas", sender: "c.ruiz@construccionesandinas.co",
    recipient: "pagos@entidad.example", subject: "Ticket PRV-442 — actualización bancaria aprobada",
    time: "10:02", body: ["El cambio fue iniciado en el portal de proveedores hace cinco días. Compras verificó por videollamada al representante registrado; Tesorería aprobó el ticket PRV-442 con doble control. Este correo solo notifica el cierre y no adjunta instrucciones nuevas."],
    signals: [
      {kind:"safe", label:"Proceso fuera del correo", detail:"La modificación nació y se aprobó en el portal, no por una instrucción aislada."},
      {kind:"safe", label:"Dominio histórico exacto", detail:"Coincide con construccionesandinas.co, sin guiones ni caracteres sustituidos."},
      {kind:"safe", label:"Doble verificación trazable", detail:"Ticket, videollamada a contacto registrado y aprobación segregada reducen el riesgo BEC."},
      {kind:"context", label:"Un correo no prueba el proceso", detail:"La legitimidad depende de que el ticket y las aprobaciones puedan comprobarse directamente en el sistema."}
    ], explanation:"Es legítimo porque el cambio sensible fue validado mediante un proceso independiente y trazable. El correo es informativo.", action:"Archive la notificación y confirme que el ticket esté cerrado en el portal antes del pago."
  },
  {
    id: "L3-04", level: 3, type: "email", answer: "phishing", points: 220,
    title: "Factura desde proveedor comprometido", senderName: "Distribuciones Central", sender: "facturas@distribucionescentral.example",
    recipient: "cuentas@entidad.example", subject: "RE: Orden 55018 — saldo final",
    time: "10:57", body: ["El correo proviene del dominio verdadero y pasa SPF, DKIM y DMARC. Sin embargo, cambia la cuenta bancaria en el cuerpo y pide ignorar el portal de proveedores “por mantenimiento”."],
    signals: [
      {kind:"danger", label:"Cuenta legítima comprometida", detail:"SPF/DKIM/DMARC validan la infraestructura del dominio, no la intención de quien controla la cuenta."},
      {kind:"danger", label:"Evita el portal", detail:"El mensaje intenta sacar una operación sensible del sistema de control."},
      {kind:"danger", label:"Cambio bancario en el cuerpo", detail:"Una solicitud de alto riesgo no debe aceptarse solo por correo."},
      {kind:"context", label:"Autenticación de correo correcta", detail:"Es una señal técnica positiva, pero no compensa el cambio de proceso ni la petición financiera."}
    ], explanation:"Es un ataque desde una cuenta real comprometida. La autenticación del dominio no detecta abuso de una identidad válida.", action:"Bloquee el pago, llame al proveedor con datos maestros y alerte sobre posible compromiso."
  },
  {
    id: "L3-05", level: 3, type: "email", answer: "phishing", points: 220,
    title: "Archivo HTML que funciona sin internet", senderName: "Firma Segura", sender: "notificaciones@firma-segura.example",
    recipient: "usuario@entidad.example", subject: "Documento laboral pendiente de firma",
    time: "11:43", body: ["Abra el archivo adjunto para revisar el documento cifrado. La pantalla local muestra el logotipo institucional y pide correo, contraseña y código MFA."],
    attachment: {name:"Documento_protegido.html", note:"Formulario de acceso embebido"},
    signals: [
      {kind:"danger", label:"Formulario dentro de HTML adjunto", detail:"Puede capturar datos o enviarlos a un servidor sin mostrar una URL evidente."},
      {kind:"danger", label:"Solicita tres factores", detail:"Una firma legítima no debería pedir contraseña corporativa y código MFA dentro de un archivo."},
      {kind:"danger", label:"Servicio no esperado", detail:"No existe solicitud previa ni documento identificable en el portal de firmas habitual."},
      {kind:"context", label:"Funciona “localmente”", detail:"Que el navegador muestre file:// no vuelve seguro el contenido activo del archivo."}
    ], explanation:"Es phishing mediante HTML adjunto, una técnica que evita filtros de URL y crea una pantalla local convincente.", action:"Cierre el archivo, no introduzca datos y consulte el portal de firmas desde un marcador."
  },
  {
    id: "L3-06", level: 3, type: "call", answer: "phishing", points: 220,
    title: "Voz clonada del directivo", senderName: "Subdirector", sender: "Nota de voz en mensajería",
    subject: "Transferencia confidencial", time: "12:20", body: ["La voz y el modo de hablar coinciden con el subdirector: “Estoy con los abogados. Gira hoy $18 millones a la cuenta que te enviará este número. No llames; la operación es reservada”."],
    signals: [
      {kind:"danger", label:"Voz no equivale a identidad", detail:"Clonación de voz y audios públicos permiten imitar tono, acento y expresiones."},
      {kind:"danger", label:"Secreto y prohibición de llamar", detail:"Aísla a la víctima y elimina el canal de verificación."},
      {kind:"danger", label:"Cuenta enviada por un tercero", detail:"Separa la orden de los datos bancarios para dificultar el análisis y la trazabilidad."},
      {kind:"danger", label:"Salta controles financieros", detail:"Una autoridad no reemplaza la segregación de funciones ni los límites de aprobación."}
    ], explanation:"Es fraude ejecutivo con voz sintética o audio manipulado. La familiaridad auditiva ya no es autenticación suficiente.", action:"Detenga la operación. Use una palabra de verificación o llamada a un número conocido y aplique doble aprobación."
  },
  {
    id: "L3-07", level: 3, type: "email", answer: "legit", points: 220,
    title: "Alerta real de inicio de sesión", senderName: "Seguridad de la cuenta", sender: "account-security-noreply@accountprotection.microsoft.com",
    recipient: "usuario@entidad.example", subject: "Actividad de inicio de sesión inusual",
    time: "13:36", body: ["La alerta no incluye botón. Indica revisar la actividad desde account.microsoft.com. Al abrir el portal desde un marcador, aparece el mismo evento, dispositivo y hora. No solicita responder al correo."],
    signals: [
      {kind:"safe", label:"Verificación independiente", detail:"El evento existe al entrar por un marcador, sin depender de enlaces del correo."},
      {kind:"safe", label:"Datos coincidentes", detail:"Hora, dispositivo y ubicación se confirman en el registro de la cuenta."},
      {kind:"safe", label:"No pide secretos", detail:"El mensaje no solicita contraseña, código ni instalación."},
      {kind:"context", label:"Las alertas de seguridad son muy imitadas", detail:"La práctica segura es abrir el portal por cuenta propia, como se hizo aquí."}
    ], explanation:"Es legítima porque el hecho se confirmó en una fuente independiente. El correo funciona como alerta, no como único canal de decisión.", action:"Revise la actividad y, si no la reconoce, proteja la cuenta desde el portal."
  },
  {
    id: "L3-08", level: 3, type: "sms", answer: "phishing", points: 220,
    title: "Mensaje dentro del hilo del banco", senderName: "BANCO", sender: "Mismo hilo de SMS legítimos",
    subject: "Bloqueo preventivo", time: "14:41", body: ["BANCO: Bloqueamos su token. Reactívelo en https://banco-seguridad.example/token antes de las 16:00.", "El mensaje aparece en el mismo hilo donde llegan códigos reales."],
    links: [{label:"Reactivar token", url:"https://banco-seguridad.example/token"}],
    signals: [
      {kind:"danger", label:"Hilo falsificable", detail:"La suplantación del identificador alfanumérico puede agrupar el fraude con mensajes auténticos."},
      {kind:"danger", label:"Dominio ajeno", detail:"El destino contiene la palabra banco, pero no es el dominio registrado de la entidad."},
      {kind:"danger", label:"Plazo artificial", detail:"La hora límite impulsa una reacción automática."},
      {kind:"context", label:"Historial legítimo alrededor", detail:"La aplicación agrupa por remitente mostrado; no certifica el origen de cada SMS."}
    ], explanation:"Es smishing con spoofing de sender ID. El contexto visual del hilo es un distractor particularmente eficaz.", action:"No use el enlace. Abra la aplicación bancaria o llame al número oficial."
  },
  {
    id: "L3-09", level: 3, type: "login", answer: "phishing", points: 220,
    title: "Ventana de inicio de sesión dentro de la página", senderName: "Portal de documentos", sender: "docs-review.example",
    subject: "Inicie sesión con Microsoft", time: "15:26", body: ["Al pulsar “Abrir documento”, aparece una ventana que parece login.microsoftonline.com, con barra de dirección y candado. Pero la ventana no puede moverse fuera de la página principal y la URL real del navegador sigue siendo docs-review.example."],
    links: [{label:"Página principal", url:"https://docs-review.example/share/8491"}],
    signals: [
      {kind:"danger", label:"Browser-in-the-browser", detail:"La supuesta ventana es un dibujo HTML dentro de la página, no una ventana real del navegador."},
      {kind:"danger", label:"No se puede separar ni mover", detail:"Una ventana auténtica tiene controles del sistema y puede salir de los límites de la página."},
      {kind:"danger", label:"Origen principal no confiable", detail:"docs-review.example controla todo lo que se ve dentro de su contenido."},
      {kind:"context", label:"Barra y candado convincentes", detail:"Los elementos dibujados no tienen valor de seguridad; solo la interfaz real del navegador lo tiene."}
    ], explanation:"Es un ataque browser-in-the-browser que reproduce una ventana SSO completa para robar credenciales.", action:"Cierre la pestaña y abra el servicio desde el portal corporativo."
  },

  {
    id: "L4-01", level: 4, type: "email", answer: "phishing", points: 300,
    title: "Enlace legítimo con redirección abierta", senderName: "Centro de beneficios", sender: "beneficios@entidad.example.org",
    recipient: "usuario@entidad.example", subject: "Actualice beneficiarios antes del cierre anual",
    time: "08:03", body: ["El remitente parece interno. El botón comienza por https://intranet.entidad.example.org/redirect?url= y luego envía a login-beneficios.example.", "El mensaje fue enviado desde una cuenta interna comprometida."],
    links: [{label:"Actualizar beneficiarios", url:"https://intranet.entidad.example.org/redirect?url=https%3A%2F%2Flogin-beneficios.example"}],
    signals: [
      {kind:"danger", label:"Destino final externo", detail:"El primer dominio es confiable, pero el parámetro url ordena redirigir a login-beneficios.example."},
      {kind:"danger", label:"Cuenta interna comprometida", detail:"La dirección correcta no garantiza que el autor actual sea legítimo."},
      {kind:"danger", label:"Tema sensible", detail:"Beneficiarios implica identidad, parentesco y posibles documentos personales."},
      {kind:"context", label:"Primer tramo legítimo", detail:"Hay que revisar la cadena completa de redirecciones, no solo el inicio del enlace."}
    ], explanation:"Es phishing mediante redirección abierta y cuenta interna comprometida. Dos señales normalmente positivas se usan como cobertura.", action:"Abra Beneficios desde la intranet sin usar el botón y reporte el posible compromiso."
  },
  {
    id: "L4-02", level: 4, type: "email", answer: "legit", points: 300,
    title: "Solicitud de firma auténtica", senderName: "DocuSign", sender: "dse_na2@docusign.net",
    recipient: "usuario@entidad.example", subject: "Ana Vega le envió: Acta de comité 17-11-2026",
    time: "09:15", body: ["Ana anunció la firma durante la reunión. El código de seguridad del correo coincide con el comunicado por el canal interno. Al entrar a docusign.com manualmente, el sobre aparece pendiente y no solicita credenciales corporativas dentro de otro dominio."],
    signals: [
      {kind:"safe", label:"Solicitud anunciada", detail:"Persona, documento y momento coinciden con una comunicación previa."},
      {kind:"safe", label:"Verificación en el servicio", detail:"El sobre se encuentra al abrir DocuSign manualmente, sin depender del enlace recibido."},
      {kind:"safe", label:"Código por canal separado", detail:"La referencia coincide con un dato comunicado internamente."},
      {kind:"context", label:"El remitente no usa el dominio de la entidad", detail:"Es normal para un proveedor SaaS; debe validarse por contexto y acceso independiente."}
    ], explanation:"Es legítimo. La evidencia más fuerte es que el sobre esperado existe al entrar directamente al proveedor y coincide con un canal separado.", action:"Firme desde la sesión abierta manualmente y revise el documento antes de aceptar."
  },
  {
    id: "L4-03", level: 4, type: "chat", answer: "phishing", points: 300,
    title: "Aplicación de soporte instalada en Teams", senderName: "HelpDesk Assistant", sender: "Aplicación añadida por un usuario",
    subject: "Tarjeta adaptativa", time: "10:08", body: ["“Su equipo incumple la política. Autorice diagnóstico”. El botón abre device-login.example y muestra un código para introducir en microsoft.com/devicelogin. La aplicación solicita que comparta una captura cuando termine."],
    signals: [
      {kind:"danger", label:"Device code phishing", detail:"El código puede vincular la sesión de la víctima al dispositivo controlado por el atacante."},
      {kind:"danger", label:"Aplicación no publicada por TI", detail:"Estar dentro de Teams no significa que la organización la haya aprobado."},
      {kind:"danger", label:"Solicita prueba de finalización", detail:"La captura ayuda al atacante a saber cuándo obtuvo acceso y puede exponer datos."},
      {kind:"context", label:"microsoft.com/devicelogin es real", detail:"La página legítima puede autorizar una sesión maliciosa si el código fue generado por el atacante."}
    ], explanation:"Es phishing de código de dispositivo. Se abusa de un flujo legítimo y de una página oficial para obtener autorización.", action:"No introduzca códigos ajenos. Quite la aplicación, reporte el chat y revise sesiones y consentimientos."
  },
  {
    id: "L4-04", level: 4, type: "qr", answer: "phishing", points: 300,
    title: "QR superpuesto en la sala", senderName: "Reserva de salas", sender: "Etiqueta sobre el código original",
    subject: "Confirme asistencia", time: "10:52", body: ["El soporte acrílico es institucional, pero el QR es una pegatina ligeramente desalineada. La vista previa muestra salas-entidad.example/confirmar, mientras la pantalla de la sala usa reservas.entidad.example.org."],
    qr: {label:"Confirmar sala", payload:"https://salas-entidad.example/confirmar"},
    signals: [
      {kind:"danger", label:"Etiqueta superpuesta", detail:"La manipulación física permite reemplazar un QR legítimo sin cambiar el entorno confiable."},
      {kind:"danger", label:"Dominio primo", detail:"salas-entidad.example imita el servicio, pero no está bajo entidad.example.org."},
      {kind:"danger", label:"Inconsistencia con la pantalla", detail:"El sistema oficial visible usa reservas.entidad.example.org."},
      {kind:"context", label:"Ubicación auténtica", detail:"La sala y el soporte son reales; precisamente por eso el ataque resulta convincente."}
    ], explanation:"Es quishing físico por superposición. La seguridad del lugar no se transfiere automáticamente a una etiqueta añadida.", action:"No escanee. Informe a seguridad física/TI y use la URL mostrada por la pantalla."
  },
  {
    id: "L4-05", level: 4, type: "call", answer: "phishing", points: 300,
    title: "Devolución de llamada a falsa central", senderName: "Protección de endpoints", sender: "Correo sin enlace + teléfono",
    subject: "Renovación cobrada por $2.480.000", time: "11:37", body: ["El correo afirma que se procesó una renovación y solo ofrece un teléfono para cancelar. Al llamar, el agente pide instalar asistencia remota y entrar al banco mientras comparte pantalla."],
    signals: [
      {kind:"danger", label:"Callback phishing", detail:"Evita enlaces y adjuntos para superar filtros; el ataque comienza cuando la víctima llama."},
      {kind:"danger", label:"Cargo alarmante", detail:"La cifra alta provoca urgencia y enojo, facilitando decisiones impulsivas."},
      {kind:"danger", label:"Acceso remoto + banca", detail:"Ningún reembolso requiere observar la cuenta ni controlar el equipo."},
      {kind:"context", label:"Correo técnicamente limpio", detail:"La ausencia de enlaces o malware no lo hace legítimo; el número es la carga maliciosa."}
    ], explanation:"Es phishing de devolución de llamada, frecuente en falsos cobros y soporte técnico.", action:"Cuelgue, desinstale cualquier herramienta si llegó a instalarla y contacte al proveedor/banco por canales oficiales."
  },
  {
    id: "L4-06", level: 4, type: "email", answer: "phishing", points: 300,
    title: "Respuesta automática manipulada", senderName: "María Torres", sender: "maria.torres@entidad.example.org",
    recipient: "usuario@entidad.example", subject: "Respuesta automática: estoy fuera de la oficina",
    time: "12:19", body: ["“Durante mi ausencia, los pagos urgentes los gestiona Andrés en andres.finanzas@outlook.example. Comparta con él facturas pendientes y accesos al portal”.", "La regla de respuesta automática fue creada por un intruso en la cuenta de María."],
    signals: [
      {kind:"danger", label:"Desvío a cuenta externa", detail:"Transfiere procesos y documentos a una dirección personal no autorizada."},
      {kind:"danger", label:"Pide accesos", detail:"Ningún reemplazo legítimo necesita que le compartan credenciales."},
      {kind:"danger", label:"Abuso de regla de buzón", detail:"Una cuenta comprometida puede enviar respuestas auténticas desde el dominio real."},
      {kind:"context", label:"Remitente interno válido", detail:"La identidad técnica es real, pero el contenido revela una ruptura grave del proceso."}
    ], explanation:"Es persistencia mediante regla de buzón comprometido. El atacante usa la confianza de una respuesta automática legítimamente enviada.", action:"No contacte la cuenta externa. Avise a seguridad y a María por un canal independiente para revisar reglas y sesiones."
  },
  {
    id: "L4-07", level: 4, type: "sms", answer: "legit", points: 300,
    title: "Alerta bancaria sin enlace", senderName: "Banco", sender: "Código corto registrado 85900",
    subject: "Compra presencial", time: "13:04", body: ["Compra aprobada por $126.400 en COMERCIO CENTRAL. Si no la reconoce, bloquee su tarjeta desde la aplicación o llame al número impreso en ella. Este SMS no solicita respuesta, enlace, código ni llamada a un número nuevo.", "La compra acaba de ser realizada por usted."],
    signals: [
      {kind:"safe", label:"Actividad reconocida", detail:"Monto, comercio y momento coinciden con una operación propia."},
      {kind:"safe", label:"Sin enlace ni número impuesto", detail:"Remite a la aplicación o al número físico ya conocido por el cliente."},
      {kind:"safe", label:"No pide datos", detail:"No solicita PIN, contraseña, código ni respuesta al SMS."},
      {kind:"context", label:"El código corto no es prueba absoluta", detail:"La legitimidad surge de la coincidencia transaccional y de que no obliga a usar el mensaje para actuar."}
    ], explanation:"Es legítimo en este escenario. La alerta coincide con una transacción propia y no crea un canal nuevo para capturar información.", action:"No necesita hacer nada. Si alguna vez no reconoce una compra, abra la aplicación por separado."
  },
  {
    id: "L4-08", level: 4, type: "email", answer: "phishing", points: 300,
    title: "Ataque con CAPTCHA y proxy inverso", senderName: "Portal de nómina", sender: "nomina@entidad-beneficios.example",
    recipient: "usuario@entidad.example", subject: "Certificado de ingresos disponible",
    time: "14:16", body: ["El enlace pasa primero por un CAPTCHA de Cloudflare y luego muestra una copia exacta del SSO. Después de la contraseña solicita MFA y, si se aprueba, entra correctamente al portal real.", "La URL permanece en entidad-beneficios.example."],
    links: [{label:"Descargar certificado", url:"https://entidad-beneficios.example/certificado"}],
    signals: [
      {kind:"danger", label:"Proxy adversario en el medio", detail:"La página retransmite el SSO real y captura credenciales y cookie de sesión en tiempo real."},
      {kind:"danger", label:"URL nunca cambia al dominio oficial", detail:"La fidelidad visual no compensa el origen incorrecto en la barra real del navegador."},
      {kind:"danger", label:"CAPTCHA como evasión", detail:"Se usa para bloquear analizadores automáticos y generar falsa confianza."},
      {kind:"context", label:"MFA funciona y el portal abre", detail:"Un proxy inverso puede completar el flujo real; por eso MFA resistente a phishing es preferible."}
    ], explanation:"Es AiTM (adversary-in-the-middle). La víctima sí entra al servicio, pero el atacante roba la sesión durante el tránsito.", action:"Cierre la sesión, notifique a seguridad para revocar tokens y use un método resistente a phishing si está disponible."
  },
  {
    id: "L4-09", level: 4, type: "chat", answer: "phishing", points: 300,
    title: "Reclutador con tarea técnica", senderName: "Selección Talento Global", sender: "Perfil de red profesional creado hace 6 años",
    subject: "Prueba para vacante remota", time: "15:33", body: ["El perfil tiene contactos y publicaciones antiguas. Envía un repositorio privado con una “prueba” y pide ejecutar npm install y npm run test en el equipo corporativo. El paquete instala una dependencia desde dev-tools-update.example."],
    links: [{label:"Repositorio de prueba", url:"https://code.example/talento/prueba"}],
    signals: [
      {kind:"danger", label:"Ejecución de código no confiable", detail:"Instalar dependencias ejecuta scripts y puede comprometer tokens, llaves y archivos."},
      {kind:"danger", label:"Dependencia fuera del registro esperado", detail:"dev-tools-update.example introduce código desde una fuente controlada por terceros."},
      {kind:"danger", label:"Equipo corporativo solicitado", detail:"Un proceso legítimo no debería exigir ejecutar una prueba desconocida en un activo de trabajo."},
      {kind:"context", label:"Perfil antiguo y convincente", detail:"Las cuentas de redes profesionales también se compran o comprometen; antigüedad no es identidad."}
    ], explanation:"Es ingeniería social dirigida a desarrolladores o personal técnico. La carga maliciosa está en las dependencias de una tarea plausible.", action:"No ejecute el proyecto. Verifique la empresa por canales independientes y use, si procede, un entorno aislado autorizado."
  }
];
