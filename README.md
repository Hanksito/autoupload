# 🪐 Perihelion — Social Media Scheduler

> Programa y publica Reels en Instagram, TikTok, YouTube Shorts y X (Twitter) simultáneamente, con un panel visual y calendario de publicaciones.

![Stack](https://img.shields.io/badge/Next.js-14-black) ![Vercel](https://img.shields.io/badge/Vercel-free-333) ![n8n](https://img.shields.io/badge/n8n-self--hosted-orange)

---

## 🖥️ Stack tecnológico

| Capa | Tecnología | Coste |
|------|-----------|-------|
| Frontend | Next.js 14 (App Router) | Gratis |
| Despliegue | Vercel | Gratis |
| Base de datos | Vercel Postgres | Gratis |
| Almacenamiento vídeos | Cloudinary | Gratis (25GB) |
| Automatización | n8n (self-hosted) | Gratis |
| Despliegue n8n | Railway o Render | Gratis |

---

## ⚡ Inicio rápido (desarrollo local)

```bash
# 1. Instala dependencias
npm install

# 2. Crea el archivo de configuración
cp .env.example .env.local
# → Edita .env.local con tus credenciales (ver sección abajo)

# 3. Inicia el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 🔑 Variables de entorno (`.env.local`)

Copia `.env.example` como `.env.local` y rellena cada sección:

---

### 1. Vercel Postgres (Neon) — Base de datos

> **Dónde obtenerla:** [vercel.com](https://vercel.com) → Tu proyecto → Storage → Connect Database → Postgres (Neon)
> O directamente en [neon.tech](https://neon.tech) → Create Project → Connection String

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Connection string completa de Neon/Vercel Postgres (ej: `postgres://user:pass@host.neon.tech/db?sslmode=require`) |

---

### 2. Cloudinary — Almacenamiento de vídeos

> **Dónde obtenerlas:** [cloudinary.com](https://cloudinary.com) → Dashboard → Account Details
> Registro gratuito, no se necesita tarjeta de crédito. Plan Free: 25GB y 25GB de ancho de banda/mes.

| Variable | Descripción |
|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Nombre de tu cloud (ej: `mi-nombre`) |
| `CLOUDINARY_API_KEY` | API Key del Dashboard |
| `CLOUDINARY_API_SECRET` | API Secret del Dashboard |

---

### 3. n8n — Motor de automatización

> **Dónde obtenerlas:** Al desplegar n8n en Railway/Render, crea un nodo Webhook en tu workflow.
> El `N8N_WEBHOOK_SECRET` lo defines tú — pon cualquier cadena aleatoria larga (mínimo 32 caracteres).

| Variable | Descripción |
|----------|-------------|
| `N8N_WEBHOOK_URL` | URL del webhook trigger en tu n8n (ej: `https://tu-n8n.railway.app/webhook/social-publish`) |
| `N8N_WEBHOOK_SECRET` | Secreto compartido entre Next.js y n8n para seguridad |

---

### 4. Cron Secret — Seguridad del job de publicación

> Genera uno con: `openssl rand -hex 32` o [randomkeygen.com](https://randomkeygen.com)
> En Vercel, este header se envía automáticamente en las llamadas de cron.

| Variable | Descripción |
|----------|-------------|
| `CRON_SECRET` | Token aleatorio para proteger `/api/cron/publish` |

---

### 5. Instagram — Facebook Graph API ✅ Gratis

> **Requisitos:**
> - Cuenta de Instagram **Business** o **Creator**
> - App en [developers.facebook.com](https://developers.facebook.com) con permisos: `instagram_basic`, `instagram_content_publish`
>
> **Dónde obtenerlas:** developers.facebook.com → Tu App → Instagram → Token de acceso de larga duración

| Variable | Descripción |
|----------|-------------|
| `INSTAGRAM_ACCESS_TOKEN` | Token de acceso de la cuenta (larga duración, válido 60 días) |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | ID de la cuenta profesional de Instagram |

---

### 6. TikTok — Direct Post API ✅ Gratis (con aprobación)

> **Requisitos:**
> - Cuenta en [developers.tiktok.com](https://developers.tiktok.com)
> - Solicitar acceso a **"Content Posting API"**
> - Sin auditoría: posts en privado, máx. 5 usuarios
> - Con auditoría aprobada: posts públicos, hasta 15 vídeos/día
>
> **Dónde obtenerlas:** developers.tiktok.com → Tu App → Credentials

| Variable | Descripción |
|----------|-------------|
| `TIKTOK_CLIENT_KEY` | Client Key de tu app |
| `TIKTOK_CLIENT_SECRET` | Client Secret de tu app |
| `TIKTOK_ACCESS_TOKEN` | Access Token del usuario autenticado |

---

### 7. X / Twitter — API v2 ⚠️ Limitado en tier gratuito

> **Coste:** Tier gratuito: 1.500 tweets/mes | Basic ($100/mes): 3.000 tweets/mes
> **Dónde obtenerlas:** [developer.twitter.com](https://developer.twitter.com) → Tu proyecto → Keys and Tokens

| Variable | Descripción |
|----------|-------------|
| `TWITTER_API_KEY` | Consumer Key de tu app |
| `TWITTER_API_SECRET` | Consumer Secret de tu app |
| `TWITTER_ACCESS_TOKEN` | Access Token del usuario |
| `TWITTER_ACCESS_TOKEN_SECRET` | Access Token Secret del usuario |
| `TWITTER_BEARER_TOKEN` | Bearer Token (para operaciones de lectura) |

---

### 8. YouTube — YouTube Data API v3 ✅ Gratis

> **Requisitos:**
> - Cuenta en [console.cloud.google.com](https://console.cloud.google.com)
> - Activar **YouTube Data API v3** en tu proyecto de Google Cloud
> - Crear credenciales **OAuth 2.0** → Aplicación web
> - Límite gratuito: 10.000 unidades/día (~6 vídeos/día)
>
> **Guía para el Refresh Token:** [OAuth 2.0 Playground](https://developers.google.com/oauthplayground) → Selecciona YouTube Data API v3 → Autoriza → Copia el Refresh Token

| Variable | Descripción |
|----------|-------------|
| `YOUTUBE_CLIENT_ID` | Client ID OAuth 2.0 |
| `YOUTUBE_CLIENT_SECRET` | Client Secret OAuth 2.0 |
| `YOUTUBE_REFRESH_TOKEN` | Refresh Token del usuario (largo plazo) |

---

## 🚀 Despliegue en Vercel

```bash
# Instala Vercel CLI si no lo tienes
npm i -g vercel

# Despliega
vercel

# O conecta tu repo de GitHub en vercel.com (recomendado)
# Vercel detecta Next.js automáticamente
```

**Tras desplegar:**
1. Ve a tu proyecto en Vercel → Settings → Environment Variables
2. Añade todas las variables de `.env.local`
3. El cron (`vercel.json`) se activa automáticamente cada minuto

---

## 🤖 Configuración de n8n

### Despliegue en Railway (gratis)
1. Ve a [railway.app](https://railway.app) → New Project → Deploy from Template → busca "n8n"
2. Anota la URL pública que Railway te asigna
3. Entra al panel de n8n → Workflows → Crea uno nuevo

### Workflows necesarios
Importa los workflows de la carpeta `/n8n-workflows/` (los encontrarás en el repo):

| Archivo | Plataforma |
|---------|-----------|
| `instagram-reel.json` | Instagram Reels |
| `tiktok-video.json` | TikTok |
| `youtube-short.json` | YouTube Shorts |
| `twitter-video.json` | X / Twitter (opcional) |

Cada workflow:
1. Recibe el webhook de Next.js con los datos del post
2. Publica en la red social correspondiente
3. Llama a `/api/webhook/n8n` con el resultado (éxito/error)

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx                    # Dashboard con calendario
│   ├── new/page.tsx                # Formulario de nuevo Reel
│   ├── globals.css                 # Estilos globales
│   └── api/
│       ├── posts/route.ts          # GET, POST posts
│       ├── posts/[id]/route.ts     # GET, DELETE post por ID
│       ├── upload/route.ts         # Subida de vídeo a Cloudinary
│       ├── cron/publish/route.ts   # Job que revisa posts pendientes
│       └── webhook/n8n/route.ts    # Callback de n8n al publicar
├── components/
│   ├── PostCard.tsx                # Tarjeta de post individual
│   └── CalendarView.tsx            # Calendario mensual
└── lib/
    ├── db.ts                       # Cliente Vercel Postgres + CRUD
    ├── cloudinary.ts               # Helper de subida de vídeos
    └── n8n.ts                      # Trigger de webhooks n8n
```

---

## 📋 Límites de las APIs (resumen)

| Plataforma | Límite gratuito |
|-----------|----------------|
| Instagram | 100 posts/24h vía API |
| TikTok | 15 vídeos/día (con app auditada) |
| YouTube | ~6 vídeos/día (10.000 unidades) |
| X/Twitter | 1.500 tweets/mes (tier gratuito) |

---

## 📄 Licencia

MIT — Úsalo libremente.
