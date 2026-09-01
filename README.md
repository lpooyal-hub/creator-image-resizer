# Creator Image Resizer

A browser-first image resizing and conversion tool for creators.

Live demo: https://creator-image-resizer-beta.vercel.app/

Upload an image, resize it manually or with platform presets, convert it to PNG/JPEG/WebP, and download the result. Image processing happens locally in the browser with Canvas. User images are not uploaded or stored on the server.

It also includes an AI Background Remover that runs a U^2-Net segmentation model directly in the browser via onnxruntime-web, and an experimental Avatar Preview page for testing simple browser motion effects on PNG character images. Transparent PNGs work best, but it does not create Live2D models.

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
- Set a custom output filename.
- Process images locally with Canvas.
- Remove an image background with AI and download a transparent PNG.
- Preview simple avatar motion effects on a separate experimental page.

## AI Background Remover

The background remover runs [U^2-Net](https://github.com/xuebinqin/U-2-Net) (small variant, Apache-2.0)
through `onnxruntime-web`. The model and the inference both live in the browser, so images are never
uploaded — same privacy guarantee as the resizer.

The model file is committed at `frontend/public/models/u2netp.onnx` (~4.4 MB). To re-download it:

```bash
curl -L -o frontend/public/models/u2netp.onnx \
  https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2netp.onnx
```

Notes:
- The `onnxruntime-web` version in `frontend/package.json` and `ORT_VERSION` in
  `frontend/src/utils/backgroundRemoval.js` must match — the WASM binaries are loaded from a CDN
  path built from that version.
- Inference is single-threaded because multi-threaded WASM needs `SharedArrayBuffer`, which needs
  COOP/COEP headers that static hosting does not send.
- Background removal is capped at 12 megapixels (lower than the resizer's 40 MP) because the mask is
  composited at full resolution.

## SEO landing pages

Each entry in `frontend/src/utils/seoLandingPages.js` has a matching static HTML file at the
frontend root (for example `background-remover.html`). `vite.config.js` turns each one into its own
build input, so every landing page ships real crawlable `<h1>`/`<meta>` markup instead of relying on
client-side rendering. Adding a page means: add the entry, add the HTML file, and add the slug to
both `frontend/public/sitemap.xml` and the rewrite exclusion list in `vercel.json`.

## Privacy

Images are processed locally in the browser. The backend does not receive, upload, or store user images.

## Current scope

- Supported input types: PNG, JPEG, WebP.
- Maximum image size: 40 megapixels for resizing, 12 megapixels for background removal.
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
