# Debate: Aitana (TDAH, redactora, iPhone 12 mini)

He leído a Carmen, Diego, Lucía y Javier. Antes de opinar sobre lo que no viví igual, lo he comprobado con el runner
(`debate1.json`, `debate2.json`, WebKit, iPhone 12 Mini).

## 1. Con qué estoy de acuerdo

- **Con todos: que abra en modo HORA es un error.** Carmen, Diego y Lucía lo marcan igual que yo. Diego lo pide como «que
  se acuerde de que la uso para Pomodoro» y Lucía como «recordar el último modo». Me quedo con la de Diego, que no añade
  nada en pantalla: solo quita una decisión.
- **Diego, el bug de la barra que desaparece al guardar la mezcla con Enter.** Lo reprodujiste igual que yo, con el mismo
  diagnóstico (`data-kb` atascado) y el mismo primer toque perdido en GUARDAR. Ya somos dos en dos dispositivos distintos
  (iPhone 14 y 12 mini). Con eso no es una rareza mía, es un bug.
- **Carmen, el Deshacer que no responde al primer toque con el teclado abierto.** Es el mismo patrón que mi GUARDAR: el
  teclado se cierra, la barra reaparece, todo salta y el toque cae donde ya no hay nada. Son tres casos con la misma causa
  y creo que es el fallo de fondo más importante de la beta. Para alguien con TDAH, «toqué y no pasó nada» significa
  tocar otra vez sin saber qué he hecho.
- **Lucía, lo de salir de Respirar.** [COMPROBADO] Escape no sale: tras pulsarlo sigo en «02 RESPIRAR · SESIÓN 01 ·
  PARADO» (log `respirar-tras-escape`). Desde la invitación del descanso sí hay un «CERRAR ×» claro, pero desde el icono
  no. También coincido en que la cabecera compacta translúcida y el «SILENCIAR» que se sale del margen se ven raros: yo
  los vi en el 12 mini y en el iPad.
- **Lucía, los 44 pt.** «¿POR QUÉ ASÍ?» con 32 px de alto, que encima en mi pantalla queda medio tapado por la barra en
  modo calma, es un caso claro. Con dedos nerviosos los objetivos pequeños son un sufrimiento.
- **Lucía y Diego, la numeración 01–04.** Ruido puro. Diego pensó que eran pasos y yo también me lo pregunté. Que la
  quiten.
- **Carmen y Lucía, Focus frente a Foco.** Una palabra para cada cosa, por favor. Yo tengo además «Modo focus», «Modo
  focus a pantalla completa» y «Modo calma» compitiendo.
- **Javier, el Deshacer de un solo nivel.** Con mi forma de usar el móvil (toco, me distraigo, vuelvo y deslizo otra
  cosa) perdería tareas seguro. Un «3 tareas borradas · DESHACER» me parece bien.

## 2. Con qué NO estoy de acuerdo

- **Diego, gestos por todas partes (deslizar entre pestañas, cerrar el inmersivo deslizando…): no.** Cada gesto
  invisible es algo que hago sin querer. Yo cambio de pestaña veinte veces por sesión. Si un roce con el pulgar me cambia
  de pantalla, pierdo el sitio y el hilo. Me parece bien que la hoja se cierre deslizando desde el asa (ya lo hace, lo
  comprobó Javier). Deslizar entre pestañas, no. Lo que sí te compro es **tocar el inmersivo para pausar**: un toque,
  visible y con un fin.
- **Diego, «Hoy: X min · racha N» en Foco y algo tipo Forest con recompensas: no por defecto.** Para mí, una racha en
  la pantalla de trabajo es un estímulo más, y si un día la rompo es culpa. Si existe, que sea opcional y que viva en
  Ajustes o en un toque largo, nunca en la pantalla principal.
- **Diego, sobre el texto de Respirar** («mucho texto, quiero solo la esfera»): estoy a medias. Coincido en que la
  explicación del abdomen sobra a partir del segundo día. Pero yo no quiero la esfera, quiero lo contrario: el cuadrado
  quieto que sale en modo calma. Propongo que la explicación se pliegue tras el primer uso y que la esfera no sea
  obligatoria.
- **Carmen, la pantalla de bienvenida: una frase sí, un tutorial no.** «Trabaja 25 min · descansa 5» bajo el reloj me
  vale y me ayuda. Un carrusel de bienvenida es justo el tipo de cosa que me hace abandonar antes de empezar.
- **Carmen, que la papelera pregunte «¿Borrar este recado?»: no.** Un diálogo más es un paso más y otra decisión. Prefiero
  lo que propone Lucía (separar la papelera de la X) y un Deshacer fiable, que hoy no lo es al primer toque.
- **Carmen, texto bajo todos los iconos de arriba:** solo bajo Respirar. Es el único icono que no se entiende (un círculo
  con diana), y Lucía dice lo mismo. Tres etiquetas más en la cabecera son tres cosas más que leer cada vez que abro la
  app.
- **Diego, «visualmente es la app de foco más chula que he probado».** Para mí ahí está justamente el problema: la esfera
  es preciosa y por eso se lleva mi atención. Lo «chulo» no puede ser el estado por defecto de una app de concentración.
- **Diego y Carmen, sobre los deslizadores.** Diego dice que el valor «salta al punto que tocas». Carmen y yo vimos que
  tocar no hace nada. [COMPROBADO] Los dos tenemos parte de razón: con un toque de dedo (tap) el volumen se queda en 0, y
  también con un pointerdown/up táctil al 30 % (`lluvia-tras-tap-centro "0"`, `cafe-tras-toque-puntero-30pc "0"`). Con un
  clic de ratón en el centro salta a 50 (`fuego-tras-click-centro "50"`). En el móvil, por tanto, solo funciona
  arrastrar, y eso confunde. Carmen además lo llevó a 100 de golpe: necesitamos que un toque fije el volumen y que nada
  empiece al máximo.
- **Javier, las letras perdidas en las notas.** [COMPROBADO] En WebKit (iPhone 12 mini) no lo reproduje: escribí 90
  caracteres en «Descripción de la tarea» y se guardaron íntegros, «hecho» incluido (log `valor-textarea` y `guardado` de
  `debate2.json`). No digo que no exista: tú lo viste en Chromium con errores `Maximum update depth exceeded`, así que
  puede ser propio de Android. Pero como redactora, si me pasa a mí, me voy, así que que lo prueben en un Android real
  antes de nada.

## 3. Mis 3 cambios prioritarios después de leeros

1. **Arreglar el «toque que se pierde» cuando se cierra el teclado y la barra que se queda escondida** (mi GUARDAR, el
   GUARDAR y el Enter de Diego, el Deshacer de Carmen). Es la misma causa con tres síntomas, y es lo que más rompe la
   confianza: si un toque no hace nada, alguien como yo se va.
2. **Un arranque sin decisiones y sin movimiento:** abrir en Pomodoro (o en el último modo), con una línea de texto
   («25 min de trabajo · 5 de descanso») y el modo calma ofrecido o activado si el sistema pide reducir movimiento. Y que
   ese modo calma pare de verdad todo lo que se mueve, incluidos los puntos que laten.
3. **Respirar fácil de entrar y de salir, y que quepa:** un «Terminar» visible (Lucía), etiqueta solo en ese icono, la
   explicación plegada tras el primer uso (Diego) y nada cortado por la barra en pantallas pequeñas en modo calma.

Lo que NO pondría en la lista, aunque varios lo pidan: más gestos, rachas en Foco o más opciones de personalización.
Cada una de esas cosas es, para mí, una distracción más.
