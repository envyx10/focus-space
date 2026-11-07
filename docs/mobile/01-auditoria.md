# Fase 1 · Auditoría de la experiencia mobile

Fecha: 2026-11-07 · Rama: `feature/mobile-redesign` · Base: `a43ad8f` (main)

Método: lectura completa del código (`src/`, `public/`, `index.html`, `netlify.toml`), build + 190 tests de referencia
(todo en verde) y pruebas en navegador con viewport 390×844 (iPhone 14/15) midiendo DOM, objetivos táctiles y
superposiciones. Cada hallazgo indica cómo se comprobó.

## 1. Qué es la aplicación (estado real)

Focus/Space es una SPA de productividad de **una sola pantalla**, sin router:

| Región | Componente | Qué hace |
| --- | --- | --- |
| 01 Tareas | `tasks/TasksPanel` (+ `TasksFocus` a pantalla completa) | Lista con alta, completar, editar, borrar con deshacer, tarea activa ("hacer ahora"), descripciones Markdown, importar/exportar JSON/.md, sincronización Supabase opcional con respaldo local. |
| 02 Foco | `timer/FocusPanel` | Reloj local / Pomodoro / temporizador libre / respiración guiada; reiniciar, +5 min, saltar; reloj gigante con tipografía intercambiable (`Cycler`) y esfera 3D de partículas (three.js, GPGPU) que reacciona al audio. |
| Sonidos | `audio/MixerBar` | 14 canales ambientales (lluvia, fuego, café…) con variantes; 5 "cuadrados" visibles configurables; volumen por arrastre. |
| Radio | `lofi/LofiBlock` | 7 emisoras lofi de YouTube (iframe oculto), play/pausa, emisora siguiente, volumen. |
| Cabecera | `layout/Header` | Marca, sesión/estado, fecha + tiempo, silenciar, Ajustes (panel), Cuenta (panel). |
| Ajustes | `settings/SettingsMenu` | Pomodoro, avisos (campana, notificaciones), pantalla (idioma, modo calma, tamaño de texto, acento, modo inmersivo), sonido (silenciar, cuadrados, mezclas guardadas), estadísticas, atajos. |
| Descanso | `break/BreakCorner` + `BreathGame` | Invitación a respirar durante los descansos del Pomodoro. |

**Arquitectura.** React 19 + Vite 8 + TypeScript, CSS plano por módulo con tokens (`styles/tokens.css`). Toda la
lógica vive en hooks (`useTimer`, `useTasks`/`useTaskRepo`, `useAmbient`, `useYouTubeLofi`, `useSession`) que
`App.tsx` compone; los componentes son presentacionales. Esto es una buena base: **la lógica de negocio se puede
reutilizar íntegra** y el rediseño puede limitarse a la capa de presentación.

**PWA.** `manifest.webmanifest` (standalone, tema #0b0b0b), `sw.js` network-first (solo en producción),
`viewport-fit=cover`, `apple-mobile-web-app-status-bar-style: black-translucent`, icono 512 px.

**Mobile hoy.** No existe una experiencia mobile: es el layout desktop reflujado con ~400 líneas de media queries
(`max-width: 1023px` y `560px`) en `styles/app.css`. La rejilla de 12 columnas pasa a una columna con scroll de
documento y una barra inferior de texto que oculta dos de los tres paneles inferiores.

## 2. Problemas encontrados

Impacto: **A** alto (bloquea o confunde una tarea principal), **M** medio, **B** bajo.

### Navegación y jerarquía

| # | Problema | Comprobación | Impacto |
| --- | --- | --- | --- |
| N1 | **La barra inferior no navega entre pantallas**: solo cambia el panel que hay debajo del reloj. El reloj (560 px mínimo) siempre va primero, así que cada pestaña obliga a hacer scroll; al tocarla, la página salta con `scrollIntoView` y el temporizador desaparece de la vista. No hay pestaña para volver al foco. | Navegador: tras tocar "Sonidos" el documento mide 1084 px en un viewport de 844 y el reloj queda parcialmente fuera. | A |
| N2 | Pestañas solo de texto, 11 px, mayúsculas, opacidad 0,5; sin iconos. | Captura | M |
| N3 | **Cabecera saturada**: marca + silenciar + "Ajustes" + "Entrar" en 44 px; se pierden la sesión, el estado y la fecha por debajo de 560 px. El estado del temporizador desaparece justo en el dispositivo donde más se cambia de contexto. | CSS `max-width: 560px` oculta `.hd-session`. | M |
| N4 | El selector de **tipografía del reloj** (decoración) ocupa el primer puesto de la pantalla, por encima del selector de modo. Jerarquía invertida. | Captura | M |
| N5 | La acción principal (Iniciar) queda a ~680 px, alineada a la derecha y debajo de "Sin tarea activa"; los controles secundarios (reiniciar, +5, saltar) compiten con ella en la misma fila con `flex-wrap`. | Captura | M |

### Componentes rotos o defectuosos en móvil

| # | Problema | Comprobación | Impacto |
| --- | --- | --- | --- |
| C1 | **Volumen accidental al hacer scroll**: los deslizadores del mezclador tienen `touch-action: none` y "un toque sin arrastre salta a esa posición". Un dedo que intenta desplazar la página sobre un cuadrado **no hace scroll y además cambia el volumen** (puede encender un sonido). | Código `MixerBar.tsx` (`onPointerUp` sin `moved`) + `mixer.css` | A |
| C2 | **El panel de Ajustes queda tapado por la barra inferior** (la barra está en un contexto de apilamiento posterior). La última opción nunca es pulsable sin cerrar. | Captura con el panel abierto | A |
| C3 | El panel de Ajustes se fija en `top: 44px`, pero en la PWA instalada la cabecera mide `44px + safe-area-inset-top`: en iPhone con notch el panel se monta sobre la cabecera. | `settings.css` vs `app.css` | M |
| C4 | El panel de **Cuenta desborda la pantalla** (320 px con `right: -16px`): termina en x = 394 en un viewport de 390. | Medición DOM | M |
| C5 | El ajuste **"Tamaño del texto" no hace nada en móvil**: se implementa con `zoom` y el CSS mobile fuerza `zoom: 1`. | `app.css` | M |
| C6 | **Volumen de la radio**: solo responde a clic; no se puede arrastrar con el dedo. Línea de 2 px. | `LofiBlock.tsx` | M |
| C7 | El ajuste de **mezclas guardadas** está enterrado en Ajustes (a ~1500 px de scroll) en lugar de junto al mezclador. | Panel de 2 065 px de alto | M |
| C8 | Reiniciar o cambiar de modo usa `window.confirm` nativo: bloquea, rompe el estilo y en iOS standalone aparece con la URL. | `FocusPanel.tsx` | B |
| C9 | Las etiquetas "Esc · salir" (pantalla completa de tareas e inmersivo) asumen teclado; en inmersivo el botón mide 10 px de texto con opacidad 0,35. | Captura | M |
| C10 | `requestFullscreen` no existe en iPhone: el modo inmersivo y la vista de tareas "pantalla completa" no ocultan nada del navegador en iOS. | API de WebKit | B |

### Usabilidad táctil y accesibilidad

| # | Problema | Comprobación | Impacto |
| --- | --- | --- | --- |
| T1 | **Objetivos táctiles diminutos**: selector de canal del mezclador 15 px de alto; interruptores 32×16; muestras de color 20×20; botón de emisora ~24 px. | Medición DOM | A |
| T2 | Cada fila de tarea muestra **tres iconos permanentes** (hacer ahora, editar, borrar) a opacidad 0,5: ruido visual y riesgo de borrar por error. No hay gestos. | Captura + `tasks.css` `(hover: none)` | M |
| T3 | Editar una tarea es **doble clic** sobre el texto (gesto de escritorio). | `TasksPanel.tsx` | B |
| T4 | El aviso "Deshacer" aparece al final de la lista, a menudo fuera de la vista. | Código | M |
| T5 | Sin `-webkit-tap-highlight-color`, sin `user-select: none` en controles: destello gris al tocar y selección de texto al mantener pulsado. | CSS | B |
| T6 | Sin `overscroll-behavior`: el pull-to-refresh de Android puede recargar la app a mitad de una sesión. | CSS | M |
| T7 | Teclado virtual: la barra inferior es `sticky` y no se oculta al escribir; en Android sube con el teclado y tapa el campo; nada usa `visualViewport`. | Código | M |

### Rendimiento

| # | Problema | Comprobación | Impacto |
| --- | --- | --- | --- |
| P1 | La esfera 3D (32 400 partículas en móvil, lienzo 780×1120 a DPR 2) **sigue renderizando a 60 fps aunque el reloj esté fuera de pantalla**. Batería. | Código `Scene3D.tsx` + medición del canvas | M |
| P2 | Bundle inicial 322 kB (101 kB gzip) + 5 pesos de Inter Tight y JetBrains Mono desde Google Fonts. Aceptable; three.js y Markdown ya se cargan bajo demanda. | Build | B |

### PWA

| # | Problema | Impacto |
| --- | --- | --- |
| W1 | Un único icono con `purpose: "any maskable"`: Android recorta el logo en la máscara o lo muestra con margen incorrecto. | B |
| W2 | Sin `mobile-web-app-capable` (la etiqueta `apple-…-capable` está obsoleta en Chrome), sin `orientation`, sin `shortcuts`. | B |
| W3 | Sin `interactive-widget=resizes-content` en el viewport (comportamiento del teclado en Chrome Android). | B |

## 3. Propuesta de actuación

1. **Shell mobile propio** (`src/mobile/`) que se monta por debajo de 1024 px mediante `matchMedia`; desktop
   sigue renderizando exactamente el árbol actual. Toda la lógica (hooks) se comparte desde `App.tsx`.
2. **Navegación por pestañas reales** con iconos: *Foco · Tareas · Sonido · Ajustes*; cada pestaña es una pantalla
   completa con su propio scroll. Un **mini-reproductor del temporizador** sobre la barra mantiene el contexto al
   salir de Foco (N1, N2, N3).
3. **Foco** reordenado por prioridad: estado → modo → reloj → tarea activa (seleccionable con una hoja) →
   acción principal a ancho completo en la zona del pulgar; secundarias como botones de icono. Tipografía a
   Ajustes (N4, N5, C8 con hoja de confirmación propia).
4. **Tareas** con filas grandes, gestos de deslizamiento (completar / borrar) con alternativa accesible, detalle
   en hoja a pantalla completa reutilizando el editor Markdown existente, compositor fijo sobre el teclado y
   aviso de deshacer flotante (T2–T4, T7).
5. **Sonido** unificado: radio + mezclador en una lista vertical con deslizadores táctiles que no secuestran el
   scroll, favoritos primero, "más sonidos" y mezclas guardadas en la misma pantalla (C1, C6, C7, T1).
6. **Ajustes** como lista agrupada estilo iOS con controles de 44 px, cuenta integrada y tamaño de texto que
   funciona (C2–C5).
7. Hoja inferior (`Sheet`) reutilizable con arrastre para cerrar, safe areas y teclado (`visualViewport`).
8. Pausar la esfera 3D fuera de la pestaña Foco y con la página oculta (P1).
9. Ajustes PWA: viewport, `mobile-web-app-capable`, manifest con `shortcuts`/orientación (W2, W3).
