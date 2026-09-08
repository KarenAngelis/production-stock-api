# Deployment and demo modes

## Published browser demo

Public portfolio demo: https://stockmaster-karen-demo.kdenich16.chatgpt.site . Public access was enabled and verified on 2026-09-08. The link can be shared with recruiters.

The portfolio demo uses `REACT_APP_DEMO_MODE=true` at build time. It is a static React build with per-tab fictional data. It has no backend or database connection, so visitors cannot change a shared inventory. Hash-based routing keeps all screens accessible on static hosting.

Normal application builds leave this variable unset or set it to `false`; they call the real FastAPI backend. CI end-to-end tests explicitly disable demo mode.

## Full-stack local Docker environment

```bash
docker compose up --build
docker compose logs -f backend
docker compose down
```

Open `http://localhost:3000` and `http://localhost:8000/docs`. PostgreSQL uses host port 5433. Compose waits for the database health check before starting the API. Named database volumes survive `docker compose down`; do not remove volumes unless their data is disposable.

The Compose credentials are development examples. This configuration uses development servers and is not an internet production configuration. Docker is not available in the implementation environment, so this flow is documented but not runtime-verified here.

## Preparing an actual server deployment

1. Provision a PostgreSQL service and a Python container host; keep the database network private.
2. Configure `DATABASE_URL` with the `postgresql+psycopg` driver, `STRICT_DB=1`, and real secrets through the host's secret manager. Do not commit environment files or log connection strings.
3. Before public API exposure, implement authentication and per-user/organization authorization. Restrict CORS to the real frontend origin; the existing development CORS configuration is not appropriate for production.
4. Build the frontend with its public HTTPS API URL in `REACT_APP_API_URL`; this is embedded at build time, not dynamically read from runtime secrets.
5. Use the host's managed TLS or a properly configured reverse proxy for HTTPS. Expose only the necessary web ports. Do not publish PostgreSQL port 5432.
6. Replace table creation on import with reviewed schema migrations; establish backup and recovery procedures.
7. Verify health endpoint `/`, application/database logs and an isolated synthetic-data smoke test. Never include passwords, tokens or real user data in logs.

The published static demo does not prove that steps 1–7 have been executed. Its purpose is an interactive portfolio walkthrough while the repository and CI demonstrate the actual API.
