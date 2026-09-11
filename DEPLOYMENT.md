# NTIS Deployment Guide (Production & Cloud Hosting)

This guide walks you through deploying the **NTIS (National Thermal Intelligence System)** to the cloud for free with automatic CI/CD on every git push.

---

## Architecture Overview
The project has two distinct components:
1. **Backend (`backend/`):** Python Flask REST API with Gunicorn WSGI server, scikit-learn ML model, and SQLite/PostgreSQL fallback.
2. **Frontend (`thermal-watch-ai/`):** React 18 + Vite + Tailwind CSS + Leaflet Single Page Application (SPA).

---

## Recommended Free Deployment Stack

| Component | Platform | Free Tier | Deploy Time |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Vercel** or **Netlify** | 100% Free, Global CDN, SSL | ~1 minute |
| **Backend** | **Render** or **Railway** | Free Web Service tier, SSL | ~3 minutes |

---

## Method 1: The Recommended Free Setup (Render Backend + Vercel Frontend)

### Step 1: Deploy the Backend on Render (Free Web Service)

1. Go to [https://render.com](https://render.com) and log in with your GitHub account.
2. Click **New +** ➔ **Web Service**.
3. Connect your GitHub repository: `vivekramina/NTIS--National-Thermal-Intelligence-System-`.
4. Configure the settings:
   - **Name:** `ntis-backend` (or any name you prefer)
   - **Region:** Singapore / Frankfurt / Oregon (closest to your users)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn run:app`
   - **Instance Type:** `Free`
5. Under **Environment Variables**, add:
   - `FLASK_ENV` = `production`
   - `FLASK_DEBUG` = `false`
   - `DEMO_MODE` = `true`
   - `CORS_ORIGINS` = `*`
6. Click **Create Web Service**.
7. Wait 2–3 minutes until the deployment completes. Render will provide you with a public URL:
   ```
   https://ntis-backend-xxxx.onrender.com
   ```
   *(Test it in your browser: `https://ntis-backend-xxxx.onrender.com/api/health` should return `{"status":"healthy"}`)*

---

### Step 2: Deploy the Frontend on Vercel (Zero-Config 1-Click Deployment)

The repository is now pre-configured for **Zero-Config Vercel Hosting**. You do not need to manually configure build commands or environment variables — everything connects automatically:

1. Go to [https://vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** ➔ **Project**.
3. Import your GitHub repository: `vivekramina/NTIS--National-Thermal-Intelligence-System-`.
4. Leave all settings at their defaults:
   - **Framework Preset:** `Vite` (auto-detected)
   - **Root Directory:** `./` (or `thermal-watch-ai` — both are supported automatically)
   - **Build & Output Settings:** Auto-configured via `vercel.json`
   - **API Connection:** Automatically configured to connect to your live Render backend (`https://ntis-backend-ynam.onrender.com/api`)
5. Click **Deploy**.
6. Within 60 seconds, your site will be live at:
   ```
   https://ntis-thermal-watch.vercel.app
   ```
   *(Or your custom Vercel URL)*

---

## Method 2: 1-Click All-in-One Deployment on Render (Blueprint)

This repository includes a pre-configured `render.yaml` Blueprint file.

1. Go to [https://dashboard.render.com/blueprints](https://dashboard.render.com/blueprints).
2. Click **New Blueprint Instance**.
3. Select your repository: `vivekramina/NTIS--National-Thermal-Intelligence-System-`.
4. Render will automatically detect both `ntis-backend` and `ntis-frontend` and configure routing and environment variables between them.
5. Click **Apply**. Both the backend API and frontend website will be built and deployed automatically!

---

## Method 3: Deploying Frontend on Netlify (Alternative)

1. Log in to [https://netlify.com](https://netlify.com).
2. Click **Add new site** ➔ **Import an existing project** ➔ **GitHub**.
3. Select `vivekramina/NTIS--National-Thermal-Intelligence-System-`.
4. Settings:
   - **Base directory:** `thermal-watch-ai`
   - **Build command:** `npm run build`
   - **Publish directory:** `thermal-watch-ai/dist`
5. In **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://your-backend-url.onrender.com/api`
6. Click **Deploy Site**. The `_redirects` file included in `thermal-watch-ai/public/` handles all SPA routing.

---

## Post-Deployment Verification Checklist

- [ ] Visit the frontend URL in your browser.
- [ ] Verify that the Live Radiometric Canvas loads India's satellite tiles.
- [ ] Check the **Detection Telemetry Trend** card (all ranges `24h`, `7d`, `30d`, and `90d`).
- [ ] Open the **Categories** matrix modal to verify 16-category ML classes.
- [ ] Inspect the browser developer console (F12) to ensure network requests to `/api/*` succeed with `HTTP 200`.
