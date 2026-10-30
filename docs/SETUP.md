# Puesta en marcha de cuentas y despliegue

La app funciona sin nada de esto (modo solo local). Estos pasos activan las cuentas y la sincronización de tareas.

## 1. Supabase

1. Crea un proyecto en <https://supabase.com/dashboard>.
2. **SQL Editor** → pega y ejecuta [`supabase/schema.sql`](../supabase/schema.sql).
3. **Project Settings → API**: copia `Project URL` y la clave `anon public`.
4. En local, copia `.env.example` a `.env.local` y rellena:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
5. **Authentication → Providers → Email**: activado (enlace mágico). Con esto ya puedes iniciar sesión por email.
6. **Authentication → URL Configuration**:
   - Site URL: la URL de Netlify (paso 4) cuando la tengas; mientras tanto `http://localhost:5173`.
   - Redirect URLs: añade `http://localhost:5173` y la URL de Netlify.

## 2. Google

1. <https://console.cloud.google.com> → crea un proyecto.
2. **APIs y servicios → Pantalla de consentimiento OAuth**: tipo *Externo*, rellena nombre y email.
3. **Credenciales → Crear credenciales → ID de cliente OAuth** → *Aplicación web*.
   - URI de redirección autorizado: `https://<project-ref>.supabase.co/auth/v1/callback`
4. Copia *Client ID* y *Client secret* en Supabase → **Authentication → Providers → Google** y actívalo.

## 3. GitHub

1. <https://github.com/settings/developers> → **New OAuth App**.
   - Homepage URL: la URL de Netlify (o `http://localhost:5173`).
   - Authorization callback URL: `https://<project-ref>.supabase.co/auth/v1/callback`
2. Genera un *client secret* y copia ID y secret en Supabase → **Authentication → Providers → GitHub** y actívalo.

## 4. Netlify

1. Sube el repo a GitHub.
2. <https://app.netlify.com> → **Add new site → Import from Git** → elige el repo. `netlify.toml` ya define build (`bun run build`) y carpeta (`dist`).
3. **Site configuration → Environment variables**: añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
4. Despliega y vuelve al paso 1.6 para añadir la URL final en Supabase.
