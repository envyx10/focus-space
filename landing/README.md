# Focus/Space — landing

The product page: a separate SPA (own entry, build and deploy) that shares the app's identity and, through the `@/` alias, its real code: the particle shaders and physics, the timer state machine, the Web Audio engine, the accent colours and the clock typefaces.

```bash
bun run dev:landing      # http://localhost:5174
bun run build:landing    # type-check + build to dist-landing/
bun run preview:landing
```

Set `VITE_APP_URL` to the app's address when deploying: every "Abrir Focus/Space" link goes there. Without it, dev points at `http://localhost:5173` and production at the GitHub repository.

On Netlify, a second site from this repository: build command `bun run build:landing`, publish directory `dist-landing`.

## Art direction

**One object: the app's own sphere.** The same particles, GPU simulation and shaders as the app (`src/features/visual`), drawn on a canvas the size of the window so its currents never hit an edge. It glides between chapters, takes the accent colour, tilts towards the pointer, parts where the pointer moves, and on the cover sheds a slow trail of dust. Nothing else on the page is made of particles: the details and the close leave the stage to the words.

Type: Swiss. Inter Tight, the app's own grotesque, for everything: bold headlines in sentence case, set tight and flush left; labels in the same face; text justified and hyphenated. One spacing scale. The close sets the name, FOCUS/SPACE, across the full width. No screenshots.

## Chapters

Portada · Todo en su sitio (the app's one screen, walked piece by piece) · El ritmo (one Pomodoro cycle to scale, from the app's presets) · Respira (the app's breathing guide, `breath.ts`, with the sphere swelling on each breath) · Los detalles · Preguntas (answers from the README) · Entra.

## Notes

- `src/field/AppSphere.ts` mounts the sphere and places it per chapter (`PLACES`); `sim.ts` is the app's simulation pass plus the pointer and the trail. It loads after the first paint; without WebGL the page keeps a static glow.
- Entrances use an IntersectionObserver and CSS (`setupReveals`); the closing name uses GSAP + ScrollTrigger. With `prefers-reduced-motion` the words are simply there, and the sphere moves between chapters without gliding, as in the app's reduced-motion mode.
