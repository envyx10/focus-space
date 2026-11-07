# Informe de beta — Lucía (Product Designer senior, fintech, Madrid)

## 1. Quién soy y para qué la usaría

Soy Lucía, 34 años. Diseño apps nativas en una fintech y trabajo con las HIG y Material 3 a diario. En el trabajo uso Focus/Space en desktop y me gusta su estética suiza. Lo que quiero saber es si la versión móvil tiene el mismo nivel de diseño o si es "una web comprimida". La usaría para hacer pomodoros con una tarea activa en el iPhone 15 Pro cuando no estoy delante del portátil.

## 2. Qué hice

Todo con WebKit (Safari iOS), con las safe areas simuladas del runner (47 px arriba y 34 px abajo).

1. **paso1** · iPhone 14 Pro Max: primera apertura y las 4 pestañas en estado vacío. Medí todos los objetivos táctiles con `getBoundingClientRect`.
2. **paso2** · iPhone 14: hoja "Elige una tarea" vacía; 4 tareas creadas (una larga); una completada deslizando →, otra borrada deslizando ← y recuperada con Deshacer; menú "···".
3. **paso3/paso4** · iPhone 14: detalle de tarea; notas en Markdown (H2, lista, negrita, casilla, `código`, cita, enlace); cerrar y reabrir; "Hacer ahora".
4. **paso5** · iPhone 14 Pro Max: borrar desde la papelera del detalle; Foco con la tarea en "Ahora"; hoja de elegir tarea con contenido; Pomodoro iniciado; silenciar; cambiar a Libre en plena sesión (sale una confirmación).
5. **paso6** · iPhone 14 Pro Max: mini‑temporizador en Tareas y Sonidos; Respirar durante unos 10 s; modo inmersivo.
6. **paso7** · iPhone 14 Pro Max: Ajustes → acento azul (#38bdf8), tipo "Syne" y tamaño A++; después Foco (parado y en marcha), Tareas y Sonidos.
7. **paso8** · iPhone 14: variante de Lluvia, "Más sonidos / 9", modo Libre, "¿Por qué así?" en Respirar y salir de Respirar.

## 3. Lo que comprobé

**Primera apertura y estructura**
- [COMPROBADO] La app se abre en el modo **Hora**, no en Pomodoro. Aun así enseña "SESIÓN 01 · PARADO" y un CTA "INICIAR" (`beta/lucia/shots-1/01-foco-vacio.png`).
- [COMPROBADO] Los eyebrows numerados no siguen el orden de la barra inferior. Foco es la primera pestaña y lleva **02**; Tareas lleva **01**, Sonidos **03** y Ajustes **04** (`shots-1/01…04`). La hoja "¿En qué vas a trabajar?" también lleva "01" (`shots-2/01-hoja-elegir-tarea-vacia.png`).
- [COMPROBADO] Safe areas correctas en vertical. La cabecera empieza en y≈57 (por debajo de los 47 px simulados) y la barra de pestañas termina en 706 de 740, dejando el home indicator libre (log "objetivos foco", paso1).

**Estados vacíos**
- [COMPROBADO] Tareas vacío: cuadrado de acento, "Nada pendiente" y "Escribe abajo tu primera tarea. Tócala para añadir notas en Markdown." (`shots-1/02-tareas-vacio.png`).
- [COMPROBADO] La hoja "Elige una tarea" sin tareas dice "No tienes tareas pendientes." y ofrece el CTA "IR A TAREAS" (`shots-2/01-hoja-elegir-tarea-vacia.png`).
- [COMPROBADO] Cuenta en Ajustes: solo el texto "Modo solo local: tus tareas se guardan en este navegador.", sin ninguna acción (`shots-1/04-ajustes-vacio.png`).

**Idioma y microcopy**
- [COMPROBADO] Inglés mezclado con la interfaz en español: "Focus (min)" en Ajustes (`shots-1/04`); "02 FOCUS" en la cabecera del Pomodoro (`shots-5/05-pomodoro-corriendo.png`); "FOCUS" en el mini‑temporizador (`shots-6/01-mini-temporizador.png`); "Modo focus →" en Ajustes y el aria-label "Modo focus a pantalla completa". La pestaña, en cambio, se llama "FOCO".
- [COMPROBADO] Los botones secundarios de Foco mezclan un icono, el texto "+5 min" en minúsculas y otro icono, todo junto a "PAUSAR" en versalitas (`shots-5/05`).

**Objetivos táctiles (logs de paso1, paso2, paso6 y paso7, en px CSS)**
- [COMPROBADO] Cumplen los 44 pt: pestañas 108×56, iconos de cabecera 44×44, filas de tarea 48×60 (casilla) y 286–326×60 (abrir), CTA 398×56, filas de menú 358×56, añadir tarea 56×55. Los interruptores miden 52×30, pero toda la fila (398×52) es tocable.
- [COMPROBADO] No llegan a 44: steppers − / + de Ajustes **44×42**; ritmo 25/5–90/20 **132×40**; tono **99×40**; ES/EN **41×40**; A/A+/A++ **50×40**; muestras de color **40×40** y "Elegir otro color" **38×38** (2 px menos que sus hermanas); chips de variante de ambiente **36 px** de alto; "SILENCIAR" **105×36**; "¿POR QUÉ ASÍ?" **117×32**.
- [COMPROBADO] En iPhone 14 (390 px) el selector "Elegir otro color" baja solo a una segunda fila (y=1372 frente a y=1321 de las muestras; log "objetivos lista", paso2).

**Alineaciones y retícula** (el margen general es de 16 px)
- [COMPROBADO] "SILENCIAR" en Sonidos acaba a 8 px del borde derecho (x 317 + 105 = 422 de 430) y no respeta el margen de 16 px del resto (`shots-1/03-sonidos-vacio.png`, log "objetivos foco").
- [COMPROBADO] El toast "Tarea borrada · DESHACER" tiene unos 12 px de margen lateral, no 16 (`shots-2/06-tras-swipe-borrar.png`).
- [COMPROBADO] El contenido de Respirar va a unos 20 px del borde y la hoja "Por qué respirar así" a unos 22 px, mientras la cabecera va a 16 (`shots-6/03-respirar-1.png`, `shots-8/05-respirar-por-que.png`).
- [COMPROBADO] En Respirar, el contador "0" está centrado sobre "respiraciones", que va alineado a la izquierda (`shots-6/03`).

**Hojas inferiores: al menos cinco cabeceras distintas**
- [COMPROBADO] "01" + título grande + X (elegir tarea, `shots-5/03-hoja-elegir-con-tareas.png`); título sin eyebrow (Opciones de la lista, `shots-2/08-menu-opciones.png`); título pequeño "Tarea" con papelera + X (detalle, `shots-3/01-detalle-abierto.png`); eyebrow "CONFIRMAR" + título (cambio de modo, `shots-5/08-libre.png`); y una hoja **sin asa** con título en monoespaciada y una X más fina y gris ("Por qué respirar así", `shots-8/05`).
- [COMPROBADO] Variante y "Más sonidos" no son hojas: la variante rota en el sitio (Suave → Ventana, log "variante lluvia") y "Más sonidos / 9" se despliega dentro de la lista (`shots-8/03-mas-sonidos-abierto.png`).

**Tareas**
- [COMPROBADO] Crear con Enter funciona y el campo se queda enfocado para la siguiente. Con el campo enfocado se oculta la barra de pestañas (`shots-2/02-composer-foco.png`, `shots-2/03-lista-con-teclado.png`).
- [COMPROBADO] Deslizar → completa sin toast: la tarea pasa a "HECHAS / 1", tachada y con un check de acento. Deslizar ← borra y muestra "Tarea borrada · DESHACER". Deshacer la devuelve a su posición (`shots-2/05`, `06`, `07`).
- [COMPROBADO] La casilla para completar es el **número** "01": su aria-label es "Completar …", pero visualmente no parece tocable (log "objetivos lista").
- [COMPROBADO] En el detalle, la papelera (rojo de acento) y la X miden 44×44 y están **pegadas**, sin separación (x 296–340 y 340–384). Tocar la papelera borra al momento, sin confirmación; solo queda el Deshacer (`shots-5/01-tras-papelera-detalle.png`).
- [COMPROBADO] Las notas se guardan solas y lo indican con "GUARDANDO…" → "GUARDADO" (`shots-4/02`, `03`). El conmutador VER/EDITAR solo aparece cuando hay texto.
- [COMPROBADO] El Markdown renderizado tiene fallos: las viñetas de la lista **no se ven** ("Paso 1", "Paso 2" sin marcador); la casilla `[ ]` es un cuadrado gris que parece deshabilitado; el H2 "Alcance" y el título de la tarea salen en JetBrains Mono y el cuerpo en Inter Tight. La cita (barra de acento) y el enlace (acento subrayado) están bien (`shots-4/05-detalle-reabierto.png`; log "fuentes titulo detalle vs lista": detalle `JetBrains Mono`, lista `Inter Tight`).
- [COMPROBADO] "Hacer ahora" no me lleva a Foco. Me deja en la hoja, cambia la etiqueta a "AHORA" y el botón a "QUITAR DE «AHORA»" (`shots-4/06-tras-hacer-ahora.png`). Al cerrar y volver a Foco, la tarjeta ya pone "TRABAJANDO EN · Revisar specs…" (`shots-5/02-foco-con-tarea-ahora.png`).
- [COMPROBADO] En la lista, una tarea con notas muestra la etiqueta "TIENE DESCRIPCIÓN" (`shots-4/04-lista-tras-cerrar.png`).
- [COMPROBADO] El botón de la pestaña Tareas no tiene aria-label: con badge, su texto es "1\nTAREAS" (log "diagnostico tab Tareas"). El badge es un cuadrado gris claro sobre el icono.

**Foco, mini‑temporizador, Respirar e inmersivo**
- [COMPROBADO] Cambiar de modo con el Pomodoro en marcha abre la hoja "¿Cambiar de modo? Se perderá el tiempo de esta fase." con CANCELAR / CONTINUAR (`shots-5/08-libre.png`).
- [COMPROBADO] Silenciar: el icono pasa a altavoz tachado en acento y el aria-label a "Silenciado" con pressed=true, sin toast (`shots-5/07-tras-tocar-sonido.png`).
- [COMPROBADO] Mini‑temporizador encima de la barra (430×52) con "FOCUS 24:58" y pausa. La pestaña Foco muestra además un cuadradito de acento (`shots-6/01`, `shots-6/02-sonidos-con-mini.png`).
- [COMPROBADO] Respirar sustituye el reloj por la esfera, "Inspira / por la nariz" → "Suelta / despacio, por la boca", unos puntos de progreso y el contador de respiraciones. El contador seguía en 0 a los ~10 s y luego pasó a 1 (logs "respirar texto", "inmersivo texto"; `shots-6/03`, `05`).
- [COMPROBADO] Escape no sale de Respirar. Se sale tocando otra vez el icono de Respirar, que vuelve al modo anterior (log "tras segundo toque respirar": "TIEMPO LIBRE"). En la vista normal de Respirar no hay ningún botón "Terminar" (`shots-6/03`).
- [COMPROBADO] **Inmersivo + Respirar: el botón "× SALIR" se superpone al texto** "pecho, casi quieto." y casi toca "¿POR QUÉ ASÍ?" (`shots-6/07-inmersivo.png`; SALIR 91×44 en y=638).
- [COMPROBADO] Al hacer scroll aparece una cabecera compacta centrada ("AJUSTES", "SONIDOS") con un fondo tan transparente que el contenido de debajo se lee a través: "Notificación del navegador", "Probar sonido →" o la fila Café con "SILENCIAR" encima (`shots-7/03-ajustes-azul-syne.png`, `shots-7/04-ajustes-A++.png`, `shots-8/03`).

**Personalización**
- [COMPROBADO] El tipo seleccionado por defecto es **Mono**, no Suiza (log "estados seleccion": Mono=true).
- [COMPROBADO] El acento azul se aplica al instante en todas partes: eyebrows, dos puntos del reloj, segundos, CTA, indicador y etiqueta de la pestaña activa, mini‑temporizador y toda la tarjeta de radio de Sonidos (`shots-7/06`, `07`, `08`, `09`).
- [COMPROBADO] Syne cambia los dígitos del reloj, los segundos, "MIN" y el mini‑temporizador. Los títulos de página siguen en Inter Tight (`shots-7/06`, `shots-7/08-tareas-A++.png`).
- [COMPROBADO] A++ agranda los textos de Ajustes, pestañas, cabeceras y Sonidos sin desbordes horizontales (log "desbordes horizontales": vacío). Sin embargo, **"+5 min" se come el padding de su botón de 56 px y toca los bordes** (`shots-7/07-foco-corriendo-A++.png`). El font-size raíz sigue en 16 px (log "tamano raiz A++").

## 4. Lo que opino

- [OPINIÓN] La base es buena y no es una web comprimida. Retícula de 16 px, filetes de 1 px, segmentados rectangulares, versalitas espaciadas, un solo acento y la cabecera numerada: la ADN suiza del desktop está ahí. El acento propagado a todo, incluida la tarjeta de radio, se nota pensado como sistema.
- [OPINIÓN] Lo que la baja de nivel son los detalles, justo lo que miro primero. "Focus" frente a "Foco" en cuatro sitios me parece descuidado. Un producto que cuida tanto la tipografía no puede tener "Focus (min)" debajo de "POMODORO".
- [OPINIÓN] La numeración 01–04 es decorativa, pero si existe tiene que significar algo. Que la primera pestaña sea "02" y que una hoja también sea "01" la convierte en ruido.
- [OPINIÓN] Las hojas inferiores parecen cinco componentes distintos. En un sistema de diseño serio la cabecera de una hoja es una sola pieza, con variantes documentadas. "Por qué respirar así", sin asa y con su X fina, parece de otro producto.
- [OPINIÓN] Tipografía: el valor por defecto "Mono" mete JetBrains Mono en el título del detalle, en los H2 del Markdown, en "Inspira" y en los segundos del reloj, mientras todo lo demás va en Inter Tight. Una mono para cifras me parece bien, pero en titulares de texto largo ("Revisar specs del onboarding KYC") queda técnico y pesado. Esperaba "Suiza" por defecto, por coherencia con lo que veo en desktop.
- [OPINIÓN] Objetivos táctiles: la mayoría van bien, pero hay una "segunda clase" de controles entre 32 y 42 px (steppers, segmentados de Ajustes, chips de variante, Silenciar, "¿Por qué así?"). En un móvil que se usa con una mano, los 44 pt no son opcionales. La muestra de color de 38 junto a las de 40 es de esas cosas que se ven en una revisión de píxel.
- [OPINIÓN] La papelera roja pegada a la X en el detalle es una trampa. Es el gesto más destructivo justo al lado del más frecuente. Que haya Deshacer lo mitiga, pero yo la movería al pie o la separaría.
- [OPINIÓN] El solape de "SALIR" en inmersivo y la cabecera compacta transparente son los dos fallos que más "web" se ven. En iOS, la barra que colapsa lleva material con desenfoque; aquí se leen dos capas de texto a la vez.
- [OPINIÓN] El feedback está bien resuelto donde existe: "GUARDANDO…/GUARDADO", el Deshacer, la confirmación al cambiar de modo y el icono de silencio en acento. Echo de menos algo al completar una tarea (ni háptica ni toast); el tachado se pierde si la sección HECHAS queda fuera de pantalla.
- [OPINIÓN] El Markdown renderizado sin viñetas falla en lo básico. Si prometes Markdown en el estado vacío, la lista tiene que verse como lista.
- [OPINIÓN] Respirar está muy bien escrito: el copy de "¿Por qué así?" es claro y nada esotérico, y la esfera es preciosa. La salida no es descubrible y el contador desalineado se ve.

## 5. Lo que me confundió

- Abrir la app por primera vez en modo **Hora** con un botón "INICIAR" y "SESIÓN 01 · PARADO". No sé qué inicia ese botón si estoy viendo la hora (no lo toqué en ese modo).
- Que el número de la tarea sea la casilla de completar. Lo descubrí por el aria-label, no porque se vea tocable.
- "Hacer ahora" no me llevó a Foco. Esperaba que me pusiera a trabajar y me quedé en la hoja con "QUITAR DE «AHORA»".
- Cómo salir de Respirar. Escape no funciona, no hay botón de salida y tuve que volver a tocar el icono de la cabecera, que es ambiguo: es un círculo con diana que no me dice "respirar".
- En Respirar, la cabecera seguía diciendo "SESIÓN 01 · EN CURSO" con el Pomodoro en marcha. No me queda claro si el pomodoro sigue corriendo por debajo.
- Hay dos "silencios": el altavoz de la cabecera de Foco y el botón "SILENCIAR" de Sonidos. No sé si son lo mismo.
- "Tipo" en Ajustes: no sé si es la tipografía del reloj o la de toda la app. Cambia el reloj, y con Mono por defecto también parece afectar al título del detalle y a "Inspira".

## 6. Lo que echo en falta

- [PROPUESTA] Un único componente de cabecera de hoja (asa + eyebrow opcional + título + acciones) aplicado a las cinco hojas.
- [PROPUESTA] Pasar de una vez todos los literales a "Foco": "Foco (min)", "02 FOCO", el mini‑temporizador "FOCO" y "Modo inmersivo" en lugar de "Modo focus".
- [PROPUESTA] Subir a 44 pt mínimos los steppers, segmentados, chips de variante, "SILENCIAR" y "¿Por qué así?", e igualar "Elegir otro color" a 40×40, o mejor todos a 44.
- [PROPUESTA] Una casilla visible en la fila de la tarea (o el número con estado hover/pressed y un borde) y una respuesta háptica o un toast con Deshacer al completar.
- [PROPUESTA] Separar la papelera de la X en el detalle, por ejemplo con "Borrar tarea" como acción de texto al pie.
- [PROPUESTA] Un botón "Terminar" visible en Respirar, que Escape o un deslizamiento hacia abajo también la cierren, y un icono más claro (pulmones u ondas).
- [PROPUESTA] Un fondo opaco o con desenfoque real en la cabecera compacta de scroll.
- [PROPUESTA] Arreglar el render de listas del Markdown y hacer tocable la casilla `[ ]`.
- [PROPUESTA] Abrir por defecto en Pomodoro, o recordar el último modo, y ocultar "SESIÓN / PARADO" en modo Hora.
- [PROPUESTA] Con A++, que los botones cuadrados de icono crezcan con el texto, o que "+5 min" pase a icono.

## 7. iOS / Android

- [COMPROBADO] En WebKit, las safe areas simuladas se respetan en vertical: la cabecera queda bajo el notch y la barra de pestañas sobre el home indicator.
- [HIPÓTESIS] VoiceOver leerá la pestaña Tareas como "1 TAREAS" (sin aria-label, el número del badge va delante). Lo esperable sería "Tareas, 1 pendiente".
- [HIPÓTESIS] Los interruptores cuadrados (52×30, gris sobre negro) no se parecen al UISwitch de iOS. Con la fila entera tocable funcionan, pero en la captura no distingo bien "apagado" de "deshabilitado" ("Notificación del navegador" frente a "Modo calma").
- [HIPÓTESIS] Al deslizar ← para borrar una tarea en iOS puede haber conflicto con el gesto de "atrás" desde el borde. No lo probé desde el borde.
- No probé Android ni el modo horizontal.

## 8. Veredicto

**6/10.** El lenguaje visual es coherente con desktop y en lo grande (Foco, acento, Sonidos) está a la altura: no es una web comprimida. La seguiría usando para pomodoros en el móvil. Pero tal como está no la enseñaría a mi equipo como referencia: mezcla Foco/Focus, la numeración no tiene lógica, hay cinco cabeceras de hoja distintas, una docena de controles por debajo de 44 pt, un solape en inmersivo, la cabecera compacta transparente y el Markdown sin viñetas. Todo tiene arreglo y la mayoría es de una tarde. Con eso pasaría a 8.
