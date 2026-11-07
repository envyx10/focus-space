# Informe de beta — Javier (42, backend senior, Bilbao)

Rutas relativas a `qa/`. Datos de partida: `beta/javier/gen.mjs` (25 tareas en `focus-space:tasks:v1`, 3 hechas, 10 con descripción Markdown con SQL/bash/Go/YAML, listas, checklists, tabla y enlaces, una de 300 caracteres y otra con `ñ ç ü ß 漢字 עברית <script>`).

## 1. Quién soy y para qué la usaría

Desarrollo backend en remoto y vivo con una lista larga de tareas con notas en Markdown (queries, comandos, enlaces). En el portátil uso Focus/Space. En el móvil quiero consultar y retocar esas notas en el tren Bilbao–Donostia sin perder nada y sabiendo qué está guardado y dónde.

## 2. Qué hice

Todo en Chromium emulando **Pixel 7** (412×915), y una ejecución en **Pixel 7 horizontal** (863×360).

1. **f1** — Arranque con 25 tareas precargadas: Foco, lista de Tareas, scroll hasta el final, detalle de la tarea con Markdown largo, de la de 300 caracteres y de la de caracteres raros (`shots-1/`).
2. **f2** — Editar el título y las notas de "Rotar certificado TLS", cerrar arrastrando la hoja, reabrir y comprobar. Segunda ronda: escribir y cerrar con Escape sin esperar (`shots-2/`).
3. **f2b** — Repetí la escritura de notas con un texto controlado para confirmar un problema de letras perdidas (`shots-2b/`).
4. **f3** — Cinco tareas seguidas con Enter en el compositor, con `document.activeElement` y `data-kb` tras cada una. También Enter con el campo vacío y con solo espacios (`shots-3/`).
5. **f4 / f4b** — Borrar varias tareas seguidas deslizando a la izquierda, Deshacer, borrar la tarea "AHORA" y deshacer, y completar deslizando a la derecha (`shots-4/`, `shots-4b/`).
6. **f5** — Menú "···": Exportar, mirar qué se genera; Importar; Ajustes para ver el estado de la cuenta (`shots-5/`).
7. **f6** — Horizontal: lista, detalle, modo edición de notas y compositor (`shots-6-horizontal/`).

## 3. Lo que comprobé

**Lista y detalle**
- [COMPROBADO] La lista muestra "PENDIENTES / 22 · EN ESTE DISPOSITIVO", numeración 01–22, etiquetas "AHORA" y "TIENE DESCRIPCIÓN", y "HECHAS / 3" plegable al final con tachado. La pista "DESLIZA → PARA COMPLETAR · ← PARA BORRAR" sale al pie (`shots-1/02-lista.png`, `shots-1/04-lista-final.png`).
- [COMPROBADO] El scroll de 25 tareas va fluido. La cabecera grande se colapsa a "TAREAS" con el "···" siempre accesible (`shots-1/03-lista-scroll.png`).
- [COMPROBADO] La tarea de 300 caracteres sale entera en la lista (unas 7 líneas, ocupa media pantalla) (`shots-probe/a.png`, `shots-3/02-tras-3.png`).
- [COMPROBADO] Los caracteres raros, el hebreo y `<script>alert(1)</script>` se pintan como texto, sin ejecutar nada (`shots-1/03-lista-scroll.png`, `shots-1/08-detalle-raros.png`).
- [COMPROBADO] En el detalle, el Markdown se renderiza bien: encabezados, `código en línea`, negrita, lista numerada, bloque SQL con resaltado, checklist con casillas (marcada y sin marcar) y enlace en color (`shots-1/05-detalle-md.png`, `shots-1/06-detalle-md-scroll.png`).
- [COMPROBADO] El título del detalle usa una tipografía mono enorme. La tarea de 300 caracteres ocupa 14 líneas y llena casi toda la hoja antes de llegar a las notas (`shots-1/07-detalle-300.png`).
- [COMPROBADO] Fallo visual: con la hoja sin desplazar, el contenido sigue pintándose **por debajo** del pie fijo ("GUARDADO" + botones). Se ve "Probar con pg_stat_statements" asomando bajo "MARCAR COMO HECHA" (`shots-1/05-detalle-md.png`, borde inferior).

**Edición y guardado**
- [COMPROBADO] Al tocar el título, el foco va al textarea "Título de la tarea" y `data-kb` = `true`. Añadí " (URGENTE) 🔥" y se guardó bien, emoji incluido (log de f2, `shots-2/01-titulo-editando.png`).
- [COMPROBADO] "EDITAR" cambia las notas a Markdown en crudo (el botón pasa a "VER") y pone el foco en el textarea "Descripción de la tarea" (log "foco tras EDITAR", `shots-2/02-notas-modo-edicion.png`).
- [COMPROBADO] Hay indicador de guardado: "GUARDANDO…" justo después de escribir y "GUARDADO" a los 1,2 s. localStorage ya tenía los cambios **sin cerrar la hoja** (logs "indicador guardado…" y "localStorage tras editar", `shots-2/03-notas-tecleadas.png`).
- [COMPROBADO] **Se pierden letras al escribir en las notas.** Tecleé `echo "hecho"` y quedó guardado `echo "heco"`; se ve en la captura (`shots-2/03-notas-tecleadas.png`). Lo repetí en f2b con texto controlado. "para ver si se" quedó "ver i se", "dos: kubectl" quedó "dos:kubectl", "linea tres" quedó "lineatres" y "OPQRSTU" quedó "OPQSTU". Mientras tanto la página lanzó tres veces `Maximum update depth exceeded` (log "errores ronda 1" y CONSOLE de f2/f2b). En el compositor de "Nueva tarea", el mismo tipo de texto ("hecho hhhh") llegó intacto (log "tarea creada"), y en el título tampoco perdí nada.
- [COMPROBADO] Arrastrar la hoja hacia abajo desde el asa la cierra (log "hoja sigue abierta tras arrastrar: false"). Al reabrir, título y notas estaban como los dejé, con "GUARDADO" (`shots-2/06-reabierta.png`, `shots-2/07-reabierta-final.png`, log "texto final hoja reabierta").
- [COMPROBADO] Con el textarea enfocado, el primer Escape solo saca el foco (va a un BUTTON) y el segundo cierra la hoja. Escribí una línea y cerré casi al instante (100 ms): la línea "NOTA RÁPIDA cerrada sin esperar" sí estaba en localStorage (logs de la segunda ronda de f2).
- [COMPROBADO] En localStorage solo hay `focus-space:stats`, `tasks:v1`, `prefs` y `timer`, sin claves de cola de sincronización (modo local) (log "claves localStorage").

**Encadenar tareas con Enter**
- [COMPROBADO] Tras cada uno de los 5 Enter, el foco sigue en el input "Nueva tarea", el campo se vacía y `data-kb` sigue en `true`, así que el teclado no se cierra entre tarea y tarea (logs "1…5 tras Enter").
- [COMPROBADO] Mientras escribes se ocultan las pestañas de abajo y el compositor se queda pegado abajo con una flecha naranja (`shots-3/02-tras-3.png`).
- [COMPROBADO] Las 5 tareas nuevas se añaden **al final** de las pendientes (posición y = 1684–1918 px con una pantalla de 915). **Ninguna se ve** mientras las escribo; solo sube el contador ("PENDIENTES / 25", "/ 26"…) (log "posiciones nuevas tareas", `shots-3/02-tras-3.png`, `shots-3/04-tras-5.png`).
- [COMPROBADO] El compositor es de una sola línea: con un texto largo solo ves el final ("…e corta la cobertura una y otra vez sin avisar") (`shots-3/03-compositor-texto-largo.png`).
- [COMPROBADO] Enter con el campo vacío o con solo espacios no crea tareas (logs "Enter con compositor vacío / con espacios → 30").

**Borrar y deshacer**
- [COMPROBADO] Deslizar a la izquierda borra y sale "Tarea borrada · DESHACER" (`shots-4/01-tras-borrar-1.png`). En la animación de entrada el aviso es semitransparente y se lee la fila de detrás encima del texto.
- [COMPROBADO] **Deshacer solo recupera el último borrado.** Borré 3 (Comprar billete, Rotar certificado, 1:1 con Ane) y Deshacer devolvió solo "1:1 con Ane". Después del Deshacer el aviso desaparece y no hay forma de recuperar las otras dos (logs "tras Deshacer" de f4b y "storage tras 1er/2º Deshacer" de f4).
- [COMPROBADO] En f4, con tres deslizamientos rápidos (250 ms entre ellos), uno no borró nada ("Limpiar feature flags" siguió en la lista). Con 600 ms de separación (f4b) se borraron los tres. No sé si fue por la animación de la lista o por el propio emulador.
- [COMPROBADO] Si borro la tarea "AHORA" (con 599 caracteres de notas) y deshago, vuelve con su id, su descripción y el estado "AHORA" intactos (log "tarea activa tras borrar+deshacer").
- [COMPROBADO] El aviso "Tarea borrada" seguía en pantalla 7 s después. Además, al completar otra tarea deslizando a la derecha, el aviso **siguió diciendo "Tarea borrada"** y no apareció nada sobre la tarea completada (log "aviso tras completar", `shots-4b/03-tras-completar.png`). La tarea sí pasó a "HECHAS / 4".

**Exportar / importar / estado**
- [COMPROBADO] "···" abre una hoja "Opciones de la lista" con "Limpiar hechas (3)", "Exportar" e "Importar" (`shots-5/01-menu.png`).
- [COMPROBADO] Exportar descarga directamente `focus-space-tareas.json` (5.935 B, `application/json`) mediante un enlace de descarga. No se usa la hoja de compartir de Android y la app no muestra ningún aviso de que se exportó (logs "eventos al exportar" y "aviso tras exportar: []", `shots-5/02-tras-exportar.png`).
- [COMPROBADO] El JSON trae las 25 tareas (también las hechas), con `text`, `done`, `createdAt` y `description`: las 10 descripciones Markdown completas. **No incluye** cuál está "AHORA" ni los ids (log "resumen export").
- [COMPROBADO] Importar admite `.json,.txt,.md` (log "inputs de fichero"). No llegué a importar ningún fichero.
- [COMPROBADO] Ajustes dice "Modo solo local: tus tareas se guardan en este navegador." y la lista, "EN ESTE DISPOSITIVO" (log "texto ajustes", `shots-5/04-ajustes.png`).

**Horizontal (Pixel 7, 863×360)**
- [COMPROBADO] En la lista solo caben 2 tareas: la cabecera grande "Tareas", el compositor y la barra de pestañas se comen el resto (`shots-6-horizontal/02-lista-horizontal.png`).
- [COMPROBADO] En el detalle, el pie fijo ("GUARDADO" + dos botones de unos 50 px) ocupa casi la mitad de la altura. De las notas solo se ve "Contexto" (`shots-6-horizontal/03-detalle-horizontal.png`).
- [COMPROBADO] En modo edición el textarea mide 160 px pero el pie sigue encima: solo se lee **una línea** ("## Contexto") y la siguiente asoma por debajo de los botones (log "textarea en horizontal", `shots-6-horizontal/04-editar-horizontal.png`).

## 4. Lo que opino

- [OPINIÓN] Lo de las letras perdidas es lo peor que le puede pasar a esta app. Que en una nota con comandos `echo "hecho"` se convierta en `echo "heco"`, o que se coma un espacio en `kubectl`, me rompe el copiar y pegar en la terminal sin avisar. Para mí, mientras no se arregle, editar notas en el móvil no es fiable. Lo grave es que la app dice "GUARDADO" con el texto ya corrompido.
- [OPINIÓN] La lectura del Markdown me gusta mucho: el bloque SQL con resaltado, las checklists y el `código en línea` se leen mejor que en muchas apps de notas. Para consultar en el tren cumple.
- [OPINIÓN] El indicador "GUARDANDO… / GUARDADO" es justo lo que pedía: sé cuándo está guardado sin cerrar nada. Y que cerrar con Escape a los 100 ms no pierda la última línea me da confianza.
- [OPINIÓN] Lo de encadenar con Enter está bien hecho: el teclado no se cierra y el campo se limpia. Pero añadir 5 tareas sin ver ninguna, porque van al final de 22, es desconcertante. Solo me entero por el contador.
- [OPINIÓN] Un Deshacer de un solo nivel no cuadra con un gesto tan rápido como deslizar. Si borro tres seguidas a lo bestia y me equivoqué en la primera, la pierdo. "Que nada se pierda" no se cumple aquí.
- [OPINIÓN] El título del detalle en mono gigante queda bonito con títulos cortos. Con un título largo, como los que escribo yo, la hoja es todo título.
- [OPINIÓN] Exportar a ciegas me irrita: toco "Exportar", la hoja se cierra y no pasa nada visible en la app. En Android, el aviso de Chrome sale abajo y se pierde. Quiero un "Exportadas 25 tareas → focus-space-tareas.json".
- [OPINIÓN] En horizontal, editar notas es inviable: una línea visible y, con el teclado real, probablemente cero.
- [OPINIÓN] "EN ESTE DISPOSITIVO" bajo el título es claro y honesto. Me sirve para saber que no estoy sincronizado.

## 5. Lo que me confundió

- Tras completar una tarea deslizando a la derecha, el aviso seguía diciendo "Tarea borrada · DESHACER" por un borrado anterior. ¿Si pulso Deshacer, deshago el borrado o el completado? No está claro.
- Tras 5 Enter no supe dónde estaban mis tareas hasta bajar al final de la lista.
- En el compositor con un texto largo no veo el principio de lo que he escrito.
- Uno de tres deslizamientos rápidos no borró nada y no hubo ninguna señal. Pensé que lo había borrado.
- En el detalle no hay una forma obvia de exportar o copiar **una** nota como `.md`. Hay "IMPORTAR .MD", pero no su pareja.

## 6. Lo que echo en falta

- [PROPUESTA] Arreglar ya la pérdida de caracteres en el textarea de notas: el valor que se escribe no debe pisarse con el guardado automático.
- [PROPUESTA] Deshacer de varios niveles, o un aviso que agrupe ("3 tareas borradas · DESHACER") y las recupere todas.
- [PROPUESTA] Al añadir con Enter, hacer scroll hasta la nueva tarea, resaltarla un momento o mostrar las recién añadidas encima del compositor. O dar la opción de añadir arriba.
- [PROPUESTA] Un aviso tras Exportar con el nombre del fichero y el número de tareas. En Android, ofrecer la hoja de compartir (Drive, Telegram a mí mismo).
- [PROPUESTA] Exportar/copiar una nota individual como `.md`, y exportar toda la lista también en Markdown, no solo en JSON. Incluir en el JSON qué tarea está "AHORA".
- [PROPUESTA] En modo edición, y siempre en horizontal, ocultar o encoger el pie con "MARCAR COMO HECHA" / "HACER AHORA" para dejar sitio al texto.
- [PROPUESTA] Limitar la altura del título en el detalle (y quizá en la lista) con "ver más", o usar un tamaño menor para títulos largos.
- [PROPUESTA] Compositor multilínea que crezca hasta 3–4 líneas.
- [PROPUESTA] Que el aviso cambie a "Tarea completada · DESHACER" al completar.

## 7. iOS / Android

- [COMPROBADO] En Chromium/Android, Exportar descarga el fichero con `<a download>`, sin pasar por `navigator.share`, aunque Chrome lo tiene (log "eventos al exportar").
- [HIPÓTESIS] En un Android real el JSON irá a Descargas con el aviso de Chrome. Desde la app, sin un mensaje propio, mucha gente no sabrá dónde ha ido a parar.
- [HIPÓTESIS] La pérdida de letras puede ser peor con el teclado real de Android (Gboard con predicción y composición) que con las pulsaciones del emulador. Habría que probarlo en un dispositivo.
- [HIPÓTESIS] En el emulador no hay teclado virtual, así que no pude verificar si tapa lo que escribo. `data-kb=true` se activa al enfocar los campos y la barra de pestañas se oculta, lo cual va en buena dirección. En horizontal, con el pie fijo del detalle, el texto quedará casi seguro tapado.
- El aviso `setPointerCapture: No active pointer` que salió en f2 creo que lo provoca mi gesto sintético de arrastre, no la app. `Maximum update depth exceeded` sí lo atribuyo a la app, porque coincide con la escritura en notas.

## 8. Veredicto

**6/10.** Para **leer** mis notas en el tren la seguiría usando: el Markdown se ve muy bien, la lista aguanta 25 tareas con textos largos y emojis, y el "GUARDADO" me da tranquilidad. Para **editar** notas, hoy no: ver mi `echo "hecho"` guardado como `echo "heco"` mientras la app dice "GUARDADO" es justo lo que no puedo aceptar. Súmale un Deshacer de un solo nivel, las tareas que se añaden donde no las veo, una exportación muda y un horizontal casi inútil para editar. Si arreglan la pérdida de caracteres y el deshacer múltiple, sube a 8.
