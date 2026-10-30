# Focus/Space v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir la SPA de escritorio Focus/Space v1: tareas (locales o sincronizadas con cuenta), temporizador Pomodoro/libre gigante, mezclador de ambientes con variantes, lofi de YouTube y esfera de partículas reactiva, con estética suiza oscura.

**Architecture:** SPA React + TypeScript sin router (una sola pantalla). La lógica vive en módulos puros testeables (`timer`, `tasks`, `audio/levels`, `prefs`) y los componentes solo pintan. El audio de ambientes pasa por un único `AudioContext` con un `GainNode` por canal hacia un `AnalyserNode` que alimenta la esfera. Las tareas usan un repositorio intercambiable: `localStorage` sin sesión y Supabase con sesión.

**Tech Stack:** Bun · Vite · React 18 + TypeScript · Vitest + Testing Library (jsdom) · Supabase JS v2 · YouTube IFrame Player API · Canvas 2D (esfera y grano) · Netlify.

**Spec:** `docs/superpowers/specs/2026-10-30-focus-space-design.md`

## Global Constraints

- Bun para todo: `bun install`, `bun run dev`, `bun run test`, `bun run build`. Nada de npm/yarn/pnpm ni sus lockfiles.
- Colores exactos: fondo `#0b0b0b`, texto `#ecebe6`, filetes `#262626`, acento único `#ff4b1f`. Sin más colores de acento.
- Tipografía: Inter Tight (Google Fonts), pesos 300/400/500/700/800.
- Retícula de 12 columnas; tareas en columnas 1–4; focus en columnas 5–12; franja inferior de 120px.
- Solo escritorio: ancho mínimo de diseño 1024px, sin layout móvil.
- Pomodoro: 25 min de trabajo, 5 de descanso, descanso largo cada 4 bloques de trabajo. Duración del descanso largo: 15 min (decisión del plan).
- Grano: opacidad 0.045, `mix-blend-mode: overlay`, refresco cada 6 frames.
- Esfera: 1600 puntos, distribución Fibonacci.
- Solo las tareas van a Supabase; las preferencias van a `localStorage`.
- La app arranca y funciona entera sin variables de Supabase (modo solo local).
- Sonidos solo con licencia CC0 o equivalente, servidos desde `public/sounds/`, con su atribución en `public/sounds/CREDITS.md`.
- Sin Spotify, sin enlace "Spotify ↗".
- Referencia visual: `.superpowers/brainstorm/1391-1793342371/content/swiss-3d.html`, variante 1. Copiar estilos de ahí en vez de reinventarlos.

## Review Focus

1. **Autoplay bloqueado:** el `AudioContext` nace `suspended`. La primera interacción (pulsar play o mover un volumen) debe reanudarlo; mover un volumen antes no puede lanzar error ni quedarse mudo para siempre. Test en Task 5.
2. **Pestaña en segundo plano:** los navegadores ralentizan `setInterval`. El temporizador calcula el tiempo con marcas de `Date.now()`, así que un `tick` con mucho tiempo transcurrido debe cruzar una o varias fases correctamente. Test en Task 3.
3. **`localStorage` corrupto o de una versión antigua** (JSON inválido, campos que faltan): se usan los valores por defecto y la app no se rompe. Test en Tasks 4 y 5.
4. **Fusión al iniciar sesión** con tareas duplicadas o dos tareas activas (una local y otra remota): resultado sin duplicados y con como mucho una tarea activa. Test en Task 8.
5. **YouTube bloqueado** (bloqueador de anuncios, sin red) o variables de Supabase ausentes: el bloque lofi muestra "No disponible", el enlace Cuenta ofrece solo modo local y el resto de la app sigue funcionando. Tests en Tasks 7 y 8.

---

## File Structure

```
focus-space/
  index.html                      fuentes, <div id="root">
  netlify.toml                    build + SPA redirect
  .env.example                    VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
  docs/SETUP.md                   guía de cuentas (Supabase, Netlify, Google, GitHub)
  supabase/schema.sql             tabla tasks + RLS
  public/sounds/*.mp3, CREDITS.md
  src/
    main.tsx, App.tsx             composición de la retícula
    styles/tokens.css, app.css    tokens y retícula
    layout/Header.tsx             marca · sesión NN · fecha · Cuenta
    visual/Grain.tsx              canvas de grano
    visual/sphere.ts              fibonacciSphere, projectPoint (puros)
    visual/Sphere.tsx             canvas animado
    timer/timer.ts                reducer puro
    timer/useTimer.ts             hook con rAF/intervalo + localStorage
    timer/FocusPanel.tsx          reloj gigante + controles + tarea activa
    tasks/types.ts                Task, TaskRepo
    tasks/localRepo.ts
    tasks/supabaseRepo.ts
    tasks/merge.ts                mergeTasks
    tasks/useTasks.ts
    tasks/TasksPanel.tsx
    audio/channels.ts             CHANNELS (canales y variantes)
    audio/engine.ts               createEngine
    audio/levels.ts               bandLevels
    audio/MixerBar.tsx
    prefs/prefs.ts                loadPrefs/savePrefs
    lofi/useYouTubeLofi.ts
    lofi/LofiBlock.tsx
    auth/supabase.ts              cliente o null
    auth/useSession.ts
    auth/AccountMenu.tsx
  src/**/*.test.ts(x)             junto a cada módulo
```

---

### Task 1: Scaffold, tokens y retícula vacía

**Files:**
- Create: proyecto Vite (`bun create vite . --template react-ts`), `src/styles/tokens.css`, `src/styles/app.css`, `src/App.tsx`, `src/App.test.tsx`, `vitest.config.ts` (o bloque `test` en `vite.config.ts`), `.gitignore` (añadir `.superpowers/`, `.env`)
- Modify: `index.html` (Inter Tight desde Google Fonts, `<title>Focus/Space</title>`)

**Interfaces:**
- Produces: `<App/>` con cinco regiones con `data-region`: `header`, `tasks`, `focus`, `mixer`, `lofi`. CSS vars `--bg --fg --line --accent`.

- [ ] **Step 1:** `git init` en `focus-space/` y commit del spec y el plan existentes.
- [ ] **Step 2:** Scaffold con Bun y `bun add -d vitest @testing-library/react @testing-library/jest-dom jsdom`. Script `"test": "vitest run"`.
- [ ] **Step 3: Write the failing test** `App renders the five grid regions`: `render(<App/>)` y comprobar que existen los cinco `[data-region=...]`.
- [ ] **Step 4:** `bun run test` → FAIL.
- [ ] **Step 5:** Implementar la retícula: `grid-template-columns: repeat(12,1fr)`, `grid-template-rows: 44px 1fr 120px`, `height: 100vh`, `min-width: 1024px`, tokens de Global Constraints. Copiar la estructura de la referencia visual.
- [ ] **Step 6:** `bun run test` → PASS; `bun run build` → sin errores.
- [ ] **Step 7:** Commit `feat: scaffold vite app with swiss grid`.

### Task 2: Cabecera y grano

**Files:**
- Create: `src/layout/Header.tsx`, `src/layout/Header.test.tsx`, `src/visual/Grain.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `Header({ sessionNumber: number, now: Date, accountSlot: ReactNode })`. `Grain()`, sin props, fijo sobre toda la pantalla con `pointer-events: none`.

- [ ] **Step 1: Failing test** `Header shows zero-padded session and date`: `sessionNumber=3`, `now=new Date('2026-10-30')` → contiene `Sesión 03` y `Jue 30.10`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implementar `Header` (formato de fecha con `Intl.DateTimeFormat('es-ES', { weekday: 'short' })` en mayúsculas de etiqueta) y `Grain`: canvas a resolución de viewport con ruido regenerado cada 6 frames, que deja de animar si `prefers-reduced-motion: reduce`.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat: header and film grain`.

### Task 3: Temporizador (lógica + reloj)

**Files:**
- Create: `src/timer/timer.ts`, `src/timer/timer.test.ts`, `src/timer/useTimer.ts`, `src/timer/FocusPanel.tsx`, `src/timer/FocusPanel.test.tsx`

**Interfaces:**
- Produces:
  - `type TimerMode = 'pomodoro' | 'free'`; `type Phase = 'work' | 'short' | 'long'`
  - `POMODORO = { work: 25*60_000, short: 5*60_000, long: 15*60_000, longEvery: 4 }`
  - `type TimerState = { mode: TimerMode; phase: Phase; durationMs: number; endsAt: number | null; pausedRemainingMs: number; completedWork: number; freeMs: number }`
  - `initialState(mode: TimerMode, freeMs?: number): TimerState`
  - `start(s, now): TimerState`, `pause(s, now): TimerState`, `reset(s): TimerState`
  - `remaining(s, now): number`
  - `advance(s, now): { state: TimerState; phasesEnded: number }`: cruza todas las fases vencidas y la siguiente arranca sola en modo pomodoro. En modo libre se para al llegar a 0.
  - `useTimer(): { state, remainingMs, start, pause, reset, setMode, setFreeMinutes, sessionNumber }`. `sessionNumber = completedWork + 1`, contador diario guardado en `localStorage` con la fecha.

- [ ] **Step 1: Failing tests** en `timer.test.ts`:
  - `pomodoro starts with 25 min work`: `remaining(start(initialState('pomodoro'), 0), 0) === 25*60_000`.
  - `work → short break after 25 min`: `advance(started, 25*60_000).state.phase === 'short'`, `phasesEnded === 1`, `completedWork === 1`.
  - `4th work block leads to long break`: con `completedWork: 3` en fase `work`, al vencer → `phase === 'long'`, `durationMs === 15*60_000`.
  - `background tab: one tick crossing several phases`: arrancar en 0 y `advance(s, (25+5+10)*60_000)` → `phase === 'work'`, `completedWork === 1`, `phasesEnded === 2`, `remaining === 15*60_000`.
  - `pause keeps remaining`: start en 0, pausa en 60_000, `remaining(s, 999_999) === 24*60_000`.
  - `free mode stops at zero`: `initialState('free', 10*60_000)`, `advance(..., 11*60_000)` → `endsAt === null`, `remaining === 0`, `phasesEnded === 1`.
- [ ] **Step 2:** `bun run test src/timer` → FAIL.
- [ ] **Step 3:** Implementar `timer.ts` (puro, sin `Date.now()` dentro; `now` siempre es un parámetro).
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5: Failing test** `FocusPanel renders minutes solid, seconds outlined`: con `remainingMs = 24*60_000 + 13_000` → `[data-part=min]` contiene `24` y `[data-part=sec]` contiene `13`. Muestra el texto de la tarea activa recibida por props.
- [ ] **Step 6:** Implementar `FocusPanel({ remainingMs, running, mode, phase, activeTaskText, onStart, onPause, onReset, onModeChange, onFreeMinutes, children })`. El reloj se copia de la referencia: minutos peso 800, separador de dos cuadrados naranjas con `blink 1s steps(1)`, segundos `-webkit-text-stroke: 1.5px`, `<sup>MIN</sup>`. `children` es el hueco para la esfera, que va detrás. `useTimer` refresca con `setInterval(250)` y llama a `advance`; si `phasesEnded > 0` reproduce un aviso suave (`public/sounds/chime.mp3`, volumen 0.4). Los controles (play/pausa, reset, Pomodoro/Libre, minutos libres) van como texto en mayúsculas pequeño, sin botones redondeados.
- [ ] **Step 7:** Run → PASS. Commit `feat: pomodoro and free timer`.

### Task 4: Tareas en local + panel

**Files:**
- Create: `src/tasks/types.ts`, `src/tasks/localRepo.ts`, `src/tasks/localRepo.test.ts`, `src/tasks/useTasks.ts`, `src/tasks/TasksPanel.tsx`, `src/tasks/TasksPanel.test.tsx`

**Interfaces:**
- Produces:
  - `type Task = { id: string; text: string; done: boolean; active: boolean; createdAt: string }` (`id = crypto.randomUUID()`, `createdAt` en ISO)
  - `interface TaskRepo { list(): Promise<Task[]>; save(t: Task): Promise<void>; remove(id: string): Promise<void> }`
  - `localRepo: TaskRepo`, clave `focus-space:tasks:v1`
  - `useTasks(repo: TaskRepo): { tasks, add(text), toggle(id), edit(id, text), remove(id), setActive(id | null) }`. `setActive` desactiva todas las demás. El orden es: no hechas por `createdAt` y, después, las hechas.
  - `TasksPanel({ tasks, synced: boolean, ...acciones de useTasks })`

- [ ] **Step 1: Failing tests:**
  - `localRepo round-trips tasks`: guardar dos, `list()` devuelve las dos.
  - `localRepo survives corrupt storage`: `localStorage.setItem('focus-space:tasks:v1', '{nope')` → `list()` resuelve `[]` sin lanzar.
  - `setActive leaves at most one active` (con `renderHook`).
  - `TasksPanel shows local-only notice when not synced`: aparece el texto `Guardado solo en este navegador · Inicia sesión para sincronizar`.
  - `adding empty or whitespace text does nothing`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implementar. Filas numeradas `01, 02…`, las hechas tachadas con opacidad 0.3 y la activa marcada con `→` en el acento. Input "+ Nueva tarea" al final: Enter guarda. Doble clic edita y Escape cancela. Botón de borrar al pasar el ratón.
- [ ] **Step 4:** Run → PASS. Commit `feat: local task list`.

### Task 5: Motor de audio, canales y mezclador

**Files:**
- Create: `src/audio/channels.ts`, `src/audio/engine.ts`, `src/audio/engine.test.ts`, `src/audio/levels.ts`, `src/audio/levels.test.ts`, `src/prefs/prefs.ts`, `src/prefs/prefs.test.ts`, `src/audio/MixerBar.tsx`, `src/audio/MixerBar.test.tsx`, `public/sounds/*.mp3`, `public/sounds/CREDITS.md`

**Interfaces:**
- Produces:
  - `type ChannelId = 'rain' | 'fire' | 'cafe' | 'wind'`
  - `CHANNELS: { id: ChannelId; label: string; variants: { id: string; label: string; src: string }[] }[]` con estas variantes exactas: rain = suave, ventana, tormenta, tienda · fire = hoguera, chimenea · cafe = cafetería, biblioteca · wind = suave, bosque. Ficheros: `/sounds/<channel>-<variant>.mp3`.
  - `createEngine(ctx: AudioContext): { setVolume(ch: ChannelId, v: number): void; setVariant(ch: ChannelId, variantId: string): void; resume(): Promise<void>; analyser: AnalyserNode }`. Cada canal es un `<audio loop>` → `MediaElementSource` → `Gain` → `analyser` → `destination`. Si un canal tiene volumen 0, su audio se pausa para no gastar CPU. Cambiar de variante hace un fundido cruzado de 400 ms.
  - `bandLevels(freq: Uint8Array): { bass: number; high: number }`, en 0..1. `bass` es la media de los bins correspondientes a menos de 250 Hz, con `sampleRate` 48000 y `fftSize` 1024 como parámetros por defecto; `high` es la media por encima de 2 kHz.
  - `type Prefs = { v: 1; volumes: Record<ChannelId, number>; variants: Record<ChannelId, string>; lofiVolume: number; freeMinutes: number }`. `DEFAULT_PREFS` arranca con rain 0.65 y el resto a 0. `loadPrefs(): Prefs` y `savePrefs(p: Prefs): void`, con la clave `focus-space:prefs`.
  - `MixerBar({ prefs, onVolume(ch, v), onVariant(ch, id) })`

- [ ] **Step 1:** Conseguir los 10 loops de ambiente y el aviso `chime.mp3` con licencia CC0 (Freesound filtrando por licencia CC0, o Pixabay Sounds), recortados a 1–3 min y en mp3 a 128 kbps. Anotar cada uno en `CREDITS.md` con autor, URL y licencia. Si la descarga necesita una cuenta o la aprobación del usuario, parar y pedírsela; mientras tanto, usar como sustituto un mp3 de ruido de 2 s generado por un script de Node y marcado como `PLACEHOLDER` en `CREDITS.md`.
- [ ] **Step 2: Failing tests:**
  - `bandLevels: silence is zero`: un `Uint8Array(512)` de ceros → `{ bass: 0, high: 0 }`.
  - `bandLevels: full low bins → bass 1, high 0`.
  - `loadPrefs falls back on corrupt JSON` y `loadPrefs fills missing keys from defaults` (por ejemplo, un `{ v: 1, volumes: { rain: 0.2 } }` guardado conserva rain 0.2 y completa el resto).
  - `engine: setVolume before resume does not throw and resume() calls ctx.resume`, con un `AudioContext` falso que haga de mock mínimo.
  - `MixerBar: clicking channel name cycles variant`: con rain en `suave`, un clic llama a `onVariant('rain', 'ventana')`; desde `tienda` vuelve a `suave`.
- [ ] **Step 3:** Run → FAIL.
- [ ] **Step 4:** Implementar. Cada bloque de canal es como en la referencia: nombre (con la variante debajo en pequeño), valor 00–100 en número grande de peso 300 y línea de volumen. El volumen se cambia arrastrando en horizontal sobre el bloque y con la rueda del ratón. Para accesibilidad, cada bloque tiene `role="slider"` con `aria-valuenow` y responde a las flechas. Cualquier interacción llama a `engine.resume()`. El `AudioContext` se crea una sola vez, de forma perezosa, en `App`.
- [ ] **Step 5:** Run → PASS. Commit `feat: ambient mixer with variants`.

### Task 6: Esfera de partículas

**Files:**
- Create: `src/visual/sphere.ts`, `src/visual/sphere.test.ts`, `src/visual/Sphere.tsx`
- Modify: `src/App.tsx` (meter `<Sphere>` como `children` de `FocusPanel`)

**Interfaces:**
- Consumes: `bandLevels`, `engine.analyser` (Task 5).
- Produces: `fibonacciSphere(n: number): [number, number, number][]` y `Sphere({ getLevels: () => { bass: number; high: number } | null })`.

- [ ] **Step 1: Failing tests:** `fibonacciSphere(1600)` devuelve 1600 puntos, todos con `|p| ≈ 1` (tolerancia 1e-9), y `y` va de 1 a -1.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implementar `Sphere` portando `sphere()` de la referencia visual. `getLevels()` sustituye al audio simulado: `bass` controla la escala (+12 %) y `high` el erizado. Si devuelve `null` o todo es 0, la esfera respira sola con `0.5 + 0.5·sin(t·0.6)` atenuado a ×0.3. Los niveles se suavizan con un EMA de 0.15. Canvas con `devicePixelRatio`. Se pausa con `document.hidden` y, con `prefers-reduced-motion`, se queda en un frame estático.
- [ ] **Step 4:** Run → PASS. Comprobación manual: con la lluvia a 65 la esfera se eriza, y con todo a 0 respira despacio. Commit `feat: audio-reactive particle sphere`.

### Task 7: Lofi de YouTube

**Files:**
- Create: `src/lofi/useYouTubeLofi.ts`, `src/lofi/LofiBlock.tsx`, `src/lofi/LofiBlock.test.tsx`

**Interfaces:**
- Produces:
  - `LOFI_VIDEO_ID = 'jfKfPfyJRdk'` (directo "lofi hip hop radio"). Es una constante; si el directo cambia de ID se sustituye aquí.
  - `useYouTubeLofi(): { status: 'loading' | 'ready' | 'unavailable'; playing: boolean; play(); pause(); setVolume(v: number) }`. Carga `https://www.youtube.com/iframe_api` una sola vez. Si a los 8 s no hay `onReady`, o llega `onError`, pasa a `'unavailable'`.
  - `LofiBlock({ status, playing, volume, onToggle, onVolume })`

- [ ] **Step 1: Failing tests:**
  - `LofiBlock shows "No disponible" when unavailable` y, en ese estado, el botón de play queda deshabilitado.
  - `toggle calls onToggle`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implementar. Un iframe de 1×1 px fuera de la vista (con `aria-hidden`) y nunca visible. El bloque naranja macizo se copia de la referencia: `▶ LOFI RADIO — LIVE`, título grande y el volumen con la rueda del ratón o las flechas. El volumen se guarda en `prefs.lofiVolume`.
- [ ] **Step 4:** Run → PASS. Comprobación manual en el navegador: suena tras el primer clic. Commit `feat: youtube lofi stream`.

### Task 8: Cuenta con Supabase y sincronización de tareas

**Files:**
- Create: `src/auth/supabase.ts`, `src/auth/useSession.ts`, `src/auth/AccountMenu.tsx`, `src/auth/AccountMenu.test.tsx`, `src/tasks/supabaseRepo.ts`, `src/tasks/merge.ts`, `src/tasks/merge.test.ts`, `supabase/schema.sql`, `.env.example`
- Modify: `src/App.tsx` (elegir el repositorio según la sesión y lanzar la fusión al iniciar sesión)

**Interfaces:**
- Consumes: `Task` y `TaskRepo` (Task 4).
- Produces:
  - `supabase: SupabaseClient | null`: es `null` si falta `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY`.
  - `useSession(): { user: User | null; signInWithEmail(email): Promise<void>; signInWithProvider('google' | 'github'): Promise<void>; signOut(): Promise<void>; available: boolean }`
  - `supabaseRepo(client, userId): TaskRepo`. La tabla `tasks` tiene `id uuid pk`, `user_id uuid references auth.users not null default auth.uid()`, `text text not null`, `done bool`, `active bool`, `created_at timestamptz`. Con RLS, las políticas select, insert, update y delete exigen `user_id = auth.uid()`.
  - `mergeTasks(local: Task[], remote: Task[]): Task[]`: une por `id` (si hay conflicto gana la remota), descarta las locales cuyo texto normalizado (trim + minúsculas) ya exista en remoto y deja como mucho una `active`; si hay varias, gana la remota.

- [ ] **Step 1: Failing tests:**
  - `merge: union by id, remote wins`.
  - `merge: same text not duplicated` (`' Leer '` en local y `'leer'` en remoto dan una sola tarea).
  - `merge: at most one active, remote preferred`.
  - `AccountMenu without supabase shows local-only and no sign-in buttons` (con `available: false`).
  - `AccountMenu shows email field, Google and GitHub buttons when available`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implementar. Con un email válido, `signInWithEmail` usa `signInWithOtp` con `emailRedirectTo: location.origin`. Al pasar de `user` null a no null: se leen las tareas locales y las remotas, se fusionan con `mergeTasks`, se guarda en remoto la diferencia, se vacía `localRepo` y se cambia al repositorio remoto. Al cerrar sesión se vuelve al local vacío. `AccountMenu` es un panel desplegable desde "Cuenta ↗", con la misma estética de filas y filetes.
- [ ] **Step 4:** Run → PASS. Commit `feat: supabase auth and task sync`.

### Task 9: Despliegue y guía de cuentas

**Files:**
- Create: `netlify.toml`, `docs/SETUP.md`, `README.md`

- [ ] **Step 1:** `netlify.toml` con `command = "bun run build"`, `publish = "dist"`, la variable `BUN_VERSION` y una redirección `/* → /index.html 200`.
- [ ] **Step 2:** En `docs/SETUP.md`, los pasos numerados para el usuario: crear el proyecto en Supabase, ejecutar `supabase/schema.sql`, activar Email; crear un OAuth client en Google Cloud (URL de callback de Supabase) y activar el proveedor Google; crear una OAuth App en GitHub y activar el proveedor GitHub; añadir la URL de Netlify en Supabase → Auth → URL Configuration; crear el sitio en Netlify desde el repo con las dos variables `VITE_`.
- [ ] **Step 3:** `bun run test` y `bun run build` → todo en verde.
- [ ] **Step 4: Verificación en el navegador** (`bun run dev`, panel del navegador a 1440×900):
  - sin consola en rojo;
  - las tareas persisten al recargar;
  - el Pomodoro avanza (probarlo temporalmente con duraciones cortas);
  - la lluvia suena y la esfera reacciona;
  - el lofi suena;
  - sin `.env` todo funciona en modo local.
- [ ] **Step 5:** Commit `chore: netlify config and setup guide`.
