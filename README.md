# 🚀 NASA Explorer

An interactive **NASA Explorer Dashboard** built with **React + TypeScript (Vite)** on the frontend and **Express + TypeScript + Redis caching** on the backend.  
It integrates multiple **NASA APIs** (APOD, Mars Rover Photos, NEOs, EONET Earth events, DONKI, TechTransfer) into one unified explorer app.

---

## ✨ Features

- **Astronomy Picture of the Day (APOD)** – view NASA’s daily highlight image.
- **Near-Earth Objects (NEO)** – fetch & chart asteroids close to Earth, with derived statistics.
- **Mars Rover Photos** – browse rover images filtered by date, camera, and rover.
- **EONET Earth Events** – explore real-time Earth events (wildfires, storms, floods, etc.) on an interactive map.
- **DONKI Space Weather** – retrieve notifications about solar storms and other space weather activity.
- **Tech Transfer** – search NASA’s technology database.
- **Swagger/OpenAPI Docs** – self-documented REST API at `/docs`.
- **Caching with Redis** – improves API performance.
- **Dockerized** – portable, production-ready with PM2 process manager.
- **Deploy-ready for Render** – includes `Dockerfile` and `render.yaml`.

---

## 🛠️ Project Structure

```
nasa-explorer/
├── client/               # React + Vite + TS frontend
│   ├── src/
│   │   ├── modules/      # Feature-based components (Apod, Mars, Eonet, etc.)
│   │   ├── helpers/      # Utility functions (date, number formatting, etc.)
│   │   ├── hooks/        # Custom hooks (useObservable, etc.)
│   │   ├── services/     # Frontend API calls (React Query)
│   │   └── main.tsx      # App entry
│   └── public/           # Static assets (favicon, etc.)
│
├── server/               # Express backend
│   ├── src/
│   │   ├── routes/       # API endpoints (apod, neo, mars, eonet, etc.)
│   │   ├── middleware/   # Validation & error handling
│   │   ├── cache/        # Redis caching helpers
│   │   ├── logger.ts     # Pino logger
│   │   ├── config.ts     # Env config
│   │   └── index.ts      # Express app entry
│   └── dist/             # Compiled output (after build)
│
├── render.yaml           # Render deployment blueprint
├── Dockerfile            # Docker setup (multi-stage, PM2)
├── tsconfig.json         # Shared TypeScript config
└── README.md             # This file
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- npm or pnpm
- Redis (optional but recommended for caching)

### 1. Clone & install
```bash
git clone https://github.com/muditstja/nasa-explorer.git
cd nasa-explorer
```

Frontend:
```bash
cd client
npm install
```

Backend:
```bash
cd ../server
npm install
```

### 2. Build frontend
```bash
cd client
npm run build   # outputs build into ../server/build
```

### 3. Build backend
```bash
cd ../server
npm run build   # compiles TS -> dist/
```

### 4. Run backend (with PM2)
```bash
cd server
pm2 start dist/index.js --name nasa-explorer
```

Server runs at:  
👉 http://localhost:8080  
Docs at:  
👉 http://localhost:8080/docs

---

## 🌍 Deployment (Render)

This repo includes a **Dockerfile** and a **Render blueprint** (`render.yaml`).  

1. Push code to GitHub.
2. In [Render](https://render.com):
   - Create a **Blueprint** from your repo → it auto-detects `render.yaml`.
   - Deploys:
     - A **Web Service** (Docker-based Express app).
     - A **Redis instance** (free tier).
3. Set env vars in Render dashboard:
   - `NASA_API_KEY` (from https://api.nasa.gov)
   - `ALLOWED_ORIGINS` (`https://nasa-explorer-l5v6.onrender.com`)
4. Done 🚀

---

## 🔑 Environment Variables

| Variable          | Description                                |
|-------------------|--------------------------------------------|
| `NASA_API_KEY`    | Required NASA API key (free from NASA)     |
| `PORT`            | Port server listens on (default: 8080)     |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed frontends  |
| `REDIS_URL`       | Redis connection string (auto on Render)   |

---

## 📖 API Endpoints

Swagger/OpenAPI available at `/docs`.  

Main routes:
- `GET /api/apod` → Astronomy Picture of the Day
- `GET /api/neo/stats` → Near-Earth Object stats
- `GET /api/mars/photos` → Rover images
- `GET /api/events` → EONET Earth events
- `GET /api/donki` → Space weather
- `GET /api/tech` → Tech Transfer DB

---

## 🧰 Tech Stack

**Frontend**:
- React + TypeScript
- React Query
- React Leaflet (maps)
- Tailwind CSS
- RxJs

**Backend**:
- Express + TypeScript
- Zod (API request parameter runtime validation)
- Redis (caching)
- Pino (logging)
- PM2 (process manager)

**Infra**:
- Docker
- Render (deploy)
- Swagger/OpenAPI

---

## 📜 License

MIT – free to use, modify, and distribute.
