<div align="center">

<img src="docs/media/logo.svg" alt="" width="84" height="84" />

# Focus/Space

**Una sala de concentración en tu navegador.**<br />
Tareas, temporizador Pomodoro, sonidos ambientales mezclables, radio lofi y una esfera de partículas que respira con lo que escuchas.<br />
Una sola pantalla, sin cuenta, sin configurar nada.

[English](README.md) · **Español**

<br />

[![Licencia: MIT](https://img.shields.io/badge/c%C3%B3digo-MIT-ff4b1f?style=flat-square)](#créditos-y-licencias)
[![Sonidos: CC0](https://img.shields.io/badge/sonidos-CC0-ff4b1f?style=flat-square)](public/sounds/CREDITS.md)
[![React 19](https://img.shields.io/badge/React-19-0b0b0b?style=flat-square&logo=react&logoColor=61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-7-0b0b0b?style=flat-square&logo=typescript&logoColor=3178c6)](https://www.typescriptlang.org)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-0b0b0b?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-0b0b0b?style=flat-square&logo=vite&logoColor=646cff)](https://vite.dev)
[![Español e inglés](https://img.shields.io/badge/ES%20%C2%B7%20EN-biling%C3%BCe-0b0b0b?style=flat-square)](#español-e-inglés)
[![PRs bienvenidas](https://img.shields.io/badge/PRs-bienvenidas-0b0b0b?style=flat-square)](#contribuir)

<br />

<img src="docs/media/hero-es.webp" alt="Focus/Space: añadir tareas, iniciar un Pomodoro y subir los sonidos de lluvia, café y teclado mientras la esfera de partículas reacciona" width="900" />

<sub>Escribir tareas, iniciar un Pomodoro y montar un ambiente sonoro. La esfera sigue cada canal que subes.</sub>

</div>

<br />

## Por qué

La mayoría de apps de concentración son un simple temporizador o un panel lleno de cosas por configurar. Focus/Space está en medio: **todo lo que necesitas para empezar una sesión en una sola pantalla**, lo bastante tranquila para dejarla abierta todo el día en un segundo monitor.

- **Cero configuración.** Clona, instala, ejecuta. Sin ajustes funciona en *modo solo local* y guarda en tu navegador.
- **Sin registrarte.** Las cuentas son opcionales y solo añaden sincronización entre dispositivos.
- **Fiable.** El temporizador sobrevive a una recarga, se mantiene exacto en pestañas en segundo plano y su cuenta atrás aparece en el título de la pestaña.
- **Hecha para dejarla abierta.** Oscura, silenciosa, con una escena 3D que sigue al sonido. ¿Demasiado? Activa el *modo calma*.

<br />

<div align="center">
<table>
  <tr>
    <td width="50%" valign="top">
      <img src="docs/media/mixer.webp" alt="Subir sonidos de lluvia, fuego y teclado y pasar por las grabaciones Cherry MX Blue, Brown y Red" />
      <p align="center"><b>Mezclador de ambientes</b><br /><sub>Cinco canales con variantes, incluidas grabaciones reales de teclados Cherry MX.</sub></p>
    </td>
    <td width="50%" valign="top">
      <img src="docs/media/focus.webp" alt="Modo focus: la interfaz se desvanece y el reloj crece junto a la esfera" />
      <p align="center"><b>Modo focus</b> <kbd>F</kbd><br /><sub>Desaparece todo menos el reloj y la esfera.</sub></p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <img src="docs/media/settings.webp" alt="El panel de ajustes: ritmos de Pomodoro, avisos y cambio de toda la interfaz entre inglés y español" />
      <p align="center"><b>Ajustes</b><br /><sub>Ritmo del Pomodoro, avisos, tamaño de texto, modo calma e idioma.</sub></p>
    </td>
    <td width="50%" valign="top">
      <img src="docs/media/typefaces.webp" alt="Pasando por las cinco tipografías del reloj" />
      <p align="center"><b>Cinco tipografías para el reloj</b><br /><sub>Cada una ajustada para que los dígitos ocupen el mismo ancho.</sub></p>
    </td>
  </tr>
</table>
</div>

## También en el móvil

Por debajo de 1024&nbsp;px el diseño pasa a una sola columna: reloj, tareas, mezclador y radio, con controles a todo el ancho y zonas táctiles cómodas. Tiene un manifiesto de app web, así que puede vivir en tu pantalla de inicio.

<div align="center">
<img src="docs/media/mobile-es.webp" alt="Focus/Space en un móvil: iniciar un Pomodoro, bajar a las tareas, añadir una y subir lluvia y teclado en el mezclador" width="300" />
</div>

## Funciones

**Temporizador**
- **Pomodoro y temporizador libre.** 25 / 5 min con un descanso largo cada 4, o los ritmos 50 / 10 y 90 / 20, o tus propias duraciones. El libre va de 1 a 240 min.
- **Tú mandas.** Añade 5 minutos, salta una fase o evita que la siguiente empiece sola.
- **A prueba de recargas.** La fase en marcha se guarda con su hora de fin, así que cerrar la pestaña no la pierde.
- **Avisos a tu medida.** Cuenta atrás en el título de la pestaña, notificación del navegador opcional (el permiso se pide solo al activarla) y un sonido con volumen propio, hasta *apagado*.
- **Estadísticas.** Tiempo de foco hoy y en 7 días, y tu racha.

**Tareas**
- Añade, edita (<kbd>✎</kbd> o doble clic), completa y borra, con **deshacer**. Marca una como *activa* y te acompaña bajo el reloj.
- Limpia las completadas, **exporta** a JSON e **importa** JSON o una lista de texto (una tarea por línea; sirven los `- [x]`).
- Primero local: se guardan en tu navegador. Inicia sesión (opcional) para sincronizar.

**Sonido**
- **Cinco canales ambientales:** lluvia, fuego, café, viento y teclado, cada uno con variantes (ventana, tormenta, tienda, chimenea, biblioteca, bosque, Cherry MX Blue, Brown y Red…).
- Mezcla con un clic, arrastrando, con la rueda o con las flechas. **Guarda mezclas** con nombre y **silencia todo** de una vez.
- **Radio lofi** con volumen propio, tres emisoras y cambio automático si una se cae.

**Aspecto**
- Una **esfera de partículas** en Three.js (65.536 partículas simuladas en la GPU) que sigue a los canales ambientales y al ritmo del lofi.
- Cinco tipografías para el reloj, grano de película, **modo calma** (sin esfera ni grano), tres tamaños de texto y un **modo focus** que agranda el reloj.

<a id="español-e-inglés"></a>
**Español e inglés.** Elige el idioma en Ajustes. Empieza con el de tu navegador y se recuerda. Accesible desde el diseño: roles y etiquetas reales en cada control, deslizadores manejables con teclado y un temporizador legible por lectores de pantalla.

### Atajos de teclado

Nunca se activan mientras escribes, con un modificador pulsado ni sobre un botón o deslizador enfocado.

| Tecla | Acción |
|---|---|
| <kbd>Espacio</kbd> | Iniciar / pausar el temporizador |
| <kbd>N</kbd> | Nueva tarea |
| <kbd>M</kbd> | Silenciar todo |
| <kbd>C</kbd> | Modo calma |
| <kbd>F</kbd> | Modo focus (<kbd>Esc</kbd> para salir) |
| <kbd>?</kbd> | Abrir / cerrar ajustes |

## Inicio rápido

Necesitas una versión reciente de [Bun](https://bun.sh).

```bash
git clone https://github.com/envyx10/focus-space.git
cd focus-space
bun install
bun run dev
```

Abre <http://localhost:5173>. Eso es todo: tareas y preferencias viven en tu navegador.

> **Consejo:** los navegadores bloquean el audio hasta que interactúas con la página. Haz clic en cualquier sitio una vez y empezará tu mezcla guardada.

### Cuentas y sincronización (opcional)

Para sincronizar tareas entre dispositivos necesitas un proyecto gratuito de [Supabase](https://supabase.com):

1. Ejecuta [`supabase/schema.sql`](supabase/schema.sql) en el editor SQL de Supabase.
2. Copia `.env.example` a `.env.local` y rellena la URL de tu proyecto y la clave `anon`:

   ```env
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon-public-key>
   ```

3. Reinicia `bun run dev`. El menú **Cuenta** ya te dejará iniciar sesión.

La guía completa (email, Google, GitHub y despliegue en Netlify) está en [docs/SETUP.md](docs/SETUP.md).

## Scripts

| Comando | Qué hace |
|---|---|
| `bun run dev` | Servidor de desarrollo con recarga en caliente |
| `bun run build` | Comprueba tipos y compila a `dist/` |
| `bun run preview` | Sirve la compilación de producción en local |
| `bun run test` | Ejecuta las pruebas (Vitest + Testing Library) |
| `bun run lint` | Analiza con oxlint |

## Cómo funciona

```
src/
├── timer/      Pomodoro y temporizador libre: máquina de estados pura, persistencia, avisos
├── tasks/      Lista de tareas con repo local (localStorage) y repo de Supabase
├── audio/      Motor Web Audio, mezclador, canales y análisis de niveles
├── lofi/       Reproductor de lofi de YouTube con cambio de emisora
├── visual/     Esfera de partículas Three.js, shaders GLSL, tipografías, grano
├── settings/   Panel de ajustes
├── stats/      Tiempo de foco por día y rachas
├── i18n/       Diccionarios (es, en), proveedor y detección de idioma
├── auth/       Sesión de Supabase y menú de cuenta
├── prefs/      Volúmenes, mezclas y opciones de pantalla, guardados en el navegador
├── lib/        Utilidades de almacenamiento y atajos de teclado
└── layout/     Cabecera
```

- **El temporizador** guarda la hora de fin en lugar de contar ticks, así que es exacto en pestañas en segundo plano, y todo su estado se guarda para sobrevivir a una recarga.
- **La esfera** lee niveles de un `AnalyserNode` de Web Audio en cada canal ambiental. El iframe de YouTube no se puede analizar directamente, así que mientras suena el lofi sigue un ritmo sintético.
- **Three.js se carga en diferido** tras el primer pintado, para que el reloj y las tareas aparezcan al instante.
- **Las tareas son primero locales.** En tu primer inicio de sesión las tareas del navegador se fusionan con tu cuenta (gana la copia remota en conflictos y se descartan duplicados).
- **Las traducciones son objetos simples.** `src/i18n/es.ts` es la fuente; `en.ts` debe tener todas las claves (lo exigen el compilador y una prueba).

## Tecnologías

[React 19](https://react.dev) · [TypeScript](https://www.typescriptlang.org) · [Vite](https://vite.dev) · [Three.js](https://threejs.org) + GLSL · Web Audio API · [Supabase](https://supabase.com) (Auth + Postgres con RLS) · [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) · [oxlint](https://oxc.rs) · [Bun](https://bun.sh) · [Netlify](https://netlify.com)

## Privacidad

No hay analíticas ni seguimiento. Todo se queda en tu navegador salvo que configures Supabase e inicies sesión. Dos cosas se cargan de terceros, como en cualquier web que las use: las tipografías del reloj vienen de **Google Fonts** y la radio lofi es un embed oficial de **YouTube**.

## Contribuir

Es un proyecto pequeño y las contribuciones son bienvenidas: sonidos ambientales, tipografías, traducciones o correcciones.

1. Haz un fork y crea una rama: `git checkout -b feat/mi-idea`
2. Haz tu cambio y mantén `bun run test` y `bun run lint` en verde.
3. Abre una pull request explicando qué cambia y por qué.

Añadir un idioma consiste en copiar `src/i18n/en.ts`, traducirlo y registrarlo en `src/i18n/index.tsx`. Los sonidos nuevos deben ser **CC0** (o libres de redistribuir) y constar en [public/sounds/CREDITS.md](public/sounds/CREDITS.md). Al contribuir aceptas que tu código se publique bajo la licencia MIT del proyecto.

¿Ideas o errores? [Abre una issue](https://github.com/envyx10/focus-space/issues).

## Créditos y licencias

Todo lo que hay en este repositorio es libre de usar, pero no todo tiene la misma licencia. Esta es la imagen completa.

| Qué | Licencia | Detalles |
|---|---|---|
| **Código fuente** | [MIT](LICENSE), © 2026 envyx10 | Úsalo, modifícalo y distribúyelo, con fines comerciales o no. Conserva el aviso de copyright. |
| **Sonidos ambientales y de teclado**, campanilla | **CC0 1.0** (dominio público) | Grabaciones reales de autores de [Freesound](https://freesound.org). No exigen atribución, pero cada archivo y autor figura en [public/sounds/CREDITS.md](public/sounds/CREDITS.md). Los clips de teclado están recortados, en bucle y con el volumen igualado. |
| **Imágenes de demostración** (`docs/media`) | MIT, como el código | Grabaciones silenciosas de esta app, hechas para este README. |
| **Tipografías del reloj** | [SIL Open Font License 1.1](https://openfontlicense.org) | Inter Tight, Space Grotesk, Syne, JetBrains Mono y Unbounded, cargadas desde [Google Fonts](https://fonts.google.com) en tiempo de ejecución. No se incluyen en este repositorio. |
| **Dependencias** | MIT (12) y 0BSD (1) en el paquete que se publica | React, Three.js y el cliente de Supabase, entre otras. Lista completa con versiones en [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md). |
| **Radio lofi** | No forma parte de este repositorio | Un embed oficial de YouTube. Los directos pertenecen a sus dueños y se aplican las condiciones de YouTube. Focus/Space no los descarga, graba ni redistribuye. |

**Marcas.** *Cherry MX* es una marca de Cherry GmbH y aquí solo describe los interruptores de teclado que se grabaron. *Pomodoro Technique* es una marca registrada de Francesco Cirillo. React, Three.js, Supabase, Vite, TypeScript, YouTube y el resto de nombres y logotipos de las insignias pertenecen a sus propietarios. Focus/Space es un proyecto independiente, sin afiliación ni respaldo de ninguno de ellos.

<div align="center">
<sub>Hecha para sesiones largas de concentración. Si te ayuda, una ⭐ ayuda a que otros la encuentren.</sub>
</div>
