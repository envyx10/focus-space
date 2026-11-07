# Third-party licenses · Licencias de terceros

Focus/Space's own code is under [FSL-1.1-MIT](LICENSE) (© 2026 envyx10). This file lists what else is in, or loaded by, the app and under which terms.
*El código propio de Focus/Space está bajo [FSL-1.1-MIT](LICENSE) (© 2026 envyx10). Este archivo lista qué más contiene o carga la app y bajo qué condiciones.*

## What ships in the production bundle · Lo que va en el paquete de producción

These 13 packages (the runtime dependencies and everything they depend on) are compiled into the files served to users. Twelve are MIT, one is 0BSD: both permit commercial use and redistribution, and MIT asks that its copyright notice travels with the code (each package's own `LICENSE` file, in `node_modules`, is that notice).

| Package | Version | License |
|---|---|---|
| [@supabase/auth-js](https://github.com/supabase/supabase-js) | 2.118.0 | MIT |
| [@supabase/functions-js](https://github.com/supabase/supabase-js) | 2.118.0 | MIT |
| [@supabase/phoenix](https://github.com/supabase/phoenix) | 0.4.5 | MIT |
| [@supabase/postgrest-js](https://github.com/supabase/supabase-js) | 2.118.0 | MIT |
| [@supabase/realtime-js](https://github.com/supabase/supabase-js) | 2.118.0 | MIT |
| [@supabase/storage-js](https://github.com/supabase/supabase-js) | 2.118.0 | MIT |
| [@supabase/supabase-js](https://github.com/supabase/supabase-js) | 2.118.0 | MIT |
| [iceberg-js](https://github.com/supabase/iceberg-js) | 0.8.1 | MIT |
| [react](https://github.com/facebook/react) | 19.3.1 | MIT |
| [react-dom](https://github.com/facebook/react) | 19.3.1 | MIT |
| [scheduler](https://github.com/facebook/react) | 0.28.0 | MIT |
| [three](https://github.com/mrdoob/three.js) | 0.186.1 | MIT |
| [tslib](https://github.com/microsoft/tslib) | 2.8.1 | 0BSD |

The built app serves the full text of every one of these licenses, plus ours, at `/licenses.txt` (linked from Settings → About). It is generated at build time from `node_modules`; `licenses-plugin.ts` holds the list and a test checks it matches this table.
*La app publicada sirve el texto completo de todas estas licencias, más la nuestra, en `/licenses.txt` (enlazado desde Ajustes → Acerca de). Se genera al compilar desde `node_modules`; `licenses-plugin.ts` guarda la lista y un test comprueba que coincide con esta tabla.*

Versions are the ones in `bun.lock` when this file was written; check it for the current ones.
*Las versiones son las de `bun.lock` al escribir este archivo; consúltalo para las actuales.*

## Development tools (not shipped) · Herramientas de desarrollo (no se publican)

`@testing-library/*`, `@types/*`, `@vitejs/plugin-react`, `jsdom`, `oxlint`, `vite` and `vitest` are MIT. `typescript` is Apache-2.0. They are only used to build and test the project.

## Typefaces · Tipografías

The clock typefaces are **not** in this repository. The browser downloads them from [Google Fonts](https://fonts.google.com) when they are needed. All are under the [SIL Open Font License 1.1](https://openfontlicense.org), which allows free use, including commercial.

| Typeface | Used for |
|---|---|
| Inter Tight | Interface text |
| Space Grotesk | Clock face "Grotesk" |
| Syne | Clock face "Syne" (default) |
| JetBrains Mono | Clock face "Mono" |
| Unbounded | Clock face "Unbounded" |

"Suiza" (Swiss) uses Inter Tight.

## Sounds · Sonidos

All ambient sounds, the keyboard recordings and the end-of-phase chime are **CC0 1.0** recordings from [Freesound](https://freesound.org) (public domain: no attribution is required). Each file, its author and its URL are in [public/sounds/CREDITS.md](public/sounds/CREDITS.md). The keyboard files are trimmed excerpts, mixed down to mono, level-matched and looped with a short crossfade.

## Lofi radio · Radio lofi

The radio is an official YouTube embed (the IFrame Player API). The streams are not part of this repository and belong to their owners; YouTube's [Terms of Service](https://www.youtube.com/t/terms) apply. Focus/Space does not download, record or redistribute them.

## Trademarks · Marcas

"Cherry MX" is a trademark of Cherry GmbH, used only to describe the recorded switches. "Pomodoro Technique" is a registered trademark of Francesco Cirillo. React, Three.js, Supabase, Vite, TypeScript, YouTube, Google Fonts and the rest are trademarks of their owners and appear only to name the technologies used. Focus/Space is independent and not affiliated with or endorsed by any of them.
