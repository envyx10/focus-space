# Fase 3 · Implementación y decisiones

## Arquitectura

```
App.tsx ── hooks compartidos (useTimer, useTasks, useAmbient, useYouTubeLofi, useSession, stats…)
   ├── ≥1024 px → árbol desktop original (sin cambios visuales: comparado píxel a píxel)
   └── <1024 px → src/mobile/MobileApp  (shell de pestañas)
                    ├── FocusView     Foco
                    ├── TasksView     Tareas  (reutiliza Detail de TasksFocus)
                    ├── SoundView     Sonido  (radio + ambientes + mezclas)
                    ├── SettingsView  Ajustes (incluye la cuenta)
                    ├── Sheet         hoja inferior reutilizable
                    ├── Slider        deslizador táctil
                    └── platform.ts   media queries, teclado virtual, háptica
```

| Decisión | Por qué | Alternativa descartada |
| --- | --- | --- |
| Elegir el árbol con `matchMedia('(max-width: 1023px)')` en `App` | Desktop queda literalmente intacto; mobile puede tener otra estructura, no solo otro CSS. El estado vive en los hooks de `App`, así que al girar una tablet o redimensionar no se pierde nada. | Seguir con media queries sobre el mismo DOM (el origen de los problemas N1–C7). |
| Mismo corte (1024 px) que el responsive anterior | Es donde el grid desktop deja de caber (`min-width: 1024px`). Tablets en vertical reciben el shell mobile con contenido centrado a 680 px. | Corte a 768 px: dejaría 768–1023 sin layout válido. |
| Todas las pestañas montadas, la activa visible, las demás `inert` | Conserva scroll, borradores y estado de cada pestaña, como una tab bar nativa. | Desmontar al cambiar (pierde el estado y reinicia WebGL). |
| `Scene3D` recibe `paused` | Fuera de Foco no se simula ni se dibuja (P1). La prop es opcional: desktop no la pasa. | Desmontar la esfera (coste de reinicializar GPGPU). |
| Sin `Grain` en mobile | Un canvas a pantalla completa a DPR 3 con opacidad 0,02 no aporta nada visible en un móvil y cuesta memoria. | — |
| `Sheet` propio con Pointer Events | Arrastre 1:1, cierre por distancia o velocidad, foco gestionado, fondo `inert`, sigue al teclado. Sin dependencias. | Vaul/Radix: dependencias nuevas para una pieza de ~150 líneas. |
| `Slider` con bloqueo de eje | `touch-action: pan-y`; los primeros 6 px deciden: horizontal ajusta, vertical hace scroll; un toque no cambia nada (arregla C1). Ratón y teclado siguen funcionando. | Reutilizar el deslizador del mezclador desktop (`touch-action: none`). |
| Teclado: foco en campo editable + puntero grueso ⇒ "teclado abierto"; tamaño desde `visualViewport` | Medir `innerHeight` frente a `visualViewport` solo funciona en iOS; con `interactive-widget=resizes-content` Android encoge ambos. | Detectar por diferencia de alturas (falla en Android). |
| Confirmaciones en hoja propia | `window.confirm` bloquea y en iOS standalone muestra la URL (C8). | — |
| Textos de tamaño A/A+/A++ vía `--m-ts` | El `zoom` desktop rompía el layout móvil y estaba anulado (C5). | — |
| Lógica compartida extraída | `useTaskDraft` (tasks/draft.ts) y `downloadTasks` (tasks/transfer.ts) los usan desktop y mobile; `Detail` se exporta de `TasksFocus`. | Duplicar el código. |
| CSS responsive antiguo eliminado de `app.css` (−351 líneas) | Solo aplicaba por debajo de 1024 px, donde ya no existe `.app`. | Dejar código muerto. |

## Cambios fuera de `src/mobile`

| Fichero | Cambio | Efecto en desktop |
| --- | --- | --- |
| `App.tsx` | Rama mobile (cargada bajo demanda), `onStation` extraído, barra `.m-tabs` antigua eliminada, `?tab=` para accesos directos, atajos en pausa con una hoja abierta (solo mobile) | Ninguno (comparación píxel a píxel) |
| `dev/phone.html` | Vista previa de desarrollo en un marco de teléfono | No entra en el build |
| `visual/Scene3D.tsx` | Prop opcional `paused` | Ninguno (no se pasa) |
| `break/BreakCorner.tsx`, `break/BreathGame.tsx` | Aceptan el contenedor `.m-focus` / `.m-app` | Ninguno |
| `tasks/TasksPanel.tsx` | Usa `useTaskDraft` y `downloadTasks`; exporta `MAX_TEXT`, `UNDO_MS` | Ninguno (mismos tests) |
| `tasks/TasksFocus.tsx` | Exporta `Detail`; **corrección**: "Guardando…" se deriva del estado en lugar de fijarse en un efecto (perdía teclas al escribir rápido, hallado en la beta) | Ninguno visual; corrige el mismo fallo latente en desktop |
| `lofi/useYouTubeLofi.ts` | El reproductor oculto es `inert` (no recibe el foco con Tab) | Ninguno visual; mejora de accesibilidad |
| `lib/Icon.tsx` | 9 iconos nuevos con el mismo trazo | Ninguno |
| `styles/app.css` | Fuera el responsive < 1024 px | Ninguno |
| `index.html`, `manifest.webmanifest` | `interactive-widget`, `mobile-web-app-capable`, título iOS, `shortcuts`, `orientation`, `categories` | Ninguno |
| `i18n/es.ts`, `i18n/en.ts` | 39 claves `m.*` | Ninguno |

## Mapa de funciones (nada se elimina)

| Función desktop | Dónde está en mobile |
| --- | --- |
| Reloj / Pomodoro / Libre / Respirar / reiniciar / +5 / saltar | Foco |
| Tipografía del reloj (`Cycler`) | Ajustes › Pantalla › Tipografía |
| Modo focus (inmersivo) | Icono en Foco y Ajustes › Pantalla |
| Silenciar | Icono en Foco y botón en Sonido |
| Tareas: añadir, completar, editar, borrar + deshacer, tarea activa | Tareas (filas, gestos y detalle) y hoja "¿En qué vas a trabajar?" en Foco |
| Descripciones Markdown, importar .md | Detalle de tarea (mismo editor) |
| Limpiar hechas, exportar, importar | Tareas › menú ··· |
| Mezclador (5 cuadrados) y variantes | Sonido › Ambiente (favoritos = los 5 cuadrados) y "Más sonidos" (los otros 9) |
| Elegir qué sonidos van en los cuadrados (`MixerSlots`) | No en mobile: allí todos los sonidos están accesibles en la lista; los favoritos siguen siendo los del desktop. |
| Mezclas guardadas | Sonido › Mezclas guardadas |
| Radio lofi | Sonido › tarjeta de radio (añade "emisora anterior") |
| Cuenta | Ajustes › Cuenta |
| Pomodoro, avisos, idioma, calma, tamaño, acento | Ajustes |
| Estadísticas | Ajustes › Estadísticas |
| Atajos de teclado | Ajustes, solo con puntero fino (iPad con trackpad); los atajos siguen activos |

## Validación (fase 4)

- **Desktop intacto**: el commit base y la rama, compilados y servidos aparte, dan capturas **idénticas byte a
  byte** a 1440×900, 1024×700 y 1920×1080, con y sin el panel de Ajustes abierto (`desktop-diff.mjs`).
- **Tests**: 206/206 al cierre (190 previos + 16 del shell mobile: navegación, alta de tareas, deslizar para completar y
  borrar con deshacer, scroll vertical que no actúa, hoja de detalle y Escape, mini-temporizador, confirmación de
  reinicio, teclado, tamaño de texto, deslizador táctil).
- **Navegador real** con Playwright: WebKit (iPhone 14, iPhone 14 horizontal, iPhone SE) y Chromium (Pixel 7,
  iPad Mini), con safe areas simuladas: flujos de Foco, Tareas, Sonido, Ajustes, Respirar, descanso con invitación
  y juego, inmersivo, teclado, A++.
- Corregido durante la validación: superíndice del reloj desalineado; esfera invisible en Respirar (fondo opaco
  heredado); juego de descanso posicionado en relativo; `setPointerCapture` que lanzaba con un puntero ya liberado;
  nota duplicada de "solo en este navegador".

## Cambios tras la beta (fase 5)

Ver la tabla de la sección 2 de [`04-beta-testing.md`](04-beta-testing.md) (B1–B24): teclado y toques perdidos,
autoguardado, Deshacer de varios niveles, arranque en el temporizador con una línea de ayuda, "Foco" y numeración
01–04, casilla visible, botones que no se cortan, deslizador que acepta un toque, modo calma completo, Respirar con
"Terminar" y Escape, regiones vivas, foco, contraste y objetivos de 44 px. Además el shell mobile pasó a un
fragmento cargado bajo demanda (el bundle de desktop vuelve a 100,8 kB gzip).

## Limitaciones conocidas

- Emulación ≠ hardware: el comportamiento real del teclado, el rebote de iOS, las safe areas reales y la PWA
  instalada deben confirmarse en dispositivos físicos (ver `05-roadmap.md`).
- La radio de YouTube no carga en el entorno de pruebas (iframe de terceros), así que su reproducción no se ha
  podido verificar aquí.
- iPhone no tiene Fullscreen API para páginas: el modo inmersivo oculta la interfaz de la app pero no la del
  navegador (en la PWA instalada no hay interfaz de navegador, así que sí es completo).
