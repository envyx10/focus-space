# Contributing · Contribuir

**English**

Contributions are welcome: ambient sounds, typefaces, translations and bug fixes. Setup and scripts are in the [README](README.md#quick-start).

1. Fork the repo and create a branch: `git checkout -b feat/my-idea`
2. Make your change and keep `bun run test` and `bun run lint` green.
3. Open a pull request explaining what it changes and why.

## What you agree to

By opening a pull request you confirm that:

1. **You wrote it**, or you have the right to submit it, and it is not copied from code under an incompatible license.
2. **It goes under the project's license.** Your contribution is released under [FSL-1.1-MIT](LICENSE), like the rest of the code.
3. **The author may relicense it.** You grant the author a perpetual, worldwide, royalty-free licence to use, modify and distribute your contribution under any other terms, including a commercial or closed-source licence. You keep the copyright on what you wrote. This is what lets the project change its license later without asking every contributor again.
4. **No third-party material** goes in without being listed: sounds must be **CC0** (or otherwise free to redistribute) and added to [public/sounds/CREDITS.md](public/sounds/CREDITS.md); fonts must be under the SIL OFL; any new dependency goes into [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md) with its license.
5. **No name or logo rights.** Contributing does not give you rights over the name, logo or identity ([TRADEMARK.md](TRADEMARK.md)), and nothing you contribute may include a third party's.

Sign your commits off with `git commit -s` (a `Signed-off-by:` line, the [Developer Certificate of Origin](https://developercertificate.org)). It is how you state point 1.

Adding a language: copy `src/i18n/en.ts`, translate it and register it in `src/i18n/index.tsx`.

---

**Español**

Las contribuciones son bienvenidas: sonidos ambientales, tipografías, traducciones y correcciones. La instalación y los scripts están en el [README](README.es.md#inicio-rápido).

1. Haz un fork y crea una rama: `git checkout -b feat/mi-idea`
2. Haz tu cambio y mantén `bun run test` y `bun run lint` en verde.
3. Abre una pull request explicando qué cambia y por qué.

## A qué te comprometes

Al abrir una pull request confirmas que:

1. **Lo escribiste tú**, o tienes derecho a aportarlo, y no está copiado de código con una licencia incompatible.
2. **Entra bajo la licencia del proyecto.** Tu aportación se publica bajo [FSL-1.1-MIT](LICENSE), igual que el resto del código.
3. **El autor puede relicenciarla.** Concedes al autor una licencia perpetua, mundial y sin royalties para usar, modificar y distribuir tu aportación bajo cualquier otra condición, también comercial o de código cerrado. Conservas el copyright de lo que escribiste. Esto permite que el proyecto cambie de licencia sin pedir permiso de nuevo a cada colaborador.
4. **Nada de terceros sin declarar:** los sonidos deben ser **CC0** (o libres de redistribuir) y constar en [public/sounds/CREDITS.md](public/sounds/CREDITS.md); las tipografías, SIL OFL; cualquier dependencia nueva va a [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md) con su licencia.
5. **Sin derechos sobre el nombre ni el logo.** Contribuir no te da derechos sobre el nombre, el logo ni la identidad ([TRADEMARK.md](TRADEMARK.md)), y nada de lo que aportes puede incluir los de un tercero.

Firma tus commits con `git commit -s` (una línea `Signed-off-by:`, el [Developer Certificate of Origin](https://developercertificate.org)). Es la forma de declarar el punto 1.

Añadir un idioma: copia `src/i18n/en.ts`, tradúcelo y regístralo en `src/i18n/index.tsx`.
