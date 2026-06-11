# Creator Image Resizer

A browser-first image resizing and conversion tool for creators.

Live demo: https://creator-image-resizer-beta.vercel.app/

Upload an image, resize it manually or with platform presets, convert it to PNG/JPEG/WebP, and download the result. Image processing happens locally in the browser with Canvas. User images are not uploaded or stored on the server.

The app also includes an experimental Avatar Preview page for testing simple browser motion effects on PNG character images. Transparent PNGs work best, but it does not create Live2D models.

## What it does

- Drag and drop or pick an image.
- Preview the image and original file details.
- Resize with optional aspect ratio locking.
- Apply platform presets for social media, developer, and game creator image sizes.
- Export as PNG, JPEG, or WebP.
- Adjust JPEG/WebP output quality.
- Choose Fit, Fill, or Stretch output behavior to avoid accidental distortion.
- Choose the background color used by Fit mode.
- Generate an export preview before downloading.
- Process images locally with Canvas.
- Preview simple avatar motion effects on a separate experimental page.

## Privacy

Images are processed locally in the browser. The backend does not receive, upload, or store user images.

## Current scope

- Supported input types: PNG, JPEG, WebP.
- Maximum image size: 40 megapixels.
- Live2D features are intentionally not implemented yet.
- Avatar Preview is a visual preview only. It does not generate rigged models.
- The backend is only a health check API for future expansion.

## Project structure

```text
frontend/   React + Vite app
backend/    FastAPI health check
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on Vite's default port `5173` locally.

## Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend currently exposes only:

- `GET /health`

## Vercel

This repository is configured for Vercel through `vercel.json`.

- Install command: `cd frontend && npm install`
- Build command: `cd frontend && npm run build`
- Output directory: `frontend/dist`

## Docker

Useful on servers where Node is not installed directly:

```bash
docker compose up --build
```

- Frontend: `http://localhost:5174`
- Backend: `http://localhost:8010/health`
