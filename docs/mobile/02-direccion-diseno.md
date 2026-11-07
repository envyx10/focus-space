# Fase 2 · Dirección de diseño mobile

## Principio

Focus/Space tiene una identidad muy marcada: negro #0b0b0b, Inter Tight, micro-etiquetas en mayúsculas con
tracking, secciones numeradas (01, 02…), filetes de 1 px, esquinas rectas, un único acento (naranja por defecto,
configurable) y un reloj gigante tabular con los dos puntos en cuadrados de acento. **Esa identidad se conserva
íntegra.** Lo que cambia es la *estructura*: de "página web reflujada" a "app de pestañas", con los patrones que
los usuarios ya conocen de las apps nativas de iOS y Android.

## Referencias conceptuales (patrones, no estética)

| Patrón | Dónde se ve | Cómo lo aplicamos |
| --- | --- | --- |
| Barra de pestañas con icono + etiqueta, 4 destinos | Reloj, Música, Fitness (iOS); Material 3 navigation bar | *Foco · Tareas · Sonido · Ajustes*. Activa = icono y etiqueta en acento + filete superior de 2 px (rasgo propio). |
| Mini-reproductor persistente | Música, Spotify, Podcasts | **Mini-temporizador** sobre la barra cuando el Pomodoro corre y no estás en Foco: fase · tiempo · pausa. Tocarlo vuelve a Foco. |
| Título grande que se compacta al hacer scroll | Recordatorios, Ajustes, Notas (iOS) | Cada pantalla abre con "01 / Tareas" grande; al desplazarse aparece una cabecera compacta con filete. |
| Hojas inferiores con arrastre para cerrar | Mapas, Buscar, Material bottom sheets | `Sheet` reutilizable: elegir tarea activa, detalle de tarea, confirmaciones, elegir sonido, menú de lista. |
| Filas con acciones por deslizamiento | Mail, Recordatorios, Gmail | Deslizar → completar; deslizar ← borrar (con deshacer). Siempre con alternativa accesible en el detalle. |
| Compositor fijo sobre el teclado | Recordatorios ("Nuevo recordatorio"), Mensajes | El campo "+ Nueva tarea" vive abajo y sube con el teclado (`visualViewport`); la barra de pestañas se oculta al escribir. |
| Lista agrupada de ajustes | Ajustes de iOS, Android Settings | Grupos con cabecera micro, filas de 48 px, interruptores táctiles. |
| Aviso flotante con deshacer | Gmail, Fotos | Toast sobre la barra con "Deshacer" durante 8 s. |
| Acción principal en la zona del pulgar | Reloj › Temporizador | Botón Iniciar/Pausar a ancho completo en el tercio inferior; secundarias como botones cuadrados de icono. |

## Arquitectura de pantallas

```
┌──────────── safe-area-top ───────────┐
│ 02 FOCO · Sesión 03 · En marcha   🔈 ⛶│  ← estado siempre visible
│ [ POMODORO | LIBRE | HORA ]   ◌ Respirar│
│                                       │
│            25:00 ᵐⁱⁿ   (esfera 3D)     │
│                                       │
│ ▸ Tarea activa: Revisar propuesta  ›  │  ← abre hoja para elegir
│ [↺] [+5] [⏭]   [■■■■ PAUSAR ■■■■■]     │  ← zona del pulgar
├───────────────────────────────────────┤
│  ⏱ Foco   ☰ Tareas   ∿ Sonido   ⚙ Ajustes │
└──────────── safe-area-bottom ────────┘
```

- **Foco**: estado (sesión, fase) → selector de modo → reloj → tarea activa → acciones. La tipografía del reloj se
  mueve a Ajustes › Pantalla. Respirar es una acción, no un modo del segmentado. El modo inmersivo es un botón de
  icono; en él se toca la pantalla para mostrar "Salir".
- **Tareas**: título grande con pendientes, lista con filas de 56 px, número como casilla, punto si tiene notas,
  flecha de acento si es la tarea activa. Tocar abre el detalle (hoja a pantalla completa con el editor Markdown
  existente). Menú "···" con limpiar hechas / exportar / importar.
- **Sonido**: tarjeta de radio (el bloque de acento actual) con play grande, emisora anterior/siguiente y
  deslizador real; botón maestro de silencio; los 5 favoritos como filas con deslizador ancho; "Más sonidos";
  mezclas guardadas como chips.
- **Ajustes**: cuenta, Pomodoro, avisos, pantalla (idioma, calma, tamaño de texto, acento, tipografía),
  estadísticas. Los atajos de teclado solo se muestran si hay puntero fino.

## Movimiento

- Cambio de pestaña: fundido + 6 px de desplazamiento, 180 ms `ease-out`. Sin animación con *reduced motion*.
- Hojas: entrada 380 ms con curva iOS `cubic-bezier(0.32, 0.72, 0, 1)`; arrastre 1:1 con el dedo, cierre por
  distancia (>30 %) o velocidad (>0,5 px/ms), rebote si no.
- Pulsación: `scale(0.97)` en `:active`, 100 ms, para todos los botones táctiles.
- Filas deslizables: siguen al dedo con resistencia pasado el umbral; la acción se confirma al soltar.
- Vibración háptica breve (Android, `navigator.vibrate`) al completar, iniciar y pausar; iOS lo ignora.

## Reglas de plataforma (iOS y Android)

`100dvh`, `env(safe-area-inset-*)` en cabecera/barra/hojas, `overscroll-behavior: none` en la raíz y `contain`
en cada scroll interno, sin `tap-highlight`, `user-select: none` solo en controles, `touch-action: manipulation`
en botones, `pan-y` en deslizadores y filas deslizables, campos a 16 px, `enterkeyhint`,
`interactive-widget=resizes-content`, hover solo bajo `(hover: hover) and (pointer: fine)`.

## Límites

- Desktop (≥1024 px) renderiza exactamente el mismo árbol de componentes y CSS que antes.
- No se elimina ninguna función: todas siguen accesibles en mobile (se lista el mapa en `03-decisiones.md`).
- Sin dependencias nuevas: hojas, gestos y deslizadores se implementan con Pointer Events.
