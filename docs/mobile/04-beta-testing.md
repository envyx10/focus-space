# Fase 5 · Informe de beta testing simulado

> **Aviso de método.** Los participantes son **agentes de IA que simulan perfiles de usuario**; no son personas
> reales. Lo que aquí se llama "opinión" es una opinión simulada y **no debe leerse como dato de usuarios**. Sí son
> reales las interacciones: cada agente usó la app de verdad (Playwright con WebKit en perfiles de iPhone y Chromium
> en perfiles de Android/iPad), miró sus capturas y midió el DOM. Los fallos marcados como *comprobado* tienen
> evidencia reproducible (captura, log o test).

Informes completos en [`beta/`](beta/): un informe y un debate por persona, más la auditoría de accesibilidad.

## 1. Participantes y experiencia resumida

| Perfil | Dispositivo emulado | Ejecuciones | Nota (simulada) | En una frase |
| --- | --- | --- | --- | --- |
| **Carmen**, 58, administrativa, poca tecnología, vista cansada | Galaxy S9+ (360 px), Pixel 7 | 10 + 2 | 5/10 | Apuntar recados es rápido; tachar, entender el Pomodoro y el inglés la frenan. |
| **Diego**, 21, estudiante en exámenes, usuario de Forest/Spotify | iPhone 14, SE, horizontal | 9 + 2 | 6/10 | Arrancar en un toque y el mini-temporizador le "ganan"; la barra que desaparecía le haría cerrar la app. |
| **Lucía**, 34, product designer senior | iPhone 14 / 14 Pro Max | 8 + 3 | 6/10 | "No es una web comprimida", pero pide sistema: una sola cabecera de hoja, 44 pt, lenguaje coherente. |
| **Javier**, 42, backend, notas largas en Markdown | Pixel 7, horizontal | 8 + 1 | 6/10 | Lee muy bien el Markdown; no edita si se pierden letras. |
| **Aitana**, 29, redactora con TDAH | iPhone 12 mini, iPad Mini | 10 + 2 | 6/10 | Respirar es lo mejor; el modo calma debe parar *todo* y montar el ambiente cuesta. |
| Auditoría de accesibilidad (WCAG 2.2 AA) | iPhone 14, SE, iPad Mini, Pixel 7 | driver propio | — | 24 hallazgos; lo básico (inert, aria, alternativas a gestos) está bien. |

## 2. Problemas comprobados durante las pruebas

Estado: ✅ corregido y verificado en esta rama · ⏳ pendiente (roadmap).

| # | Problema | Quién / evidencia | Estado |
| --- | --- | --- | --- |
| B1 | **Se perdían pulsaciones al escribir notas** (`echo "hecho"` → `echo "heco"`) con `Maximum update depth exceeded`, y aun así decía "Guardado". Causa: el autoguardado de `Detail` hacía `setState` dentro de un efecto en cada tecla; con el hilo principal cargado (esfera 3D) React encadenaba renders síncronos y descartaba teclas. Afectaba también a desktop en equipos lentos. | Javier (Chromium); reproducido con su fichero exacto; WebKit no lo mostraba | ✅ "Guardando" se deriva del estado; mismo escenario: 0 errores, texto íntegro |
| B2 | **La barra de pestañas quedaba oculta tras guardar una mezcla con Enter** (atrapada en Sonido). WebKit no emite `focusout` cuando el campo enfocado se desmonta. | Diego, Aitana, Lucía (WebKit); Carmen y Javier vieron que en Chromium no pasaba | ✅ vigilancia del foco mientras el teclado está abierto; verificado en WebKit |
| B3 | **El primer toque en Deshacer / Guardar se perdía con el teclado abierto**: al perder el foco el campo, la barra reaparecía y movía el botón bajo el dedo. | Carmen (Android), Javier, Diego, Aitana (iOS) | ✅ el layout espera a que baje el teclado (280 ms); verificado en WebKit |
| B4 | Deshacer recuperaba solo el último borrado; el aviso duraba 8 s. | Javier; auditoría (2.2.1) | ✅ acumula todos los borrados del aviso, 12 s, no caduca mientras tiene foco |
| B5 | La app abría en modo **Hora** con un botón "Iniciar" que cambiaba a Pomodoro sin avisar. | Los cinco | ✅ abre en el temporizador y una línea explica el modo ("25 min de foco y 5 de descanso…") |
| B6 | "Focus" mezclado con "Foco"; numeración 01/02 no correspondía al orden de pestañas. | Lucía, Carmen, Diego | ✅ "Foco" en mobile (cabecera, mini, ajustes); 01 Foco · 02 Tareas · 03 Sonidos · 04 Ajustes |
| B7 | El número de la tarea no parecía una casilla. | Carmen, Lucía | ✅ cuadro con el número que se rellena con ✓ |
| B8 | "Marcar como hecha" dejaba la hoja abierta (y el número cambiaba); "Hacer ahora" no llevaba a Foco. | Carmen, Lucía, Diego | ✅ hecha → cierra la hoja; hacer ahora → abre Foco |
| B9 | INICIAR cortado con A++ en 360 px y en horizontal; "+5 min" tocaba los bordes. | Carmen (S9+), Lucía (SE), Diego (horizontal) | ✅ el botón principal pasa a su propia fila cuando no cabe |
| B10 | Tocar un deslizador no hacía nada (solo arrastrar). | Carmen, Aitana; auditoría (2.5.7) | ✅ un toque salta a ese punto, salvo justo después de un scroll (sigue sin cambiar volumen al desplazarse) |
| B11 | Tocar el nombre de un sonido no hacía nada. | Carmen | ✅ el nombre enciende (50 %) / apaga |
| B12 | El modo calma no paraba los puntos que laten. | Aitana | ✅ sin animaciones en calma |
| B13 | De Respirar no se salía con Escape ni había botón visible. | Lucía, Aitana, Diego | ✅ botón con texto "Respirar / Terminar" y Escape |
| B14 | Región viva que anunciaba el reloj cada segundo. | Auditoría (crítica en un estado) | ✅ solo se anuncian cambios de estado |
| B15 | El iframe oculto de YouTube entraba en el orden de tabulación (y sacaba el foco de las hojas). | Auditoría | ✅ `inert` (también corrige desktop) |
| B16 | Atajos de una tecla activos detrás de una hoja (Espacio arrancaba el Pomodoro). | Auditoría | ✅ en mobile esperan mientras hay hoja abierta |
| B17 | Foco perdido tras completar con la casilla o borrar desde el detalle. | Auditoría | ✅ el foco vuelve a la casilla o a la pestaña |
| B18 | Anillo de foco invisible en la tarjeta de radio (acento sobre acento). | Auditoría | ✅ anillo en `--on-accent` |
| B19 | Controles invisibles del inmersivo seguían en el orden de foco; "Salir" a 2,8:1 y encima de Respirar. | Auditoría, Lucía | ✅ `inert`, "Salir" arriba con contraste |
| B20 | Objetivos < 44 px: pastilla Silenciar, chips de variante, segmentados, steppers, muestras. | Lucía (medido) | ✅ 44 px |
| B21 | Cabecera compacta casi transparente; "Silenciar" a 8 px del borde. | Lucía | ✅ 96 % opaca, margen 16 px |
| B22 | Papelera pegada a la X en el detalle. | Lucía, Carmen | ✅ 12 px de separación |
| B23 | Bloques de código cortados; título de la tarea en mono gigante. | Javier, Lucía | ✅ código con salto de línea; título en Inter Tight |
| B24 | El campo de nombre de mezcla no recibía el foco al abrir la hoja. | Diego, Javier | ✅ `data-autofocus` en hojas de formulario |
| B25 | Contraste insuficiente: pista de gestos y tareas hechas (2,8:1), segundos del reloj (2,85:1). | Auditoría | ✅ pista y hechas a `--muted` (≈5,6:1) · ⏳ segundos del reloj (decisión de marca, ver roadmap) |
| B26 | La explicación "¿Por qué así?" de Respirar no es modal; se corta en pantallas pequeñas. | Auditoría, Aitana | ✅ el guía hace scroll · ⏳ convertirla en `Sheet` |
| B27 | Las casillas `[ ]` del Markdown están deshabilitadas. | Javier, Lucía | ⏳ |
| B28 | Una mezcla guardada no restaura el volumen de la radio. | Diego | ⏳ (decisión de producto) |
| B29 | Exportar descarga en silencio; solo JSON. | Javier | ⏳ |

## 3. Críticas recurrentes

1. **Arranque y lenguaje** (5/5): abrir en "Hora", "Focus" en inglés, el Pomodoro sin explicar.
2. **El teclado que mueve la pantalla** (4/5): barra que desaparece, primer toque perdido. Tres testers lo vieron por separado y lo atribuyeron, con razón, a una sola causa.
3. **Cosas que se cortan** (4/5): A++, 360 px, horizontal.
4. **Gestos invisibles**: el deslizar para completar/borrar no se descubre (Carmen no vio la pista); a la vez, Aitana y Javier piden *no* añadir más gestos.

## 4. Funcionalidades que generan confusión

- La pantalla inicial en modo Hora y "Iniciar" que cambia de modo (corregido).
- El número como casilla (corregido).
- Dos botones de silencio (Foco y Sonido): Lucía lo ve redundante; Carmen y Diego usan el de Foco. Se mantienen ambos.
- "Modo focus" / "Modo calma" (Aitana): "Modo focus" pasa a "Pantalla completa"; "Modo calma" lleva ahora una explicación ("Sin esfera ni animaciones…").
- La hoja de detalle habla de "Markdown" y "`código`" a quien no lo necesita (Carmen) — el placeholder es compartido con desktop: roadmap.

## 5. Nuevas funcionalidades propuestas (por los agentes)

| Propuesta | Quién | Apoyos / rechazos en el debate |
| --- | --- | --- |
| Recordar el último modo (en vez de forzar Pomodoro) | Javier, Aitana | Diego a favor; nadie en contra |
| "Hoy / racha" visibles en Foco | Diego | Lucía: en una línea; Aitana y Carmen en contra (estímulo, culpa) |
| Reordenar tareas arrastrando | Diego, Javier | — |
| Casillas de Markdown tocables; exportar una nota como .md; hoja de compartir del sistema | Javier | Carmen: que no le aparezca a ella |
| Deslizar entre pestañas | Diego | **Rechazada** por Javier, Lucía, Aitana y Carmen (choca con deslizar filas y con el "atrás" de iOS) |
| Confirmación al borrar | Carmen | **Rechazada** por Diego, Lucía, Javier y Aitana: prefieren un Deshacer fiable (implementado) |
| Tocar el inmersivo para pausar | Diego | Aitana a favor |
| Mezcla que incluya la radio | Diego | — |
| Explicación de Respirar plegada tras el primer uso | Aitana | — |
| Menos opciones decorativas (colores, tipografías) | Aitana | Javier y Lucía: reordenar, no quitar (aplicado: calma y tamaño arriba) |

## 6. Mejoras de UX/UI aplicadas tras la beta

Todas las ✅ de la sección 2. Además: Ajustes reordenado (Cuenta → Pantalla con tamaño de texto y calma primero →
Pomodoro → Avisos → Estadísticas), "1 sesión" en singular, la tarea recién añadida se desplaza a la vista,
y el aviso de Deshacer se anuncia en una región `status` siempre montada.

## 7. Específico de iOS y Android

| Plataforma | Hallazgo | Tipo |
| --- | --- | --- |
| iOS (WebKit) | Sin `focusout` al desmontar un campo enfocado → barra atascada (B2). | Comprobado, corregido |
| iOS | No hay Fullscreen API para páginas: el inmersivo no oculta Safari (sí en la PWA instalada). | Conocido |
| iOS | `navigator.vibrate` no existe: sin háptica. | Conocido |
| iOS | Viñetas que desaparecen al mezclar `- ` y `- [ ]` en una lista (Lucía; Javier no lo ve en Chromium). | Comprobado en WebKit, ⏳ |
| Android (Chromium) | Pérdida de teclas en notas (B1), visible allí por la carga del WebGL por software. | Comprobado, corregido |
| Android | `interactive-widget=resizes-content` cambia cómo el teclado redimensiona: confirmar en un dispositivo real. | Hipótesis |
| Ambos | La radio de YouTube no se pudo reproducir en el entorno de pruebas; el audio Web no existe en el WebKit de Playwright. | Sin verificar |

## 8. Oportunidades de mejora del producto

- **Onboarding de un solo paso** (no tutorial): la línea de ayuda del modo ya cubre lo esencial; validar si basta.
- **El móvil como lector de notas** (Javier) puede ser un caso de uso propio: lectura cómoda, búsqueda, copiar código.
- **Ambiente "de un toque"**: presets visibles (lluvia+café, ruido rosa…) en lugar de montar a mano (Aitana).
- **Recordatorios / notificaciones** de fin de fase en la PWA instalada (no verificable en esta beta).

## 9. Priorización (impacto × esfuerzo)

| Prioridad | Elemento | Impacto | Esfuerzo |
| --- | --- | --- | --- |
| Hecho | B1–B24 | Alto | Bajo-medio |
| P1 | Probar en hardware real (iPhone + Android de gama media), PWA instalada, teclado real | Alto | Bajo |
| P1 | Recordar el último modo | Medio | Bajo |
| P1 | Casillas Markdown tocables | Medio | Medio |
| P2 | Explicación de Respirar como `Sheet` + plegada tras el primer uso | Medio | Bajo |
| P2 | Reordenar tareas arrastrando | Medio | Medio |
| P2 | Exportar con hoja de compartir (`navigator.share`) y .md | Medio | Bajo |
| P3 | "Hoy / racha" opcional en Foco | Bajo-medio | Bajo |
| P3 | Mezclas que guarden la radio | Bajo | Bajo |

## 10. Recomendaciones para la siguiente iteración

1. Sustituir la simulación por **5 sesiones con personas reales** que cubran los mismos perfiles, con las mismas
   tareas guía; comparar con estas hipótesis.
2. Probar la **PWA instalada** en iOS y Android (safe areas reales, teclado, audio en segundo plano, notificaciones).
3. Instrumentar (sin datos personales) cuántas veces se usa deslizar frente a la casilla, para decidir si la pista
   de gestos se queda.

### Qué es comprobado, qué es opinión

- **Comprobado**: sección 2 (con evidencia en `beta/*` y verificación propia), y las filas "Comprobado" de la 7.
- **Opiniones de los agentes**: notas, gustos y desacuerdos de las secciones 1, 3–5. Útiles para formular hipótesis,
  no para decidir.
- **Hipótesis de mejora**: secciones 8 y 9.
- **Requiere validación con usuarios humanos**: todo lo anterior que no sea un fallo comprobado, en especial
  onboarding, gestos, estadísticas en Foco y reducción de opciones.
