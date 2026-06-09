# Creator Image Resizer

A small React + FastAPI MVP for resizing and converting images locally in the browser.

## What it does

- Drag and drop or pick an image.
- Preview the image and original file details.
- Resize with optional aspect ratio locking.
- Export as PNG, JPEG, or WebP.
- Process images locally with Canvas. Images are not uploaded to the server.

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

## Docker

Useful on servers where Node is not installed directly:

```bash
docker compose up --build
```

- Frontend: `http://localhost:5174`
- Backend: `http://localhost:8010/health`
