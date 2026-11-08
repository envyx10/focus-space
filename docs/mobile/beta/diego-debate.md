# Debate — Diego (21, estudiante, iPhone 13)

Leí a Carmen, Lucía, Javier y Aitana. Antes de opinar sobre lo que yo no viví igual, lo comprobé con el runner
(WebKit, iPhone 14): `beta/diego/d1.json` y `beta/diego/d2.json`, capturas en `beta/diego/shots-debate/`.

## 0. Primero, una corrección a mi propio informe

En mi informe puse que el deslizador de volumen "salta al punto que tocas". **Me equivoqué al interpretarlo.**
Aitana tenía razón: [COMPROBADO] un toque sin arrastrar deja la lluvia en "0 %, Suave", y un arrastre de 3 px también
(log `lluvia-tras-toque-sin-arrastrar` y `lluvia-tras-toque-con-3px` en d1). El valor solo cambia arrastrando. Lo dejo
claro porque no quiero que nadie arregle un bug que no existe a partir de mi informe.

## 1. Con qué estoy de acuerdo

- **Todos (Carmen, Lucía, Aitana y yo): la app abre en HORA.** Nadie de los cinco la quiere ahí. Somos cuatro perfiles
  que no se parecen en nada y nos ha molestado a todos. No es cuestión de gusto, es un mal valor por defecto.
  Lucía lo resume bien: ocultar "SESIÓN / PARADO" en Hora o, mejor, no abrir en Hora.
- **Aitana, lo de la barra que desaparece al guardar la mezcla con Enter.** Lo encontramos los dos por separado y con
  la misma hipótesis (el input se desmonta enfocado y no salta `focusout`). Y lo del **primer toque perdido en GUARDAR**
  (a ti el botón te saltó de 565 a 531, a mí de 566 a 600). Y aquí entra **Carmen**: tu "el primer Deshacer no hizo
  nada con el teclado abierto" es, para mí, **el mismo bug con otra cara**: se cierra el teclado, vuelve la barra,
  todo se mueve y tu toque cae donde ya no hay botón. Son tres síntomas de una sola causa.
- **Lucía, "Focus" frente a "Foco" y los números 01–04 sin orden.** Lo mismo que vi yo. Y Aitana añade un tercer
  lío: "Modo focus a pantalla completa", "Modo focus →" y "Modo calma". Son tres nombres parecidos y no sabes cuál es cuál.
- **Lucía, Escape no sale de Respirar.** Yo había salido con Escape, pero entrando desde la invitación del descanso
  (que tiene "CERRAR"). Desde el icono de la cabecera, [COMPROBADO] Escape no hace nada: sigue "02 RESPIRAR · SESIÓN
  01 · PARADO" (log `tras-escape-respirar-cabecera`, d1). Así que sí: dos entradas a Respirar con dos salidas distintas.
- **Lucía, "+5 min" con A++ toca los bordes.** [COMPROBADO] en iPhone 14: PAUSAR cabe, pero "+5 min" va pegado al
  marco (`shots-debate/02-corriendo-A++.png`). El "INICIAR" cortado de Carmen no lo reproduzco en 390 px. Ella estaba en
  un Galaxy S9+ más estrecho, así que me lo creo. Es la misma familia que mi PAUSAR cortado en horizontal.
- **Javier, "Deshacer" de un solo nivel.** Yo deslizo rápido por todo. Si me cargo dos temas seguidos, quiero
  recuperar los dos. Tu propuesta de "3 tareas borradas · DESHACER" es justo lo que haría yo.
- **Javier, las tareas nuevas van al final y no las ves.** Con mis 4 temas no me pasó, pero en exámenes llego a 20
  y me pasaría seguro.
- **Lucía, la papelera pegada a la X.** Ahí sí tienes razón: no hace falta confirmar nada, basta con no poner el
  botón de borrar donde va el pulgar a cerrar.

## 2. Con qué NO estoy de acuerdo

- **Carmen, "que pregunte ¿Borrar este recado?".** No. Cada confirmación es un toque más, y ya hay Deshacer. Lo que hay que
  arreglar es que el Deshacer funcione al primer toque (tu bug del teclado) y que aguante varios borrados (lo de Javier).
  Un Deshacer fiable es mejor que un diálogo que todos acabamos pulsando sin leer. Lo de Lucía (separar la papelera)
  resuelve tu miedo sin frenarme a mí.
- **Carmen, pantalla de bienvenida y texto bajo cada icono.** Una línea bajo el reloj ("25 min de trabajo · 5 de
  descanso"), vale, eso no estorba. Un tutorial de varias pantallas o etiquetas debajo de los tres iconos de arriba,
  no: es más texto en una pantalla que ahora se entiende de un vistazo. El icono de Respirar sí es malo (Lucía
  también lo dice). La solución es un icono mejor, no una etiqueta.
- **Carmen, traducir "lofi" a "música tranquila".** Para ti es ruido, para mí "lofi" es una palabra de uso normal. "FOCUS" → "FOCO" sí,
  porque la pestaña ya se llama Foco. "lofi", "ASMR" o "Drone" se buscan así en Spotify. Si los traducen, yo no los
  encuentro.
- **Aitana, que la esfera se mueva menos y que el mini-temporizador sea gris u ocultable.** Respeto que a ti te
  distraiga, y el modo calma existe para eso. Pero la esfera es lo que hace que esto "se sienta app" y no un
  formulario, y el mini **naranja grande** es justo lo que yo quiero: mirar el móvil en la mesa y ver 24:58 sin
  pensar. Hazlo opcional para ti, pero no me lo quites por defecto. Coincido contigo en que el modo calma debería parar
  también los puntitos que laten: si te prometen calma, nada debería moverse.
- **Aitana, "ambientes primero y lofi plegable".** Para mí el lofi es lo principal y la lluvia va encima. Lo que nos
  vale a los dos es lo de "recordar lo último que usé" o tener las mezclas guardadas arriba (y en Foco). Tú pones "Escribir en
  casa" y yo "biblio" con un toque, sin bajar dos pantallas ninguno.
- **Lucía, los 44 pt en todo y las cinco cabeceras de hoja.** Técnicamente tienes razón, pero como usuario no lo
  noto. Ninguno de esos controles de 40–42 px me falló al tocarlo. Las cabeceras de hoja distintas tampoco me
  confundieron. Lo pondría detrás de los bugs que nos dejan atrapados o nos hacen perder toques.
- **Javier, la pérdida de letras en las notas.** No dudo de lo que viste, pero [COMPROBADO] **no lo reproduzco en
  WebKit**: escribí "mascara 255.255.255.0 para ver si se pierde algo OPQRSTU" y en el textarea y en localStorage
  quedó idéntico (log `notas-escritas`, d1). Tu prueba fue en Chromium/Pixel 7, así que [HIPÓTESIS] puede ser solo de
  Android/Chrome. Si es así, es grave para Carmen y para ti, y habría que probarlo con Gboard de verdad. Que diga
  "GUARDADO" con el texto corrompido es lo peor de todo lo que hemos encontrado entre los cinco.

## 3. Mis 3 cambios prioritarios tras leer a los demás

1. **Arreglar el bug del teclado y del layout que salta.** Hoy la barra desaparece tras guardar con Enter (Aitana y yo),
   se pierde el primer toque en GUARDAR (Aitana y yo) y se pierde el primer Deshacer (Carmen). Es una sola raíz, la
   han visto tres testers y deja a la gente atrapada o perdiendo acciones. Para mí va lo primero.
2. **Abrir en Pomodoro (o en el último modo) y tener lo esencial en Foco: el ritmo 25/5 · 50/10 a un toque y "hoy:
   X min · racha N" visible.** Lo de abrir en HORA lo apuntamos cuatro de cinco. Las estadísticas escondidas al
   fondo de Ajustes son mi queja principal.
3. **Que nada se corte: horizontal, A++ y pantallas pequeñas.** Mi PAUSAR en horizontal, el INICIAR de Carmen con
   A++, el "+5 min" de Lucía y el Respirar en calma de Aitana tapado por la barra en el 12 mini. Son cuatro testers con
   cuatro botones o textos cortados. Se ve como una web, no como una app.

Lo que dejaría claramente para después: más confirmaciones, más texto de ayuda y quitar animaciones por defecto.
Eso arregla la experiencia de uno de nosotros a costa de la de otro. Los tres puntos de arriba nos arreglan la
experiencia a todos.
