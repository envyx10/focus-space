# Third-party licenses · Licencias de terceros

Focus/Space's own code is under [FSL-1.1-MIT](LICENSE), © 2026 Pablo Gil Diaz (envyx10). This file lists what else is in, or loaded by, the app and under which terms.
*El código propio de Focus/Space está bajo [FSL-1.1-MIT](LICENSE), © 2026 Pablo Gil Diaz (envyx10). Este archivo lista qué más contiene o carga la app y bajo qué condiciones.*

## What ships in the production bundle · Lo que va en el paquete de producción

These 87 packages (the runtime dependencies and everything they depend on) are compiled into the files served to users. 84 are MIT, one is ISC, one BSD-3-Clause and one 0BSD: all permit commercial use and redistribution, and MIT, ISC and BSD ask that their copyright notice travels with the code (each package's own `LICENSE` file, in `node_modules`, is that notice).
*Estos 87 paquetes (las dependencias de ejecución y todo aquello de lo que dependen) se compilan en los archivos que reciben los usuarios. 84 son MIT, uno ISC, uno BSD-3-Clause y uno 0BSD: todas permiten el uso comercial y la redistribución, y MIT, ISC y BSD piden que su aviso de copyright acompañe al código (el archivo `LICENSE` de cada paquete, en `node_modules`, es ese aviso).*

### App and sync · App y sincronización

The Supabase client and its dependencies are only bundled when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set; without them the app is local-only and the build leaves them out.
*El cliente de Supabase y sus dependencias solo entran en el paquete si están definidas `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`; sin ellas la app funciona solo en local y el build las deja fuera.*

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

### Markdown in task descriptions · Markdown en las descripciones de tareas

react-markdown, remark-gfm and rehype-highlight, plus what they depend on. They live in a separate chunk that is only downloaded when a description is shown.
*react-markdown, remark-gfm y rehype-highlight, más aquello de lo que dependen. Van en un archivo aparte que solo se descarga al mostrar una descripción.*

| Package | Version | License |
|---|---|---|
| [@ungap/structured-clone](https://github.com/ungap/structured-clone) | 1.4.0 | ISC |
| [bail](https://github.com/wooorm/bail) | 2.0.2 | MIT |
| [ccount](https://github.com/wooorm/ccount) | 2.0.1 | MIT |
| [comma-separated-tokens](https://github.com/wooorm/comma-separated-tokens) | 2.0.3 | MIT |
| [decode-named-character-reference](https://github.com/wooorm/decode-named-character-reference) | 1.3.0 | MIT |
| [devlop](https://github.com/wooorm/devlop) | 1.1.0 | MIT |
| [escape-string-regexp](https://github.com/sindresorhus/escape-string-regexp) | 5.0.0 | MIT |
| [estree-util-is-identifier-name](https://github.com/syntax-tree/estree-util-is-identifier-name) | 3.0.0 | MIT |
| [extend](https://github.com/justmoon/node-extend) | 3.0.2 | MIT |
| [hast-util-to-jsx-runtime](https://github.com/syntax-tree/hast-util-to-jsx-runtime) | 2.3.7 | MIT |
| [hast-util-to-text](https://github.com/syntax-tree/hast-util-to-text) | 4.0.3 | MIT |
| [hast-util-whitespace](https://github.com/syntax-tree/hast-util-whitespace) | 3.0.0 | MIT |
| [highlight.js](https://github.com/highlightjs/highlight.js) | 11.11.2 | BSD-3-Clause |
| [html-url-attributes](https://github.com/rehypejs/rehype-minify/tree/main/packages/html-url-attributes) | 3.0.1 | MIT |
| [inline-style-parser](https://github.com/remarkablemark/inline-style-parser) | 0.2.9 | MIT |
| [is-plain-obj](https://github.com/sindresorhus/is-plain-obj) | 4.1.0 | MIT |
| [longest-streak](https://github.com/wooorm/longest-streak) | 3.1.0 | MIT |
| [lowlight](https://github.com/wooorm/lowlight) | 3.3.0 | MIT |
| [markdown-table](https://github.com/wooorm/markdown-table) | 3.1.0 | MIT |
| [mdast-util-find-and-replace](https://github.com/syntax-tree/mdast-util-find-and-replace) | 3.0.4 | MIT |
| [mdast-util-from-markdown](https://github.com/syntax-tree/mdast-util-from-markdown) | 2.1.0 | MIT |
| [mdast-util-gfm](https://github.com/syntax-tree/mdast-util-gfm) | 3.1.0 | MIT |
| [mdast-util-gfm-autolink-literal](https://github.com/syntax-tree/mdast-util-gfm-autolink-literal) | 2.0.1 | MIT |
| [mdast-util-gfm-footnote](https://github.com/syntax-tree/mdast-util-gfm-footnote) | 2.1.0 | MIT |
| [mdast-util-gfm-strikethrough](https://github.com/syntax-tree/mdast-util-gfm-strikethrough) | 2.0.1 | MIT |
| [mdast-util-gfm-table](https://github.com/syntax-tree/mdast-util-gfm-table) | 2.0.1 | MIT |
| [mdast-util-gfm-task-list-item](https://github.com/syntax-tree/mdast-util-gfm-task-list-item) | 2.0.0 | MIT |
| [mdast-util-phrasing](https://github.com/syntax-tree/mdast-util-phrasing) | 4.1.0 | MIT |
| [mdast-util-to-hast](https://github.com/syntax-tree/mdast-util-to-hast) | 13.2.1 | MIT |
| [mdast-util-to-markdown](https://github.com/syntax-tree/mdast-util-to-markdown) | 2.2.2 | MIT |
| [mdast-util-to-string](https://github.com/syntax-tree/mdast-util-to-string) | 4.0.0 | MIT |
| [micromark](https://github.com/micromark/micromark/tree/main/packages/micromark) | 4.0.3 | MIT |
| [micromark-core-commonmark](https://github.com/micromark/micromark/tree/main/packages/micromark-core-commonmark) | 2.0.4 | MIT |
| [micromark-extension-gfm](https://github.com/micromark/micromark-extension-gfm) | 3.0.0 | MIT |
| [micromark-extension-gfm-autolink-literal](https://github.com/micromark/micromark-extension-gfm-autolink-literal) | 2.1.0 | MIT |
| [micromark-extension-gfm-footnote](https://github.com/micromark/micromark-extension-gfm-footnote) | 2.1.0 | MIT |
| [micromark-extension-gfm-strikethrough](https://github.com/micromark/micromark-extension-gfm-strikethrough) | 2.1.0 | MIT |
| [micromark-extension-gfm-table](https://github.com/micromark/micromark-extension-gfm-table) | 2.1.2 | MIT |
| [micromark-extension-gfm-task-list-item](https://github.com/micromark/micromark-extension-gfm-task-list-item) | 2.1.0 | MIT |
| [micromark-factory-destination](https://github.com/micromark/micromark/tree/main/packages/micromark-factory-destination) | 2.0.1 | MIT |
| [micromark-factory-label](https://github.com/micromark/micromark/tree/main/packages/micromark-factory-label) | 2.0.1 | MIT |
| [micromark-factory-space](https://github.com/micromark/micromark/tree/main/packages/micromark-factory-space) | 2.1.0 | MIT |
| [micromark-factory-title](https://github.com/micromark/micromark/tree/main/packages/micromark-factory-title) | 2.0.1 | MIT |
| [micromark-factory-whitespace](https://github.com/micromark/micromark/tree/main/packages/micromark-factory-whitespace) | 2.0.1 | MIT |
| [micromark-util-character](https://github.com/micromark/micromark/tree/main/packages/micromark-util-character) | 2.1.1 | MIT |
| [micromark-util-chunked](https://github.com/micromark/micromark/tree/main/packages/micromark-util-chunked) | 2.0.1 | MIT |
| [micromark-util-classify-character](https://github.com/micromark/micromark/tree/main/packages/micromark-util-classify-character) | 2.0.1 | MIT |
| [micromark-util-combine-extensions](https://github.com/micromark/micromark/tree/main/packages/micromark-util-combine-extensions) | 2.0.1 | MIT |
| [micromark-util-decode-numeric-character-reference](https://github.com/micromark/micromark/tree/main/packages/micromark-util-decode-numeric-character-reference) | 2.0.2 | MIT |
| [micromark-util-decode-string](https://github.com/micromark/micromark/tree/main/packages/micromark-util-decode-string) | 2.0.1 | MIT |
| [micromark-util-edit-map](https://github.com/micromark/micromark/tree/main/packages/micromark-util-edit-map) | 1.0.0 | MIT |
| [micromark-util-html-tag-name](https://github.com/micromark/micromark/tree/main/packages/micromark-util-html-tag-name) | 2.0.1 | MIT |
| [micromark-util-normalize-identifier](https://github.com/micromark/micromark/tree/main/packages/micromark-util-normalize-identifier) | 2.0.1 | MIT |
| [micromark-util-resolve-all](https://github.com/micromark/micromark/tree/main/packages/micromark-util-resolve-all) | 2.0.1 | MIT |
| [micromark-util-sanitize-uri](https://github.com/micromark/micromark/tree/main/packages/micromark-util-sanitize-uri) | 2.0.1 | MIT |
| [micromark-util-subtokenize](https://github.com/micromark/micromark/tree/main/packages/micromark-util-subtokenize) | 2.1.0 | MIT |
| [property-information](https://github.com/wooorm/property-information) | 7.2.0 | MIT |
| [react-markdown](https://github.com/remarkjs/react-markdown) | 10.1.0 | MIT |
| [rehype-highlight](https://github.com/rehypejs/rehype-highlight) | 7.0.2 | MIT |
| [remark-gfm](https://github.com/remarkjs/remark-gfm) | 4.0.1 | MIT |
| [remark-parse](https://github.com/remarkjs/remark/tree/main/packages/remark-parse) | 11.0.0 | MIT |
| [remark-rehype](https://github.com/remarkjs/remark-rehype) | 11.1.2 | MIT |
| [space-separated-tokens](https://github.com/wooorm/space-separated-tokens) | 2.0.2 | MIT |
| [style-to-object](https://github.com/remarkablemark/style-to-object) | 2.0.2 | MIT |
| [trim-lines](https://github.com/wooorm/trim-lines) | 3.0.1 | MIT |
| [trough](https://github.com/wooorm/trough) | 2.2.0 | MIT |
| [unified](https://github.com/unifiedjs/unified) | 11.0.5 | MIT |
| [unist-util-is](https://github.com/syntax-tree/unist-util-is) | 6.0.1 | MIT |
| [unist-util-position](https://github.com/syntax-tree/unist-util-position) | 5.0.0 | MIT |
| [unist-util-stringify-position](https://github.com/syntax-tree/unist-util-stringify-position) | 4.0.0 | MIT |
| [unist-util-visit](https://github.com/syntax-tree/unist-util-visit) | 5.2.0 | MIT |
| [unist-util-visit-parents](https://github.com/syntax-tree/unist-util-visit-parents) | 6.1.0 | MIT |
| [vfile](https://github.com/vfile/vfile) | 6.0.3 | MIT |
| [vfile-message](https://github.com/vfile/vfile-message) | 4.0.3 | MIT |

The built app serves the full text of every one of these licenses, plus ours, at `/licenses.txt` (linked from Settings → About). It is generated at build time from `node_modules`; `licenses-plugin.ts` holds the list, a test checks it matches these tables, and the build fails if the bundle contains a package that is not on it.
*La app publicada sirve el texto completo de todas estas licencias, más la nuestra, en `/licenses.txt` (enlazado desde Ajustes → Acerca de). Se genera al compilar desde `node_modules`; `licenses-plugin.ts` guarda la lista, un test comprueba que coincide con estas tablas y el build falla si el paquete contiene una dependencia que no está en ella.*

Versions are the ones in `bun.lock` when this file was written; check it for the current ones.
*Las versiones son las de `bun.lock` al escribir este archivo; consúltalo para las actuales.*

## Landing page (`landing/`) · Página del producto

The landing is a separate build (`bun run build:landing`). Besides React and three.js (above), it ships one more package:
*La landing es un build aparte (`bun run build:landing`). Además de React y three.js (arriba), incluye un paquete más:*

| Package | Version | License |
|---|---|---|
| [gsap](https://gsap.com) | 3.15.1 | [Standard "no charge" license](https://gsap.com/standard-license) |

GSAP is free to use, including commercially; its license is not an open-source one and it is not part of the app's own bundle.
*GSAP es de uso gratuito, también comercial; su licencia no es de código abierto y no forma parte del paquete de la app.*

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

The migraine, frequency and spatial channels are not recordings: [`src/audio/synth.ts`](src/audio/synth.ts) generates them in the browser, so they are part of the code and under its license.
*Los canales de migraña, frecuencias y espacial no son grabaciones: [`src/audio/synth.ts`](src/audio/synth.ts) los genera en el navegador, así que forman parte del código y de su licencia.*

## Lofi radio · Radio lofi

The radio is an official YouTube embed (the IFrame Player API). The streams are not part of this repository and belong to their owners; YouTube's [Terms of Service](https://www.youtube.com/t/terms) apply. Focus/Space does not download, record or redistribute them.

## Logo and name · Logo y nombre

The name, logo and icons are not under FSL: see [TRADEMARK.md](TRADEMARK.md).
*El nombre, el logo y los iconos no están bajo FSL: ver [TRADEMARK.md](TRADEMARK.md).*

## Trademarks · Marcas

"Cherry MX" is a trademark of Cherry GmbH, used only to describe the recorded switches. "Pomodoro Technique" is a registered trademark of Francesco Cirillo. React, Three.js, Supabase, Vite, TypeScript, YouTube, Google Fonts and the rest are trademarks of their owners and appear only to name the technologies used. Focus/Space is independent and not affiliated with or endorsed by any of them.
