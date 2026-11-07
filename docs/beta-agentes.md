# Beta test simulado de Focus/Space

> Seis agentes interpretaron a usuarios distintos tras leer el código y el README. **No usaron la app en un navegador**: el audio, las animaciones y el tacto real son inferencias. Úsalo como lista de hipótesis, no como datos de usuarios reales.

## Resumen

Beta cerrada de Focus/Space con 6 personas: todas ponen un 3/5. Coinciden en que la app es preciosa y sin fricción de entrada (sin cuenta, sin onboarding), pero falla como herramienta fiable por tres cosas: el temporizador se pierde al recargar (el README dice lo contrario), el aviso de fin de fase es solo un chime fijo a 0,4 y el Pomodoro encadena fases solo sin control. Los cuatro fallos más repetidos están confirmados en el código. Con persistencia + aviso + control de fases, casi todos subirían a 4.

## Consenso

- Primera impresión excelente: sin cuenta, sin onboarding, estética cuidada. Lo más valorado: mezclador de ambiente, tarea activa bajo el reloj y reloj grande.
- El temporizador no sobrevive a una recarga aunque el README lo promete. 6/6 lo citan como prioridad 1 o 2 en el debate.
- El aviso de fin de fase es insuficiente: solo un chime a volumen fijo 0,4, sin título de pestaña con cuenta atrás ni notificación. Lo pide todo el grupo (ocultar la pestaña tras Figma, PDF, Teams, auriculares).
- El Pomodoro encadena fases solo y no se puede saltar, alargar ni esperar al usuario. Lo piden Dani, Javi, Paco, Lucía, Marta y Nora.
- Duraciones fijas 25/5/15 en Pomodoro: se pide 50/10 o configurable (Lucía, Dani, Marta, Javi, Paco, Nora).
- Sin estadísticas: el contador se reinicia cada día y el modo Libre no cuenta (Lucía, Dani, Marta, Javi, Paco).
- El borrado de tareas con × es inmediato, sin deshacer, y la edición solo por doble clic sin pista (Lucía, Dani, Javi, Paco, Nora).
- La cabecera dice siempre 'En curso' aunque el temporizador esté parado; es una etiqueta que miente (Lucía, Dani, Marta, Javi, Paco, Nora).
- Falta un interruptor manual para apagar esfera y grano: hoy solo se respeta prefers-reduced-motion del sistema (Lucía, Dani, Marta, Nora, Paco; Marta y Nora lo quieren como opción, no eliminación).
- El chime no se puede apagar ni regular, aunque cada uno lo pide por un motivo distinto: Nora quiere silencio o suave, Javi y Paco quieren que se mantenga pero configurable. La conclusión compartida es hacerlo ajustable.

## Discrepancias

- Móvil/responsive: Javi, Marta y Lucía (parcialmente) lo piden. Lucía en el debate prefiere que quede solo en escritorio para no distraerse con el móvil. Dani y Nora piden hacer antes lo barato (persistencia y título de pestaña). Paco quiere lo básico primero. El min-width 1024 es decisión explícita del spec.
- Tema claro: Marta lo pide para trabajar de día. Lucía y Nora lo rechazan (para ellas el negro es la inmersión). Paco prefiere letra más grande antes que tema claro. Solo vale como opción, con el negro por defecto.
- Atajos de teclado: Dani lo considera crítico. Paco no los quiere salvo como añadido a los botones visibles. Nora avisa de que un Espacio global se disparará al escribir en otra pestaña o en un campo. Javi lo pone tercero. Si se hacen, que sean con foco o modificador.
- Esfera de 65k partículas: para Dani es coste de GPU y distracción. Marta la considera la identidad del producto. Nora y Marta señalan que Scene3D ya hace return con document.hidden y baja a 180² con pocos núcleos, así que el coste solo se paga si la pestaña está visible. Falta un modo calma, no quitarla.
- Notificación del navegador: Javi y Lucía la piden. Paco avisa de que el cartel de permiso asusta en un portátil de empresa y prefiere el título de pestaña, que no pregunta nada. Se podría empezar por el título.
- Tipografía/letra pequeña: Paco y Lucía sufren con 10-13px y opacidad .55. Nora, para quien la estética minúscula encaja, avisa de que no puede ser una decisión única. Acuerdo: selector de tamaño, no cambiar el defecto.
- Los loops de audio (microcorte en la costura, MP3 de 1-2,5 min): solo Nora lo oye con claridad. Lucía y Marta lo confirman a medias. Los demás no lo notan. No verificable en código; hay que escucharlo.
- Stepper de ±5: Marta dice que no se llega a 50 limpios. Dani y Javi lo corrigen: desde 25 se llega en cinco clics. Es una queja de comodidad (presets 25/50/90 o campo numérico), no un fallo.
- Sincronizar 3D por getDisplayMedia: Marta, Nora y Javi dicen que el ritual de compartir pestaña es raro o asusta. Dani lo considera secundario. Se ve como extra, no como núcleo.
- Lofi vía YouTube con IDs fijos: Marta y Javi lo ven frágil; el resto lo considera secundario.

## Fallos confirmados en el código

- El temporizador no sobrevive a una recarga, contra lo que dice el README: src/timer/timerStore.ts persiste solo {day, completedWork, freeMinutes}; src/timer/useTimer.ts crea el estado con initialState y README.md:125 afirma que 'survives a reload'.
- No hay aviso de fin de fase fuera del chime: grep de document.title y Notification en src sin resultados; solo existe chime() en src/timer/useTimer.ts.
- El chime tiene volumen fijo 0,4 y no es ajustable ni pasa por el mezclador: src/timer/useTimer.ts:8-9.
- La cabecera muestra 'En curso' fijo aunque el temporizador esté parado: src/layout/Header.tsx:20.
- No hay atajos globales de teclado: en src solo hay addEventListener('keydown') en src/audio/useAmbient.ts (desbloqueo de audio) y src/auth/AccountMenu.tsx (Escape).
- El Pomodoro encadena fases sin pausa y las duraciones son una constante fija: src/timer/timer.ts (advance() usa endsAt + durationMs; POMODORO 25/5/15).
- El layout fija min-width: 1024px: src/styles/app.css:40.

## Backlog priorizado

| Prioridad | Tipo | Propuesta | Quién lo pide |
|---|---|---|---|
| alta | bug | Persistir el temporizador (endsAt, fase, modo, pausa) y restaurarlo al recargar | Lucía, Dani, Marta, Javi, Nora, Paco |
| alta | feature | Aviso real de fin de fase: cuenta atrás en document.title y notificación opcional | Lucía, Dani, Marta, Javi, Nora, Paco |
| alta | mejora | Chime ajustable: volumen propio, apagar y, mejor, fundido suave | Nora, Lucía, Dani, Javi, Paco, Marta |
| alta | feature | Control de fases del Pomodoro: opción de no autoarrancar, saltar descanso, +5 min | Dani, Javi, Paco, Lucía, Marta, Nora |
| alta | feature | Duraciones de Pomodoro configurables (presets 25/5, 50/10, 90) y mejor entrada de minutos en modo Libre | Lucía, Dani, Marta, Javi, Paco, Nora |
| media | bug | Cabecera 'En curso' fija: que dependa del estado real (En curso / En pausa / Parado) | Lucía, Dani, Marta, Javi, Paco, Nora |
| alta | mejora | Deshacer al borrar tarea y mejorar la edición (botón visible, o pista) | Paco, Lucía, Dani, Javi, Nora |
| media | feature | Modo calma: interruptor para apagar o reducir esfera 3D y grano | Lucía, Dani, Marta, Nora, Paco |
| media | mejora | Selector de tamaño de texto y mejor contraste en la UI secundaria | Paco, Lucía, Marta |
| media | copy/UX | Botones con texto o tooltip visible (→ Hacer ahora, × Borrar) y localizar textos en inglés de la radio lofi | Paco, Lucía, Dani, Marta |
| media | feature | Estadísticas ligeras: horas por día/semana, racha, contar sesiones libres y minutos por tarea | Lucía, Dani, Marta, Javi, Paco, Nora |
| media | feature | Mute global y escenas de sonido guardadas con nombre | Lucía, Dani, Marta, Nora, Paco |
| media | copy/UX | Pista de primera vez: los volúmenes arrancan a 0 y no se explica ('sube un deslizador') | Paco, Lucía |
| media | feature | Atajos de teclado (Espacio/Ctrl+Enter iniciar-pausar, R, N, F), solo con foco o modificador y con chuleta '?' | Dani, Nora, Javi, Lucía, Marta |
| media | mejora | Confirmación al cambiar de modo o reiniciar con el timer corriendo | Lucía, Paco, Javi |
| media | mejora | Loops de audio sin costura (crossfade o AudioBuffer) y más material por canal | Nora, Lucía, Marta |
| baja | feature | Modo inmersión: ocultar interfaz y pantalla completa para reloj y esfera | Nora, Marta |
| baja | feature | Exportar/importar tareas (JSON o texto) y reordenar o archivar con 'limpiar completadas' | Javi, Dani, Lucía, Nora, Paco |
| baja | feature | Versión responsive / PWA para móvil y tablet | Javi, Marta, Lucía |
| baja | feature | Tema claro opcional y acento personalizable | Marta |
| baja | feature | Ruido blanco/marrón/rosa y más canales de sonido | Lucía, Nora |
| baja | mejora | Lofi: selector de emisora, textos dinámicos, alternativa al diálogo de compartir pestaña | Marta, Javi, Lucía, Dani, Nora |
| baja | feature | Capricho de personaje: integración con Obsidian, ruido de variación aleatoria, color de acento y temporizador de apagado | Nora, Marta |

### Detalle

**Persistir el temporizador (endsAt, fase, modo, pausa) y restaurarlo al recargar** (alta, bug)
La promesa del README es falsa y perder el bloque en curso es la mayor pérdida real. Ya se usa hora de pared, así que es una corrección barata. Al restaurar, avisar si terminó mientras no estaba ('Tu Pomodoro terminó hace 3 min').
_Evidencia:_ src/timer/timerStore.ts solo guarda {day, completedWork, freeMinutes}; src/timer/useTimer.ts inicia con initialState; README.md:125 dice 'survives a reload'.

**Aviso real de fin de fase: cuenta atrás en document.title y notificación opcional** (alta, feature)
Con la pestaña tapada, auriculares o audio mudo se pierde el cambio de fase. Empezar por el título (sin permisos, discreto) y dejar la notificación como opt-in.
_Evidencia:_ grep de document.title y Notification en src sin resultados; index.html con título fijo; solo chime() en useTimer.ts.

**Chime ajustable: volumen propio, apagar y, mejor, fundido suave** (alta, mejora)
Un ding fijo a 0,4 fuera del mezclador es un sobresalto para unos y poco para otros. Necesitan elegir silencio, bajo o normal.
_Evidencia:_ src/timer/useTimer.ts:7-9: new Audio('/sounds/chime.mp3') con volume = 0.4 fijo.

**Control de fases del Pomodoro: opción de no autoarrancar, saltar descanso, +5 min** (alta, feature)
Salir al baño o atender una interrupción consume el descanso y arranca otro foco sin querer. Es el control mínimo que pide casi todo el grupo.
_Evidencia:_ src/timer/timer.ts:59 advance() encadena con endsAt + durationMs sin pausa.

**Duraciones de Pomodoro configurables (presets 25/5, 50/10, 90) y mejor entrada de minutos en modo Libre** (alta, feature)
Los bloques reales son de 45-50 o 90 min. Mejor presets o campo numérico que cinco clics de ±5.
_Evidencia:_ timer.ts: POMODORO constante 25/5/15 cada 4; solo el modo free tiene stepper.

**Cabecera 'En curso' fija: que dependa del estado real (En curso / En pausa / Parado)** (media, bug)
Una etiqueta que miente confunde ('pensé que estaba contando'). Es copy barato de corregir.
_Evidencia:_ src/layout/Header.tsx:20 con <span className="acc">En curso</span> fijo.

**Deshacer al borrar tarea y mejorar la edición (botón visible, o pista)** (alta, mejora)
El × borra al primer clic sin deshacer. En táctil, con prisa o a las 3 de la mañana se pierde la lista. Toast de deshacer de 5 s soluciona la mayor parte.
_Evidencia:_ TasksPanel.tsx: tk-del llama directo a remove(); edición solo con onDoubleClick.

**Modo calma: interruptor para apagar o reducir esfera 3D y grano** (media, feature)
Quien se distrae o tiene ansiedad/TDAH no tiene opción si no tiene activo reduced-motion del sistema. Mantener la esfera como defecto, que es la identidad visual.
_Evidencia:_ App.tsx monta siempre Scene3D y Grain; solo hay prefers-reduced-motion.

**Selector de tamaño de texto y mejor contraste en la UI secundaria** (media, mejora)
Casi toda la UI fuera del reloj va a 10-13px con opacidad baja. Es accesibilidad real para vista cansada, no un capricho de edad. Debe ser opción, sin cambiar el defecto.
_Evidencia:_ CSS con font-size 10/11/12/13px en tasks.css, mixer.css, lofi.css, header.css; .lbl con opacity .55 en app.css.

**Botones con texto o tooltip visible (→ Hacer ahora, × Borrar) y localizar textos en inglés de la radio lofi** (media, copy/UX)
Los símbolos sin texto no se explican solos. 'Lofi radio — live', 'beats to relax / study to' y '3D ↯ Sincronizar' mezclan idiomas y jerga.
_Evidencia:_ TasksPanel.tsx pinta '→' y '×' con significado solo en aria-label; LofiBlock.tsx tiene textos en inglés y SYNC_LABEL.

**Estadísticas ligeras: horas por día/semana, racha, contar sesiones libres y minutos por tarea** (media, feature)
Todos quieren ver su progreso y que la tarea activa sirva para algo. Paco lo ve vital (opositor), Dani lo quiere como motivación. Hoy el contador se reinicia a diario y el modo Libre no cuenta.
_Evidencia:_ timerStore.ts reinicia completedWork cuando cambia el día; timer.ts advance() no cuenta el modo free.

**Mute global y escenas de sonido guardadas con nombre** (media, feature)
Reconstruir cuatro sliders cada sesión es repetitivo y no hay botón para silenciar rápido.
_Evidencia:_ prefs.ts solo recuerda volúmenes; no existe botón mute global.

**Pista de primera vez: los volúmenes arrancan a 0 y no se explica ('sube un deslizador')** (media, copy/UX)
Algunas personas abren la app, ven silencio y creen que está rota. Un texto discreto basta, sin tutorial largo.
_Evidencia:_ DEFAULT_PREFS con volúmenes a 0; useAmbient.ts espera a pointerdown/keydown.

**Atajos de teclado (Espacio/Ctrl+Enter iniciar-pausar, R, N, F), solo con foco o modificador y con chuleta '?'** (media, feature)
Dani, Nora y Lucía lo piden. Paco los acepta solo como añadido, no sustituto. Cuidado con que Espacio global interfiera al escribir en otros campos o apps.
_Evidencia:_ Solo hay keydown en useAmbient.ts (unlock) y AccountMenu.tsx (Escape).

**Confirmación al cambiar de modo o reiniciar con el timer corriendo** (media, mejora)
Un clic accidental borra la cuenta; Reiniciar además vuelve a fase de trabajo aunque estés en descanso. Los botones de modo están pegados.
_Evidencia:_ useTimer.ts: setMode y reset ponen endsAt: null sin confirmar.

**Loops de audio sin costura (crossfade o AudioBuffer) y más material por canal** (media, mejora)
Es la queja principal de Nora, que es muy sensible. Lucía y Marta lo confirman en parte. Hay que escucharlo para validarlo; no es verificable leyendo código.
_Evidencia:_ engine.ts usa HTMLAudioElement con el.loop = true y sin solape; loops de 1:00 a 2:30 min.

**Modo inmersión: ocultar interfaz y pantalla completa para reloj y esfera** (baja, feature)
Quieren que la app 'desaparezca' en el segundo monitor. Es una pantalla limpia sin reconstruir nada.
_Evidencia:_ Sin modo equivalente en App.tsx.

**Exportar/importar tareas (JSON o texto) y reordenar o archivar con 'limpiar completadas'** (baja, feature)
Javi tiene un portátil de empresa que puede limpiar datos del navegador y quiere salvavidas sin cuenta. Las hechas se acumulan y no hay orden manual.
_Evidencia:_ sortTasks solo ordena por done y createdAt; Task = {id,text,done,active,createdAt}.

**Versión responsive / PWA para móvil y tablet** (baja, feature)
Javi y Marta lo piden. Dani y Nora lo ven posterior a lo barato. Lucía no lo quiere en el móvil. Es contra una decisión explícita del spec; abordarlo después de persistencia y avisos.
_Evidencia:_ app.css:40 min-width: 1024px; no hay @media de ancho.

**Tema claro opcional y acento personalizable** (baja, feature)
Solo Marta lo pide con convicción; Lucía y Nora lo rechazan. Aceptable como opción, con negro por defecto.
_Evidencia:_ tokens.css define solo el tema oscuro.

**Ruido blanco/marrón/rosa y más canales de sonido** (baja, feature)
El catálogo de 4 canales se queda corto tras una semana. Deseo plausible pero no decisivo.
_Evidencia:_ 4 canales y 10 loops en public/sounds.

**Lofi: selector de emisora, textos dinámicos, alternativa al diálogo de compartir pestaña** (baja, mejora)
El extra se percibe frágil (IDs fijos, 'No disponible' a los 8 s) y compartir pestaña asusta o parece un ritual raro. Es secundario para el uso principal.
_Evidencia:_ useYouTubeLofi.ts con tres IDs fijos y timeout de 8 s; tabCapture.ts con getDisplayMedia.

**Capricho de personaje: integración con Obsidian, ruido de variación aleatoria, color de acento y temporizador de apagado** (baja, feature)
Son ideas personales sin demanda fuera de ellas. No entran en el roadmap sin más señales de usuarios.

## Reseñas

### ★★★☆☆ Preciosa y relajante, pero si recargo pierdo el Pomodoro y eso me da ansiedad
_Lucía, 22 años, estudiante de Medicina_

Vengo de Forest + Notion y quería algo que me juntara tareas, temporizador y sonido en una sola pestaña. La primera impresión es de 10: fondo negro, naranja, un reloj enorme y una esfera de puntos que se mueve con la lluvia. Abre directo, sin pedirme cuenta, y eso se agradece muchísimo. Una semana con lluvia suave + café biblioteca a volumen bajito y, no te voy a mentir, es hipnótico. Los sonidos son grabaciones de verdad, no un bucle de diez segundos que notas que se repite.

Pero me he llevado dos disgustos. El primero: recargué la pestaña sin querer en pleno Pomodoro y el temporizador volvió a 25:00 como si nada. El README presume de que el tiempo sobrevive a una recarga, pero en el código lo único que se guarda es cuántos pomodoros llevas hoy y los minutos del modo libre, no cuándo acaba el que está corriendo. Perder 18 minutos de cuenta mientras repaso hematología me hizo querer tirar el portátil.

El segundo es que yo, que me distraigo con una mosca, me encuentro con grano animado, una esfera moviéndose y un reloj gigante. Es precioso, pero es mucho estímulo y no hay forma de apagar la esfera; solo puedo cambiar la tipografía. Y cuando acaba la fase solo suena una campanita y la siguiente arranca sola. Con auriculares y la pestaña en segundo plano me paso de largo, y de repente el bloque de trabajo ya está corriendo sin que yo lo haya decidido. Sin notificación ni cambio en el título de la pestaña. Tampoco hay estadísticas: pone Sesión 03 y ya.

Para mí es un buen fondo de estudio y un sustituto a medias de Forest, pero para fiarme de verdad como mi herramienta de exámenes necesita que el temporizador sea a prueba de recargas y de despistes. Le doy un 3, y subiría a 4 si arreglan eso.

**Caso de uso:** Lunes a viernes: abro Focus/Space en el portátil al llegar a la biblioteca de la facultad. Apunto 4 o 5 tareas del día (repasar farmacología tema 7, hacer 40 preguntas de MIR, pasar apuntes de fisiología) y marco una como activa con la flechita para que aparezca bajo el reloj. Pongo lluvia suave al 25 % y café biblioteca al 15 %, y arranco Pomodoro de 25/5. En época de exámenes, para las tardes largas en casa, uso el modo Libre a 90 min (se ajusta de 5 en 5) para bloques de práctica de casos clínicos. A veces enciendo la radio lofi cuando estoy haciendo tareas mecánicas como pasar a limpio, pero no mientras leo. Los fines de semana lo dejo en la hora local en un segundo monitor mientras cocino y estudio con calma.

**Le encanta:**
- Se abre y funciona: sin registro, sin configurar nada. Las tareas y los volúmenes se quedan guardados en el navegador (localRepo y prefs) y al volver estaba todo como lo dejé.
- El mezclador de ambientes: lluvia, fuego, café y viento con variantes (lluvia ventana, café biblioteca...). Que 'Café – Biblioteca' exista es casi un chiste para mí, y suena a biblioteca de verdad. Son grabaciones CC0 de Freesound en bucle, no sintetizado.
- La tarea 'activa' bajo el reloj (la flechita →) me da un propósito por sesión y rompe la parálisis de qué hago ahora. Pantalla en la que ves 'Sin tarea activa' si no has elegido y eso me empuja a elegir.
- Que arranque en modo reloj y, al iniciar el temporizador, el tiempo se haga pequeño y la cuenta atrás tome el protagonismo. Se siente como una sala, no como una app.
- El modo Libre de 1 a 240 min ajustable de 5 en 5, porque mis bloques de estudio no son 25 minutos.
- Atención al detalle de accesibilidad: sliders con teclado (flechas), roles y etiquetas; el timer es legible por lectores de pantalla.
- El cambio de tipografía del reloj con el selector ‹ › (6 tipos). Sé que es superficial pero me hizo sentir que el espacio es mío.

**Frustraciones:**
- El temporizador en marcha se pierde si recargas o cierras la pestaña (alta) — src/timer/useTimer.ts crea el estado con useState(() => initialState('pomodoro', ...)) y src/timer/timerStore.ts solo persiste {day, completedWork, freeMinutes}; endsAt nunca se guarda. El README y un comentario en FocusPanel.tsx ('a running timer (e.g. after a reload) takes the stage') dan a entender que sobrevive a la recarga, pero no es así.
- Las fases del Pomodoro arrancan solas y el único aviso es una campanita (alta) — timer.ts: advance() encadena a la siguiente fase con endsAt: state.endsAt + durationMs sin pausa. useTimer.ts: al acabar fase solo llama a chime() (new Audio('/sounds/chime.mp3'), volumen fijo 0.4). No hay Notification API, ni cambia document.title (grep no encuentra ninguno), ni aviso visual en pantalla aunque el diseño original lo mencionaba.
- Demasiado estímulo visual y no se puede apagar la esfera ni el grano (media) — App.tsx siempre monta Scene3D y Grain. El único control de escena es el Cycler de tipografía (sceneControl). prefers-reduced-motion se respeta en Grain.tsx, Scene3D.tsx y focus.css, pero no hay interruptor manual para quien no tiene activado ese ajuste del sistema.
- Cambiar de modo o pulsar Reiniciar mientras corre borra la cuenta sin avisar (media) — useTimer.ts: setMode llama a initialState(m, ...) y resetT llama a reset(s), ambos ponen endsAt: null sin confirmación. Los botones Pomodoro/Libre están pegados al lado del selector de Hora, fácil de clicar sin querer. Reset además vuelve la fase a 'work'.
- Duraciones del Pomodoro fijas y sin opción de saltar o detener fases (media) — timer.ts: const POMODORO = { work: 25, short: 5, long: 15, longEvery: 4 } es una constante, no hay ajustes. No existe botón de 'saltar descanso' ni de 'terminar sesión'. Para mí 50/10 es lo que funciona.
- No hay seguimiento ni estadísticas: ni siquiera sé cuántas horas estudié (media) — timerStore.ts guarda solo completedWork del día y se reinicia si cambia el día (sameDay). El encabezado muestra 'Sesión 03 — En curso' (Header.tsx) y siempre pone 'En curso' aunque el temporizador esté parado. Tampoco se cuentan pomodoros por tarea (decisión explícita del diseño v1).
- Tareas muy básicas: sin reorden, subtareas, fechas ni etiquetas; las hechas se quedan en la lista (media) — tasks/types.ts: Task = {id, text, done, active, createdAt}. useTasks.ts: sortTasks solo ordena por done y createdAt. No hay arrastrar ni archivar; el diseño v1 lo deja fuera. No sustituye mi Notion para asignaturas.
- Es solo de escritorio: no se puede usar en el móvil ni en una tablet pequeña (media) — styles/app.css: min-width: 1024px y min-height: 640px; el spec lo declara no-objetivo. Yo estudio con el portátil pero a veces con la tablet en la cama.
- La radio lofi depende de YouTube y puede quedar 'No disponible'; 'Sincronizar 3D' es raro (baja) — useYouTubeLofi.ts: tres IDs de directos y timeout de 8 s hasta 'unavailable'; el comentario avisa de que los de Lofi Girl no se pueden incrustar. LofiBlock.tsx: el botón de sincronizar usa getDisplayMedia, que lanza el diálogo de compartir pantalla de Chrome, algo que a una persona sin conocimientos técnicos le suena a vigilancia, y solo Chrome/Edge/Brave de escritorio.
- El sonido no se activa hasta que haces clic, y el volumen del lofi y el de ambiente son independientes pero no hay un 'silenciar todo' (baja) — useAmbient.ts: AudioContext se reanuda solo en el primer pointerdown/keydown. Los volúmenes por defecto son todos 0 (DEFAULT_PREFS), así que la primera vez no suena nada y no se explica en la interfaz. LofiBlock y MixerBar son sliders independientes; no hay botón mute global.
- Hay cosas pequeñas de usabilidad que me han pillado (baja) — MixerBar.tsx: onWheel cambia el volumen al hacer scroll sobre el slider (fácil cambiarlo sin querer al desplazar la página). TasksPanel.tsx: editar una tarea requiere doble clic (onDoubleClick) sin pista visual. El número del cuadrito de tarea (01, 02...) parece un contador, no un check. Todo el texto de interfaz está en español pero el README y la web de presentación son en inglés.

**Pide:**
- Que el temporizador sobreviva a recargas y cierres de pestaña: guardar endsAt, fase y modo en localStorage y restaurarlos al abrir.: Es lo que más me jode y ya tienen la base (el tiempo se calcula por reloj de pared, no por ticks). Perder la cuenta en pleno estudio me estresa más que ayudarme.
- Aviso real de fin de fase: notificación del navegador, título de pestaña con la cuenta atrás (ej. '12:34 · Focus') y un modo en el que la siguiente fase no arranca hasta que yo pulse.: Con auriculares y la pestaña de fondo la campanita no basta, y no quiero que el siguiente bloque empiece sin que yo lo decida.
- Modo calma / minimalista: interruptor para apagar la esfera 3D y el grano y dejar solo reloj + tareas.: Mi ansiedad y mi falta de concentración piden menos estímulos, sobre todo en época de exámenes.
- Duraciones de Pomodoro editables (50/10 por ejemplo), botón de saltar descanso y de terminar sesión.: 25 minutos se me quedan cortos para leer un tema; mi ritmo real es 50/10 y hacer preguntas tipo test en bloques de 90.
- Estadísticas sencillas de estudio: horas por día y semana, racha, y minutos por tarea o por asignatura.: Forest me da el bosque; aquí no veo si estudié 6 u 8 horas. Me motiva ver el progreso en época de oposiciones o exámenes finales.
- Tareas con etiquetas o asignaturas, orden manual (arrastrar), y poder importar una lista pegando texto.: Hoy tengo mi plan en Notion y duplicarlo a mano es un rollo. Ligar un bloque de tiempo a una asignatura me permitiría ver dónde se me va el tiempo.
- Mute global y 'Escenas' guardadas (ej. 'Biblioteca': lluvia suave 20 % + café biblioteca 15 %; 'Examen': solo viento suave) que se activen con un clic.: Ahora tengo que recolocar cuatro sliders cada vez y bajar todo cuando alguien me habla.
- Versión responsive o PWA para tablet y móvil, con un modo de pantalla completa para el reloj.: A veces estudio con la tablet y el móvil como segundo dispositivo; con min-width 1024 no puedo usarla.
- Sonidos de ruido blanco/marrón/rosa y más variedad (mar, biblioteca silenciosa, aula) que ayuden con la concentración.: El ruido marrón es lo que me funciona cuando la lluvia ya me cansa; el catálogo de 4 canales se queda corto tras una semana.
- Un pequeño tutorial de primera vez que diga 'haz clic para activar el sonido y sube un deslizador'.: Todos los volúmenes están a 0 por defecto y nada indica que hay que arrastrar; mi compañera abrió la app, vio silencio y pensó que estaba rota.

**¿Lo recomendaría?** Sí, con matices. A compañeros que quieren un fondo bonito y relajante con tareas y Pomodoro simples se la recomiendo ya. A quien se juega algo gordo en cada bloque de estudio (como yo antes de un examen) le diría que espere a que el temporizador sobreviva a una recarga y avise bien al terminar. Ahora mismo la uso como ambiente y sigo con Forest para lo serio.

### ★★★☆☆ Preciosa para tener en el segundo monitor, pero me falta teclado y me sobra GPU
_Dani, 31, desarrollador freelance con TDAH_

Vale, me ha pasado lo de siempre: la abro, digo "qué bonito", la uso tres días y al cuarto vuelvo a Pomofocus. Pero esta vez sé por qué, y eso ya es más de lo que puedo decir de casi todas.

Lo bueno, que me jode reconocer. Abres y no hay onboarding, ni cuenta, ni catorce pantallas de ajustes. Un reloj enorme, tus tareas a la izquierda, lluvia abajo, y se guarda en el navegador sin registrarte. Para alguien con TDAH, cuyos ajustes son su excusa favorita para no empezar, eso vale oro. Que abra mostrando la hora y no un timer en 25:00 gritándome también me gusta: no me presiona. Y la esfera de partículas que se mueve con la lluvia es puro postureo... que me tiene mirándola, lo cual es ligeramente contraproducente para una app de foco, lo sé.

Lo malo: es una app pensada para el ratón y yo vivo en el teclado. Busqué un atajo para iniciar/pausar y no existe: en el código no hay ningún listener global de teclado salvo el que desbloquea el audio y el Escape del menú de cuenta. Tengo que soltar lo que estoy haciendo, coger el ratón y clicar "Iniciar". Con TDAH cada fricción es una puerta de salida. Editar una tarea solo se hace con doble clic, y no hay forma de saltar al input de "Nueva tarea" sin ratón.

Segunda queja: el Pomodoro es 25/5/15 fijo (constante POMODORO en timer.ts) y encadena fases solo. Acaba el foco y se mete en el descanso sin preguntarme; acaba el descanso y arranca otro foco sin que yo decida nada. Cuando estoy en hiperfoco quiero saltarme el descanso, y cuando estoy hecho polvo quiero alargarlo. No hay "saltar fase" ni "+5 min". Solo existe "Reiniciar", que además me tira a una fase de trabajo desde cero.

Y la promesa del README de que el timer "sobrevive a una recarga" no la veo: el estado del timer es un useState que arranca siempre en Pomodoro parado; en localStorage solo se guardan el contador de sesiones del día y los minutos del modo libre. Si cierro la pestaña a mitad de sesión, pierdo el timer. Con tantas pestañas como abro yo, eso pasa.

Aun así, la parte de tareas está bien pensada en lo esencial: marcas una como activa y aparece bajo el reloj. Lo que no hace nada con ella: no cuenta pomodoros por tarea, no hay subtareas, ni prioridad, ni reordenar, ni "limpiar completadas". Mis tareas hechas se quedan ahí acumulándose.

Nota: 3 sobre 5. Visualmente es un 5, como producto de foco para mí es un 3, y con atajos y persistencia del timer subiría a 4 sin pensarlo. Mientras tanto la dejo abierta en el monitor de al lado con la lluvia puesta, que es para lo que mejor sirve.

**Caso de uso:** Lunes a viernes, trabajando desde casa como dev freelance. Por la mañana abro Focus/Space en el segundo monitor, meto 3 o 4 tareas del día, marco como activa la más urgente, pongo lluvia suave al 30% y la radio lofi, y lanzo un Pomodoro. Con clientes que me interrumpen uso el modo Libre a 45 o 50 minutos para bloques de código profundo. A mediodía miro la hora en el propio reloj (arranca mostrando la hora local) y por la tarde repito, con fuego y café de biblioteca para las tareas aburridas de facturación. Lo uso más como "ambiente con reloj" que como sistema de productividad.

**Le encanta:**
- Arranque sin fricción: sin cuenta ni configuración, todo en localStorage (README y src/lib/storage.ts), justo lo que necesito para no procrastinar en ajustes
- Abre mostrando la hora local en vez de un timer en cuenta atrás (FocusPanel.tsx, estado clock), y cuando hay timer corriendo la hora queda pequeña debajo: no hay presión visual
- Mixer de ambiente (lluvia, fuego, café, viento) con variantes, sliders que se mueven con arrastre, rueda y flechas (MixerBar.tsx), y recuerda tu mezcla entre sesiones (prefs.ts)
- La tarea activa se muestra bajo el reloj ('Sin tarea activa' si no hay): me recuerda para qué estoy sentado
- El timer guarda la hora de fin real, no cuenta ticks (timer.ts, advance), así que no se desfasa en pestañas en segundo plano
- Accesible de verdad: roles, aria-labels, sliders operables con teclado y respeta prefers-reduced-motion
- Las seis tipografías del reloj con dígitos del mismo ancho: detalle de gusto que se nota

**Frustraciones:**
- No hay atajos de teclado para lo esencial (iniciar/pausar, reiniciar, nueva tarea, cambiar modo) (alta) — En src/ solo hay listeners de keydown en useAmbient.ts (desbloquear audio) y AccountMenu.tsx (Escape). FocusPanel.tsx solo expone botones de ratón. Editar tarea es solo onDoubleClick en TasksPanel.tsx.
- El estado del timer no sobrevive a una recarga, contradiciendo el README (alta) — useTimer.ts inicializa state con initialState('pomodoro', ...) en useState; timerStore.ts solo persiste { day, completedWork, freeMinutes }. El README dice que el timer 'survives a reload' y el comentario de FocusPanel menciona 'a running timer (e.g. after a reload)', pero endsAt nunca se guarda.
- Pomodoro rígido y con encadenado automático de fases sin control: no se puede saltar, alargar ni parar entre fases (alta) — timer.ts: POMODORO = {work 25, short 5, long 15, longEvery 4} constante; advance() arranca la siguiente fase con endsAt + durationMs sin pausa. Los minutos configurables (stepper de 5 en 5, 1-240) solo existen en modo 'free'. 'Reiniciar' (reset) vuelve a fase work.
- Las sesiones en modo Libre no cuentan para nada (media) — En advance(), el modo 'free' hace endsAt: null y break sin tocar completedWork, así que el 'Sesión 0X' de la cabecera nunca avanza con bloques libres. Mi caso real es justo bloques de 45-50 min.
- Cabecera engañosa: dice 'En curso' siempre, aunque no haya nada corriendo (baja) — Header.tsx tiene el texto 'Sesión NN — En curso' fijo, sin depender de timer.running.
- Aviso de fin de fase muy pobre: solo un chime, sin título de pestaña, sin notificación del sistema (alta) — useTimer.ts chime() reproduce /sounds/chime.mp3 a volumen 0.4 fijo. No hay document.title con la cuenta atrás ni Notification en todo src/. Si tengo el audio silenciado o la pestaña enterrada, me lo pierdo.
- Lista de tareas muy básica: sin reordenar, sin limpiar completadas, sin deshacer al borrar (media) — useTasks.ts sortTasks ordena por done y createdAt; el modelo Task (types.ts) es solo id/text/done/active/createdAt. El botón × (tk-del) llama a remove directamente sin confirmación ni undo. Las hechas se acumulan.
- Lofi limitada y desconectada del timer (media) — useYouTubeLofi.ts usa tres IDs fijos con fallback automático; el título 'beats to relax / study to' está hardcodeado en LofiBlock.tsx aunque suene otro stream. Depende del iframe de YouTube (se pone 'No disponible' tras 8 s) y no se pausa ni se atenúa con los descansos.
- Solo escritorio y pensada para pantalla grande; coste de GPU dudoso para tenerla abierta todo el día (media) — app.css: .app { min-width: 1024px; min-height: 640px }. Scene3D.tsx simula 65 536 partículas en GPU (256², 180² si hardwareConcurrency <= 4). El README presume de 'built to be left open all day' pero no hay opción de apagar la escena ni modo ahorro.
- Interfaz solo en español y sin ajustes de duración/sonido del aviso (baja) — README: 'The interface is in Spanish'; textos hardcodeados en los componentes, sin sistema i18n.

**Pide:**
- Atajos de teclado globales: Espacio o Ctrl+Enter para iniciar/pausar, R reiniciar, N enfocar nueva tarea, flechas para cambiar modo, y E o F2 para editar tarea; con chuleta visible tipo '?': Soy de teclado; sin esto abandono. Cada vez que cojo el ratón rompo el flujo y con TDAH eso es una puerta de salida.
- Persistir el estado completo del timer (endsAt, fase, modo) en localStorage y recuperarlo al recargar: El timer ya usa hora de fin real, así que es casi gratis, y cumple lo que promete el README.
- Duraciones de Pomodoro configurables, botón saltar fase, +5 min, y opción de no auto-arrancar la siguiente fase: Mi atención no es de 25 minutos clavados. Quiero decidir si sigo en hiperfoco o descanso.
- Contar las sesiones libres y los pomodoros por tarea activa, con un resumen sencillo del día: Me motiva ver 'hoy llevo 4 bloques y 2 tareas hechas'. Ahora la tarea activa es decorativa.
- Avisos reales de fin de fase: cuenta atrás en el título de la pestaña, notificación del navegador, y volumen/sonido del aviso configurable: Trabajo con 30 pestañas y el audio a menudo silenciado; con solo el chime a 0.4 me paso de largo.
- Gestión mínima de tareas: reordenar con teclado, 'limpiar completadas', deshacer al borrar, y quizá atajo para convertir una tarea en activa: Las tareas hechas se acumulan y borrar sin undo me da miedo. No quiero un Todoist, solo que no estorbe.
- Modo ahorro: poder apagar o reducir la esfera 3D y el grano, o pausarla cuando la pestaña no es visible: La uso en un portátil con la pantalla de al lado; 65k partículas a 60 fps todo el día me preocupa por batería y ventiladores.
- Presets de ambiente (p. ej. 'Lluvia + café') y mute/maestro global; enlazar el lofi y el mixer con el timer (bajar al descanso o auto-play al iniciar): Hoy cada sesión empiezo a mano con cuatro sliders. Un clic para 'mi mezcla de código profundo' sería perfecto.

**¿Lo recomendaría?** Sí, con matices. A gente que quiere un entorno bonito y tranquilo, sin cuenta ni configuración, la recomendaría ya. A gente de teclado o con TDAH que necesita control fino del Pomodoro, le diría que espere a que tenga atajos y persistencia del timer, y mientras tanto lo use como compañero ambiental junto a su timer de siempre.

### ★★★☆☆ Preciosa como un póster suizo, pero aún es un reloj bonito más que una herramienta
_Marta, 38, diseñadora gráfica freelance_

Vale, a ver. Abrí Focus/Space y me quedé mirando la pantalla un buen rato. Negro, un naranja eléctrico (#ff4b1f) usado con una contención que ya quisieran muchas webs de estudio, etiquetas diminutas en mayúsculas con numeritos 01, 02, 03 como en un cartel de Müller-Brockmann, y esa esfera de partículas girando al lado del reloj gigante. Son 65.536 partículas simuladas en la GPU y se nota: el movimiento es sedoso, con una corriente de ruido que no tiene nada que ver con el típico visualizador tembloroso. Y el grano de película animado por encima... soy una persona sencilla, eso me compra.

Lo mejor para mí es el reloj. Seis tipografías (Suiza, Grotesk, Syne, Editorial, Mono, Unbounded) y no es un selector de postureo: cada una lleva su tracking y un factor de escala medido para que 25:00 ocupe más o menos lo mismo, y los dígitos son tabulares. Yo me paso el día cambiando de fuente en Figma y aquí lo hice por puro vicio. Syne por defecto es una elección con personalidad.

Ahora la parte en la que me enfado. Es un póster precioso que todavía no sabe que tiene que ser una herramienta. Cuando acaba una fase suena un chime a volumen 0.4 y en el código no veo que cambie el título de la pestaña ni que lance una notificación del sistema (no hay document.title ni Notification en src). Si estoy en Figma a pantalla completa, me entero tarde o no me entero. Los pomodoros son 25/5/15 fijos, sin configurar; el modo libre sube de 5 en 5, así que no puedo poner 50 minutos exactos. Y no hay estadísticas: lo único que cuenta es el número de sesión de hoy, que se reinicia cada día.

Y la pega gorda: es una app de escritorio y punto. El layout fija min-width: 1024px y min-height: 640px, y no hay ningún media query de ancho. En el portátil pequeño o en el móvil, nada. Tampoco hay tema claro: trabajo de día con luz natural y un negro puro todo el rato me cansa. Con Endel y Brain.fm me bajo la app al móvil; aquí no puedo.

Sobre el audio: me gusta que la mezcla (lluvia, fuego, café, viento, con variantes) se controle arrastrando, con la rueda o con flechas, y que haya fundidos de 0.4 s. Pero son 4 canales y 10 loops cortos de Freesound; el café de biblioteca está genial, pero a la tercera hora oigo el bucle. Y lo peor de la mezcla: el control es un número de dos cifras y una línea finita; para ajustar la lluvia mientras tengo la reunión de Meet detrás es incómodo.

La radio lofi me parece el punto más flojo de verdad: es un único bloque naranja con un texto fijo, beats to relax / study to, y detrás hay un reproductor de YouTube oculto con tres streams de reserva. Un día se cae uno y listo. No puedo elegir emisora, ni saltar, ni nada. Y para que la esfera siga la música real tengo que pulsar 3D Sincronizar y aceptar el diálogo del navegador para compartir la pestaña. Funciona solo en Chrome/Edge/Brave de escritorio. Me encanta la idea, pero compartir pantalla para ver una bola moverse es un ritual raro. Mientras no lo hago, la esfera sigue un ritmo sintético, así que no es la música real.

Nota: 3 sobre 5. Visualmente un 5, de verdad. Como app de foco que me acompañe una semana, un 2,5: le faltan notificaciones, ajustes, tema claro, móvil, estadísticas. Con eso sería un 4,5 de las que recomiendo a todo el estudio.

**Caso de uso:** Lunes a viernes trabajo desde casa en identidades visuales y maquetación. Abro Focus/Space en el segundo monitor a las 9:30 con el café, pongo lluvia suave al 30 % y fuego de chimenea al 15 %, escojo la tipografía Editorial porque va con lo que estoy diseñando y lanzo un Pomodoro con la tarea activa 'Maquetar dossier cliente'. A mediodía cambio a Libre, 50 minutos para una revisión larga. Por la tarde, cuando hay llamadas, dejo solo el reloj de hora local, que es el modo con el que abre la app. Muchas veces olvido el temporizador porque la pestaña queda detrás de Figma y solo oigo un ding suave.

**Le encanta:**
- La dirección de arte: negro, un único acento naranja, etiquetas en mayúsculas pequeñas con numeración 01/02/03 (estética suiza) y grano de película animado. Se nota criterio, no plantilla.
- El selector de seis tipografías para el reloj, con tracking y escala ajustados por fuente en typefaces.ts y dígitos tabulares: el reloj no baila al cambiar de fuente ni cuando cuentan los segundos.
- Esfera de 65.536 partículas en la GPU (Scene3D.tsx) con corriente de ruido curl, fundido de entrada de 2,5 s y respeto a prefers-reduced-motion (se queda en un fotograma estático). Muy cuidado.
- Abre por defecto en hora local y el temporizador pasa a protagonista al arrancar, con la hora pequeña debajo: pensado para dejarlo abierto todo el día.
- El mezclador de ambiente se controla con arrastre, rueda o flechas, con fundidos de 0,4 s al encender y apagar, y recuerda tu mezcla y tu fuente entre sesiones.
- El cronómetro guarda la hora de fin, no cuenta ticks: sobrevive a pestañas en segundo plano y a recargas. Eso da confianza.
- Sin cuenta ni configuración obligatoria; las tareas funcionan en local y el modo con sincronización es opcional.

**Frustraciones:**
- Aviso de fin de fase muy débil: solo un chime a volumen 0.4 (alta) — src/timer/useTimer.ts: la función chime() reproduce /sounds/chime.mp3 con volume 0.4. No hay document.title, Notification ni cambio visual del favicon en ningún archivo de src (grep sin resultados). Si la pestaña está detrás de otra app, es fácil no enterarse.
- Solo escritorio: no hay diseño responsive ni móvil (alta) — src/styles/app.css: .app tiene min-width: 1024px y min-height: 640px y no hay @media de ancho en ningún CSS (solo prefers-reduced-motion). La rejilla es fija de 12 columnas y regiones con alturas fijas.
- Solo tema oscuro (media) — src/styles/tokens.css define únicamente --bg: #0b0b0b y --fg; no hay variante clara ni prefers-color-scheme. Con luz de día un negro absoluto cansa.
- Pomodoro no configurable y modo libre con saltos de 5 minutos (media) — src/timer/timer.ts: POMODORO = {work 25, short 5, long 15, longEvery 4} constante. FocusPanel.tsx: el stepper hace Math.max(1, min - 5) y Math.min(240, min + 5), así que desde 25 solo llegas a múltiplos de 5 desde 1 (1, 6, 11...), no a 50 limpios... en la práctica se queda en 21, 26, 31... salvo que empieces en un múltiplo.
- El pomodoro encadena fases sin pausa: no hay confirmación antes de empezar el siguiente bloque (media) — timer.ts advance(): al terminar una fase calcula la siguiente con endsAt = endsAt + durationMs, es decir, sigue corriendo sola. Si te levantas y no oyes el ding, el descanso se come tu tiempo y arranca otro focus sin que lo pidas.
- Cero estadísticas o historial (media) — src/timer/timerStore.ts solo guarda day, completedWork y freeMinutes, y reinicia completedWork cuando cambia el día. La cabecera solo enseña 'Sesión NN — En curso'. No hay racha, tiempo total ni vinculación entre tareas y pomodoros.
- Lofi: una sola 'emisora' fija, dependiente de YouTube, sin controles (media) — useYouTubeLofi.ts: LOFI_VIDEO_IDS son tres IDs fijos que se prueban en orden; el comentario admite que los de Lofi Girl rechazan el embebido (error 150). LofiBlock.tsx muestra un título fijo 'beats to relax / study to'. No hay selector de emisora, ni siguiente, ni indicación de cuál suena. Si los tres caen, el bloque pasa a 'No disponible'.
- La sincronización de la esfera con la música exige compartir pestaña y solo va en Chrome/Edge/Brave (media) — tabCapture.ts usa getDisplayMedia con preferCurrentTab; useMusicSync.ts puede acabar en estados 'no-audio', 'denied' o 'unsupported'. Mientras no se activa, App.tsx usa beatPulse (groove sintético), no la música real. Fricción alta para ver un efecto estético.
- Mezclador poco cómodo y con poca variedad (baja) — MixerBar.tsx: cada canal es un slider de una línea fina con un número de dos cifras; cambiar variante es un clic que cicla (nextVariant) sin ver las demás opciones. Son 4 canales y 10 loops (public/sounds), sin ruido blanco/marrón ni mezcla guardada como escena con nombre; solo se recuerdan los volúmenes (prefs.ts).
- Tipografías cargadas desde Google Fonts: parpadeo y dependencia de red (baja) — visual/useTypeface.ts inyecta un <link> a fonts.googleapis.com la primera vez que eliges una fuente con display=swap; sin conexión caes al fallback genérico (sans-serif/serif/monospace) y el reloj cambia de ancho aunque la escala está pensada para la fuente real.
- Pequeños detalles de contraste y descubribilidad en la interfaz (baja) — focus.css: los segundos usan #5b5a56 sobre #0b0b0b, bastante tenue; .tk-arrow y .tk-del tienen opacity: 0 hasta pasar el ratón (tasks.css), y editar una tarea exige doble clic en el texto (TasksPanel.tsx onDoubleClick), nada lo indica. Las etiquetas de 10-11px en mayúsculas se leen justas.
- Tareas sin orden manual, sin subtareas ni fechas (baja) — useTasks.ts sortTasks ordena por done y createdAt, sin reordenar; tipo Task en tasks/types.ts solo tiene text, done, active y createdAt. Para una lista de trabajo real queda muy básico.

**Pide:**
- Notificación del sistema y cuenta atrás en el título de la pestaña (y favicon que cambie de color según fase), además del sonido, con volumen del aviso ajustable.: Trabajo en Figma a pantalla completa; la pestaña de Focus/Space queda siempre detrás y un ding a 0.4 no basta.
- Duraciones de Pomodoro editables (por ejemplo 50/10) y opción de pausar al cambiar de fase en lugar de encadenar automáticamente.: Mi flujo de diseño necesita bloques largos y no quiero que el siguiente focus arranque solo si me he levantado a por agua.
- Tema claro, o al menos un tono de fondo alternativo cálido, siguiendo prefers-color-scheme.: De día, con luz natural, el negro #0b0b0b me cansa; la estética suiza funciona igual de bien en papel blanco con el mismo naranja.
- Versión responsive/PWA para portátil pequeño y móvil, quizá con el reloj y el mezclador como vista mínima.: Hoy el layout fija min-width 1024; me gustaría llevarlo al móvil como hago con Endel.
- Estadísticas ligeras y bonitas: tiempo enfocado por día/semana, racha, y qué tarea consumió cuántos pomodoros, con la misma estética tipográfica.: Solo se guarda el contador diario; me gustaría ver mi semana, y como diseñadora, que ese gráfico esté a la altura del resto.
- Escenas de sonido guardadas con nombre (por ejemplo 'Tarde de lluvia'), ruido blanco/marrón y más variantes; poder ver todas las variantes de un canal en lugar de ciclar a ciegas.: El mezclador solo recuerda volúmenes y variantes sueltas; cambiar de ambiente exige reajustar cuatro sliders.
- Lofi con selector de emisoras y soporte para pistas propias o enlace de Spotify/YouTube, y que la esfera reaccione sin tener que compartir pantalla (por ejemplo con audio local propio).: Un solo stream fijo y el ritual del diálogo de compartir pestaña me sacan de la experiencia.
- Modo pantalla completa o 'solo reloj y esfera' con atajos de teclado (espacio para iniciar/pausar, F para pantalla completa) y indicación de los gestos ocultos (doble clic para editar, rueda para volumen).: Quiero un modo de presentación limpio en el segundo monitor y no tener que descubrir los gestos por casualidad.
- Personalización del acento (naranja por defecto) y de la intensidad o densidad del grano y la esfera.: El naranja es precioso pero hay clientes y días en que querría un tono distinto; y el grano animado a veces me distrae.

**¿Lo recomendaría?** Sí, con matices. A cualquier persona de diseño o a quien le importe la estética se la recomendaría ya como pantalla de segundo monitor, porque está muy por encima de la media en tipografía y movimiento. Para alguien que necesite avisos fiables, ajustes, estadísticas o usarla en móvil, todavía no: hoy le recomendaría Endel o Brain.fm y volvería a mirar esta en unos meses.

### ★★★☆☆ Precioso para dejar abierto, pero justo lo que necesito en un día caótico me falla
_Javi, 45, padre y teletrabajador en banca_

Una semana con la pestaña abierta en el portátil de empresa y mi opinión es contradictoria, así que va tal cual.

Lo bueno: entrar es un gustazo. Sin registro, sin instalar nada, abres y ves la hora, tus tareas, un mezclador de lluvia/fuego/café y una esfera de partículas que respira con el sonido. Para alguien que no quiere dar su correo a nadie ni instalar cosas en un portátil de banca, que todo se guarde en el navegador (localStorage, lo he comprobado en localRepo.ts) es un puntazo. La cuenta con Supabase es opcional y no me la pide nunca. Lo de la tarea activa bajo el reloj me ha servido de verdad: miro y sé qué estaba haciendo antes de que mi hija entrara a pedirme un zumo.

Lo malo, y es gordo: el temporizador no sobrevive a una recarga. El README presume de que "sobrevive a una recarga", pero en useTimer.ts el estado del cronómetro es un useState normal; solo se persiste el contador de sesiones del día y los minutos del modo libre (timerStore.ts). Cerré la pestaña sin querer entre dos llamadas, volví y el Pomodoro había desaparecido, empezando de cero. Para un padre con interrupciones, eso es lo peor que te puede pasar. Además, cuando acaba una fase solo suena un chime suave: no hay notificación del sistema, ni el tiempo en el título de la pestaña (index.html tiene un título fijo "Focus/Space"), así que con otra ventana encima o sin sonido me lo como. Y en el móvil no existe: el CSS pone min-width: 1024px, así que en el teléfono es inusable. Mi nota es un 3: bonito, respetuoso con la privacidad, pero hoy es un juguete de segundo monitor y no una herramienta para días caóticos.

**Caso de uso:** Teletrabajo en banca con dos niños en casa. Por la mañana abro la pestaña, anoto 3-4 tareas y marco una como activa. Trabajo en bloques de 25 min que las interrupciones me rompen cada dos por tres, con lluvia o café de fondo en el portátil de empresa durante reuniones sin cámara. Quiero poder salir, volver y que el cronómetro siga donde estaba, y enterarme de que ha acabado una fase aunque esté en otra ventana. Lo que no hago nunca: sacar el móvil para esto, porque no cabe.

**Le encanta:**
- Cero fricción y cero cuentas: sin Supabase configurado funciona en modo solo local (AccountMenu.tsx lo dice: 'Modo solo local'), y para mí, que desconfío de dar datos, eso vale oro.
- La tarea activa bajo el reloj (FocusPanel.tsx, 'Sin tarea activa' / texto de la tarea): con interrupciones, recuperar el hilo de 'qué estaba haciendo' en un segundo me ahorra bastante.
- El cronómetro guarda la hora de fin real (endsAt) y no cuenta ticks (timer.ts: advance), así que si la pestaña se queda en segundo plano durante una reunión, al volver el tiempo es correcto y recupera varias fases de golpe.
- Las tareas se guardan optimistas y con aviso si falla (useTasks.ts, 'No se pudo guardar el último cambio'), y si me creo una cuenta mañana mis tareas locales se funden con las remotas (sync.ts / merge.ts) en vez de perderse.
- El mezclador de ambiente (lluvia, fuego, café, viento con variantes) recuerda mis volúmenes entre días (prefs.ts) y es lo único que me tapa el ruido de los niños sin ponerme música con letra.

**Frustraciones:**
- El temporizador en marcha no sobrevive a una recarga ni a cerrar la pestaña, pese a lo que dice el README (alta) — useTimer.ts: el estado (endsAt, phase) vive en useState(initialState('pomodoro', ...)); timerStore.ts solo guarda day, completedWork y freeMinutes. El comentario de FocusPanel ('a running timer after a reload takes the stage') da por hecho algo que nunca ocurre, y el README promete 'survives a reload'.
- Cero avisos fuera de la pestaña: ni notificación del sistema ni el tiempo en el título (alta) — El único aviso es chime() en useTimer.ts (new Audio('/sounds/chime.mp3'), volumen 0.4, con .catch silencioso). No hay Notification, ni document.title dinámico (index.html: <title>Focus/Space</title>), ni mediaSession ni wakeLock. Si estoy en Teams con auriculares o el sonido en mute, no me entero de que acabó.
- No funciona en móvil ni en una ventana pequeña (alta) — styles/app.css: .app { height: 100vh; min-width: 1024px; min-height: 640px }, y la única @media del proyecto es prefers-reduced-motion en focus.css. La maquetación es una rejilla de 12 columnas fija. El README lo vende como 'desktop focus room', pero en el teléfono no puedo ni mirar las tareas.
- El Pomodoro encadena fases solo y sin control: no puedo saltar, ni elegir si empiezo el descanso (media) — timer.ts advance(): al acabar una fase, nextPhase() arranca la siguiente al instante con endsAt + durationMs. No hay botón de saltar ni pausa entre fases. Si un niño me interrumpe justo al acabar el foco, el descanso de 5 min corre sin mí y el siguiente Pomodoro empieza solo. Además 'Reiniciar' (reset) vuelve a una fase 'work' de 25 min aunque estuviera en un descanso.
- Duraciones fijas en Pomodoro: 25/5/15 y cada 4 (media) — timer.ts: const POMODORO = { work: 25*MIN, short: 5*MIN, long: 15*MIN, longEvery: 4 } sin ningún ajuste en la UI. Solo el modo 'Libre' permite cambiar minutos (de 5 en 5, 1-240), y ahí no hay descansos ni ciclo. Con mis reuniones de 30 min, 25 no me encaja.
- No hay historial ni estadísticas: el contador es opaco y se borra cada día (media) — timerStore.ts: completedWork se pone a 0 si r.day !== today. El encabezado muestra 'Sesión 03 — En curso' (Header.tsx) siempre con 'En curso', aunque el cronómetro esté parado. No sé cuánto he enfocado esta semana ni en qué tarea.
- Pequeñas trampas de uso: la edición de tareas está escondida y borrar no se puede deshacer (media) — TasksPanel.tsx: editar es onDoubleClick sobre el texto (ni icono ni pista), y el botón × llama a remove(id) directo, sin confirmación ni deshacer. En táctil o con prisa lo borro sin querer. Tampoco hay forma de reordenar tareas: useTasks.sortTasks ordena por hecha y por createdAt.
- El audio de ambiente y la lofi dependen de YouTube y de un gesto previo; 'Sincronizar' me da mala espina (baja) — useYouTubeLofi.ts: carga https://www.youtube.com/iframe_api de un tercero y, si falla en 8 s (READY_TIMEOUT_MS), queda 'unavailable'. En un portátil corporativo con proxy esto se cae a menudo. tabCapture.ts usa getDisplayMedia: el diálogo de 'compartir pestaña' en un equipo de empresa asusta, aunque solo analice el audio. Y useAmbient.ts no suena hasta el primer clic.
- Lo de la cuenta es solo un enlace mágico o GitHub/Google, y exige que alguien monte Supabase (baja) — docs/SETUP.md pide crear proyecto Supabase, configurar OAuth de Google y GitHub y desplegar en Netlify. Para mí, usuario, no hay alternativa de exportar/importar mis tareas en un archivo para llevarlas al móvil sin cuenta.

**Pide:**
- Persistir el estado completo del temporizador (fase, endsAt, pausedRemainingMs) en localStorage y restaurarlo al abrir, avisando 'Tu Pomodoro terminó hace 3 min': Es la promesa del README y lo que más me duele: con interrupciones constantes recargo o cierro sin querer. La arquitectura con endsAt de reloj de pared ya lo permite casi gratis.
- Notificación del navegador al acabar cada fase y tiempo restante en el título de la pestaña (p. ej. '12:34 · Focus'), con opción de silenciar el chime: Estoy en reuniones y con otras ventanas encima. Quiero enterarme sin depender del sonido ni tener la pestaña a la vista.
- Versión móvil responsive o al menos PWA ligera con la misma pantalla simplificada (reloj, tarea activa, iniciar/pausar): El teléfono es lo que tengo a mano cuando me interrumpen. Hoy el min-width: 1024px la deja inservible fuera del portátil.
- Duraciones configurables del Pomodoro (p. ej. 30/5, 50/10) y botones de 'Saltar fase' y 'Empezar descanso/foco' manual en vez de encadenado automático: Mi jornada se parte en bloques que no son de 25 min, y cuando me interrumpen quiero decidir yo cuándo arranca el siguiente tramo.
- Resumen sencillo: sesiones por día/semana y tiempo por tarea activa, guardado en local: Ahora el contador se resetea a diario y no puedo ver si la semana fue productiva ni cuánto dediqué a cada cosa.
- Exportar/importar tareas en JSON o en texto, y atajos de teclado (espacio para iniciar/pausar, N para nueva tarea): Quiero llevar mi lista sin crear cuenta ni dar mi email a un servicio de terceros, y manejarlo rápido a una mano cuando tengo al niño en el regazo.
- Deshacer al borrar una tarea (toast de 5 s) y un botón de editar visible: Hoy × borra a la primera y la edición solo se descubre por doble clic; con prisa o en táctil es fácil cargarse algo.

**¿Lo recomendaría?** Con reservas. Se lo recomendaría a alguien con un segundo monitor, auriculares y jornadas tranquilas, que quiere un rincón bonito y privado sin cuentas. Para un padre teletrabajador con interrupciones, solo cuando el temporizador sobreviva a una recarga, avise fuera de la pestaña y tenga versión móvil.

### ★★★☆☆ Preciosa de ver, pero el audio todavía no me deja desaparecer dentro de ella
_Nora, 27, escritora y guionista nocturna_

Una semana con Focus/Space en el segundo monitor, de 23:00 a 3:00, y salgo con sentimientos mezclados.

Lo bueno primero, porque lo hay. Entras y no hay onboarding, ni cuenta, ni popups, ni un solo aviso. Una pantalla oscura con un reloj enorme, la esfera de partículas respirando con la lluvia y ya. Eso es exactamente lo que le pido a una herramienta de escritura nocturna: que no me hable. El mezclador es lo mejor de la app. Lluvia al 30, chimenea al 15 y biblioteca al 10 se parece bastante a lo que me monto en myNoise, pero sin 14 sliders. Y que la tarea activa quede bajo el reloj me ha servido para no olvidar que esta sesión era «escena 14, diálogo del sótano» y no «mirar Twitter».

Ahora lo que me duele. Soy de las que oyen el punto de unión de un loop, y aquí se oye. Los sonidos son MP3 de 1 a 2,5 minutos (la ventana dura 1:05, la cafetería 1:00) que se repiten con `el.loop = true` sobre un elemento Audio normal. Eso en MP3 suele dejar un microcorte o un salto en la costura, y en `engine.ts` no hay crossfade entre vueltas. A volumen bajo, con la lluvia de ventana, a la tercera vez ya lo estaba esperando, y cuando lo oyes una vez ya no lo desoyes. Las capas de distinta duración se desincronizan, y eso ayuda un poco, pero un minuto de lluvia sigue siendo un minuto de lluvia.

Y el campanazo. Cuando acaba una fase suena un «bell ding» a volumen fijo 0,4 (`useTimer.ts`), por encima de mi lluvia al 20 %, a las 2 de la mañana, sin forma de silenciarlo ni bajarlo. Para una app que se vende como calma, eso es un sobresalto. Lo quiero apagable, o que escale con el volumen del mix.

Tampoco me fío de la promesa «sobrevive a una recarga». El README lo dice y el temporizador usa hora de pared, pero en `useTimer.ts` el estado del timer se inicializa de cero en cada carga: solo se guardan los pomodoros del día y los minutos del modo libre. Si se me cierra la pestaña a media sesión, pierdo el cronómetro. Me dio rabia comprobarlo a las 3 de la mañana con el capítulo a medias.

Resumen: la atmósfera es de 4,5 y el audio de 2,5. Me quedo con 3 de momento, pero es de los 3 con ganas de subir a 4 si arreglan las costuras y el campanazo. Con un par de cambios sería mi pestaña fija de madrugada.

**Caso de uso:** Sesiones de escritura de 2 a 4 horas por la noche, en el segundo monitor mientras escribo guion en Obsidian. Monto lluvia suave + chimenea + un poco de biblioteca, pongo el modo Libre a 50 minutos (el Pomodoro de 25 me corta el flujo a mitad de escena) y dejo como tarea activa la escena que toca. Algunas noches añado la radio lofi en segundo plano para tramos de reescritura, no de creación. Pulso «Sincronizar» si quiero que la esfera siga la música real, aunque ahí me toca compartir la pestaña con cuadro del navegador, que rompe un poco la magia.

**Le encanta:**
- Cero fricción: sin cuenta, sin onboarding, sin avisos. Abres y funciona; la sincronización con Supabase es opcional y no se te pone delante (README, App.tsx).
- El mezclador de MixerBar: arrastrar, rueda del ratón o flechas, y el botón de variante que rota entre Ventana, Suave, Tormenta, Tienda. Es rápido y cabe en una línea. Los volúmenes se recuerdan entre sesiones (prefs.ts).
- Fundidos de 0,4 s al subir y bajar canales (engine.ts) y los canales a cero ni se descargan ni gastan CPU: ese cuidado se nota al usarla.
- El reloj grande con la hora local por defecto y el contador que lo sustituye al arrancar; la tarea activa justo debajo. Una sola idea por pantalla.
- Los sonidos son grabaciones reales CC0 con créditos (CREDITS.md), no síntesis falsa, y se nota en la textura de la lluvia de ventana.
- La esfera 3D reacciona a los canales y respeta prefers-reduced-motion (Scene3D.tsx). Es bonita sin ser un protector de pantalla chillón; el grano de película ayuda al tono.
- Seis tipografías para el reloj, con dígitos de ancho fijo para que no baile. Parece un detalle tonto pero a mí me importa.

**Frustraciones:**
- Los loops se oyen: sin crossfade en la costura y duraciones cortas (1 a 2,5 min) (alta) — engine.ts usa HTMLAudioElement con el.loop = true y no hay solapamiento entre vueltas; CREDITS.md indica 1:00 (cafetería), 1:05 (ventana), 1:04 (viento suave). Los MP3 añaden relleno del codificador, lo que suele dar un microcorte en el punto de repetición. Es mi mayor queja como usuaria sensible al audio.
- El campanazo del temporizador no se puede silenciar ni regular (alta) — useTimer.ts, función chime(): new Audio('/sounds/chime.mp3') con volume = 0.4 fijo, se dispara en cada fase terminada. No pasa por el AudioContext del mezclador ni hay ajuste en prefs.ts para apagarlo. Rompe la inmersión justo cuando más inmersa estoy.
- El cronómetro no sobrevive a recargar, pese a lo que da a entender el README (media) — timerStore.ts solo guarda day, completedWork y freeMinutes; el estado (endsAt, fase, restante) se crea con initialState() en useTimer.ts en cada carga. Un comentario en FocusPanel.tsx habla de «a running timer (e.g. after a reload)», pero nada lo persiste. Cerrar la pestaña mata la sesión en curso.
- La radio lofi depende de YouTube y puede fallar o meter anuncios fuera de mi control (media) — useYouTubeLofi.ts: tres IDs fijos de streams en directo, un timeout de 8 s y luego estado «No disponible»; los streams de Lofi Girl rechazan el embebido (comentario en el propio archivo). Los IDs pueden morir cuando el canal cambie el directo. Además el volumen del mezclador y el de lofi son controles separados, sin ningún balance entre ellos.
- Sincronizar el 3D con música real obliga a compartir pantalla (baja) — useMusicSync.ts / tabCapture.ts usan getDisplayMedia; en navegadores sin soporte queda desactivado («Tu navegador no permite capturar audio»). Y si no marcas «Compartir audio de la pestaña», el botón solo cambia de texto. Es torpe para algo que quiero usar sin pensar.
- Poco control de sesión: sin atajos de teclado, sin auto-inicio de la siguiente fase ni opción de silencio al acabar (media) — Solo hay atajos de flechas dentro de los sliders (MixerBar.tsx, LofiBlock.tsx); no hay ningún listener global de teclado. En advance() de timer.ts el Pomodoro encadena fases solo, pero no hay ajuste para pausar entre ellas; la cabecera dice siempre «Sesión 0N — En curso» (Header.tsx) aunque el timer esté parado.
- Las tareas son muy mínimas para escribir de verdad (baja) — TasksPanel.tsx: texto plano de hasta 500 caracteres, sin orden manual, sin notas ni subtareas ni etiquetas; borrar es un × sin deshacer. Para un proyecto de guion con escenas me quedo corta y acabo volviendo a Obsidian.
- Todo el interfaz es solo en español, sin modo para ocultar la interfaz (baja) — README: «The interface is in Spanish». Para mí no es un problema, pero con la esfera y el reloj sí echo un modo «pantalla limpia» donde todo (tareas, mezclador, cabecera) se desvanezca y me deje solo la atmósfera.

**Pide:**
- Loops sin costura: crossfade real entre vueltas (dos elementos solapados o AudioBuffer con loop y fundido) y/o sonidos más largos, o varias grabaciones por canal que se alternen aleatoriamente.: Es lo que más me saca de la escritura. La lluvia, si se nota que es un loop, deja de ser lluvia y pasa a ser un reloj de 65 segundos.
- Interruptor para silenciar el campanazo y control de su volumen; mejor aún, un fundido suave de 3 s en vez de un ding seco.: Quiero que me avise sin asustarme, o que no me avise y ya está. Ahora no tengo ninguna opción.
- Persistir el cronómetro en la recarga (guardar endsAt y fase en timerStore).: El README lo vende y los datos ya trabajan con hora de pared; falta guardar el estado. Una recarga accidental no debería costarme la sesión.
- Modo inmersión: un atajo (por ejemplo F) que oculte tareas, mezclador y cabecera y deje solo reloj y esfera, con pantalla completa opcional.: El objetivo es que la app desaparezca. Que quede el reloj enorme y poco más, y que vuelva al mover el ratón.
- Atajos de teclado globales: espacio para iniciar o pausar, M para silenciar todo, números para subir o bajar cada canal.: Escribo con las manos en el teclado; coger el ratón para el mezclador me saca del texto.
- Presets o escenas de mezcla guardadas («Tormenta nocturna», «Café de guion») con un clic, y un temporizador de apagado con fundido de salida largo.: Reconstruyo mi mezcla cada noche. Y me quedo dormida a veces escribiendo; que todo se desvanezca solo al terminar sería precioso.
- Más canales y textura: ruido marrón/rosa, ciudad lejana, tren, y un control de variación aleatoria de volumen para que la lluvia respire.: myNoise lo hace muy bien con la variación lenta; aquí cada canal es un volumen fijo.
- Integración ligera con Obsidian o portapapeles: copiar al final de la sesión «sesión 03 · 50 min · escena del sótano» como línea de nota diaria.: Llevo un registro de lo que escribo cada día; ahora tengo que apuntarlo yo a mano y se me olvida.
- Poder reordenar y archivar tareas en lugar de borrarlas, con deshacer.: Un × sin vuelta atrás a las 3 de la mañana y adiós a la lista de escenas.

**¿Lo recomendaría?** Sí, con matices. A amigas que escriben o estudian de noche y quieren algo bonito y sin ruido de interfaz se la recomendaría ya. A las que son tan sensibles al audio como yo les diría que esperen a que arreglen las costuras de los loops y el campanazo: son lo único que me impide ponerle un 4 y dejarla como pestaña fija.

### ★★★☆☆ El Pomodoro me gusta, pero me han puesto la letra para hormigas
_Paco, 63 años, opositor, poco técnico, pantalla grande y vista cansada_

Vengo a estudiar y me encuentro una pantalla negra con un reloj enorme. Eso, la verdad, me ha gustado: el número se lee desde la otra punta del salón, y el Pomodoro de 25 y 5 de toda la vida funciona bien. Le doy a Iniciar, suena un campanilla cuando toca y no tengo que pensar más. Para eso sí la uso. Hasta ahí, cuatro estrellas.

Lo demás ya no lo tengo tan claro. Casi todo lo que hay alrededor del reloj está escrito en letra de 10, 11 o 12 píxeles, y encima en gris apagado. Los nombres de las pestañas, las tareas, el volumen... yo tengo que acercar la cara a la pantalla. Y no hay forma de agrandarla, o al menos yo no la he encontrado. Dicen que es para tenerla abierta todo el día en un segundo monitor, pues será para gente de veinte años.

Luego están los botones que no se explican solos. Para marcar una tarea como la de ahora hay una flechita (→). ¿Una flecha? Yo pensaba que era para pasarla a otro sitio. Para borrar, una equis diminuta que borra a la primera, sin preguntar ni dejarme deshacer. Y para corregir una tarea hay que hacerle doble clic al texto, cosa que nadie te cuenta. Lo descubrí de casualidad. Y en la parte de abajo me sale «Lofi radio — live», «beats to relax / study to» y «3D ↯ Sincronizar». Yo no sé qué es eso de 3D ni de sincronizar, y ese símbolo raro me da yuyu. Si el resto está en español, ¿por qué esto no?

Lo de la lluvia, el fuego y el café de biblioteca me ha sorprendido para bien. Con la lluvia suave y el café de biblioteca a poquito volumen estudio mejor que con el silencio de mi casa. Eso no me lo esperaba y se lo reconozco. Pero para subir y bajar el volumen hay que arrastrar un trazo finito o usar la rueda del ratón, y la primera vez no tenía ni idea.

Mi mayor queja: el Pomodoro es solo el de 25/5/15. Yo tengo temario por bloques y a veces me va mejor 50 y 10, y no puedo cambiarlo. Y cuando acaba el trabajo, el descanso empieza solo sin avisar más que con un pitido; si me he ido a por un café y no lo oigo, ya he perdido cinco minutos y sin darme cuenta. Tampoco veo nada del tiempo que llevo estudiado en la semana, que para un opositor es lo que más importa.

Resumen: me quedo con el temporizador y los sonidos de fondo, que están muy bien. Pero se nota que la hizo gente joven con vista de lince. Un 3 sobre 5, y subiría a 4 si me dejaran agrandar la letra y me explicaran los botones con palabras.

**Caso de uso:** Preparo oposiciones. Me siento por las mañanas con la tele apagada y abro la app en el monitor grande. Apunto en Pendientes los temas del día (por ejemplo «Tema 14 — Procedimiento administrativo»), le doy a la flechita en el que voy a estudiar, elijo Pomodoro, pongo lluvia suave y café de biblioteca bajitos y arranco. Cuando suena la campanilla, me levanto cinco minutos. Cada cuatro, descanso largo de 15. Al terminar el bloque marco la tarea como hecha. A la tarde repito, y de noche a veces uso el modo Libre con 50 minutos para repasar tests. Lo que no puedo hacer es saber cuántas horas llevo en la semana ni si he cumplido mi objetivo.

**Le encanta:**
- El reloj gigante: se lee desde lejos y no hay nada que lo tape (focus.css usa clamp(110px, 17vw, 290px)).
- El Pomodoro clásico funciona sin tocar nada: 25 trabajo, 5 descanso, 15 largo cada 4 (timer.ts, POMODORO). Es lo que yo quería y no hay que configurar.
- La campanilla (chime.mp3) al cambiar de fase: no hace falta mirar la pantalla.
- Los sonidos de fondo con variantes (Lluvia: suave, ventana, tormenta, tienda; Café: cafetería, biblioteca). Me ayudan a concentrarme y son más de lo que esperaba.
- Que el reloj empiece enseñando la hora y que, al arrancar, la hora pase pequeñita arriba. Es discreto y útil.
- No me obliga a crear cuenta: abro y funciono. Las tareas se quedan guardadas en el navegador (localRepo.ts).

**Frustraciones:**
- Letra diminuta y gris apagado en casi todo salvo el reloj, sin opción de agrandarla (alta) — Los CSS usan font-size de 10, 11, 12 y 13px en tasks.css, mixer.css, lofi.css, header.css y account.css, y la clase .lbl tiene opacity: 0.55 (app.css). La app tiene min-width: 1024px y altura fija 100vh (app.css), así que ni se adapta ni hay ajuste de tamaño de texto en ningún sitio.
- Botones por símbolo sin texto: la flecha → para marcar la tarea activa y la × para borrar (alta) — TasksPanel.tsx pinta '→' y '×' como únicos contenidos visibles; el significado solo está en aria-label ('Marcar como activa', 'Borrar ...'), que yo no veo. No hay tooltip ni texto visible.
- Borrar una tarea no pregunta ni permite deshacer (alta) — En TasksPanel.tsx el botón .tk-del llama directamente a a.remove(task.id), y en useTasks.ts remove() quita la tarea de la lista y del repositorio de inmediato. Un clic torpe y pierdes un tema.
- Editar una tarea solo se puede hacer con doble clic, y nadie lo dice (media) — En TasksPanel.tsx, el span .tk-text usa onDoubleClick para entrar en edición; no hay botón de editar ni indicación visible. A mi edad el doble clic falla con frecuencia.
- Textos en inglés y jerga que no entiendo en el bloque de música (alta) — LofiBlock.tsx muestra «Lofi radio — live», «beats to relax / study to» y «Vol»; la etiqueta del botón de sincronizar es «3D ↯ Sincronizar» (SYNC_LABEL). Al pulsarlo el navegador me pide 'compartir pantalla' y el estado 'no-audio' me pide 'Marca «Compartir audio de la pestaña»', que no sé dónde está.
- El Pomodoro no se puede configurar y el descanso arranca solo (alta) — POMODORO está fijo en timer.ts (25/5/15 cada 4) y en FocusPanel solo hay stepper de minutos para el modo Libre. En advance() de timer.ts, al acabar una fase la siguiente empieza sola (endsAt: state.endsAt + durationMs) y solo suena chime(); no hay botón de 'empezar el descanso', ni notificación, ni cambio en el título de la pestaña (no hay document.title ni Notification en todo src/).
- Si recargo la página pierdo el temporizador, aunque el README dice lo contrario (media) — El README dice que el temporizador 'survives a reload' y FocusPanel.tsx comenta 'a running timer (e.g. after a reload)', pero useTimer.ts arranca con initialState(...) y timerStore.ts solo guarda day, completedWork y freeMinutes: no se guarda endsAt. Tras recargar vuelve a 25:00 parado.
- Cambiar de modo o pulsar Reiniciar tira el temporizador sin avisar (media) — En useTimer.ts setMode() llama a initialState(...) aunque esté corriendo, y reset() vuelve a la fase de trabajo (initialState con phase 'work'), incluso si estabas en un descanso. FocusPanel muestra '↺ Reiniciar' sin confirmación.
- La cabecera dice siempre «En curso» aunque no haya nada en marcha (baja) — Header.tsx tiene fijo <span className="acc">En curso</span> y nunca mira si el temporizador está corriendo. Me hizo pensar que ya estaba contando. Además 'Sesión 03' solo cuenta pomodoros de trabajo de hoy (completedWork) y no se explica.
- Las tareas no se relacionan con el tiempo estudiado, y no hay ningún resumen (alta) — La tarea activa solo se muestra como texto bajo el reloj (FocusPanel, activeTaskText). El único contador es completedWork en timerStore.ts, que se pone a 0 cada día (sameDay). No hay historial, ni semana, ni nada por tarea.
- Los sonidos y la música requieren pulsar algo primero, y no dice cuál es el que suena (media) — useAmbient.ts espera a un clic o tecla (listeners 'unlock') antes de reproducir, y el README lo explica como un 'Tip'; en la interfaz no hay ningún aviso. Los volúmenes arrancan a 0 y se manejan arrastrando una línea fina (MixerBar.tsx: onPointerDown/onPointerMove), sin un botón de silenciar.
- Si no hay cuenta, solo guarda en este navegador, y la oferta de iniciar sesión usa Google/GitHub y 'enlace mágico' (media) — TasksPanel.tsx muestra 'Guardado solo en este navegador · Inicia sesión para sincronizar'. AccountMenu.tsx ofrece 'Enviar enlace →', 'Continuar con Google →' y 'Continuar con GitHub →'; yo no tengo GitHub ni sé qué es un 'enlace'. Y si no hay Supabase configurado (!session.available) el menú solo dice 'Modo solo local', sin explicar cómo no perder las tareas si limpio el navegador.

**Pide:**
- Selector de tamaño de letra (Normal / Grande / Muy grande) y subir el mínimo a 16px con mejor contraste, sin tanto gris.: Con 63 años y vista cansada, el 90% de lo que hay en pantalla fuera del reloj lo leo a duras penas. Sin esto no puedo recomendarla.
- Botones con palabras: «Hacer ahora», «Borrar», «Editar» en vez de →, × y doble clic; y un «Deshacer» durante unos segundos después de borrar.: No debería adivinar qué hace cada símbolo, y un borrado accidental de un tema no debería ser irreversible.
- Pomodoro configurable (por ejemplo 50/10) y una opción de 'esperar a que yo pulse' antes de empezar el siguiente descanso o bloque.: Mi forma de estudiar por temas no cabe en 25 minutos exactos, y no quiero perder el descanso si estoy fuera de la mesa.
- Aviso más claro al acabar cada fase: texto grande en pantalla y título de la pestaña (por ejemplo «¡Descanso! 05:00») además de la campanilla.: Si tengo otra pestaña o el libro delante no me entero de que ha cambiado la fase; hoy solo hay un sonido (chime()).
- Resumen de estudio: horas de hoy y de la semana, y racha de días, con una meta que yo ponga (por ejemplo 4 horas al día).: Para un opositor lo importante es cuántas horas netas lleva. Ahora el contador se reinicia cada día y no se guarda nada.
- Guardar el temporizador cuando recargo o cierro sin querer la pestaña.: El README promete que sobrevive a una recarga y no es verdad; me ha pasado perder 20 minutos de bloque.
- Poner todo en español claro: «Radio lofi — en directo», «Volumen», y cambiar «3D ↯ Sincronizar» por algo como «Que la esfera siga la música» con una explicación en un cuadro de ayuda.: No soy de inglés ni de tecnicismos; la parte de abajo me desanima y no sé si estoy usando algo roto.
- Un botón de silenciar todo y un 'sonidos recomendados' (por ejemplo «Para leer», «Para memorizar») con ajustes ya puestos.: Los controles de volumen son finos y se manejan arrastrando; con una combinación hecha me evito trastear.
- Tareas con un número de pomodoros estimados y hechos, y poder ordenarlas (subir/bajar).: Mi temario es largo y quiero saber cuántos bloques me ha llevado cada tema, y poner primero el más urgente.
- Una explicación inicial de un minuto (guía rápida) la primera vez que abro la app, con letra grande.: Descubrí por casualidad lo del doble clic y lo del clic previo para que suene el audio. No quiero tener que investigar.

**¿Lo recomendaría?** Con reservas. A alguien joven que quiera una pantalla bonita y tranquila, sí. A un compañero opositor de mi edad, solo si le hace falta únicamente el Pomodoro y un fondo de lluvia, y le advierto de que tendrá que acercarse a la pantalla para leer casi todo. Si agrandan la letra y explican los botones, la recomendaría sin dudar.

## Hilo de debate

### Lucía, 22, estudiante de Medicina
- **a Dani, 31, desarrollador freelance con TDAH** (da la razón y lo comprueba): Dani, lo del timer lo he mirado y tienes razón. El README (línea 125) dice que 'sobrevive a una reload', pero en useTimer.ts el estado sale de initialState() y endsAt no se guarda en ningún sitio. Yo con 9 horas de biblioteca y la pestaña abierta con otras 20 me lo he cargado más de una vez sin querer. Para mí es el fallo número uno, porque pierdes justo el bloque en el que estabas concentrada. Y ya que hablamos de atajos: yo no soy de teclado como tú, pero cuando tengo el apunte en una mano y el boli en la otra, un espacio para pausar me salvaría. Eso sí, no me pongas más pantallas de ajustes, que a mí también me agobian.
- **a Paco, 63 años, opositor** (da la razón y aporta un caso de uso que no vio): Paco, aunque tenemos 40 años de diferencia, me pasa lo mismo con la letra. Lo he comprobado en el CSS: hay un montón de 10, 11 y 13px en tasks, mixer, lofi y header. Yo estudio a las 7 de la tarde con la vista machacada de pantallas y las etiquetas me cuestan. La flechita → y la × sin texto me tiraron para atrás, y que el × borre sin deshacer me da pánico. Perder la tarea 'Repasar cardio' a dos días del examen me haría llorar. Lo de la cabecera 'En curso' siempre fijo (Header.tsx) también me despistó: pensé que estaba contando y llevaba un rato sin darle a Iniciar. Una cosa en la que no coincido: a mí el pitido me sirve, no me da tanto problema.
- **a Nora, 27, escritora y guionista nocturna** (matiza): Nora, comprobé lo del chime: sí, useTimer.ts lo reproduce a volumen 0.4 fijo y no hay ajuste para bajarlo. Pero en mi caso lo defiendo a medias. Yo tengo auriculares con la lluvia y cuando acaba la fase necesito algo que me saque de la página del libro; un aviso demasiado suave me haría pasarme 20 minutos. Lo que sí quiero es poder elegir: silencio, bajo o normal. Lo de los loops de 1 minuto con el.loop = true (engine.ts) sí lo he notado, sobre todo la cafetería, y con ansiedad ante exámenes un salto en el audio me distrae muchísimo. Hasta que lo leí no sabía que eso era lo que me molestaba.
- **a Javi, 45, padre y teletrabajador en banca** (da la razón con un matiz de estudiante): Javi, lo del Pomodoro que encadena fases solo es real y a mí me pasa al revés que a ti: salgo al baño al terminar el foco y vuelvo con el descanso ya consumido y otro foco a medias. Pero no coincido en lo del móvil: yo en el móvil ya tengo Forest, y me da miedo que Focus/Space acabe siendo otra app más en el bolsillo que me distrae. Prefiero que sea la pantalla del escritorio, y que el móvil quede lejos. Eso sí, la notificación y el tiempo en el título de la pestaña me parecen básicos: con Notion y el PDF abiertos la pestaña queda enterrada.
- **a Marta, 38, diseñadora gráfica freelance** (discrepa): Marta, en lo del tema claro no coincido: para estudiar de noche y con luz baja el negro me va bien, y lo del naranja contenido me parece lo que evita que me agobie. Lo que sí te compro es lo de la esfera de partículas y el grano: es bonito, pero a mí que me distraigo con cualquier cosa me tiene mirando la pantalla en vez del apunte. Necesito poder apagarlo, o al menos que la esfera se reduzca cuando hay una fase de foco corriendo. Para ti es arte; para mí a las 11 de la noche con un examen de Farmacología es un estímulo más.

_Cambia de opinión:_ Al principio pensaba que lo del timer y los avisos eran detalles menores, pero tras comprobar que el README promete que el timer sobrevive a una recarga y el código no lo guarda (useTimer.ts, timerStore.ts), lo subo a prioridad máxima. También me convenció Paco de que × sin deshacer y los símbolos sin texto son un problema real, no solo de gente mayor.

_Su prioridad:_ Persistir el estado del timer (endsAt y fase) al recargar y añadir un aviso de fin de fase fuera del sonido (título de la pestaña y notificación), con volumen del chime ajustable. Es lo que más pérdida real causa a quien estudia muchas horas con muchas pestañas.

### Dani, 31, freelance con TDAH
- **a Lucía** (da la razón y matiza): Lo de la recarga lo he comprobado y tienes razón. useTimer.ts arranca con initialState('pomodoro') en un useState, y timerStore solo guarda completedWork y freeMinutes. Pero el README dice 'survives a reload' y eso es falso. Lo que sí aguanta es la pestaña en segundo plano, porque usa endsAt de reloj de pared. Yo no lo veo como 3 estrellas por ansiedad, lo veo como un bug de verdad. Guardar endsAt, fase y pausedRemainingMs en localStorage son quince líneas. Y lo de apagar la esfera te lo compro del todo: con TDAH, un reloj gigante más una nube de 65k partículas más grano animado es mucho. No hay interruptor y debería haberlo.
- **a Marta** (discrepa en un dato y da la razón en otro): Te has columpiado con el stepper. FocusPanel.tsx hace freeMinutes ± 5 y el valor por defecto es 25. Con cinco clics desde 25 llegas a 50 limpios, no a 21 ni 26. Solo te sale 1, 6, 11 si bajas hasta 1. Eso es un matiz menor, no un fallo. Lo del aviso sí lo confirmo. Hice grep de document.title y Notification en src y no sale nada, solo chime() con volumen 0.4. En tu caso, con Figma a pantalla completa, es un problema real. Lo de la lofi y el diálogo de compartir pantalla me parece secundario: es un extra, no el núcleo. Lo del tema claro me da igual, pero para quien trabaja de día entiendo que cuente.
- **a Nora** (da la razón y trae un caso de uso): Lo del campanazo me hace gracia porque yo lo veo al revés que tú. En engine.ts el mezclador usa loop = true sobre HTMLAudioElement, y chime() crea otro new Audio fuera del mezclador con volumen 0.4 fijo. Así que tienes razón: ni se silencia ni escala con tu mezcla. Yo lo quiero apagable por otro motivo. Con TDAH, un ding fuerte a mitad de hiperfoco me saca del estado y me da más rabia que el propio descanso. Lo de las costuras de los loops no lo puedo comprobar sin oído, así que te creo, pero sospecho que hay más fallos como ese. El que sí he visto es que no hay ni un solo atajo global de teclado. Las únicas listeners de keydown son el desbloqueo del audio y el cierre del menú de cuenta. Para una app que dice ser de foco es una vergüenza.
- **a Paco** (da la razón en parte y defiende otra postura): En lo de la letra pequeña te doy la razón. Casi todo va a 10-13px y gris apagado, y no hay ajuste de tamaño. Eso es un problema de accesibilidad de verdad, no solo de gente mayor. Pero te discuto lo de los botones: la flecha y la × los veo bien como minimalismo. Eso sí, la × borra sin deshacer, y eso sí es una trampa, aunque con un 'deshacer' de cinco segundos se arreglaría sin añadir texto. Lo de que el descanso arranque solo me parece lo más grave de lo que cuentas. Estoy de acuerdo contigo en que debería esperar a que pulses.
- **a Javi** (matiza y cambia un poco de opinión): Antes pensaba que lo del móvil era un no-objetivo razonable. Me has hecho dudar. Si el min-width de 1024px deja la app inservible justo en el momento en que te interrumpen, pierde sentido como herramienta de días caóticos. Aun así, yo priorizaría antes persistir el temporizador y poner el tiempo en el título de la pestaña, que es barato, antes que hacer un móvil entero. Lo del padre con niños lo veo claro: sin recarga, sin título y sin pausa entre fases, es un cronómetro que te deja tirado exactamente cuando más lo necesitas.

_Cambia de opinión:_ Sobre el móvil. Pensaba que escritorio-solo era una decisión de producto defendible. Javi y Lucía me convencieron de que, sin persistencia ni aviso, el hueco se nota más fuera del portátil. Sigo creyendo que primero va lo barato: persistir endsAt y poner el tiempo en el título.

_Su prioridad:_ Persistir el estado del temporizador (endsAt, fase, pausa) en localStorage. Es lo que casi todos reportan, lo comprobé en useTimer.ts y timerStore.ts, y el README promete 'survives a reload' sin cumplirlo. Detrás: cuenta atrás en document.title, aviso de fin de fase apagable y pausa opcional entre fases.

### Marta, 38, diseñadora gráfica
- **a Nora, 27, escritora y guionista nocturna** (da la razón y matiza): Nora, el campanazo lo he mirado y tienes razón: en useTimer.ts, chime() crea un new Audio('/sounds/chime.mp3') con volume = 0.4 fijo, fuera del mezclador. Cero ajuste. Y lo de las costuras del loop también cuadra: engine.ts hace el.loop = true sobre un elemento Audio, sin crossfade. Yo no soy tan fina de oído como tú, pero desde el diseño te digo lo mismo con otra palabra: la app cuida la transición del reloj, la tipografía y el fundido de 0,4 s al subir un canal, y luego te suelta un ding seco igual para todos. Es una incoherencia de acabado. Un fundido de 2-3 s en vez de un campanazo sería lo coherente con el resto. Eso sí, en la queja de los loops yo no me mojo más: lo del microcorte del MP3 no lo he comprobado escuchándolo, solo veo que no hay solape en el código.
- **a Lucía, 22 años, estudiante de Medicina** (matiza y discrepa en parte): Lucía, lo del exceso de estímulo lo entiendo, pero no estoy tan de acuerdo en el diagnóstico. Yo, que vivo de mirar pantallas, te digo que lo que cansa no es la esfera sino que no puedas apagarla. Lo de prefers-reduced-motion lo he comprobado: Grain.tsx y Scene3D.tsx lo respetan, pero solo si tienes activado el ajuste del sistema, y casi nadie sabe que existe. Por ahí un interruptor 'calma' es lo mínimo. Dicho esto, el reloj arranca mostrando la hora y se hace pequeño al iniciar el temporizador, y eso me parece una jerarquía visual muy bien pensada. Lo que sí te compro entero es lo de 'En curso': Header.tsx lo tiene escrito fijo con un span, aunque no corra nada. En una app que presume de silencio, una etiqueta que miente es ruido.
- **a Paco, 63 años, opositor** (da la razón y trae otro caso): Paco, de las letras pequeñas tengo que darte la razón aunque me duela como diseñadora. Lo he contado en los CSS: 11px aparece 7 veces y 10px otras 4, y .lbl tiene opacity: 0.55 en app.css. El reloj usa un clamp enorme y hay una variable --display-scale que escala el reloj y un título de 30px, pero el resto de la interfaz no la usa. Eso cuadra con tu sensación de 'el reloj es enorme y lo demás para hormigas'. Es un fallo de jerarquía y de accesibilidad: el contraste de 0.55 sobre negro con 10px es difícil para cualquiera con vista cansada, no solo a tu edad. Y lo de → y × sin texto visible también es un problema de legibilidad de iconos. Yo pondría palabras, como tú pides. Lo del inglés en el bloque de la lofi también me chirría tipográficamente: mezcla de idiomas en una misma línea.
- **a Dani, 31, desarrollador freelance con TDAH** (discrepa en un punto): Dani, con lo de los 65.536 partículas a todo el día coincido en que da miedo, pero ojo con exagerar: en Scene3D.tsx hay un if (document.hidden) return y Grain.tsx tampoco redibuja con la pestaña oculta, así que el gasto no es 'siempre'. En tu segundo monitor, visible, sí corre. Donde sí te apoyo es en lo de los atajos: la app es tan cuidada visualmente que se siente raro que no tenga ni espacio para iniciar. Pero te discuto lo de 'postureo': para mí la esfera es lo que diferencia esto de Pomofocus. Si se quita sin más se queda en un reloj con lluvia. Lo ideal es tu modo ahorro, no su eliminación.

_Cambia de opinión:_ Antes de leer a los demás pensaba que la esfera y el grano eran intocables porque son la identidad visual. Lucía y Dani me han convencido de que sin un interruptor de calma el diseño se vuelve una imposición, sobre todo para quien tiene ansiedad o TDAH. Paco me ha hecho ver que mi perfeccionismo con el reloj gigante ignora que el resto de la interfaz tiene texto de 10 y 11px con contraste bajo.

_Su prioridad:_ Que el estado del temporizador sobreviva a una recarga y que el fin de fase avise de verdad (título de pestaña, notificación y chime ajustable). Lo dicen casi todos los testers y el README lo promete.

### Javi, 45, padre y teletrabajador en banca
- **a Lucía** (da la razón y aporta caso de uso): Lucía, lo del Pomodoro perdido al recargar lo he mirado en el código y es verdad. El estado del timer es un useState que arranca de cero. timerStore.ts solo guarda day, completedWork y freeMinutes, y endsAt no se persiste. Y el README (línea 125) dice que sobrevive a una recarga, que es mentira. Yo lo vivo peor que tú. Estoy en una reunión, entra mi hijo, se me cierra la pestaña o el portátil de empresa se reinicia por una actualización forzada, y adiós. Para mí eso es lo primero que habría que arreglar. Además, en mi caso no puedo ni instalar nada para tener otra opción. Lo que sí te matizo: yo no quiero que arranque solo la siguiente fase. A ti te da ansiedad, a mí me hace perder el control mientras atiendo a un crío. Así que pediría las dos cosas juntas: restaurar el timer y que no encadene fases solo.
- **a Marta** (discrepa en un dato): Marta, aquí te corrijo, que no quiero que la gente piense que le falta algo que sí tiene. Dices que no puedes poner 50 minutos limpios. He mirado FocusPanel.tsx y el stepper hace ±5 desde freeMinutes. El valor por defecto es 25, así que 25, 30, 35... llegas a 50 en cinco clics. Solo te saldría 21, 26, 31 si bajas hasta 1 y subes desde ahí, y eso es un detalle raro, no un fallo de uso normal. Lo que sí compro es que sea pesado: cinco clics para 50 min es un rollo. Un campo numérico o presets (25/50/90) lo arreglarían. Donde sí tienes razón es en que el aviso de fin de fase es flojísimo, solo un chime a 0.4 y ni document.title ni Notification en todo src. Con Figma a pantalla completa o con una reunión de Teams compartiendo pantalla, yo tampoco me entero.
- **a Dani** (da la razón parcialmente y matiza): Dani, confirmo lo de los atajos: los únicos keydown que hay en src son el de desbloquear el audio en useAmbient y el Escape del menú de cuenta. Nada de espacio para iniciar o pausar. Pero te discuto la prioridad. Tú pones los atajos como lo más urgente, y yo, con una mano en el móvil y otra con el niño, tampoco tengo teclado a mano a veces. Para mí el orden es: 1) persistir el timer, 2) aviso real en la pestaña (título con cuenta atrás), 3) atajos. Y ya que estás, súmale algo que no has dicho: la cabecera pone siempre Sesión NN — En curso (Header.tsx) aunque no corra nada. En una pestaña olvidada del portátil de trabajo, eso te hace creer que ya contaba. Eso sí que me ha pasado.
- **a Nora** (da la razón en lo comprobado, matiza en lo no comprobado): Nora, el campanazo lo confirmo: useTimer.ts crea new Audio('/sounds/chime.mp3') con volume 0.4 fijo, sin pasar por el mixer ni por los ajustes. Y que el loop sea un el.loop = true sobre un elemento Audio lo vi en engine.ts. El microcorte en la costura no lo puedo verificar leyendo código, eso lo tienes que oír tú, y te creo porque eres la que tiene oído. Pero yo lo miro desde el lado contrario: el chime es lo único que me avisa cuando tengo la pestaña tapada, así que no lo quitaría. Lo que pediría es que sea configurable, apagable y con volumen propio, y que se complemente con título de pestaña y notificación. Un ding a las 3 de la mañana te asusta a ti. Un ding a mí a veces es lo único que me dice que ya van cinco minutos de descanso.
- **a Paco** (da la razón y trae un caso de uso): Paco, mucho de lo que dices lo he mirado y es cierto: la × borra directamente (sin undo) y la flecha → no tiene texto, solo aria-label. A mí me pasó lo mismo con la × cuando tenía el portátil en el regazo y un niño me dio un codazo. Lo de la letra pequeña lo noto yo también en el portátil de empresa con la pantalla a poca resolución. Y te sumo algo que no dijiste: la web dice Guardado solo en este navegador. En mi caso, el portátil corporativo borra datos del navegador cada cierto tiempo por política de IT, así que las tareas se me pueden ir sin que yo haga nada. No me voy a registrar con Google ni GitHub en una herramienta de la que no sé quién está detrás. Querría un exportar o copiar la lista a mano como salvavidas.

_Cambia de opinión:_ Antes pensaba que el aviso de fin de fase y la persistencia del timer eran quejas de gente muy sensible o muy exigente. Tras comprobar el código, README prometiendo supervivencia a recarga y src sin document.title ni Notification, veo que es un fallo objetivo, no una manía. Lucía y Nora me convencieron de que el chime debe poder apagarse y tener volumen propio. Marta me hizo ver que la regla de los 50 minutos sí funciona desde 25, así que no todo lo que se afirma es un fallo.

_Su prioridad:_ Persistir el estado completo del temporizador (endsAt, fase, modo) en localStorage y restaurarlo al recargar. El README ya lo promete y es falso, y se acompaña con aviso real de fin de fase (título de pestaña, notificación) y la opción de que la siguiente fase no arranque sola.

### Nora, 27, escritora y guionista nocturna
- **a Lucía** (da la razón y matiza): Lo de la recarga lo he comprobado antes de dártelo por bueno: useTimer.ts guarda en timerStore solo day, completedWork y freeMinutes, y el estado con endsAt vive en un useState que arranca siempre parado. O sea, el comentario de FocusPanel sobre 'tras una recarga' es una promesa que el código no cumple. Dicho esto, yo no lo veo igual que tú en lo del estímulo: la esfera y el grano son justo lo que a mí me mete en la escena. Lo que yo pediría no es quitar la esfera, sino un interruptor, porque lo tuyo con la ansiedad es legítimo y lo mío también. Y ojo, el grano ya se pausa con la pestaña oculta (document.hidden), así que el coste solo lo paga quien mira.
- **a Dani** (discrepa en parte): Con lo de los 65k de partículas te veo un poco alarmista: Scene3D.tsx hace return si document.hidden, y baja a 180² con pocos núcleos, así que 'a 60 fps todo el día' solo pasa si la pestaña está a la vista. En un segundo monitor sí, pero no tan fiero. Lo de los atajos de teclado en cambio te lo compro entero: solo hay listeners para desbloquear audio y Escape del menú, y yo escribo de noche con las manos en el teclado, no quiero tocar el ratón para pausar. Pero ojo con 'espacio = iniciar/pausar': si lo globalizan, me lo van a disparar mientras escribo en Obsidian con la pestaña enfocada. Que sea una tecla con modificador o solo con foco en el panel.
- **a Paco** (da la razón y trae un caso que no vio): Tienes toda la razón con la flechita y la equis: el significado solo está en el aria-label, y borrar es inmediato sin deshacer. Y te traigo un caso de mi lado: yo escribo con la luz baja y a mí la letra pequeña y tenue me encaja con la estética, pero me di cuenta leyéndote de que es una decisión que no puede ser única. Un selector de tamaño de texto beneficia a los dos: tú subes, yo me quedo como estoy. Lo del inglés en la radio lofi también me chirría, aunque a mí me da igual porque no miro esa zona. Eso sí, no sé si el Pomodoro rígido es un defecto para ti tanto como para los demás; tú dices que el 25/5 te vale. Yo creo que lo que de verdad os falta a todos es que el siguiente bloque no arranque solo.
- **a Marta** (discrepa): Te voy a llevar la contraria con el tema claro: para mí un tema claro sería lo contrario de lo que quiero, escribo de noche con lluvia y la pantalla negra ES la inmersión. Si lo añaden, que sea opcional y que el negro siga por defecto. Donde sí te doy la razón es en el loop: a mí también se me nota, y como sonidos son 10 grabaciones cortas de Freesound, a la tercera hora el oído sensible lo caza. Y lo de compartir pestaña para sincronizar la esfera me parece un precio absurdo por un efecto que yo ni usaría.
- **a Javi** (matiza): Compruebo y confirmo: no hay document.title ni Notification en todo src, así que el aviso fuera de pestaña es solo el chime. Pero en tu caso yo no empezaría por la versión móvil, que el min-width de 1024px es decisión del spec. Empezaría por persistir el endsAt, que es casi gratis, y poner el tiempo en el título de la pestaña. Eso te arregla el 80% de tu día caótico sin rediseñar nada.

_Cambia de opinión:_ Antes creía que la esfera y el grano no eran un problema porque a mí me inmersan; leyendo a Lucía y a Paco entiendo que sin un interruptor de calma y un tamaño de letra ajustable la app deja fuera a gente a la que le haría bien. Sigo queriendo que el negro y el grano sean el defecto.

_Su prioridad:_ Persistir el estado del temporizador (endsAt, fase, modo) en localStorage, porque el README y un comentario del código prometen algo que no ocurre, y a la vez que el siguiente bloque no arranque solo, con el tiempo en el título de la pestaña como aviso discreto que no rompa la inmersión.

### Paco, 63, opositor
- **a Lucía** (da la razón y aporta caso propio): Lucía, lo de perder el Pomodoro al recargar me lo creía a medias, porque el README dice que sobrevive y yo me fío de lo que está escrito. Pero me he metido en el código y es verdad. useTimer guarda solo las sesiones del día y los minutos del modo libre, y la hora de fin no se guarda en ningún sitio. Y eso a mí me duele más que a ti. Yo estudio temario de oposición en bloques largos y no sé qué es una recarga. Pulso la F5 sin querer, o cierro la pestaña pensando que se queda abierta, y se va la cuenta. Un hombre de mi edad no sabe que ha pasado. Solo ve 25:00 otra vez y piensa que ha roto algo. Eso para mí es lo primero que hay que arreglar, antes que cualquier adorno.
- **a Lucía** (matiza): Lo de la esfera que se mueve te lo compro, pero con una pega. A ti te distrae porque eres joven y quieres apagarla. A mí, con la vista cansada, me cuesta más encontrar los botones entre tanto fondo negro y letritas diminutas que la bola en sí. Un botón claro que diga 'Quitar animación' nos valdría a los dos. Eso sí, en el código no existe, solo se respeta el ajuste del sistema, que yo no sabría ni dónde está.
- **a Dani** (discrepa en parte): Dani, lo de los atajos de teclado: he mirado y tienes razón, no hay ninguno global, solo las flechas dentro de los deslizadores y el Escape del menú. Pero a mí los atajos me sobran. No me los sé ni los quiero aprender. Si los ponen, que los pongan además de los botones, nunca en lugar de ellos, y con un 'Iniciar' bien grande que diga lo que hace. Lo que sí te compro es lo de saltar el descanso y alargarlo. Yo a veces estoy leyendo un tema, suena el aviso y se me corta la cabeza a mitad de párrafo. Pero no pidas muchas cosas a la vez, que luego la pantalla se llena de botones y me pierdo.
- **a Javi** (da la razón y lo amplía): Javi, lo del aviso al acabar lo he comprobado y es cierto. Solo suena una campanita (chime a volumen 0,4 en useTimer) y no hay notificación ni cambia el título de la pestaña. Yo tengo la pestaña al lado de la del temario en PDF y no miro la otra. Ahora, ojo con una cosa que dices: en un portátil de empresa pedir una notificación puede asustar con un cartel de 'permitir'. A mí me asustaría. Yo preferiría que el título de la pestaña ponga '12:34 · Focus' y ya está. Eso no pregunta nada a nadie y se ve de un vistazo. Sobre el móvil: yo también lo quiero, pero primero lo básico.
- **a Nora** (matiza y cambia un poco de opinión): Nora, yo nunca me había fijado en que la lluvia se repite. Se lo achaco a mis oídos. Pero lo del campanazo me ha hecho pensar. El código confirma que va fijo a 0,4 y no se puede quitar. Yo antes pensaba que el aviso sonaba poco, y ahora veo que a ti te sobra y a mí me falta. Con eso ya no sé qué pedir. Lo razonable es poder subirlo y bajarlo, o apagarlo. Y de paso una cosa que nadie ha dicho: los volúmenes empiezan todos a cero, así que la primera vez no suena nada y yo creí que no funcionaba el sonido. Pon un texto que diga 'sube un deslizador para oír'.
- **a Marta** (discrepa): Marta, tú juzgas la letra y la rejilla y te entiendo. Pero hay un detalle de tu reseña que hay que corregir: dices que el cronómetro 'sobrevive a recargas' porque guarda la hora de fin. Eso es verdad solo mientras la pestaña sigue abierta, aunque esté en segundo plano. Si recargas, no se guarda nada, que lo he mirado en timerStore. Y eso cambia tu 'da confianza'. Además las etiquetas de 10-11 píxeles en mayúsculas y los segundos en gris oscuro sobre negro son un problema serio para mi vista. Un tema claro o letra más grande me importa más que cambiar de tipografía.

_Cambia de opinión:_ Entré creyendo que lo que me faltaba eran botones más claros. Tras leer a Nora y comprobar el código, veo que el aviso de fin (solo una campanita fija a 0,4, sin título de pestaña ni notificación) es un fallo para unos y para otros, y ya no pido solo 'más fuerte': pido que se pueda ajustar. También tengo menos fe en el README, porque prometía que el temporizador sobrevive a una recarga y en el código no es así.

_Su prioridad:_ Que el temporizador no se pierda al recargar o cerrar la pestaña (guardar la hora de fin, la fase y el modo), con un aviso al acabar que se vea sin sonido, como el tiempo en el título de la pestaña.

