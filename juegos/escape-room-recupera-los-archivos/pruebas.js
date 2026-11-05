/*
╔══════════════════════════════════════════════════════════════════════════════╗
║ ZONA EDITABLE — PRUEBAS DE “ESCAPE ROOM: RECUPERA LOS ARCHIVOS”            ║
║                                                                            ║
║ Para agregar una prueba:                                                   ║
║ 1. Copia una prueba completa y pégala JUSTO ANTES del comentario final.    ║
║ 2. Usa un id único (por ejemplo, ER-025).                                   ║
║ 3. Conserva estos campos: icono, archivo, sector, nivel, titulo, escenario, ║
║    pregunta, opciones, correcta, pista, explicacion y accion.               ║
║ 4. Escribe 3 o 4 opciones y señala la correcta con correcta: 0, 1, 2 o 3.  ║
║ 5. Sectores sugeridos: Respaldo, Cuarentena, Acceso, Integridad y Evidencia.║
║ 6. Conserva la coma entre pruebas. No insertes HTML en los textos.          ║
║                                                                            ║
║ PLANTILLA:                                                                 ║
║ {                                                                          ║
║   id: "ER-025", icono: "📁", archivo: "archivo_025.enc",                ║
║   sector: "Recuperación", nivel: 2, titulo: "Prueba nueva",             ║
║   escenario: "Describe el incidente.",                                    ║
║   pregunta: "¿Cuál es la acción más segura?",                             ║
║   opciones: ["Opción A", "Opción B", "Opción C"], correcta: 0,          ║
║   pista: "Orienta sin revelar la respuesta.",                             ║
║   explicacion: "Explica por qué.",                                        ║
║   accion: "Indica el protocolo seguro."                                   ║
║ },                                                                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

window.PRUEBAS_ESCAPE_ARCHIVOS = [
  {
    id: "ER-001", icono: "🧊", archivo: "nomina_noviembre.xlsx.enc", sector: "Cuarentena", nivel: 1,
    titulo: "Archivo cifrado en la carpeta compartida",
    escenario: "Varias extensiones cambiaron a .enc y aparece una nota que exige pago.",
    pregunta: "¿Qué debes hacer primero?",
    opciones: ["Pagar para acelerar la recuperación", "Aislar el equipo o recurso afectado y reportar el incidente", "Renombrar los archivos", "Reiniciar todos los equipos"], correcta: 1,
    pista: "La prioridad inicial es impedir que el daño siga propagándose.",
    explicacion: "El cifrado masivo puede ser ransomware. La contención temprana limita la propagación y permite activar la respuesta institucional.",
    accion: "Aísla el activo sin destruir evidencia y contacta de inmediato al canal de incidentes."
  },
  {
    id: "ER-002", icono: "💾", archivo: "contratos_2026.zip", sector: "Respaldo", nivel: 1,
    titulo: "Copia de seguridad disponible",
    escenario: "Existe una copia de los contratos creada la noche anterior al incidente.",
    pregunta: "¿Qué condición debe verificarse antes de restaurarla?",
    opciones: ["Que el archivo tenga un nombre corto", "Que la copia sea íntegra, esté libre de malware y provenga del respaldo autorizado", "Que pueda abrirse desde una cuenta personal"], correcta: 1,
    pista: "Una copia disponible no siempre es una copia confiable.",
    explicacion: "Restaurar una copia comprometida puede reintroducir malware o datos alterados.",
    accion: "Valida origen, integridad y fecha del respaldo en un entorno controlado antes de restaurar."
  },
  {
    id: "ER-003", icono: "🔗", archivo: "enlace_expedientes.url", sector: "Acceso", nivel: 1,
    titulo: "Enlace público a expedientes",
    escenario: "El vínculo de recuperación permite acceso a cualquier persona que lo tenga.",
    pregunta: "¿Cómo proteges los archivos recuperados?",
    opciones: ["Acortas el enlace", "Restringes el acceso a identidades autorizadas y defines vencimiento", "Lo publicas solo durante una hora"], correcta: 1,
    pista: "La protección depende de quién puede entrar, no de qué tan difícil sea adivinar la URL.",
    explicacion: "Los enlaces públicos pueden reenviarse o quedar registrados fuera del control institucional.",
    accion: "Revoca el vínculo abierto, aplica permisos nominales y revisa el registro de accesos."
  },
  {
    id: "ER-004", icono: "#️⃣", archivo: "evidencia.iso", sector: "Integridad", nivel: 2,
    titulo: "Imagen forense sin huella",
    escenario: "Se copió un disco para análisis, pero nadie registró su hash.",
    pregunta: "¿Qué permite demostrar que la copia no cambió?",
    opciones: ["Comprimirla", "Calcular y documentar una huella criptográfica con el procedimiento autorizado", "Cambiarla a solo lectura después de editarla"], correcta: 1,
    pista: "Busca una evidencia matemática de que dos contenidos son idénticos.",
    explicacion: "El hash permite comparar la evidencia original y sus copias y detectar modificaciones.",
    accion: "Calcula el hash con una herramienta autorizada y regístralo junto con la cadena de custodia."
  },
  {
    id: "ER-005", icono: "🕰️", archivo: "informe_final_v7.docx", sector: "Recuperación", nivel: 1,
    titulo: "Documento sobrescrito",
    escenario: "Una edición incorrecta reemplazó el informe final en el repositorio institucional.",
    pregunta: "¿Cuál es la recuperación más segura?",
    opciones: ["Buscar una copia en correos personales", "Usar el historial de versiones del repositorio y validar la versión elegida", "Pedir a cualquiera que reconstruya el archivo"], correcta: 1,
    pista: "El repositorio puede conservar estados anteriores con fecha y autor.",
    explicacion: "El historial de versiones mantiene trazabilidad y reduce el riesgo de recuperar copias informales o incompletas.",
    accion: "Restaura una versión conocida, documenta el cambio y verifica el contenido con su responsable."
  },
  {
    id: "ER-006", icono: "🧪", archivo: "actualizacion_urgente.exe", sector: "Cuarentena", nivel: 2,
    titulo: "Ejecutable dentro del respaldo",
    escenario: "La carpeta de respaldo contiene un instalador no reconocido creado durante el incidente.",
    pregunta: "¿Qué haces con ese archivo?",
    opciones: ["Lo ejecutas sin red", "Lo eliminas de inmediato sin registrar nada", "Lo mantienes aislado y solicitas análisis al equipo autorizado"], correcta: 2,
    pista: "Preservar y analizar es distinto de ejecutar o destruir.",
    explicacion: "Un ejecutable desconocido puede ser parte del ataque y también una fuente de evidencia.",
    accion: "Aísla la muestra, conserva metadatos y remítela por el canal de análisis seguro."
  },
  {
    id: "ER-007", icono: "🔐", archivo: "claves_recuperacion.txt", sector: "Acceso", nivel: 2,
    titulo: "Credenciales expuestas en texto plano",
    escenario: "El archivo recuperado contiene usuarios, contraseñas y códigos de recuperación.",
    pregunta: "¿Cuál es la respuesta correcta?",
    opciones: ["Volver a guardarlo con un nombre oculto", "Tratar las credenciales como comprometidas, rotarlas y migrarlas al gestor autorizado", "Imprimirlo y borrar el archivo"], correcta: 1,
    pista: "Ocultar el archivo no invalida secretos que ya pudieron ser leídos.",
    explicacion: "Las credenciales expuestas deben considerarse comprometidas aunque no haya evidencia visible de uso.",
    accion: "Rota secretos, revisa accesos y usa el mecanismo corporativo de gestión de credenciales."
  },
  {
    id: "ER-008", icono: "📨", archivo: "restauracion_compartida.msg", sector: "Evidencia", nivel: 2,
    titulo: "Correo que promete descifrado",
    escenario: "Llega un mensaje externo con una herramienta para recuperar todos los archivos.",
    pregunta: "¿Qué decisión evita agravar el incidente?",
    opciones: ["Descargarla si el remitente ofrece garantía", "Reenviarla al correo personal para probar", "No abrirla y reportarla como parte del incidente"], correcta: 2,
    pista: "Los atacantes pueden aprovechar la urgencia de la recuperación.",
    explicacion: "Una supuesta herramienta de descifrado puede instalar malware adicional o robar información.",
    accion: "Conserva el mensaje, reporta sus encabezados y usa solo herramientas aprobadas por el equipo de respuesta."
  },
  {
    id: "ER-009", icono: "☁️", archivo: "casos_exportados.pst", sector: "Acceso", nivel: 2,
    titulo: "Copia en nube personal",
    escenario: "Alguien subió un archivo institucional a su nube personal para salvarlo del incidente.",
    pregunta: "¿Qué debe hacerse?",
    opciones: ["Dejarlo allí como copia adicional", "Notificar la exposición, retirar la copia de forma controlada y recuperar por canales autorizados", "Cambiar el nombre de la cuenta personal"], correcta: 1,
    pista: "La buena intención no reemplaza los controles de custodia.",
    explicacion: "La nube personal puede incumplir controles de acceso, retención, auditoría y tratamiento de datos.",
    accion: "Reporta la transferencia, preserva trazabilidad y usa almacenamiento institucional aprobado."
  },
  {
    id: "ER-010", icono: "🧾", archivo: "registro_eventos.evtx", sector: "Evidencia", nivel: 1,
    titulo: "Registro de eventos disponible",
    escenario: "Los registros muestran actividad antes y durante el cifrado.",
    pregunta: "¿Por qué deben preservarse?",
    opciones: ["Para liberar espacio después", "Para reconstruir la línea de tiempo e identificar alcance y origen", "Para convertirlos a una hoja de cálculo y editarlos"], correcta: 1,
    pista: "Una investigación necesita saber qué ocurrió y en qué orden.",
    explicacion: "Los logs ayudan a establecer la secuencia, las cuentas usadas y los sistemas alcanzados.",
    accion: "Exporta y conserva los registros con fecha, fuente, integridad y control de acceso."
  },
  {
    id: "ER-011", icono: "🔄", archivo: "sincronizacion_activa.cfg", sector: "Cuarentena", nivel: 2,
    titulo: "Sincronización propaga el daño",
    escenario: "El cliente de nube sigue sincronizando archivos cifrados a otros dispositivos.",
    pregunta: "¿Qué medida inmediata es adecuada?",
    opciones: ["Duplicar la velocidad de sincronización", "Pausar o aislar la sincronización según el protocolo y avisar al equipo técnico", "Borrar manualmente todo desde la nube"], correcta: 1,
    pista: "Detén la réplica antes de intentar limpiar.",
    explicacion: "La sincronización puede extender eliminaciones o cifrado y reducir las opciones de recuperación.",
    accion: "Contén la sincronización, conserva versiones y coordina la restauración centralizada."
  },
  {
    id: "ER-012", icono: "🧷", archivo: "usb_respaldo_03.img", sector: "Integridad", nivel: 3,
    titulo: "USB de respaldo sin inventario",
    escenario: "Aparece una memoria que supuestamente contiene la única copia sana.",
    pregunta: "¿Cómo la examinas sin comprometer la evidencia?",
    opciones: ["La conectas al equipo afectado", "La montas con protección de escritura en un entorno controlado", "Copias archivos al primer equipo disponible"], correcta: 1,
    pista: "Evita escribir en el soporte y evita exponerlo al sistema comprometido.",
    explicacion: "La protección de escritura ayuda a preservar el contenido original durante el análisis.",
    accion: "Registra el dispositivo y usa un entorno aislado con bloqueo de escritura y herramientas autorizadas."
  },
  {
    id: "ER-013", icono: "👥", archivo: "permisos_carpeta.csv", sector: "Acceso", nivel: 1,
    titulo: "Permisos heredados excesivos",
    escenario: "La carpeta restaurada concede edición a toda la organización.",
    pregunta: "¿Qué principio debe aplicarse?",
    opciones: ["Acceso abierto mientras termina la emergencia", "Mínimo privilegio según función y necesidad", "Una contraseña compartida para todos"], correcta: 1,
    pista: "Cada persona debe tener solo el acceso necesario.",
    explicacion: "Restaurar datos sin restaurar controles adecuados puede generar una nueva exposición.",
    accion: "Revisa grupos, propietarios y permisos antes de habilitar el acceso productivo."
  },
  {
    id: "ER-014", icono: "🧹", archivo: "temporales_recuperados.tmp", sector: "Recuperación", nivel: 1,
    titulo: "Archivos temporales hallados",
    escenario: "La herramienta de recuperación encuentra cientos de temporales y borradores.",
    pregunta: "¿Qué criterio debe guiar la selección?",
    opciones: ["Restaurar todo sin revisar", "Priorizar datos definidos como críticos y validar contenido, propietario y fecha", "Elegir solo los archivos más grandes"], correcta: 1,
    pista: "Recuperar más no significa recuperar mejor.",
    explicacion: "La recuperación debe seguir prioridades de negocio y controles de calidad para evitar datos obsoletos o innecesarios.",
    accion: "Aplica el inventario de información crítica y valida una muestra antes de restaurar en masa."
  },
  {
    id: "ER-015", icono: "🗝️", archivo: "llave_descifrado.key", sector: "Integridad", nivel: 3,
    titulo: "Llave de descifrado no verificada",
    escenario: "Una llave circula por un chat y se afirma que recupera los documentos.",
    pregunta: "¿Qué debe ocurrir antes de usarla?",
    opciones: ["Probarla directamente sobre los originales", "Validar su procedencia y probarla sobre copias en un entorno aislado", "Publicarla para que otros confirmen"], correcta: 1,
    pista: "No arriesgues los originales con una herramienta o llave no comprobada.",
    explicacion: "Una llave falsa o incompatible puede dañar datos, filtrar información o ejecutar código malicioso.",
    accion: "Conserva originales, valida la fuente y prueba sobre duplicados controlados."
  },
  {
    id: "ER-016", icono: "📅", archivo: "plan_continuidad.pdf", sector: "Recuperación", nivel: 2,
    titulo: "Orden de restauración",
    escenario: "Hay capacidad limitada y cinco servicios esperan recuperación.",
    pregunta: "¿Cómo se decide el orden?",
    opciones: ["Por quien insista más", "Según el análisis de impacto, criticidad y objetivos de recuperación definidos", "Por orden alfabético"], correcta: 1,
    pista: "El plan de continuidad define qué debe volver primero y en cuánto tiempo.",
    explicacion: "La prioridad se basa en impacto y dependencias, no en presión informal.",
    accion: "Consulta los objetivos RTO/RPO y coordina la secuencia con responsables técnicos y de negocio."
  },
  {
    id: "ER-017", icono: "🧬", archivo: "base_datos_clientes.bak", sector: "Integridad", nivel: 2,
    titulo: "Base restaurada con datos incoherentes",
    escenario: "La base abre, pero varios totales no coinciden con los reportes previos.",
    pregunta: "¿Está lista para producción?",
    opciones: ["Sí, porque el servicio inició", "No; debe validarse integridad lógica y conciliación con fuentes confiables", "Sí, si nadie presenta una queja"], correcta: 1,
    pista: "Disponibilidad no es lo mismo que integridad.",
    explicacion: "Un sistema puede funcionar técnicamente y aun contener datos incompletos o alterados.",
    accion: "Ejecuta controles de integridad y conciliación antes de autorizar el uso operativo."
  },
  {
    id: "ER-018", icono: "📸", archivo: "captura_rescate.png", sector: "Evidencia", nivel: 1,
    titulo: "Captura de pantalla del rescate",
    escenario: "Una captura muestra la nota de rescate, hora y dirección de contacto.",
    pregunta: "¿Cuál es el manejo adecuado?",
    opciones: ["Editar la imagen para resaltar el texto", "Conservar el original y registrar contexto, fecha y origen", "Publicarla en redes para pedir ayuda"], correcta: 1,
    pista: "La evidencia debe conservarse sin alteraciones y con contexto.",
    explicacion: "Editar o publicar puede perder metadatos, exponer información o afectar la investigación.",
    accion: "Guarda el original en el repositorio de evidencia y documenta quién lo obtuvo y de dónde."
  },
  {
    id: "ER-019", icono: "📦", archivo: "respaldo_completo.tar", sector: "Respaldo", nivel: 2,
    titulo: "Una sola copia de respaldo",
    escenario: "El único respaldo está conectado permanentemente al mismo servidor comprometido.",
    pregunta: "¿Qué mejora reduce este riesgo a futuro?",
    opciones: ["Cambiar la extensión del respaldo", "Mantener copias separadas, una fuera de línea o inmutable, y probar restauraciones", "Crear más carpetas en el mismo disco"], correcta: 1,
    pista: "Una copia alcanzable por el atacante puede cifrarse junto con el original.",
    explicacion: "La separación y la inmutabilidad protegen contra cifrado, borrado y errores que afecten al entorno principal.",
    accion: "Implementa la estrategia institucional de copias múltiples y pruebas periódicas de restauración."
  },
  {
    id: "ER-020", icono: "📞", archivo: "contactos_emergencia.vcf", sector: "Recuperación", nivel: 1,
    titulo: "Canal oficial no disponible",
    escenario: "El correo institucional está caído y el equipo necesita coordinar la respuesta.",
    pregunta: "¿Qué canal debe usarse?",
    opciones: ["Cualquier grupo público", "El canal alterno previamente definido en el plan de incidentes", "Cuentas personales sin registro"], correcta: 1,
    pista: "La continuidad debe prever comunicaciones fuera del sistema afectado.",
    explicacion: "Los canales improvisados pueden filtrar datos y dificultar la trazabilidad de decisiones.",
    accion: "Activa el árbol de contactos y el canal alterno autorizado por el plan."
  },
  {
    id: "ER-021", icono: "🧿", archivo: "sesiones_activas.json", sector: "Acceso", nivel: 2,
    titulo: "Sesiones abiertas después del incidente",
    escenario: "La cuenta comprometida mantiene sesiones activas en varios dispositivos.",
    pregunta: "Además de cambiar la contraseña, ¿qué procede?",
    opciones: ["Esperar a que expiren", "Revocar sesiones y tokens, revisar MFA y actividad reciente", "Cambiar el nombre visible de la cuenta"], correcta: 1,
    pista: "Una sesión existente puede sobrevivir al cambio de contraseña.",
    explicacion: "Tokens activos pueden seguir permitiendo acceso aunque la contraseña ya sea distinta.",
    accion: "Revoca sesiones, rota credenciales, verifica MFA y revisa eventos de inicio de sesión."
  },
  {
    id: "ER-022", icono: "🧰", archivo: "herramienta_recuperacion.ps1", sector: "Cuarentena", nivel: 3,
    titulo: "Script de recuperación modificado",
    escenario: "El hash del script no coincide con el publicado por el proveedor autorizado.",
    pregunta: "¿Debes ejecutarlo?",
    opciones: ["Sí, si el nombre coincide", "No; detén el proceso y obtén una copia verificada", "Sí, pero como administrador local"], correcta: 1,
    pista: "Una diferencia de hash significa que el contenido no es el esperado.",
    explicacion: "La alteración puede deberse a corrupción o manipulación maliciosa.",
    accion: "Descarta la copia no verificada, preserva información del hallazgo y descarga desde el canal oficial."
  },
  {
    id: "ER-023", icono: "📝", archivo: "bitacora_incidente.md", sector: "Evidencia", nivel: 2,
    titulo: "Bitácora incompleta",
    escenario: "Se realizaron cambios durante la recuperación, pero no quedaron registrados.",
    pregunta: "¿Qué debe contener la bitácora?",
    opciones: ["Solo el resultado final", "Fechas, responsables, acciones, decisiones y evidencias asociadas", "Opiniones sin hora ni autor"], correcta: 1,
    pista: "La trazabilidad debe permitir reconstruir quién hizo qué y cuándo.",
    explicacion: "La bitácora apoya la coordinación, la investigación, la rendición de cuentas y las lecciones aprendidas.",
    accion: "Registra cada intervención de forma cronológica y protege la bitácora contra cambios no autorizados."
  },
  {
    id: "ER-024", icono: "✅", archivo: "acta_retorno_servicio.pdf", sector: "Recuperación", nivel: 3,
    titulo: "Retorno a operación",
    escenario: "Los archivos fueron restaurados y el servicio parece estable.",
    pregunta: "¿Qué falta antes de cerrar el incidente?",
    opciones: ["Nada; basta con que abra la aplicación", "Validar seguridad e integridad, monitorear, comunicar y documentar lecciones aprendidas", "Borrar todas las evidencias para liberar espacio"], correcta: 1,
    pista: "Recuperar el servicio no equivale a completar la respuesta.",
    explicacion: "El cierre requiere confirmar que la amenaza fue contenida, que los datos son confiables y que se documentaron mejoras.",
    accion: "Obtén validación de responsables, mantén monitoreo reforzado y realiza la revisión posterior al incidente."
  }

  // ===== AGREGA NUEVAS PRUEBAS JUSTO ENCIMA DE ESTE COMENTARIO =====
];
