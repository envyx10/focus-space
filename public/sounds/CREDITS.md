# Sonidos

Todos los archivos `.wav` de esta carpeta son **PLACEHOLDER**: se generan de forma procedural con
`node scripts/gen-placeholder-sounds.mjs` (ruido filtrado + eventos sintéticos). No tienen derechos de terceros.

Para sustituirlos por grabaciones reales:

1. Descarga loops con licencia **CC0** (p. ej. Freesound filtrando por "Creative Commons 0", o Pixabay Sounds).
2. Recórtalos a 1–3 min y guárdalos con el mismo nombre (`<canal>-<variante>.<ext>`).
3. Si cambias la extensión, actualiza `src` en `src/audio/channels.ts` (y `chime` en `src/timer/useTimer.ts`).
4. Añade aquí una línea por archivo: nombre · autor · URL · licencia.

| Archivo | Autor | URL | Licencia |
|---|---|---|---|
| rain-suave, rain-ventana, rain-tormenta, rain-tienda | PLACEHOLDER (generado) | — | — |
| fire-hoguera, fire-chimenea | PLACEHOLDER (generado) | — | — |
| cafe-cafeteria, cafe-biblioteca | PLACEHOLDER (generado) | — | — |
| wind-suave, wind-bosque | PLACEHOLDER (generado) | — | — |
| chime | PLACEHOLDER (generado) | — | — |
