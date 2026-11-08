# Informe beta — Diego (21, 3º Ing. Informática, Valencia)

## 1. Quién soy y para qué la usaría

Estoy en exámenes y me paso el día en la biblioteca con el iPhone 13 en la mesa. Uso Forest para no tocar el móvil,
Spotify para el lofi y TikTok para "descansar" (mal). Quiero una sola app que me arranque bloques de 50/10 en dos
toques, con lofi y lluvia de fondo, y que con un vistazo me diga cuánto queda y cuántas horas llevo hoy.

## 2. Qué hice

Todo con el motor WebKit (Safari). Cada fila es una ejecución separada que arranca la app desde cero.

| # | Flujo | Dispositivo | Fichero |
|---|-------|-------------|---------|
| 1 | Abrir, deslizar por la pantalla de Foco, Ajustes → 50/10, bajar hasta las estadísticas, volver a Foco, Pomodoro, Iniciar | iPhone 14 | `beta/diego/f1.json` |
| 2 | Sonidos: play al lofi, bajar su volumen con el dedo, subir la lluvia a ~70 %, cambiar la variante de lluvia, guardar la mezcla "biblio", poner la lluvia a 0 y recuperar "biblio" | iPhone 14 | `f2.json` (+ `f2b.json`, para repetir lo del botón Guardar) |
| 3 | Pomodoro corriendo → Tareas, Sonidos, Ajustes con el mini-temporizador, deslizar el mini hacia arriba, tocarlo, saltar a descanso; luego la invitación a respirar y las estadísticas | iPhone 14 | `f3.json`, `f3b.json` |
| 4 | Apuntar 4 temas, intentar reordenar arrastrando, abrir uno → "Hacer ahora", deslizar para cerrar la hoja, completar otro deslizando, ver Foco y la hoja "¿En qué vas a trabajar?" | iPhone 14 | `f4.json` |
| 5 | Iniciar directamente desde la pantalla inicial, modo inmersivo, deslizar hacia abajo, tocar la pantalla, Salir | iPhone SE | `f5.json` |
| 6 | 50/10 → recargar la página (como si cerrara Safari), bajar Focus a 1 min, arrancar, irme a Tareas, esperar a que termine y mirar las estadísticas | iPhone 14 | `f6.json` |
| 7 | En horizontal: Foco corriendo, Sonidos con el mini, volver, inmersivo, escribir una tarea | iPhone SE horizontal (con y sin notch simulado), iPhone 14 horizontal | `f7.json`, `f8.json`, `f9.json` |

## 3. Lo que comprobé

**Arranque y ritmo**

- [COMPROBADO] La primera vez que se abre, Foco sale en modo **HORA** (un reloj con la hora local), no en Pomodoro. — `beta/diego/shots-1/01-inicio.png`
- [COMPROBADO] Si pulso INICIAR estando en HORA, salta solo a Pomodoro y arranca (25:00 la primera vez). Arrancar es **1 toque**. — `shots-5/02-se-iniciar-en-modo-hora.png`, log `tras-iniciar-en-hora`
- [COMPROBADO] Ajustes → "50 / 10" deja Focus=50, Descanso=10, Largo=20, Largo cada=4 — log `valores-pomodoro`. De vuelta en Foco sigue en HORA. Toco Pomodoro y sale 50:00. Iniciar → 49:57 "EN CURSO". En total: Ajustes, 50/10, Foco, (Pomodoro), Iniciar = 4–5 toques la primera vez. — `shots-1/05-foco-pomodoro.png`, `shots-1/06-corriendo.png`
- [COMPROBADO] Tras recargar, el ritmo 50/10 se mantiene (Descanso sigue en 10), pero el modo vuelve a HORA. — log `foco-tras-recargar` y `ajustes-1min` en f6
- [COMPROBADO] Deslizar a la izquierda en Foco no hace nada: no cambia de pestaña. — `shots-1/01b-tras-deslizar-izq-en-foco.png`

**Mini-temporizador y descanso**

- [COMPROBADO] Con el Pomodoro corriendo, en Tareas, Sonidos y Ajustes aparece encima de la barra una franja "FOCUS 24:58" con un botón de pausa, y la pestaña Foco lleva un puntito naranja. — `shots-3/01-tareas-con-mini.png`
- [COMPROBADO] Tocar el mini me lleva a Foco con el tiempo correcto. Deslizarlo hacia arriba no hace nada. — logs `pantalla-tras-deslizar-mini` y `pantalla-tras-tocar-mini`
- [COMPROBADO] "Saltar fase" pasa a DESCANSO 04:59 y el descanso arranca solo. La tarjeta de tarea se cambia por "¿Respiramos un rato?" con una X ("Ahora no"). — `shots-3/06-descanso.png`
- [COMPROBADO] La invitación abre "Respirar": temporizador pequeño 04:53, esfera de partículas, "Suelta / despacio, por la boca", contador de respiraciones y "¿POR QUÉ ASÍ?". Con Escape vuelvo al descanso, que sigue corriendo. — `shots-3/09-respirar-4s-despues.png`, log `tras-respirar`
- [COMPROBADO] Si termino un Focus de 1 min estando en Tareas, el mini pasa a "DESCANSO 09:58" y sigue contando. No veo ningún aviso visual más. — `shots-6/02-tras-terminar-focus-desde-tareas.png`
- [COMPROBADO] Las estadísticas se actualizan: "HOY 1 min, **1 sesiones**, 7 DÍAS 1 min, RACHA 1 día". Un Focus saltado a los 4 s no cuenta (0 min). — log `estadisticas` (f6), log de f3b
- [COMPROBADO] Las estadísticas solo están al final de Ajustes y hay que bajar toda la página para verlas. — `shots-1/03-ajustes-abajo-estadisticas.png`

**Sonidos y mezclas**

- [COMPROBADO] En este entorno, el lofi sigue "EN PAUSA" después de darle a play (el brief ya avisa de que el vídeo puede no cargar). — log `tras-play`
- [COMPROBADO] Los deslizadores responden al dedo: el lofi baja de 60 a 29 y la lluvia sube a 70. El valor salta al punto que tocas. La variante de lluvia cambia de "Suave" a "Ventana". La pestaña Sonidos se marca con un puntito. — `shots-2/03-lluvia-subida-variante.png`
- [COMPROBADO] "Guardar mezcla actual" abre una hoja con el campo de nombre, pero **el campo no recibe el foco** solo (el foco está en un DIV), así que hay que tocarlo antes de escribir. — log `foco-teclado`, `shots-2/04-guardar-mezcla.png`
- [COMPROBADO] Con "biblio" escrito, **el primer toque en GUARDAR no guardó**: el clic acabó en el cuerpo de la hoja (`m-sheet-body`). El segundo toque sí guardó. Al poner el foco en el campo, el botón bajó de y=566 a y=600. — logs `eventos-primer-toque`, `rect-boton-antes` y `rect-boton-con-input` en `f2b.json`, `shots-2/05-mezcla-guardada.png`
- [COMPROBADO] Guardar con la tecla Enter (el "OK" del teclado) funciona a la primera. **Pero después la barra de pestañas desaparece**: `data-kb=true` se queda puesto aunque el foco está en BODY y no hay teclado. Tocar la pantalla no lo arregla; solo vuelve abriendo y cerrando otra hoja. Mientras tanto no puedo cambiar de pestaña (el toque en "Foco" falló). — log `estado-barra-tras-enter`, `tras-tocar-fondo`, `tras-abrir-y-cerrar-hoja`; `shots-2/06-biblio-recuperada.png` (sin barra)
- [COMPROBADO] Tocar "biblio" recupera la mezcla: la lluvia pasa de 0 a 70 % (Ventana). El volumen del lofi no cambia (29). — log `tras-recuperar-biblio`

**Tareas**

- [COMPROBADO] El compositor mantiene el teclado abierto al pulsar Enter, así que apunté los 4 temas seguidos. Mientras escribo, la barra de abajo se oculta. — `shots-4/02-cuatro-temas-teclado.png`
- [COMPROBADO] No hay asas para arrastrar. Deslizar "BBDD" hacia arriba no cambió el orden. — logs `asas-arrastre` (vacío) y `orden-tras-arrastrar`
- [COMPROBADO] En el detalle, "Hacer ahora" marca la tarea como "AHORA" y el botón pasa a "Quitar de «Ahora»", pero me quedo en la hoja. Deslizar hacia abajo desde el centro de la hoja no la cerró; tuve que usar la X. — `shots-4/06-tras-hacer-ahora.png`, log `hoja-abierta-tras-deslizar-abajo`
- [COMPROBADO] En Foco aparece "TRABAJANDO EN · BBDD normalización 3FN", y la hoja "¿En qué vas a trabajar?" la marca con un check. — `shots-4/09-foco-con-tarea.png`, `shots-4/10-hoja-elegir-tarea.png`
- [COMPROBADO] Deslizar → completa la tarea, que pasa a "HECHAS / 1" tachada, y el contador de la pestaña baja a 3. — `shots-4/08-tras-completar-redes.png`
- [COMPROBADO] La numeración de las cabeceras es "01 Tareas / 02 Foco / 03 Sonidos / 04 Ajustes", pero en la barra el orden es Foco, Tareas, Sonidos, Ajustes. — `shots-3/01-tareas-con-mini.png` frente a `shots-1/06-corriendo.png`

**Inmersivo y horizontal**

- [COMPROBADO] El inmersivo (iPhone SE vertical) muestra solo el reloj grande, la esfera y "× SALIR". No hay pausa, fase ni tarea. Deslizar hacia abajo o tocar la pantalla no hace nada. SALIR me devuelve a Foco y el tiempo sigue corriendo. — `shots-5/03-inmersivo.png`, `shots-5/07-tras-salir.png`
- [COMPROBADO] En horizontal, el botón principal sale **cortado ("PAUSA" y medio icono)** tanto en el iPhone 14 como en el SE. En el SE sin notch simulado, también se corta el icono de pantalla completa y "HORA" se sale del ancho (489..573 px con 568 px de pantalla). — `shots-9/01-i14-horizontal-corriendo.png`, `shots-8/01-se-horizontal-sin-notch-corriendo.png`, log `texto-fuera-de-pantalla`
- [COMPROBADO] En el SE horizontal con los márgenes de notch que mete el entorno, el reloj sale cortado ("4:59" en lugar de "24:59") y "EN CURSO" pierde la E, también en inmersivo. Ojo: el SE real no tiene notch, así que puede ser cosa de la simulación. — `shots-7/02-se-horizontal-corriendo.png`, `shots-7/05-se-horizontal-inmersivo.png`
- [COMPROBADO] En el inmersivo horizontal del iPhone 14, el reloj queda a la izquierda y no centrado sobre la esfera ni sobre SALIR. — `shots-9/02-i14-horizontal-inmersivo.png`

## 4. Lo que opino

- [OPINIÓN] Lo mejor: **Iniciar desde la pantalla inicial arranca el Pomodoro en un toque**. Eso es exactamente lo que quiero, mejor que Forest, que te hace elegir árbol y tiempo cada vez. Lo malo es que la app abra en HORA: la primera vez pensé que el botón iba a cronometrar la hora o algo raro. Si la uso para Pomodoro, que se acuerde de que la uso para Pomodoro.
- [OPINIÓN] El mini-temporizador está muy bien hecho: se ve, se toca y vuelves, y tiene pausa. Es lo que hace Spotify con el mini-player y aquí se siente igual de natural. Para mí es lo más "app" de todo.
- [OPINIÓN] Los deslizadores de volumen con el dedo van bien y el puntito en la pestaña Sonidos mola. Pero guardar la mezcla me dio tres sustos: tuve que tocar el campo aunque la hoja ya estaba abierta, el primer toque en Guardar no hizo nada, y cuando guardé con Enter **desapareció la barra de abajo**. Ese último es un bug serio: me quedo atrapado en Sonidos sin saber por qué. Si me pasa en la biblioteca, cierro la app.
- [OPINIÓN] El descanso me gusta: arranca solo y la invitación a respirar es discreta y se descarta con una X. El ejercicio de respirar es bonito, pero tiene mucho texto ("Una mano sobre él: que suba al inspirar…"). En 10 minutos de descanso lo que quiero es la esfera y "Inspira/Suelta", no leer.
- [OPINIÓN] Las estadísticas existen y funcionan (racha 1 día, ¡bien!), pero escondidas al fondo de Ajustes, debajo de la tipografía y los colores. Forest te enseña el bosque del día nada más abrir. Aquí "cuánto llevo hoy" me cuesta pestaña + scroll largo. Y "1 sesiones" queda feo.
- [OPINIÓN] Lo de los gestos: el brief y la pista de Tareas dicen "desliza → para completar", y eso funciona genial. Pero yo deslizo por todo: entre pestañas, el mini hacia arriba, la hoja hacia abajo, el inmersivo hacia abajo. Nada de eso responde. Con TikTok/Instagram uno espera que todo se deslice.
- [OPINIÓN] El inmersivo es precioso en vertical, pero no me deja pausar. Si viene alguien a hablarme en la biblio, tengo que darle a Salir y luego a Pausar. Y en horizontal el reloj se ve descentrado.
- [OPINIÓN] El texto mezcla "Focus" y "Foco" ("FOCUS", "Focus (min)", "Modo focus" junto a la pestaña "Foco"). No me molesta mucho, pero se nota a medio traducir.
- [OPINIÓN] Las animaciones de la esfera dan mucho rollo. No puedo juzgar la fluidez real a 60 fps desde capturas.

## 5. Lo que me confundió

- Al abrir por primera vez: ¿por qué sale la hora? ¿Es un reloj o un Pomodoro?
- Los números de las cabeceras (Tareas es "01" pero es la segunda pestaña; Foco es "02" pero es la primera). Pensé que eran pasos de algo.
- Después de guardar "biblio" con el teclado: ¿dónde está la barra de pestañas? No había forma obvia de salir de Sonidos.
- El primer toque en GUARDAR: no pasó nada y no sabía si se había guardado.
- "Hacer ahora": esperaba que me llevara a Foco o que la tarea subiera arriba de la lista. Se queda en su sitio, con una etiqueta pequeña "AHORA".
- Al terminar un bloque estando en otra pestaña, solo cambia el texto del mini (FOCUS → DESCANSO). Si no oyes el aviso (biblioteca, sin sonido), no te enteras.

## 6. Lo que echo en falta

- [PROPUESTA] Recordar el último modo (Pomodoro) al abrir la app, o abrir en Pomodoro por defecto.
- [PROPUESTA] Poner los ritmos 25/5 · 50/10 · 90/20 en la propia pantalla de Foco (por ejemplo, un toque largo en Pomodoro) y no solo en Ajustes.
- [PROPUESTA] Ver "Hoy: X min · racha N" pequeño en Foco, o tocar el reloj para verlo. Que la racha se vea sin entrar en Ajustes.
- [PROPUESTA] Gestos: deslizar entre pestañas, deslizar hacia abajo para cerrar hojas desde cualquier punto, y tocar el inmersivo para pausar o reanudar.
- [PROPUESTA] Reordenar tareas arrastrando (mantener pulsado y mover), como en Recordatorios.
- [PROPUESTA] Que el campo de nombre de la mezcla tenga el foco al abrir la hoja.
- [PROPUESTA] Que "Hacer ahora" suba la tarea arriba de la lista o ofrezca "Empezar ya" (que active la tarea y arranque el Pomodoro).
- [PROPUESTA] Un aviso visual al cambiar de fase (vibración o banner) cuando estás en otra pestaña.
- [PROPUESTA] Algo tipo Forest: una recompensa o un "no salgas de la app" opcional. Me falta un motivo para no abrir TikTok.
- [PROPUESTA] Que la mezcla guardada recuerde también el volumen del lofi. Ahora "biblio" solo restauró la lluvia.

## 7. iOS / Android

- [HIPÓTESIS] La barra de pestañas que desaparece tras guardar con Enter parece venir de que la hoja se cierra con el campo todavía enfocado. Al desmontarse el input, WebKit no lanza `focusout`, así que la app sigue creyendo que el teclado está abierto. En un iPhone real me espero lo mismo, y puede pasar en cualquier hoja con un campo que se cierre al enviar.
- [HIPÓTESIS] Lo del primer toque fallido en GUARDAR podría ser el típico salto de iOS: al tocar fuera del campo se cierra el teclado, la hoja se recoloca y el toque cae donde estaba el botón antes. En la emulación el botón se movió 34 px entre que enfoqué el campo y que lo pulsé.
- [HIPÓTESIS] Mi iPhone 13 en horizontal (sobre un soporte en la biblio) tendría el botón PAUSAR cortado como en las capturas del iPhone 14.
- [COMPROBADO] "Notificación del navegador: No disponible en este navegador" en Ajustes con WebKit. En Safari no tendré avisos si no instalo la PWA. — log `ajustes-texto` (f1)
- Las notificaciones y la Live Activity en pantalla de bloqueo no las pude probar. Lo que de verdad quiero ver con el móvil bloqueado en la mesa es justo eso.

## 8. Veredicto

**6/10.** La base me convence: arrancar en un toque, el mini-temporizador, la mezcla lofi + lluvia y unas estadísticas que funcionan. Visualmente es la app de foco más chula que he probado. Pero el bug de la barra que desaparece al guardar la mezcla, el botón cortado en horizontal y tener que bucear en Ajustes para ver mi racha me sacan del "se siente app". Arreglando eso, poniendo 50/10 y las stats a mano en Foco y haciendo que los gestos respondan, pasaría a un 8 y desinstalaría Forest.
