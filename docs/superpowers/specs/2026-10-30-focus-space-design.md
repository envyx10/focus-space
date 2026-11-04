# Focus/Space — diseño v1

Fecha: 2026-10-30
Estado: pendiente de aprobación (revisado por builder check)

## Intención

Las webs de "lofi + lluvia para concentrarse" que existen son feas, lentas y anticuadas. Focus/Space es un **centro de escritorio para concentrarse y relajarse** que da gusto abrir: una sola pantalla, oscura, con estética suiza/brutalista de nivel Awwwards, donde tienes tus pendientes, un temporizador, sonidos de ambiente y música lofi.

Éxito = el usuario la deja abierta en una pestaña mientras trabaja porque le apetece, no porque no haya alternativa.

## Objetivos (v1)

- **Lista de pendientes persistente** asociada a una cuenta, sincronizada entre PCs/dispositivos. Multiusuario: cada persona con su cuenta y sus tareas.
- **Temporizador** grande y protagonista, con **modo Pomodoro** (25 min trabajo / 5 descanso / descanso largo cada 4 bloques).
- **Mezclador de ambientes** por canales (lluvia, fuego, café, viento). Cada canal tiene **variantes** elegibles (p. ej. lluvia: suave / ventana / tormenta / tienda de campaña; fuego: hoguera / chimenea) y su propio volumen; los canales se mezclan entre sí.
- **Lofi por defecto**: directo de YouTube embebido (estilo "lofi hip hop radio"), con play/pausa/volumen desde la UI propia.
- **Esfera de partículas 3D** detrás del temporizador que reacciona al audio de los ambientes.

## No-objetivos (v1)

- Spotify (queda para una iteración posterior; requerirá Premium y aprobación de cuota de Spotify para uso público).
- Versión móvil / diseño responsive para teléfono en v1 (añadido después: la app ya tiene diseño para móvil).
- Modo "Relax" como pantalla separada. Una sola pantalla.
- Que la esfera reaccione al lofi de YouTube: técnicamente imposible (audio de iframe cross-origin no analizable).

## Anti-objetivos (fracaso aunque funcione)

- Que parezca una plantilla genérica: gradientes suaves, glassmorphism, tarjetas redondeadas por defecto.
- Que vaya lenta o a tirones (la animación 3D y el grano no pueden comerse la CPU ni bloquear la UI).
- Ruido/grano visual agresivo que moleste al trabajar.

## Cuenta (decidido por el usuario)

- **Se puede usar sin cuenta.** Temporizador, ambientes, lofi y tareas funcionan desde el primer segundo, sin pantalla de login.
- Sin cuenta, las tareas se guardan solo en ese navegador (localStorage): siguen ahí si vuelves desde el mismo PC, pero no existen en otro dispositivo y se pierden si se borran los datos del navegador. La UI lo indica de forma discreta (p. ej. "Guardado solo en este navegador · Inicia sesión para sincronizar").
- La cuenta sirve para **guardar y sincronizar las listas** entre dispositivos. Al iniciar sesión por primera vez, las tareas locales se suben a la cuenta y se fusionan con las que ya hubiera.
- **Métodos de acceso (Supabase Auth):** email (enlace mágico) como método base, más **Google** y **GitHub** como proveedores OAuth. Los proyectos de Supabase, Netlify, Google Cloud (OAuth client) y la OAuth App de GitHub los crea el usuario; el plan incluye una guía paso a paso y la app debe funcionar en local con solo email mientras los proveedores no estén configurados.
- El acceso a la cuenta es discreto (enlace "Cuenta" en la cabecera), sin bloquear nada.

## Dirección visual (decidida con el usuario sobre bocetos)

Referencia: `.superpowers/brainstorm/1391-1793342371/content/swiss-3d.html`, variante 1 ("Esfera de partículas").

- Fondo casi negro (`#0b0b0b`), texto blanco roto (`#ecebe6`), **un único acento naranja señal (`#ff4b1f`)**.
- **Retícula suiza de 12 columnas** con filetes finos (`#262626`), secciones numeradas (01 Pendientes, 02 Focus…), etiquetas pequeñas en mayúsculas.
- Tipografía grotesca: **Inter Tight**.
- Layout: cabecera fina (marca, sesión, fecha, cuenta) · columna izquierda (cols 1–4) con las tareas en filas numeradas · bloque central (cols 5–12) con el temporizador y la esfera detrás · franja inferior con un bloque por canal de ambiente (nombre, valor numérico grande, línea de volumen) y el reproductor lofi como bloque naranja macizo.
- **Temporizador gigante**: minutos en blanco macizo peso 800, separador = dos cuadrados naranjas que parpadean cada segundo, segundos solo en contorno (se ve la esfera a través), etiqueta "MIN" pequeña.
- **Grano** animado sutil sobre toda la pantalla (opacidad ~4–5 %, blend overlay, refresco lento).
- **Esfera de partículas** (~1600 puntos, distribución Fibonacci) que gira lento; los graves la hacen "respirar" (escala), la lluvia la "eriza" (ruido en la superficie); algunos puntos destacados en naranja. Sin audio de ambiente activo: respiración lenta propia.

## Stack (decidido)

- **Bun** como gestor de paquetes y runner de scripts.
- **React + Vite**.
- **Supabase**: autenticación (email con enlace mágico + Google + GitHub) y base de datos para las tareas.
- **Netlify** para el despliegue.

## Restricciones

- Escritorio, navegadores modernos.
- Los sonidos de ambiente deben tener licencia que permita su uso (p. ej. CC0 de Freesound) y servirse desde la propia web (necesario además para poder analizarlos con Web Audio).
- El directo de YouTube se usa mediante el reproductor embebido oficial (IFrame Player API).
- Los navegadores bloquean el autoplay con sonido: el audio arranca tras la primera interacción del usuario.

## Decisiones tomadas por mí (revisables)

- Además de Pomodoro, el temporizador permite un tiempo libre elegido por el usuario.
- Canales de ambiente: lluvia, fuego, café, viento, con las variantes listadas arriba.
- El nombre "Focus/Space" es provisional.
- **Qué se sincroniza:** solo las tareas van a Supabase. Volúmenes, variantes elegidas, duración del tiempo libre y contador de pomodoros del día se guardan en localStorage (por dispositivo). El temporizador corre en local; no se comparte en vivo entre PCs.
- **Tareas v1:** añadir, marcar como hecha, editar texto, borrar. Una tarea puede marcarse como **activa** y su texto aparece bajo el temporizador; es solo una etiqueta, no se cuentan pomodoros por tarea. Sin reordenar ni archivar en v1; las hechas se quedan al final tachadas.
- **Esquema mínimo de tarea:** id, user_id, texto, hecha, activa, creada_en. RLS: cada usuario solo ve y modifica sus tareas.
- **Control de variantes:** en cada bloque de canal, el nombre del canal es clicable y rota entre sus variantes (p. ej. "Lluvia / Tormenta"); el volumen se ajusta arrastrando sobre el bloque o su línea. Café: cafetería / biblioteca. Viento: suave / bosque.
- **"Sesión 03"** de la cabecera = número de pomodoro del día (local).
- El enlace "Spotify ↗" del boceto se elimina en v1.
- Fin de fase del Pomodoro: sonido suave + aviso visual, y la siguiente fase arranca sola.
- **Público inicial:** pequeño grupo de personas, pero sin decisiones que impidan abrirlo después.

## Lo que queda a criterio del constructor

- Librería 3D (Three.js / react-three-fiber o canvas propio) y técnica de grano, siempre que se respeten rendimiento y estética.
- Estructura del código, gestión de estado, esquema de la tabla de tareas y políticas RLS de Supabase.
- Origen concreto de cada sonido de ambiente, dentro de licencias válidas.
