# Informe de beta — Carmen (58, administrativa, Zaragoza)

## 1. Quién soy y para qué la usaría

Soy Carmen, trabajo en una gestoría y con el móvil hago lo justo: WhatsApp y el correo del trabajo. Mi hija me dijo que esta aplicación me iría bien para apuntar los recados del día y para obligarme a hacer pausas, porque en la oficina me agobio. Necesito tres cosas: apuntar rápido, tachar lo hecho y que alguien me explique qué es eso del "Pomodoro". Veo regular de cerca y llevo la letra del móvil grande.

## 2. Qué hice

Cada prueba empezó con la aplicación recién abierta, sin nada guardado.

1. **Primera vez + recados** (Galaxy S9+, `paso1.json` y `paso1b.json`): abrí la aplicación, miré la pantalla de inicio, fui a Tareas y apunté 3 recados. Para tachar uno, toqué la tarea. Para borrar otro, toqué la tarea y busqué cómo hacerlo.
2. **Recados en otro móvil, probando a deslizar** (Pixel 7, `paso1c.json`, `paso1d.json` y `paso1e.json`): después de leer la frase "Desliza → para completar · ← para borrar", probé a deslizar. También probé "Deshacer" y toqué el número de la tarea.
3. **Letra más grande** (Galaxy S9+, `paso2.json` y `paso2b.json`): busqué en Ajustes cómo agrandar la letra, elegí A++ y comparé capturas de antes y después.
4. **Pomodoro sin saber qué es** (Pixel 7, `paso3.json`): pulsé Iniciar tal como me encontré la pantalla, luego elegí Pomodoro y fui cambiando de pestaña con el reloj en marcha.
5. **Música tranquila** (Galaxy S9+, `paso4.json` y `paso4b.json`): fui a Sonidos, pulsé el botón de reproducir la radio y probé a poner lluvia.

## 3. Lo que comprobé

- [COMPROBADO] La primera pantalla abre en el modo **HORA** y no en Pomodoro. Arriba pone "02 HORA LOCAL · SESIÓN 01 · PARADO", en el centro hay un reloj enorme con una nube de puntitos detrás y abajo un botón naranja grande que dice INICIAR. No hay ningún mensaje de bienvenida ni explicación. (`shots-1/01-inicio.png`)
- [COMPROBADO] Arriba a la derecha hay tres iconos sin texto: un altavoz, un círculo y unas esquinas. Los botones de reiniciar (flecha en círculo) y de saltar fase (⏭) tampoco llevan texto. (`shots-1/01-inicio.png`, `shots-3/02-iniciar-en-modo-hora.png`; log "botones sin texto visibles": Sonido, Respirar, Modo focus a pantalla completa, Reiniciar, Saltar a la siguiente fase)
- [COMPROBADO] Con la lista de tareas vacía, el texto dice "Escribe abajo tu primera tarea. Tócala para añadir notas en Markdown." y abajo está el campo "+ Nueva tarea". Apuntar tres recados con Intro fue rápido y salen numerados 01, 02 y 03. (`shots-1/02-tareas-vacia.png`, `shots-1/04-tres-recados.png`)
- [COMPROBADO] Mientras escribo, la barra de abajo (Foco, Tareas…) desaparece. Al terminar de apuntar, seguía sin verla hasta que se cerró el teclado. (`shots-1/04-tres-recados.png`, `shots-1/05-tras-escape.png`)
- [COMPROBADO] Si toco el nombre de una tarea, no se tacha: se abre una hoja "Tarea" con el título, un cuadro de notas que habla de "Markdown", "`código`" y ".md", y dos botones grandes, MARCAR COMO HECHA y HACER AHORA. Arriba hay una papelera roja y una X. (`shots-1b/02-toco-la-tarea.png`)
- [COMPROBADO] Al pulsar "Marcar como hecha", la hoja **sigue abierta**: el título sale tachado y el número cambia de "02" a "03". Tuve que cerrarla con la X para ver la lista. Ahí la tarea ya aparece en "HECHAS / 1", tachada y con una ✓ naranja. (`shots-1b/03-tras-marcar-hecha.png`, `shots-1b/04-lista-despues.png`)
- [COMPROBADO] Para borrar, la papelera de la hoja borra al momento, sin preguntar, y sale abajo un aviso "Tarea borrada · DESHACER". Pasados unos 7 segundos el aviso seguía en pantalla. (`shots-1b/07-pasados-7s.png`)
- [COMPROBADO] El número de la izquierda (01, 02…) es en realidad un botón: al tocarlo, la tarea se marca como hecha sin abrir nada (log "tras tocar numero": "PENDIENTES / 0 … Todo hecho. Buen trabajo."). Nada en la pantalla indica que ese número se pueda tocar. (`shots-1e/01-toco-numero.png`)
- [COMPROBADO] Deslizar a la derecha completa la tarea y deslizar a la izquierda la borra con aviso de Deshacer. (`shots-1c/02-deslizo-derecha.png`, `shots-1c/03-deslizo-izquierda.png`)
- [COMPROBADO] Si borro deslizando justo después de escribir (con el cursor todavía en "Nueva tarea"), el **primer toque en DESHACER no recupera la tarea**: solo hace que vuelva a salir la barra de abajo y que el aviso suba de sitio. Hizo falta un segundo toque. Con el teclado ya cerrado, Deshacer funcionó al primer toque. (log de `paso1d.json`: "primer toque en deshacer (teclado abierto)" con PENDIENTES / 1 y "segundo toque en deshacer" con PENDIENTES / 2; `shots-1c/04-tras-deshacer.png`)
- [COMPROBADO] "Tamaño del texto" está en Ajustes, sección PANTALLA, debajo de Pomodoro, Avisos, Notificaciones e Idioma. Hay que bajar bastante para llegar. Las opciones son "A", "A+" y "A++". (`shots-2/03-ajustes-tamano.png`)
- [COMPROBADO] Con A++ todo crece: el título de la tarea "Llevar papeles al banco" pasa de ocupar unos 640 px a unos 800 px de ancho en la captura (sobre un 25 % más), y las pestañas de abajo también crecen. Aun así, la frase de ayuda "DESLIZA → PARA COMPLETAR…" sigue gris clarito sobre negro y en mayúsculas finas. (antes: `shots-2/01-tareas-ANTES.png`; después: `shots-2/05-tareas-DESPUES.png`)
- [COMPROBADO] Con A++ en el modo Pomodoro, la palabra **INICIAR no cabe en el botón**: la "R" queda cortada por el borde derecho. (`shots-2/08-foco-pomodoro-DESPUES.png`)
- [COMPROBADO] Si pulso INICIAR estando en modo HORA, la aplicación cambia sola a POMODORO y empieza una cuenta atrás de 25 minutos ("24:59", "EN CURSO"). En ningún sitio dice qué es un Pomodoro: busqué en todo el texto de la página frases como "25 minutos", "trabaja" o "descansa" y no hay ninguna (log "hay explicacion del pomodoro": false). (`shots-3/02-iniciar-en-modo-hora.png`)
- [COMPROBADO] Con el Pomodoro en marcha, en Tareas, Sonidos y Ajustes aparece encima de la barra una franja con "FOCUS 24:52" y un botón de pausa. El título de la pestaña del navegador también muestra la cuenta atrás ("24:50 · Focus — Focus/Space"). Al volver a Foco el reloj había seguido corriendo. (`shots-3/05-pestana-tareas-con-mini.png`, `shots-3/06-pestana-sonidos-con-mini.png`, log "titulo pestaña navegador")
- [COMPROBADO] La etiqueta de la fase está en inglés: arriba pone "02 FOCUS" y en la franja pequeña "FOCUS". En Ajustes aparece "Focus (min)" y "Modo focus". (`shots-3/02-iniciar-en-modo-hora.png`, log "texto ajustes completo")
- [COMPROBADO] En Sonidos, la radio se llama "RADIO LOFI — EN DIRECTO", "beats to relax / study to", "CHILLHOP · 1/11", "VOL 60". Pulsé el botón negro con el triángulo y a los 3 segundos seguía poniendo "EN PAUSA", sin ningún aviso de que estuviera cargando. (El briefing avisa de que en este entorno el vídeo puede no cargar, así que no sé si en un móvil de verdad sonaría.) (`shots-4/02-tras-play-radio.png`)
- [COMPROBADO] Para poner lluvia, tocar la palabra "Lluvia" no hace nada y tocar el "00" tampoco (log "sliders tras tocar Lluvia" y "sliders tras tocar 00": Volumen Lluvia=0). El botón "SUAVE >" no enciende la lluvia: solo cambia a "VENTANA" (log "tras tocar SUAVE"). Lo único que funciona es arrastrar la barrita de debajo. Mi gesto desde la mitad hacia la derecha la llevó directamente a **100**, el máximo. (`shots-4/06-arrastro-lluvia.png`, log "sliders tras arrastrar": Volumen Lluvia=100)
- [COMPROBADO] En "Más sonidos" aparecen "Drone", "ASMR", "Ruido BLANCO", "Papel BOLÍGRAFO"… (log "mas sonidos")

## 4. Lo que opino

- [OPINIÓN] La pantalla de inicio no me dice qué hacer. Veo una hora enorme y un botón INICIAR. ¿Iniciar qué? Si mi hija no me hubiera dicho que era para hacer pausas, habría cerrado la aplicación. Falta una frase del tipo "Trabaja 25 minutos y descansa 5. Pulsa Empezar".
- [OPINIÓN] Apuntar recados me ha gustado: escribo, le doy a Intro y aparece. Es más rápido que la libreta. Es lo mejor de la aplicación.
- [OPINIÓN] Tachar me ha costado. Lo normal para mí es tocar el recado y que se tache, o que haya un cuadradito para marcar. Aquí, al tocar, se abre una hoja que me habla de "Markdown" y "código", que no sé lo que son. El cuadradito existe, pero tiene forma de número ("01"), y un número no parece algo que se pueda pulsar.
- [OPINIÓN] La frase "DESLIZA → PARA COMPLETAR · ← PARA BORRAR" está bien pensada, pero en gris clarito, en mayúsculas pequeñas y debajo de la lista se me pasa por completo. La vi al repasar las capturas, no mientras usaba la aplicación.
- [OPINIÓN] Que el botón "Marcar como hecha" deje la hoja abierta me hace dudar de si lo he hecho bien. Esperaba volver a mi lista y ver el recado tachado.
- [OPINIÓN] Borrar con la papelera sin que pregunte me da miedo, aunque luego salga "Deshacer". Y si Deshacer no funciona al primer toque, como me pasó con el teclado abierto, pienso que lo he perdido.
- [OPINIÓN] A++ sí ayuda: la lista se lee mejor. Pero me esperaba más. Los textos grises pequeños siguen costando, y que "INICIAR" se corte al poner la letra grande parece un fallo. Además está escondido al fondo de Ajustes, entre cosas que no entiendo ("Grotesk", "Syne", "Unbounded").
- [OPINIÓN] Me irritan las palabras en inglés: FOCUS, lofi, beats to relax / study to, Chillhop, VOL, Drone, ASMR, Markdown, ".md". Si la aplicación está en español, que "FOCUS" sea "Concentración" o "Trabajo" y "lofi" sea "música tranquila".
- [OPINIÓN] Los iconos sin texto de arriba (altavoz, círculo, esquinas) no los habría tocado nunca por miedo a estropear algo. El círculo resulta ser "Respirar", que es justo lo que me vendría bien para el agobio, y no lo habría encontrado.
- [OPINIÓN] La franja "FOCUS 24:52" cuando cambio de pestaña sí me gusta: así sé que el reloj sigue corriendo.
- [OPINIÓN] Para poner lluvia tuve que adivinar que hay que arrastrar una barrita fina. Y al arrastrarla se puso al máximo de golpe. Con unos cascos me habría llevado un susto.

## 5. Lo que me confundió

- Qué es la pantalla inicial y qué significan "02", "SESIÓN 01" y "PARADO".
- Por qué al pulsar INICIAR en "HORA" de repente salen 25 minutos y pone "FOCUS".
- Al tocar un recado para tacharlo me salió una hoja de notas.
- Después de "Marcar como hecha", el número del recado pasó de 02 a 03 y la hoja no se cerró.
- No sabía que el "01" se podía tocar.
- La primera vez que pulsé "Deshacer", no se deshizo nada.
- El botón "SUAVE >" de la lluvia parece el interruptor para encenderla, pero solo cambia el tipo de lluvia.
- Le di al triángulo de la radio y seguía poniendo "EN PAUSA". ¿Funciona o no?

## 6. Lo que echo en falta

- [PROPUESTA] Una pantalla de bienvenida de una sola vez: "Apunta tus recados en Tareas. En Foco, pulsa Empezar: 25 minutos de trabajo y 5 de descanso".
- [PROPUESTA] Que la aplicación abra por defecto en Pomodoro, con una línea debajo del reloj que diga qué va a pasar ("Trabaja 25 min · luego 5 min de descanso").
- [PROPUESTA] Una casilla de verdad (□ / ✓) a la izquierda de cada recado, en lugar del número.
- [PROPUESTA] Que "Marcar como hecha" cierre la hoja y me devuelva a la lista.
- [PROPUESTA] Que el botón de borrar lleve la palabra "Borrar" al lado de la papelera y que pregunte "¿Borrar este recado?".
- [PROPUESTA] Texto debajo de los iconos de arriba ("Silenciar", "Respirar", "Pantalla completa"), igual que en las pestañas de abajo.
- [PROPUESTA] Traducir FOCUS, lofi, VOL, Drone, ASMR… y quitar "Markdown" y ".md" de los textos de ayuda.
- [PROPUESTA] Un tamaño de letra todavía mayor, que el botón INICIAR no se corte y, a ser posible, que la aplicación respete el tamaño de letra que ya tengo puesto en el móvil.
- [PROPUESTA] Un botón grande "Música tranquila" que encienda algo suave con un toque, y que los ambientes empiecen a volumen medio y no al máximo.
- [PROPUESTA] Que la radio diga "Cargando…" o "No se pudo conectar" si no suena.

## 7. iOS / Android

Probé solo en Android emulado (Galaxy S9+ y Pixel 7, Chrome).

- [COMPROBADO] En los dos vi lo mismo: el número que tacha, la hoja que no se cierra y el doble toque en Deshacer (este en el Pixel 7).
- [HIPÓTESIS] Mi móvil tiene la letra del sistema subida. No he podido comprobar si la aplicación la respeta o si solo cuenta su propio A / A+ / A++. Si no la respeta, en mi Android real lo vería todo pequeño hasta encontrar ese ajuste.
- [HIPÓTESIS] En un Android de verdad, el teclado tapa media pantalla, así que el lío del Deshacer con el teclado abierto puede pasar más a menudo de lo que he visto aquí.
- [HIPÓTESIS] En Android, el botón "atrás" del sistema es lo que yo usaría para cerrar la hoja de una tarea. No lo he probado.

## 8. Veredicto

**5 / 10.** Para apuntar recados es rápida y la seguiría usando para eso. Pero tachar y borrar no funcionan como yo esperaba, el Pomodoro no se explica en ningún sitio, hay demasiadas palabras en inglés e iconos sin nombre, y la letra grande se queda corta y corta el botón principal. Sin mi hija al lado, la mitad de las cosas no las habría encontrado. Si arreglan la casilla de tachar, la explicación del Pomodoro y el idioma, subiría a un 7.
