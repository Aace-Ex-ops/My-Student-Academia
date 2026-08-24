# 🚀 My Student Academia — Deployment Guide (Cloudflare & Firebase)

This guide provides step-by-step instructions for deploying the **My Student Academia** web application to **Cloudflare Pages** (Global Edge CDN) and **Firebase Hosting** (Google Cloud), along with production backend hosting options.

---

## ⚡ Option 1: Deploy to Cloudflare Pages (Recommended for Global Edge CDN)

Cloudflare Pages provides free hosting with unlimited bandwidth, global edge caching, and sub-50ms response times worldwide.

### Method A: 1-Click Git Integration (Automatic Continuous Deployment)
1. Push your repository to **GitHub** or **GitLab**.
2. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Select your repository `My Student Academia`.
4. Configure Build Settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `frontend`
5. (Optional) Set Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-backend-api-url.com/api` (or keep `/api` if using a proxy/redirect)
6. Click **Save and Deploy**.
   - Your frontend will be live at `https://my-student-academia.pages.dev`!

### Method B: Deploy via Wrangler CLI
1. Build the production assets:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy directly with Wrangler:
   ```bash
   npx wrangler pages deploy dist --project-name=my-student-academia
   ```
3. Follow the CLI prompt to log in to Cloudflare.

> ℹ️ Single-Page App (SPA) fallback routing is already pre-configured via `frontend/public/_redirects` (`/* /index.html 200`), so refreshing pages like `/dashboard` or `/catalog` will work seamlessly.

---

## 🔥 Option 2: Deploy to Firebase Hosting (Google Cloud Ecosystem)

Firebase Hosting provides ultra-fast global content delivery with integrated SSL certificates.

### Step-by-Step Firebase Deployment:
1. Install the Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```
2. Log in to Firebase:
   ```bash
   firebase login
   ```
3. Build the frontend production assets:
   ```bash
   cd frontend
   npm run build
   cd ..
   ```
4. (Optional) If you have a specific Firebase project, select it:
   ```bash
   firebase use <your-firebase-project-id>
   ```
5. Deploy to Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```
   - Your app will be live at `https://<your-project-id>.web.app` or `https://<your-project-id>.firebaseapp.com`!

> ℹ️ SPA routing is pre-configured in `firebase.json` with `"rewrites": [{ "source": "**", "destination": "/index.html" }]`.

---

## 🖧 Production Backend API Deployment Options

The backend uses **Express + SQLite with Prisma ORM**. Here are the best free/affordable cloud deployment options:

### Option A: Google Cloud Run (Recommended with Firebase)
Because Google Cloud Run natively builds your container from the root `Dockerfile`:
```bash
gcloud run deploy my-student-academia-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 5000
```

### Option B: Render.com (Free Tier with 1-Click Deploy)
1. Go to [Render.com](https://dashboard.render.com/) → **New Web Service**.
2. Connect your GitHub repository.
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
4. Copy your Render backend URL (e.g. `https://msa-api.onrender.com`) and paste it into `frontend/.env` as `VITE_API_BASE_URL=https://msa-api.onrender.com/api`.

### Option C: Railway.app / Fly.io
1. In `backend/`:
   ```bash
   railway up
   ```
   or
   ```bash
   fly launch
   ```

---

## 🧪 Local Build & Verification

To verify that your build output is ready for both Cloudflare and Firebase:

```bash
# 1. Build frontend
cd frontend
npm run build

# 2. Verify dist folder contains _redirects and _headers
ls dist/_redirects dist/_headers
```
