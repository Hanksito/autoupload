# 🪐 Perihelion — Social Media Scheduler

> Programa y publica Reels en **Instagram**, **TikTok**, **YouTube Shorts** y **X (Twitter)** simultáneamente. Panel visual con calendario, subida a Cloudinary, automatización con n8n y despliegue 100% gratuito en Vercel.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org)
[![Vercel](https://img.shields.io/badge/Vercel-free-333?logo=vercel)](https://vercel.com)
[![n8n](https://img.shields.io/badge/n8n-self--hosted-orange?logo=n8n)](https://n8n.io)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## 📋 Tabla de contenidos

- [¿Cómo funciona?](#-cómo-funciona)
- [Stack tecnológico](#️-stack-tecnológico)
- [Inicio rápido](#-inicio-rápido)
- [Variables de entorno](#-variables-de-entorno)
- [API Reference](#-api-reference)
- [Modelo de datos](#-modelo-de-datos)
- [Despliegue en Vercel](#-despliegue-en-vercel)
- [Configuración de n8n](#-configuración-de-n8n)
- [Errores y troubleshooting](#-errores-y-troubleshooting)
- [Límites de las APIs](#-límites-de-las-apis)
- [Estructura del proyecto](#-estructura-del-proyecto)

---

## 🔄 ¿Cómo funciona?

```
Usuario sube vídeo → Cloudinary (CDN público)
     ↓ URL pública del vídeo
Next.js guarda post en BD con estado "pending" y fecha programada
     ↓ Vercel Cron (cada minuto)
¿scheduled_at ≤ NOW? → Trigger al webhook de n8n
     ↓ n8n ejecuta en paralelo
┌─────────────────────────────────────┐
│  Instagram: Graph API → Reels       │
│  TikTok:    Direct Post API         │
│  YouTube:   Data API v3 → Shorts    │
│  X/Twitter: API v2 → Video tweet    │
└─────────────────────────────────────┘
     ↓ n8n llama al callback
BD actualiza status → "published" ✅
```

---

## 🖥️ Stack tecnológico

| Capa | Tecnología | Coste |
|------|-----------|-------|
| Frontend | Next.js 16 (App Router) | Gratis |
| Despliegue | Vercel | Gratis |
| Base de datos | Neon / Vercel Postgres | Gratis |
| Almacenamiento vídeos | Cloudinary | Gratis (25 GB) |
| Automatización | n8n (self-hosted) | Gratis |
| Despliegue n8n | Railway | Gratis |

---

## ⚡ Inicio rápido

### Prerrequisitos

- Node.js 18+
- Cuenta en [Cloudinary](https://cloudinary.com) (gratis)
- Cuenta en [Neon](https://neon.tech) (gratis)
- n8n en [Railway](https://railway.app) (gratis) o local con Docker

### Instalación

```bash
# 1. Clona el repositorio
git clone https://github.com/Hanksito/autoupload.git
cd autoupload

# 2. Instala dependencias
npm install

# 3. Copia y rellena las variables de entorno
cp .env.example .env.local

# 4. Inicia el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) — verás el dashboard con calendario.

> **Nota:** Sin `DATABASE_URL` configurada verás un error en consola al cargar posts. Es normal — la UI sigue funcionando.

---

## 🔑 Variables de entorno

Copia `.env.example` como `.env.local` y rellena cada sección:

### 1. Base de datos — Neon / Vercel Postgres

> **Obtener:** [neon.tech](https://neon.tech) → Create Project → Connection String  
> O en [vercel.com](https://vercel.com) → Tu proyecto → Storage → Connect Database → Postgres

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `DATABASE_URL` | string | Connection string de Neon (`postgres://user:pass@host.neon.tech/db?sslmode=require`) |

---

### 2. Cloudinary — Almacenamiento de vídeos

> **Obtener:** [cloudinary.com](https://cloudinary.com) → Dashboard → Account Details  
> Plan Free: 25 GB almacenamiento + 25 GB ancho de banda/mes. Sin tarjeta de crédito.

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `CLOUDINARY_CLOUD_NAME` | string | Nombre de tu cloud (ej: `mi-empresa`) |
| `CLOUDINARY_API_KEY` | string | API Key del Dashboard |
| `CLOUDINARY_API_SECRET` | string | API Secret del Dashboard |

---

### 3. n8n — Motor de automatización

> **Obtener:** URL del webhook al crear el nodo Webhook en tu workflow de n8n.  
> `N8N_WEBHOOK_SECRET` lo defines tú — mínimo 32 caracteres aleatorios.  
> Genera uno con: `openssl rand -hex 32`

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `N8N_WEBHOOK_URL` | string | URL del trigger (ej: `https://tu-n8n.railway.app/webhook/social-publish`) |
| `N8N_WEBHOOK_SECRET` | string | Secreto compartido para autenticar las llamadas entre Next.js ↔ n8n |

---

### 4. Cron — Seguridad del job de publicación

> **Obtener:** Genera con `openssl rand -hex 32` o [randomkeygen.com](https://randomkeygen.com)  
> Vercel lo envía automáticamente en el header `Authorization: Bearer` en cada ejecución del cron.

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `CRON_SECRET` | string | Token aleatorio para proteger `GET /api/cron/publish` |

---

### 5. Instagram ✅ Gratis

> **Requisitos:**
> - Cuenta Instagram **Business** o **Creator**
> - App en [developers.facebook.com](https://developers.facebook.com)
> - Permisos: `instagram_basic`, `instagram_content_publish`
>
> **Obtener:** developers.facebook.com → Tu App → Instagram → Token de acceso de larga duración (60 días)

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `INSTAGRAM_ACCESS_TOKEN` | string | Token OAuth (larga duración, renovar cada 60 días) |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | string | ID numérico de tu cuenta profesional (ej: `17841400000000000`) |

---

### 6. TikTok ✅ Gratis (con aprobación de app)

> **Requisitos:**
> - Cuenta en [developers.tiktok.com](https://developers.tiktok.com)
> - Solicitar acceso a **"Content Posting API"**
>
> ⚠️ Sin auditoría: posts privados, máx. 5 usuarios.  
> ✅ Con auditoría aprobada: posts públicos, hasta 15 vídeos/día.

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `TIKTOK_CLIENT_KEY` | string | Client Key de tu app |
| `TIKTOK_CLIENT_SECRET` | string | Client Secret de tu app |
| `TIKTOK_ACCESS_TOKEN` | string | Access Token del usuario autenticado (OAuth 2.0) |

---

### 7. X / Twitter ⚠️ Tier gratuito muy limitado

> **Coste:** Free: 1.500 tweets/mes | Basic: $100/mes → 3.000 tweets/mes  
> **Obtener:** [developer.twitter.com](https://developer.twitter.com) → Tu app → Keys and Tokens

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `TWITTER_API_KEY` | string | Consumer Key |
| `TWITTER_API_SECRET` | string | Consumer Secret |
| `TWITTER_ACCESS_TOKEN` | string | Access Token del usuario |
| `TWITTER_ACCESS_TOKEN_SECRET` | string | Access Token Secret del usuario |
| `TWITTER_BEARER_TOKEN` | string | Bearer Token (lectura) |

---

### 8. YouTube ✅ Gratis

> **Requisitos:**
> - Proyecto en [console.cloud.google.com](https://console.cloud.google.com)
> - Activar **YouTube Data API v3**
> - Crear credenciales **OAuth 2.0 → Aplicación web**
>
> **Obtener el Refresh Token:** [OAuth 2.0 Playground](https://developers.google.com/oauthplayground) → YouTube Data API v3 → Autoriza → Exchange authorization code for tokens → copia `refresh_token`

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `YOUTUBE_CLIENT_ID` | string | Client ID OAuth 2.0 (termina en `.apps.googleusercontent.com`) |
| `YOUTUBE_CLIENT_SECRET` | string | Client Secret OAuth 2.0 |
| `YOUTUBE_REFRESH_TOKEN` | string | Refresh Token de larga duración del usuario |

---

## 📡 API Reference

### Autenticación interna

Los endpoints del cron y del webhook usan autenticación por header secreto:

| Endpoint | Header |
|----------|--------|
| `GET /api/cron/publish` | `Authorization: Bearer {CRON_SECRET}` |
| `POST /api/webhook/n8n` | `x-webhook-secret: {N8N_WEBHOOK_SECRET}` |

---

### `GET /api/posts`

Lista todos los posts programados ordenados por fecha.

**Respuesta 200:**
```json
{
  "posts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Mi primer Reel",
      "description": "Texto del caption",
      "hashtags": ["viral", "reels", "fyp"],
      "media_url": "https://res.cloudinary.com/mi-cloud/video/upload/v1/social-scheduler/mi-video.mp4",
      "media_public_id": "social-scheduler/mi-video",
      "platforms": ["instagram", "tiktok", "youtube"],
      "scheduled_at": "2026-02-25T10:00:00.000Z",
      "status": "pending",
      "error_message": null,
      "platform_results": null,
      "created_at": "2026-02-24T09:00:00.000Z",
      "updated_at": "2026-02-24T09:00:00.000Z"
    }
  ]
}
```

**Ejemplo (cURL):**
```bash
curl https://tu-app.vercel.app/api/posts
```

**Ejemplo (JavaScript):**
```js
const res = await fetch('/api/posts');
const { posts } = await res.json();
```

---

### `POST /api/posts`

Crea un post programado.

**Body (JSON):**
```json
{
  "title": "Mi primer Reel",
  "description": "Caption del post",
  "hashtags": ["viral", "reels"],
  "mediaUrl": "https://res.cloudinary.com/mi-cloud/video/upload/v1/social-scheduler/video.mp4",
  "mediaPublicId": "social-scheduler/1708768000-video",
  "platforms": ["instagram", "tiktok", "youtube"],
  "scheduledAt": "2026-02-25T10:00:00.000Z"
}
```

| Campo | Tipo | Req. | Descripción |
|-------|------|------|-------------|
| `title` | string | ✅ | Título (usado en YouTube, máx. 100 chars) |
| `description` | string | ❌ | Caption/descripción del post |
| `hashtags` | string[] | ❌ | Sin `#`, se añade automáticamente |
| `mediaUrl` | string | ✅ | URL pública del vídeo en Cloudinary |
| `mediaPublicId` | string | ❌ | Public ID de Cloudinary (para borrar si hace falta) |
| `platforms` | string[] | ✅ | Uno o varios de: `instagram`, `tiktok`, `youtube`, `twitter` |
| `scheduledAt` | ISO 8601 | ✅ | Debe ser en el futuro (mínimo +5 min) |

**Respuesta 201:**
```json
{
  "post": { "id": "550e8400-...", "status": "pending", "..." }
}
```

**Errores:**

| Código | Error | Causa |
|--------|-------|-------|
| `400` | `Missing required fields` | Falta `title`, `mediaUrl`, `platforms` o `scheduledAt` |
| `400` | `Scheduled time must be in the future` | `scheduledAt` es pasado |
| `500` | `Failed to create post` | Error de BD |

**Ejemplo (cURL):**
```bash
curl -X POST https://tu-app.vercel.app/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mi Reel",
    "description": "Mira este vídeo!",
    "hashtags": ["fyp", "viral"],
    "mediaUrl": "https://res.cloudinary.com/mi-cloud/video/upload/v1/social-scheduler/video.mp4",
    "platforms": ["instagram", "tiktok"],
    "scheduledAt": "2026-02-25T10:00:00.000Z"
  }'
```

---

### `DELETE /api/posts/:id`

Elimina un post (solo si está en estado `pending`).

**Respuesta 200:**
```json
{ "success": true }
```

**Errores:**

| Código | Error | Causa |
|--------|-------|-------|
| `404` | `Post not found` | ID no existe |
| `400` | `Cannot delete an already published post` | El post ya fue publicado |

---

### `POST /api/upload`

Sube un vídeo a Cloudinary y devuelve la URL pública.

**Body:** `multipart/form-data` con campo `file` (vídeo MP4/MOV/WebM, máx 500 MB)

**Respuesta 200:**
```json
{
  "url": "https://res.cloudinary.com/mi-cloud/video/upload/v1/social-scheduler/1708768000-video.mp4",
  "publicId": "social-scheduler/1708768000-video"
}
```

**Errores:**

| Código | Error | Causa |
|--------|-------|-------|
| `400` | `No file provided` | Falta el campo `file` |
| `400` | `Invalid file type` | No es MP4, MOV ni WebM |
| `400` | `File too large` | Supera 500 MB |
| `500` | `Failed to upload video` | Error de Cloudinary |

**Ejemplo (JavaScript):**
```js
const formData = new FormData();
formData.append('file', videoFile);

const res = await fetch('/api/upload', { method: 'POST', body: formData });
const { url, publicId } = await res.json();
```

---

### `GET /api/cron/publish` 🔒

Ejecutado por Vercel Cron cada minuto. Busca posts pendientes y los dispara a n8n.

**Header requerido:**
```
Authorization: Bearer {CRON_SECRET}
```

**Respuesta 200:**
```json
{
  "message": "Processed 2 posts, triggered 2 successfully",
  "processed": 2,
  "successful": 2
}
```

---

### `POST /api/webhook/n8n` 🔒

n8n llama a este endpoint tras publicar, para actualizar el estado en BD.

**Header requerido:**
```
x-webhook-secret: {N8N_WEBHOOK_SECRET}
```

**Body:**
```json
{
  "postId": "550e8400-e29b-41d4-a716-446655440000",
  "success": true,
  "platformResults": {
    "instagram": { "success": true, "url": "https://www.instagram.com/p/ABC123/" },
    "tiktok":    { "success": true, "url": "https://www.tiktok.com/@user/video/123" },
    "youtube":   { "success": false, "error": "quota exceeded" }
  }
}
```

---

## 🗄️ Modelo de datos

### Tabla `scheduled_posts`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | Identificador único (auto-generado) |
| `title` | TEXT | Título del post |
| `description` | TEXT | Caption / descripción |
| `hashtags` | TEXT[] | Array de hashtags sin `#` |
| `media_url` | TEXT | URL pública del vídeo en Cloudinary |
| `media_public_id` | TEXT | Public ID de Cloudinary |
| `platforms` | TEXT[] | Plataformas destino |
| `scheduled_at` | TIMESTAMPTZ | Fecha/hora de publicación programada |
| `status` | TEXT | `pending` \| `publishing` \| `published` \| `failed` |
| `error_message` | TEXT | Mensaje de error (si falló) |
| `platform_results` | JSONB | Resultado por plataforma tras publicar |
| `created_at` | TIMESTAMPTZ | Fecha de creación |
| `updated_at` | TIMESTAMPTZ | Última actualización |

### Estados del post

```
pending → publishing → published
                    ↘ failed
```

| Estado | Descripción |
|--------|-------------|
| `pending` | Esperando la fecha programada |
| `publishing` | Cron lo detectó, n8n está publicando |
| `published` | Publicado en todas las plataformas |
| `failed` | Error al publicar (ver `error_message`) |

---

## 🚀 Despliegue en Vercel

### Opción A — CLI (recomendado)

```bash
npm i -g vercel
vercel
```

### Opción B — Conectar repo GitHub

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Importa el repositorio `Hanksito/autoupload`
3. Vercel detecta Next.js automáticamente → clic en **Deploy**

### Configurar variables de entorno

Tras desplegar: **Settings → Environment Variables** → añade todas las del `.env.local`.

### Cron automático

El archivo `vercel.json` ya configura el cron para ejecutarse **cada minuto**:

```json
{
  "crons": [{ "path": "/api/cron/publish", "schedule": "* * * * *" }]
}
```

> ⚠️ Los crons de Vercel requieren un plan Pro para frecuencias < 1h. En el plan Free, cambia a `"0 * * * *"` (cada hora).

---

## 🤖 Configuración de n8n

### 1. Despliegue en Railway (gratis)

1. Ve a [railway.app](https://railway.app) → **New Project** → **Deploy from Template** → busca `n8n`
2. Anota la URL pública: `https://tu-n8n.railway.app`
3. Accede al panel de n8n con esa URL

### 2. Importar el workflow

1. En n8n: **Workflows → Import from File**
2. Selecciona `n8n-workflows/social-publisher.json` del repositorio
3. El workflow tiene estas ramas en paralelo:

```
Webhook Trigger
├── ¿platforms incluye "instagram"? → Instagram: Upload Reel → Publish
├── ¿platforms incluye "tiktok"?    → TikTok: Publish Video
├── ¿platforms incluye "youtube"?   → YouTube: Upload Short
└── ¿platforms incluye "twitter"?   → X/Twitter: Post Tweet
                                              ↓ (todas)
                               Callback: POST /api/webhook/n8n
```

### 3. Variables de entorno en n8n

En Railway → Variables, añade:

| Variable | Valor |
|----------|-------|
| `NEXTJS_URL` | URL de tu app en Vercel (ej: `https://autoupload.vercel.app`) |
| `N8N_WEBHOOK_SECRET` | El mismo valor que en Vercel |
| `INSTAGRAM_ACCESS_TOKEN` | Token de Instagram |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | ID de cuenta |
| `TIKTOK_ACCESS_TOKEN` | Token de TikTok |
| `YOUTUBE_ACCESS_TOKEN` | Token de YouTube (generado con Refresh Token) |

### 4. Copiar la URL del webhook

En n8n → abre el workflow → clic en el nodo **Webhook Trigger** → copia la **Production URL**.  
Esa URL es tu `N8N_WEBHOOK_URL` en Vercel.

---

## 🐛 Errores y troubleshooting

### "Failed to fetch posts" en consola

**Causa:** No está configurada `DATABASE_URL` en `.env.local`.  
**Solución:** Crea una BD en [neon.tech](https://neon.tech) y añade la variable.

---

### Posts en estado `publishing` que no avanzan

**Causa:** n8n no pudo llamar al callback `/api/webhook/n8n`.  
**Pasos:**
1. Revisa los logs del workflow en n8n
2. Verifica que `NEXTJS_URL` en n8n apunta a la URL correcta de Vercel
3. Verifica que `N8N_WEBHOOK_SECRET` coincide en ambos lados

---

### Error de Cloudinary al subir vídeo

**Causa:** Credenciales incorrectas o vídeo demasiado grande.  
**Solución:**
- Verifica `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`
- El vídeo debe ser MP4/MOV/WebM y pesar menos de 500 MB

---

### Instagram devuelve error 400

**Causa más común:** El token de acceso expiró (caduca cada 60 días).  
**Solución:** Renueva el token en developers.facebook.com → Tu App → Instagram → Generar nuevo token.

---

### El cron no publica en Vercel Free

**Causa:** Vercel Free solo permite crons con frecuencia mínima de 1 vez/hora.  
**Solución:** Cambia `vercel.json` a `"0 * * * *"` o actualiza a Vercel Pro.

---

## 📊 Límites de las APIs

| Plataforma | Límite | Notas |
|-----------|--------|-------|
| Instagram | 100 posts/24h | Requiere cuenta Business/Creator |
| TikTok | 15 vídeos/día | Solo con app auditada; sin auditar: privado |
| YouTube | ~6 vídeos/día | 10.000 unidades/día; subir vídeo = 1.600 unidades |
| X/Twitter | 1.500 tweets/**mes** | Free tier muy limitado; Basic = $100/mes |

---

## 📁 Estructura del proyecto

```
perihelion-orbit/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Dashboard con estadísticas y calendario
│   │   ├── new/page.tsx              # Formulario de nuevo Reel
│   │   ├── globals.css               # Diseño oscuro, glassmorphism
│   │   └── api/
│   │       ├── posts/route.ts        # GET, POST /api/posts
│   │       ├── posts/[id]/route.ts   # DELETE /api/posts/:id
│   │       ├── upload/route.ts       # POST /api/upload (→ Cloudinary)
│   │       ├── cron/publish/route.ts # GET /api/cron/publish (Vercel Cron)
│   │       └── webhook/n8n/route.ts  # POST /api/webhook/n8n (callback)
│   ├── components/
│   │   ├── CalendarView.tsx          # Calendario mensual interactivo
│   │   └── PostCard.tsx              # Tarjeta de post con estado
│   └── lib/
│       ├── db.ts                     # Neon Postgres client + CRUD
│       ├── cloudinary.ts             # Upload/delete de vídeos
│       └── n8n.ts                    # Trigger webhook n8n
├── n8n-workflows/
│   └── social-publisher.json         # Workflow n8n listo para importar
├── vercel.json                       # Cron cada minuto
├── .env.example                      # Plantilla de variables documentada
└── README.md                         # Este archivo
```

---

## 📄 Licencia

MIT — Úsalo, modifícalo y compártelo libremente.
