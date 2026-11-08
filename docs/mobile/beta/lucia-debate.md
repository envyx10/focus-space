# Debate — Lucía (Product Designer senior)

He leído a Carmen, Diego, Javier y Aitana. Antes de opinar sobre lo que yo no había vivido, lo reproduje con el runner: `debate1.json`, `debate2.json` y `debate3.json`, con capturas en `shots-d1/`, `shots-d2/` y `shots-d3/`. Empiezo corrigiéndome a mí misma, porque así es más honesto.

## 0. Una corrección a mi propio informe

[COMPROBADO] **Javier tenía más razón que yo con el Markdown.** Escribí una lista normal, una numerada y una checklist por separado. Las tres se renderizan bien: viñeta `disc`, `decimal` y casillas (`shots-d2/01-markdown-listas.png`, log "estilo listas").

Lo que yo vi en mi informe era un caso concreto. Si en **la misma lista** mezclas viñetas normales con `- [ ]`, la lista entera pasa a `list-style:none` y las viñetas normales desaparecen. Sigue siendo un bug, pero de caso límite y no de lo básico. Retiro lo de "falla en lo básico".

Mantengo dos cosas. Las casillas miden **12 px** y están `disabled` (log "casillas md"), así que en móvil son decorativas. Y el contenido se pinta por debajo del pie fijo: "tres" queda cortado bajo el filete de "GUARDADO", igual que lo describe Javier (`shots-d2/01`).

## 1. Con qué estoy de acuerdo

- **Diego y Aitana: la barra de pestañas desaparece al guardar una mezcla con Enter.** Es el bug más grave de toda la beta y yo no lo había encontrado. [COMPROBADO] Lo reproduje en iPhone 14 / WebKit: tras Enter, `.m-tabbar` queda en `display:none`, `data-kb="true"` y el foco en BODY. El toque en "Foco" no responde y sigo en Sonidos (`shots-d1/01-tras-enter-mezcla.png`, log "barra tras Enter"). También confirmo que la hoja abre con el foco en el `DIV.m-sheet` y no en el campo (log "foco al abrir hoja mezcla"). Una app que te deja sin navegación no es "una web comprimida": es una web rota. Va primero en mi lista.
- **Javier: letras perdidas en las notas.** [COMPROBADO, con matiz] En WebKit no lo reproduzco. Tecleé su texto (`echo "hecho"… OPQRSTU linea tres`) y llegó intacto (log "valor notas tecleado"). Él estaba en Chromium/Pixel y vio `Maximum update depth exceeded`, así que me lo creo y lo apunto como **bug dependiente del motor o del ritmo de tecleo**. Que diga "GUARDADO" sobre texto corrupto es inaceptable: el indicador de guardado también es un contrato visual.
- **Carmen: INICIAR se corta con A++.** [COMPROBADO] En iPhone SE (320 px) con A++, el botón mide 96 px pero su contenido necesita 98 (`scrollWidth 98 > clientWidth 96`). La "R" choca con el borde (`shots-d3/01-se-A++-pomodoro.png`). En la misma captura, la cabecera "02 FOCUS / SESIÓN 01 PARADO / 13:33" pasa a tres líneas. Va en la misma familia que mi "+5 min" desbordado en el Pro Max: los botones de ancho fijo no aguantan la escala de texto.
- **Carmen: el número como casilla no se entiende, y "Marcar como hecha" no cierra la hoja.** Lo de la casilla lo dije yo, pero ella lo explica mejor: "un número no parece algo que se pueda pulsar". Además, que la hoja siga abierta tras marcarla hecha rompe el modelo de tarea terminada que se va de la vista.
- **Javier: Deshacer de un solo nivel, y el toast que sigue diciendo "Tarea borrada" después de completar otra.** Un snackbar debe describir la última acción. Si no, el botón Deshacer miente.
- **Aitana: el modo calma tiene que parar *todo*.** Lo comprobó: `m-pulse` y `br-breathe` siguen corriendo con calma activado. Un ajuste que se llama "calma" y no calma es una inconsistencia de producto, no un detalle.
- **Aitana: Respirar en calma queda tapado por la barra en el 12 mini, y la esfera invade "SESIÓN 01 PARADO".** Encaja con lo que vi yo: Respirar es la pantalla con peor control de retícula y de márgenes (20–22 px frente a 16).
- **Todos: abrir en HORA.** Somos cinco de cinco. Carmen y Aitana además descubrieron que "Iniciar" en Hora cambia a Pomodoro **sin decirlo**. Yo no lo pulsé en ese modo y ellas sí, así que eso lo doy por bueno.
- **Diego y Aitana: la numeración 01–04 no tiene sentido.** Y Aitana, con su "es una cosa más que leer", lo resume mejor que yo.
- **Aitana: SILENCIAR fuera del margen, también en el iPad.** Confirma mi medición (acaba a 8 px del borde). En el iPad, con márgenes amplios, debe verse todavía peor.

## 2. Con qué NO estoy de acuerdo

- **Carmen, sobre la confirmación "¿Borrar este recado?".** Te entiendo, pero no la pondría. Las HIG y Material 3 coinciden: para acciones reversibles es mejor **Deshacer** que un diálogo, porque el diálogo se acaba aceptando sin leer. Yo arreglaría tres cosas: que la papelera no esté pegada a la X, que se llame "Borrar tarea" con texto, y que Deshacer funcione al primer toque aunque el teclado esté abierto. Lo segundo es el bug que tú encontraste y que es lo que de verdad te dio miedo.
- **Carmen, sobre texto debajo de los iconos de arriba.** Tienes razón en el problema, no en la solución. Tres etiquetas más en la cabecera rompen la jerarquía de Foco, donde el protagonista es el reloj. Yo haría dos cosas. Primero, cambiar el icono de Respirar: el círculo con diana no dice "respirar", eso es culpa del icono. Segundo, una sola vez, al primer uso, un coach mark que los nombre. Las pestañas llevan texto porque son navegación; los iconos de cabecera son herramientas.
- **Carmen, sobre traducir "lofi", "ASMR" o "beats to relax / study to".** Aquí no estoy de acuerdo. "beats to relax / study to" es el nombre propio de la emisora. "Lofi" y "ASMR" son géneros: traducirlos por "música tranquila" sería inventar. Lo que sí es intolerable es "FOCUS", "Focus (min)" y "Modo focus" con la pestaña llamada "FOCO". Eso es interfaz, no contenido.
- **Diego, sobre deslizar entre pestañas.** No. En Tareas, el deslizamiento horizontal ya significa completar (→) y borrar (←), y el borde izquierdo es el "atrás" de iOS. Meter un tercer significado al mismo gesto es la receta para borrar sin querer, que es justo lo que asusta a Carmen. Ninguna tab bar nativa de iOS cambia de pestaña deslizando. **Sí** a deslizar hacia abajo para cerrar hojas desde el cuerpo, no solo desde el asa: es el patrón del sistema.
- **Diego, sobre "algo tipo Forest, una recompensa".** No en esta app. La identidad de Focus/Space es la sobriedad suiza, y la gamificación con bosques o medallas la convertiría en otra cosa. Tu necesidad real es ver "Hoy 1 h 40 · racha 3" sin bucear en Ajustes, y eso lo comparto: una línea de metadatos en la cabecera de Foco, en el mismo estilo que "SESIÓN 01".
- **Diego, sobre los ritmos 25/5–90/20 con toque largo en Pomodoro.** El toque largo no es descubrible en la web y no tiene equivalente accesible. Prefiero que el "SESIÓN 01" de la cabecera pase a ser "25 / 5 ›", tocable, y abra una hoja con el ritmo.
- **Aitana, sobre el mini-temporizador en gris.** A medias. El acento es lo único que dice "esto está vivo" en otra pestaña, y Diego y Carmen lo valoran precisamente por eso. Pero los dígitos grandes en acento con el punto que late son demasiado. Yo dejaría los dígitos en el color de texto, el acento solo en el cuadradito, **sin pulso**, y la animación solo con el movimiento permitido.
- **Aitana, sobre "demasiadas cosas bonitas en Ajustes".** La personalización es parte del ADN del desktop y yo no la quitaría. Pero comparto que "Modo calma" no puede vivir debajo de "Tipo". Lo reordenaría así: **Foco** (ritmo, avisos, calma), **Apariencia** (idioma, tamaño, acento, tipo) y **Datos** (cuenta, estadísticas). Y ofrecería el modo calma automáticamente cuando el sistema tenga "reducir movimiento".
- **Javier, sobre bajar el tamaño de los títulos largos en el detalle.** Comparto el diagnóstico; para mí la raíz es tipográfica. El título del detalle usa la fuente de "Tipo" (Mono por defecto) a 26 px, y una mono para 300 caracteres no funciona. Lo pondría en la fuente de texto, Inter Tight, con un tamaño que escale según la longitud y un tope de 4 líneas. La mono la dejaría para las cifras.

## 3. Mis 3 cambios prioritarios después de leeros

1. **Teclado y hojas sin estados atrapados** (Diego, Aitana, Carmen y Javier lo han sufrido de cuatro formas distintas).
   - Que la visibilidad de la barra no dependa de `focusout`, sino de `visualViewport` más el estado real del foco al desmontar cualquier input.
   - El campo de la hoja de mezcla recibe el foco al abrir.
   - El botón primario de las hojas con campo va en un pie anclado al teclado, para que no se mueva entre "foco" y "toque" y el primer toque cuente.
   - Deshacer funciona al primer toque con el teclado abierto.
   - En la hoja de detalle, un pie que se repliega en modo edición: el texto nunca se pinta bajo los botones.
   - Criterio de aceptación: en ninguna pantalla puede desaparecer la tab bar sin un teclado visible.

2. **Un sistema de componentes de verdad: hoja, botón y objetivo táctil.**
   - Una sola cabecera de hoja: asa, eyebrow opcional en versalitas, título en Inter Tight de 22 px, y a la derecha acciones de 44×44 con 8 px de separación. Las destructivas se mueven al pie como texto ("Borrar tarea").
   - Un mínimo de 44 pt en todos los controles.
   - Botones que crecen con el texto (`min-width` en lugar de `width`), para que A++ no corte "INICIAR" ni "+5 min". "+5 min" pasa a icono con aria-label en tamaños grandes.
   - La cabecera compacta, opaca: `--bg` al 100 % o con un desenfoque real, nunca translúcida a secas.
   - La X de "Por qué respirar así" y el gutter de Respirar se alinean con los 16 px de la retícula.

3. **Primera experiencia y lenguaje.**
   - Abrir en Pomodoro, y después en el último modo usado. En Hora no hay CTA, o el CTA dice "Empezar pomodoro".
   - Debajo del reloj parado, una línea de metadatos que explica el ritmo ("25 min de foco · 5 de descanso") y responde a Carmen sin onboarding de tres pantallas.
   - "Focus" pasa a "Foco" en todas partes.
   - Eyebrows numerados en el orden de la barra (Foco 01, Tareas 02…) o, mejor, fuera.
   - La casilla visible: el número se queda, pero dentro de un cuadrado de 24 px con borde de 1 px que al completar se rellena de acento con un ✓, y un área táctil de 48×60. Mantiene el lenguaje suizo y se entiende sin texto de ayuda.
   - El modo calma para todas las animaciones, incluidos los pulsos.
