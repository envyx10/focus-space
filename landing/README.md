# Focus/Space — landing

The product page: a separate SPA (own entry, build and deploy) that shares the app's identity and, through the `@/` alias, its real code: the particle shaders and physics, the timer state machine, the Web Audio engine, the accent colours and the clock typefaces.

```bash
bun run dev:landing      # http://localhost:5174
bun run build:landing    # type-check + build to dist-landing/
bun run preview:landing
```

"Abrir la app" points at the deployed app, https://focus-space-envyx10.netlify.app (in dev, the local app on :5173). Set `VITE_APP_URL` to send it somewhere else, e.g. a custom domain.

**Deploy**: a second Netlify site from this same repository, with the environment variable `FS_SITE=landing`. The root `netlify.toml` then builds the landing into `dist`; the app's site (without that variable) keeps building the app. The landing ships only its own `landing/public` (favicon and icon), about 1 MB.

## Art direction

**One object: the app's own sphere.** The same particles, GPU simulation and shaders as the app (`src/features/visual`), drawn on a canvas the size of the window so its currents never hit an edge. It glides between chapters, takes the accent colour, tilts towards the pointer, parts where the pointer moves, and on the cover sheds a slow trail of dust. Nothing else on the page is made of particles: the details and the close leave the stage to the words.

Type: Swiss. Inter Tight, the app's own grotesque, for everything: bold headlines in sentence case, set tight and flush left; labels in the same face; text justified and hyphenated. One spacing scale. The close sets the name, FOCUS/SPACE, across the full width. No screenshots.

## Chapters

Portada · Todo en su sitio (the app's one screen, walked piece by piece) · El ritmo (one Pomodoro cycle to scale, from the app's presets) · Respira (the app's breathing guide, `breath.ts`, with the sphere swelling on each breath) · Los detalles · Preguntas (answers from the README) · Entra.

## Notes

- `src/field/AppSphere.ts` mounts the sphere and places it per chapter (`PLACES`); `sim.ts` is the app's simulation pass plus the pointer and the trail. It loads after the first paint; without WebGL the page keeps a static glow.
- Entrances use an IntersectionObserver and CSS (`setupReveals`); the closing name uses GSAP + ScrollTrigger. With `prefers-reduced-motion` the words are simply there, and the sphere moves between chapters without gliding, as in the app's reduced-motion mode.
