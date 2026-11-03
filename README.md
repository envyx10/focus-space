<div align="center">

# Focus/Space

**A desktop focus room: tasks, a Pomodoro timer, mixable ambient sounds, lofi radio and a particle sphere that reacts to what you hear.**

**English** · [Español](README.es.md)

[![License: MIT](https://img.shields.io/badge/license-MIT-ff4f1f?style=flat-square)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-7-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-000000?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org)
[![Supabase](https://img.shields.io/badge/Supabase-optional_sync-3ecf8e?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Bun](https://img.shields.io/badge/Bun-runtime-f9f1e1?style=flat-square&logo=bun&logoColor=black)](https://bun.sh)
[![Tests: Vitest](https://img.shields.io/badge/tests-83_passing-2ea44f?style=flat-square&logo=vitest&logoColor=white)](#scripts)
[![Pomodoro](https://img.shields.io/badge/Pomodoro-timer-ff4f1f?style=flat-square)](#features)
[![Lofi](https://img.shields.io/badge/lofi-ambient_sounds-8a63d2?style=flat-square)](#features)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](#contributing)

<br />

<img src="docs/media/hero.gif" alt="Focus/Space: adding tasks, starting a Pomodoro and turning up the rain while the particle sphere reacts" width="880" />

</div>

---

## Why

Most focus apps are either a bare timer or a dashboard full of things to configure. Focus/Space sits in between: **one screen** with everything you need to get into a session, no account required, and a look that's calm enough to keep open all day on a second monitor.

- **Zero setup.** Clone, install, run. Without any config it works in *local-only mode* and saves to your browser.
- **Nothing to sign up for.** Accounts are optional and only add sync between devices.
- **Built to be left open.** Dark, quiet, editorial typography, and a 3D scene that breathes with the sound.

## Features

| | |
|---|---|
| ⏱️ **Pomodoro & free timer** | Classic 25 / 5 min cycles with a 15 min long break every 4 sessions, or a free timer from 1 to 240 min. A soft chime marks the end of each phase. |
| 🕐 **Local clock by default** | Opens on the time. When a timer is running, the time moves up small and the countdown takes the stage. |
| ✅ **Tasks** | Add, edit, complete and delete. Mark one as *active* and it appears under the timer, so you always know what this session is for. |
| 🌧️ **Ambient mixer** | Rain, fire, café, wind and keyboard typing, each with variants (window, storm, tent, fireplace, library, forest, Cherry MX Blue, Brown and Red…). Drag, scroll or use the arrow keys to mix them. |
| 📻 **Lofi radio** | A live lofi stream with its own volume, with automatic fallback to other streams if one is down. |
| 🔮 **Reactive particle sphere** | A Three.js shader sphere that follows the ambient channels. |
| 🔤 **Six clock typefaces** | Suiza, Grotesk, Syne, Editorial, Mono and Unbounded, each tuned so the digits keep the same width. |
| ☁️ **Optional sync** | Sign in with email (magic link), Google or GitHub through Supabase. Tasks you made before signing in are merged into your account. |
| 🌐 **English and Spanish** | Pick the language in Settings. It starts in your browser's language and is remembered. |
| ♿ **Accessible** | Real roles and labels on every control, keyboard-operable sliders, and a timer readable by screen readers. |

<table>
  <tr>
    <td width="50%" valign="top">
      <img src="docs/media/tasks.gif" alt="Adding tasks, marking one as active and starting a 40 minute free timer" />
      <p align="center"><b>Tasks + free timer</b><br /><sub>The active task follows you into the session.</sub></p>
    </td>
    <td width="50%" valign="top">
      <img src="docs/media/mixer.gif" alt="Mixing rain, fire and café sounds while the sphere reacts" />
      <p align="center"><b>Ambient mixer</b><br /><sub>The sphere moves with every channel you turn up.</sub></p>
    </td>
  </tr>
  <tr>
    <td colspan="2">
      <img src="docs/media/typefaces.gif" alt="Cycling through the six clock typefaces" />
      <p align="center"><b>Six typefaces for the clock</b><br /><sub>Pick the one that fits your desk.</sub></p>
    </td>
  </tr>
</table>

## Quick start

You need a recent version of [Bun](https://bun.sh). The interface is in Spanish.

```bash
git clone https://github.com/envyx10/focus-space.git
cd focus-space
bun install
bun run dev
```

Open <http://localhost:5173>. That's it: tasks and preferences are stored in your browser.

> **Tip:** browsers block audio until you interact with the page. Click anywhere once and the ambient sounds will start.

### Accounts and sync (optional)

To sync tasks between devices you need a free [Supabase](https://supabase.com) project:

1. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor.
2. Copy `.env.example` to `.env.local` and fill in your project URL and `anon` key:

   ```env
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon-public-key>
   ```

3. Restart `bun run dev`. The **Cuenta** (account) menu now lets you sign in.

The full guide (email, Google, GitHub and deploying to Netlify) is in [docs/SETUP.md](docs/SETUP.md).

## Scripts

| Command | What it does |
|---|---|
| `bun run dev` | Dev server with hot reload |
| `bun run build` | Type-check and build to `dist/` |
| `bun run preview` | Serve the production build locally |
| `bun run test` | Run the test suite (Vitest + Testing Library) |
| `bun run lint` | Lint with oxlint |

## How it works

```
src/
├── timer/    Pomodoro and free timer: pure state machine + React hook
├── tasks/    Task list with a local repo (localStorage) and a Supabase repo
├── audio/    Web Audio engine, mixer, level analysis and tab-audio capture
├── lofi/     YouTube lofi player with stream fallback
├── visual/   Three.js particle sphere, GLSL shaders, typefaces, film grain
├── auth/     Supabase session and account menu
├── prefs/    Volumes, variants and typeface, persisted in the browser
└── layout/   Header
```

- **The timer** stores the wall-clock end time instead of counting ticks, so it stays exact in background tabs and survives a reload.
- **The sphere** reads levels from a Web Audio `AnalyserNode` on each ambient channel. YouTube's iframe can't be analysed directly, so while lofi plays it follows a synthetic groove.
- **Three.js is lazy-loaded** after the first paint, so the clock and tasks show up instantly.
- **Tasks are local-first.** On your first sign-in your browser tasks are merged into your account (the remote copy wins conflicts and duplicates are dropped).

## Tech stack

[React 19](https://react.dev) · [TypeScript](https://www.typescriptlang.org) · [Vite](https://vite.dev) · [Three.js](https://threejs.org) + GLSL · Web Audio API · [Supabase](https://supabase.com) (Auth + Postgres with RLS) · [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) · [oxlint](https://oxc.rs) · [Bun](https://bun.sh) · [Netlify](https://netlify.com)

## Contributing

It's a small project and contributions are welcome: new ambient sounds, typefaces, scenes, translations or bug fixes.

1. Fork the repo and create a branch: `git checkout -b feat/my-idea`
2. Make your change and keep `bun run test` and `bun run lint` green
3. Open a pull request explaining what it changes and why

Ideas or bugs? [Open an issue](https://github.com/envyx10/focus-space/issues).

## Credits

- Ambient sounds are real **CC0** recordings from [Freesound](https://freesound.org). Every file and author is listed in [public/sounds/CREDITS.md](public/sounds/CREDITS.md).
- The lofi radio is streamed from YouTube and belongs to its creators.
- Fonts from [Google Fonts](https://fonts.google.com).

## License

Code under the [MIT](LICENSE) license. The sounds keep their own license (CC0).

<div align="center">
<sub>Made for long focus sessions. If it helps you, a ⭐ helps others find it.</sub>
</div>
