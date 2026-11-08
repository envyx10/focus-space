# Fase 6 · Cierre y roadmap

## Estado final verificado

| Comprobación | Resultado |
| --- | --- |
| Tests | **206/206** (190 previos + 16 del shell mobile, incluidas regresiones de la beta) |
| Build / lint | OK / 0 errores (solo avisos con el mismo patrón que ya existía) |
| Desktop intacto | Capturas **idénticas byte a byte** al commit base a 1440×900, 1024×700 y 1920×1080, con y sin Ajustes abierto |
| Bundle desktop | 100,8 kB gzip (base: 101,5 kB). El shell mobile es un fragmento aparte (10,9 kB JS + 6,2 kB CSS gzip) que desktop nunca descarga |
| Recorridos reales | WebKit: iPhone 14, 14 horizontal, SE, 12 mini · Chromium: Pixel 7, Galaxy S9+ (360 px), iPad Mini |
| Accesibilidad | 17 de los hallazgos de la auditoría corregidos y verificados (ver `04-beta-testing.md`) |

## Cómo ver la versión mobile en un teléfono simulado

Con `bun run dev`, abre `http://localhost:5173/dev/phone.html`: la app en vivo dentro de un marco de iPhone 15,
iPhone SE o Pixel 7 (vertical u horizontal), con barra de estado, Dynamic Island/cámara y las safe areas del
dispositivo aplicadas. Se recarga sola con cada cambio. Es solo de desarrollo: no entra en el build.

## Decisiones importantes (resumen)

1. Árbol mobile propio por debajo de 1024 px; desktop sin cambios. Misma lógica (hooks) para ambos.
2. Cuatro pestañas montadas a la vez (conservan estado), mini-temporizador, hojas inferiores propias, deslizador
   con bloqueo de eje, teclado gestionado con `visualViewport` + foco.
3. Sin dependencias nuevas; el shell mobile se carga bajo demanda.
4. Dos correcciones compartidas que benefician también a desktop: el autoguardado de notas que podía perder teclas
   (`TasksFocus.tsx`) y el iframe oculto de YouTube fuera del orden de tabulación (`useYouTubeLofi.ts`). Ninguna
   cambia el aspecto de desktop.

Detalle en [`03-decisiones.md`](03-decisiones.md).

## Roadmap propuesto

### Ahora (antes de fusionar)

- [ ] **Probar en hardware**: un iPhone y un Android de gama media, en Safari/Chrome y como PWA instalada. Lista:
      teclado al escribir notas y tareas, safe areas reales, rebote/pull-to-refresh, háptica en Android, radio y
      ambientes con la pantalla bloqueada, giro de pantalla. (Emulación ≠ dispositivo.)
- [ ] Fusionar con el trabajo sin commitear de `main` (grupo "Acerca de" en Ajustes y licencias): el shell mobile no
      lo incluye todavía; añadir el grupo "Acerca de" a `SettingsView` al fusionar.

### Siguiente iteración (P1)

- Recordar el último modo del temporizador (pedido por 3 perfiles; sin coste en pantalla).
- Casillas de Markdown tocables en el detalle (hoy `disabled`).
- Explicación de Respirar ("¿Por qué así?") como `Sheet` modal, plegada tras el primer uso.
- Contraste de los segundos del reloj (`--faint`, 2,85:1): decidir con diseño si se sube o se acepta como texto
  decorativo con alternativa (`aria-label` ya da la hora completa).
- Icono maskable propio para Android (hoy un solo PNG `any maskable`).

### Después (P2–P3, requieren validación con usuarios reales)

- Reordenar tareas arrastrando.
- Exportar con la hoja de compartir del sistema (`navigator.share`) y exportar una nota como `.md`.
- Presets de ambiente de un toque (lluvia+café, ruido rosa…).
- "Hoy / racha" opcional en Foco (dividió al panel: validar).
- Mezclas que guarden también la radio.
- Notificación/recordatorio de fin de fase en la PWA instalada (iOS 16.4+ con PWA instalada; Android).
- Reemplazar la simulación por 5 sesiones con personas reales de los mismos perfiles.

### Deuda técnica detectada

- CSS de `break.css` y `tasksFocus.css` aún tiene reglas `@media (max-width: 1023px)` del responsive antiguo que ya
  no aplican (no hay `.app` en mobile, y `TasksFocus` no se usa allí). Limpiar en un PR aparte.
- `useShortcuts` podría ignorar los atajos detrás de cualquier `aria-modal` también en desktop (hoy solo mobile,
  para no cambiar el comportamiento de desktop en esta rama).
