# Informe de beta: Aitana (29, redactora freelance, Sevilla, TDAH)

Todas las rutas de capturas son relativas a `beta/aitana/` (carpeta completa:
`C:/Users/VersusPC/AppData/Local/Temp/claude/2a0b86ecce4dfe7e/b0157921-ea47-4245-96ef-3632ef6e0b29/scratchpad/qa/beta/aitana/`).
Los logs son la salida del runner al ejecutar el JSON indicado.

## 1. Quién soy y para qué la usaría

Escribo desde casa y desde cafeterías, y con TDAH cualquier cosa que se mueva o pite me saca del texto. Quiero abrir algo,
ver UNA tarea, darle a empezar y olvidarme. En los descansos respiro para desbloquearme y trabajo con ruido de fondo
(ruido rosa, lluvia) para aislarme.

## 2. Qué hice

Todo en WebKit con el «iPhone 12 Mini» (375×629), salvo la última prueba, que hice en el «iPad Mini».

1. **Primera apertura sin tareas**: miré la pantalla, toqué «Elige una tarea», cerré la hoja y probé «Iniciar» tal cual (`paso1.json`, `paso1b.json`).
2. **Primera apertura con tareas**: «Ir a tareas», creé 2 o 3 tareas, volví a Foco, elegí una desde la tarjeta, reabrí la hoja, inicié un Pomodoro y me fui a Tareas (`paso1c.json`).
3. **Modo calma**: Foco con esfera (dos capturas separadas 2 s), activé el modo calma en Ajustes, volví a Foco, inicié y probé el modo inmersivo (`paso2.json`).
4. **Movimiento reducido** (`"reducedMotion": "reduce"`): Foco y Respirar (`paso2b.json`). Después, Respirar con el modo calma activado (`paso2c.json`).
5. **Respirar** desde el botón de arriba, «¿Por qué así?» y salir (`paso3.json`).
6. **Invitación a respirar en un descanso**: Pomodoro, Iniciar, saltar fase, tocar «¿Respiramos un rato?», 10 s respirando, Cerrar y un segundo ciclo (`paso3b.json`, `paso3c.json`, `paso3d.json`).
7. **Ambiente**: Sonidos, «Más sonidos», Ruido en Rosa, más Lluvia y Viento; guardé la mezcla, volví a Foco y silencié desde allí (`paso4.json`, `paso4b.json`, `paso4c.json`, `paso4d.json`).
8. **Cuánto compite por mi atención**: conté los controles visibles y las animaciones CSS en marcha en cada pantalla (`paso5.json`, más tres ficheros de diagnóstico, `diag*.json`).
9. **iPad Mini**: primera apertura, hoja de tarea vacía y Sonidos (`paso5-ipad.json`).

## 3. Lo que comprobé

**Primera apertura**
- [COMPROBADO] Arranca en modo **HORA**, no en Pomodoro. Veo «02 HORA LOCAL · SESIÓN 01 · PARADO», tres iconos arriba, el selector Pomodoro/Libre/Hora, un reloj enorme, la tarjeta «ELIGE UNA TAREA / Sin tarea activa» y un botón naranja «INICIAR». La esfera de partículas aparece desde el primer segundo. (`shots-1/01-primera-apertura.png`)
- [COMPROBADO] Si toco «INICIAR» en modo Hora, la app cambia sola a POMODORO y arranca 25:00 («02 FOCUS · EN CURSO»), sin avisar del cambio de modo. (`shots-1c/00-click-iniciar-hora.png`, log `tras-click-iniciar` de paso1c)
- [COMPROBADO] Si toco la tarjeta sin tener tareas, sale una hoja con «¿En qué vas a trabajar?», «No tienes tareas pendientes.» y un botón «IR A TAREAS». (`shots-1/02-hoja-sin-tareas.png`)
- [COMPROBADO] «Ir a tareas» me lleva a una lista vacía con «Nada pendiente / Escribe abajo tu primera tarea…». El composer «Nueva tarea» está abajo. (`shots-1b/02-tareas-vacia.png`)
- [COMPROBADO] El cuadradito naranja de ese estado vacío tiene una animación infinita (`br-breathe`, `iterations=Infinity`). (log `anim-foco-parado` de diag.json)

**Elegir tarea activa**
- [COMPROBADO] Con tareas, la hoja las lista con una flecha. Al elegir una, la tarjeta pasa a «TRABAJANDO EN · Responder a la editora» y en la pestaña Tareas aparece un contador «2». (`shots-1c/03-hoja-con-tareas.png`, `shots-1c/04-tarea-elegida.png`)
- [COMPROBADO] Si reabro la hoja, la tarea activa sale en naranja con un ✓ y aparece «QUITAR DE «AHORA»». En la lista de Tareas, esa tarea lleva la etiqueta «AHORA». (`shots-1c/05-reabrir-hoja.png`, `shots-1c/07-tareas-con-mini-timer.png`)
- [COMPROBADO] Con el Pomodoro en marcha, en Tareas sale un mini-temporizador con «FOCUS 24:58» en naranja grande y botón de pausa. El icono de Foco lleva un puntito. (`shots-1c/07-tareas-con-mini-timer.png`)
- [COMPROBADO] Ese puntito del mini-temporizador y el de la pestaña Foco laten sin parar (`m-pulse` en `m-mini-dot` y `m-live-dot`, infinitas). (log `anim-tareas` de diag.json)

**Modo calma y movimiento reducido**
- [COMPROBADO] La esfera cambia de forma sola con la app parada: en capturas tomadas con segundos de diferencia el contorno es distinto. (`shots-1/01-primera-apertura.png` frente a `shots-1/03-tras-escape.png`; `shots-2/01a…` frente a `01b…`)
- [COMPROBADO] El interruptor «Modo calma: sin esfera ni grano» está casi al final de Ajustes, debajo de la tipografía. Al activarlo, el `canvas` desaparece (`canvas-en-calma false`) y Foco queda limpio: reloj, tarjeta y botón. (`shots-2/03-ajustes-modo-calma-on.png`, `shots-2/04a-foco-calma.png`)
- [COMPROBADO] El modo inmersivo con calma muestra solo «24:58 MIN» y un «× SALIR». (`shots-2/06-inmersivo-calma.png`)
- [COMPROBADO] El modo calma **no** detiene los puntos que laten ni el cuadrado del estado vacío: con calma activado y Pomodoro en curso siguen corriendo `br-breathe` y los dos `m-pulse`. (log `anim-tareas-calma`, captura `shots-diag/tareas-calma-en-curso.png`)
- [COMPROBADO] Con `reducedMotion: reduce` no se ve la esfera en Foco (aunque el `canvas` sigue en el DOM) y no queda ninguna animación CSS en marcha. El interruptor de Modo calma sigue apagado, así que la app no lo da por activado. (`shots-2b/01a-foco-reduced.png`, `01b…`, logs `estado-reduced`, `switches-reduced` y `diag-rm.json`)

**Respirar**
- [COMPROBADO] «Respirar» cambia la pantalla de Foco por una esfera que crece y encoge, «Inspira / por la nariz» con 4 puntos, «Suelta / despacio, por la boca» con 6 puntos, una explicación de la respiración abdominal, un contador de respiraciones y «¿POR QUÉ ASÍ?». (`shots-3/01-respirar-inspira.png`, `shots-3/02-respirar-suelta.png`)
- [COMPROBADO] Al soltar el aire, la esfera crece tanto que se monta encima de «SESIÓN 01 PARADO» en la cabecera. (`shots-3/02-respirar-suelta.png`)
- [COMPROBADO] Durante la respiración la cabecera sigue diciendo «SESIÓN 01 · PARADO». (`shots-3/01…`)
- [COMPROBADO] En modo calma o con movimiento reducido, la esfera se sustituye por un cuadrado fijo que cambia de color (rojo oscuro al inspirar, naranja al soltar). En el 12 mini, el contador «0 respiraciones» y el botón «¿POR QUÉ ASÍ?» quedan cortados por la barra de pestañas: botón entre 520 y 552 px, barra desde 538 px. (`shots-2b/02a…`, `shots-2b/02b…`, `shots-2c/01-respirar-calma.png`, log `porque-vs-tabbar-calma`) Sin calma sí cabe (`shots-3/01…`).
- [COMPROBADO] «¿Por qué así?» abre una hoja larga: diafragma, 6 respiraciones por minuto, espiración de 6 s frente a 4 s de inspiración, fuentes y un aviso de que no sustituye a un tratamiento. (`shots-3/04-por-que-asi.png`, log `por-que-texto`)
- [COMPROBADO] Si vuelvo a tocar el icono Respirar, regreso a Foco. (log `tras-salir` de paso3)

**Invitación en el descanso**
- [COMPROBADO] Al saltar la fase con ⏭, el descanso empieza solo (DESCANSO · EN CURSO · 04:59), porque «Empezar la siguiente fase automáticamente» viene activado de fábrica. La tarjeta de tarea se sustituye por un recuadro naranja «■ ¿Respiramos un rato?» con una ✕ («Ahora no»). (`shots-3b/01-tras-saltar-a-descanso.png`, logs `switches-antes` y `labels` de paso3d)
- [COMPROBADO] Si toco la invitación, la respiración se abre con otra cabecera: «02 RESPIRAR», la cuenta atrás del descanso «04:58» bien visible y «CERRAR ×». El icono Respirar de arriba desaparece. A los 10 s el contador marca 1 respiración y la cuenta sigue bajando (04:47). (`shots-3c/01-respirar-desde-descanso.png`, logs `respirar-en-descanso` y `respirar-10s`)
- [COMPROBADO] «Cerrar» me devuelve al descanso con la invitación todavía visible. En el siguiente descanso vuelve a salir. Tras saltar dos fases el marcador sigue en «SESIÓN 01». (logs `tras-cerrar`, `focus-2` y `descanso-2` de paso3d)
- [COMPROBADO] Mientras dura el descanso no veo en Foco en qué tarea estaba: la invitación ocupa el sitio de la tarjeta. (`shots-3b/01…`)

**Sonidos y ambiente**
- [COMPROBADO] La primera pantalla de Sonidos es casi entera un bloque naranja de radio lofi («beats to relax / study to», «EN PAUSA»). Los ambientes empiezan debajo y hay que bajar para verlos. (`shots-3c/04-sonidos-durante-descanso.png`, `shots-4d/03-sonidos-silenciado.png`)
- [COMPROBADO] «MÁS SONIDOS / 9» se despliega en el sitio: Agua, Noche, Pájaros, Truenos, Ruido, Viaje, Drone, Papel y ASMR. (`shots-4/02-mas-sonidos.png`)
- [COMPROBADO] El chip de Ruido rota entre Blanco, Rosa y Marrón con cada toque. Truenos («LEJANOS») no tiene chip para cambiar. (logs `variante-ruido-1/2/3` de paso4b, `shots-4b/01-ruido-activado.png`)
- [COMPROBADO] Tocar un deslizador de volumen no cambia nada (sigue en «00»). Arrastrándolo sí: Ruido Rosa 56 %, Lluvia 38 %, Viento 27 %. (log `vols` del primer intento frente a `vols-1` y `vols-2`; `shots-4b/02-lluvia-viento.png`)
- [COMPROBADO] Con un ambiente sonando, el icono de Sonidos de la barra lleva un puntito. (`shots-4b/02-lluvia-viento.png`)
- [COMPROBADO] Al bajar, la cabecera fija «SONIDOS / SILENCIAR» es translúcida y se ven por debajo los botones del reproductor y los deslizadores, uno encima del otro. El botón «SILENCIAR» se sale del margen derecho que respeta el resto del contenido. (`shots-4/01-ambientes.png`, `shots-4b/03-mezcla-guardada.png`)
- [COMPROBADO] **Guardar la mezcla con Enter** funciona («Escribir en casa» aparece en «MEZCLAS GUARDADAS»), pero **la barra de pestañas desaparece** y no vuelve aunque toque en otro sitio. Me quedo atrapada en Sonidos sin poder ir a Foco. Según el diagnóstico, `.m-tabbar` queda en `display:none` con el foco ya en BODY. (`shots-4c/01-tras-enter.png`, logs `tras-enter` de paso4c y `estado-tras-guardar`, `tras-blur` y `tras-tocar-fuera` de diag)
- [COMPROBADO] **Guardar la mezcla tocando «GUARDAR»** mientras escribo: el primer toque se pierde porque el botón salta de y=565 a y=531 justo en ese momento. El segundo toque sí guarda. (`shots-diag/tras-tocar-guardar.png`, logs `boton-con-teclado`, `tras-1er-toque` y `tras-2o-toque`)
- [COMPROBADO] El altavoz de Foco silencia: el icono pasa a tachado en naranja y se llama «Silenciado». En Sonidos el botón se vuelve naranja, «SILENCIADO», y los volúmenes se conservan (38 % y 27 %). (`shots-4d/02-foco-silenciado.png`, `shots-4d/03-sonidos-silenciado.png`, log `estado-sonidos`)
- [COMPROBADO] En este WebKit de pruebas `AudioContext` no existe (`audioctx "undefined"`), así que **no he podido oír nada**. No opino sobre la calidad ni el volumen real de los sonidos.

**Carga por pantalla** (controles visibles en el viewport y animaciones CSS en marcha; el `canvas` de la esfera no está incluido) (log de paso5)
- [COMPROBADO] Foco parado: 12 controles, 1 animación. Foco en curso: 15 controles, 1 animación. Tareas vacía con mini-temporizador: 9 controles, 3 animaciones. Sonidos: 14 controles. Ajustes: 21. Respirar: 8.
- [COMPROBADO] Ajustes trae de fábrica 7 colores de acento, 5 tipografías, 3 tamaños de texto, 4 tonos de aviso, «Modo calma» y además un enlace «Modo focus →» aparte. (log `ajustes-texto` de paso2)

**iPad Mini**
- [COMPROBADO] Misma estructura que en el móvil, a mayor tamaño. La esfera apenas se distingue (polvo muy tenue). La hoja vacía de tarea se ve igual. (`shots-5-ipad/01-ipad-inicio.png`, `shots-5-ipad/02-ipad-hoja-tarea.png`)
- [COMPROBADO] En Sonidos, «SILENCIAR» queda casi pegado al borde derecho, mientras que el contenido tiene un margen amplio. (`shots-5-ipad/03-ipad-sonidos.png`)

## 4. Lo que opino

- [OPINIÓN] **En 5 segundos se entiende qué hacer**: botón naranja grande, «Iniciar», y encima «Elige una tarea». Pero empezar en modo HORA me descoloca: abro una app de concentración y lo primero es un reloj de pared. Y si le doy a Iniciar me cambia a Pomodoro sin decir nada. Para mí lo natural sería abrir directamente en Pomodoro, o que «Iniciar» no apareciera en modo Hora.
- [OPINIÓN] La hoja de tarea vacía está bien resuelta: me dice qué pasa y me da UN botón. Lo de la tarea activa me encanta: «TRABAJANDO EN…» en Foco y «AHORA» en la lista es justo lo que necesito, una sola tarea a la vista.
- [OPINIÓN] La esfera es bonita, pero **se mueve sin parar aunque no esté haciendo nada**, y eso es lo que más me cuesta. Por suerte el modo calma la quita y Foco queda limpísimo. Ese modo debería estar arriba en Ajustes, o ofrecerse la primera vez, y no enterrado debajo de «Tipo».
- [OPINIÓN] Que el modo calma no apague también los puntos que laten (mini-temporizador, pestaña Foco, cuadrado de «Nada pendiente») me parece incoherente. «Calma» debería significar que nada se mueve. Con movimiento reducido del sistema sí se paran: si ya existe esa lógica, que el modo calma la use.
- [OPINIÓN] El mini-temporizador naranja grande en Tareas (24:58) me tira la vista cada vez que cambio de pestaña, y cambio muchísimo. Lo preferiría en gris, o con una opción para ocultarlo.
- [OPINIÓN] **Respirar es lo mejor de la app.** La invitación «¿Respiramos un rato?» en el descanso es suave, tiene una ✕ clara y no suena ni salta. Desde ahí la respiración muestra la cuenta del descanso y un «CERRAR» explícito: perfecto. El modo de 4 s / 6 s con texto corto funciona. La versión con cuadrado (calma o movimiento reducido) me gusta incluso más, porque es más tranquila.
- [OPINIÓN] Pero en mi iPhone 12 mini, en modo calma (justo el que usaría), el «¿Por qué así?» y el contador quedan cortados por la barra. Parece roto.
- [OPINIÓN] Que la esfera de respirar crezca por encima de «SESIÓN 01 PARADO» queda feo, y ese «PARADO» mientras respiro me confunde: ¿estoy haciendo algo o no?
- [OPINIÓN] Que el descanso empiece solo al saltar la fase está bien para mí, pero no sabía que esa opción venía activada.
- [OPINIÓN] En Sonidos, el bloque naranja de lofi me grita. Yo vengo a por ruido rosa y lluvia, y tengo que bajar dos pantallas, abrir «Más sonidos» y arrastrar. Montar el ambiente me costó más de lo que debería. Lo de los deslizadores que no responden al toque, solo al arrastre, me hizo dudar de si funcionaba.
- [OPINIÓN] **Lo de la barra que desaparece al guardar la mezcla con Enter es grave para mí.** Me quedo atrapada en una pantalla y lo único que se me ocurriría es cerrar la app, y ahí pierdo el hilo. El primer toque perdido en «GUARDAR» también me frustra: pienso que no ha ido, vuelvo a tocar y no sé si he guardado dos veces.
- [OPINIÓN] Ajustes tiene demasiadas cosas «bonitas» (7 colores, 5 tipografías) para alguien como yo, que entraría a toquetear y acabaría sin trabajar. Las opciones que me importan (calma, sonido al terminar) quedan entre esas.
- [OPINIÓN] Los números «02», «03», «04», «01» delante de cada título no sé qué significan. Es una cosa más que leer.

## 5. Lo que me confundió

- Abrir en «HORA LOCAL» y que «Iniciar» me lanzara un Pomodoro.
- «SESIÓN 01 · PARADO» mientras respiraba, y que la sesión siga en 01 después de dos ciclos saltados: ¿cuenta o no?
- Durante el descanso dejo de ver mi tarea en Foco, y al volver al trabajo tengo que recordar cuál era.
- Hay «Modo focus a pantalla completa» (el icono de arriba), «Modo focus →» en Ajustes y «Modo calma». Tres nombres parecidos sin saber cuál es cuál.
- Los deslizadores de volumen que no reaccionan a un toque.
- Que la barra de abajo desapareciera tras guardar la mezcla.

## 6. Lo que echo en falta

- [PROPUESTA] Que la primera apertura sea en Pomodoro, con la tarjeta de tarea y el modo calma ya ofrecido («¿Prefieres sin animaciones?»).
- [PROPUESTA] Que el modo calma pare **todo** lo que se mueve, incluidos los puntos que laten, y se active solo si el sistema tiene «reducir movimiento».
- [PROPUESTA] Ambientes primero (o recordar lo último que usé) y la radio lofi plegable. Un acceso directo a mis mezclas guardadas desde Foco.
- [PROPUESTA] Que tocar un deslizador fije el volumen en ese punto.
- [PROPUESTA] Ver la tarea activa (aunque sea pequeña) también durante el descanso, para no perder el hilo al volver.
- [PROPUESTA] Un preset de respiración más corto («solo 1 minuto») y que la respiración no diga «PARADO».
- [PROPUESTA] Una opción para ocultar o atenuar el mini-temporizador.

## 7. iOS / Android

- [COMPROBADO] En el 12 mini (pantalla pequeña), Respirar en calma o con movimiento reducido queda cortado por la barra.
- [HIPÓTESIS] La barra de pestañas que desaparece tras guardar la mezcla con Enter parece venir de que el campo enfocado se elimina sin que se dispare `focusout` (WebKit), y la app sigue creyendo que el teclado está abierto. En un iPhone real debería pasar igual, y quizá también al tocar «Guardar», porque Safari no pasa el foco a un botón al tocarlo. Lo comprobé solo en emulación.
- [HIPÓTESIS] El primer toque perdido en «GUARDAR» viene de que la barra reaparece al cerrarse el «teclado» y mueve la hoja. En un iPhone real el teclado al cerrarse también desplaza la hoja, así que me esperaría lo mismo.
- [COMPROBADO] En este WebKit no hay Web Audio, así que no he podido verificar el sonido en iOS. Habría que probarlo en un iPhone de verdad, incluido si suena con la pantalla bloqueada.

## 8. Veredicto

**6/10 hoy, con potencial claro de 8.** La idea encaja conmigo: una tarea, un botón, una respiración amable en el descanso y modo calma. Respirar y la tarea activa son lo que me haría volver. Pero la app se mueve más de lo que dice (esfera por defecto, puntos que laten incluso en calma), arranca en el modo que no toca, montar mi ambiente cuesta demasiados pasos, y el fallo de la barra que desaparece al guardar una mezcla me dejaría tirada en el peor momento. La seguiría usando en el móvil en modo calma, para respirar y con una sola tarea, siempre que arreglen la barra y el recorte de Respirar en pantallas pequeñas.
