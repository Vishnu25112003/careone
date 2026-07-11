---
name: verify
description: Build, launch and drive the CareOne site (client + server + postgres) to verify changes at the browser surface.
---

# Verifying CareOne changes

## Launch

1. Postgres (Docker, port 5433): `docker start careone-postgres`.
   If bridge networking fails ("failed to add the host … pair interfaces: operation not supported" — happens after a kernel update until reboot), use the host-network fallback which shares the same data volume:
   `docker run -d --name careone-pg-host --network host -e PGPORT=5433 -v careone_pgdata:/var/lib/postgresql/data postgres:16-alpine`
2. Server: `cd server && npx prisma migrate deploy && npx prisma generate && npm run dev` → http://localhost:5000. A fresh checkout needs `prisma generate` or the server crashes with "PrismaClient not exported".
3. Client: `cd client && npm run dev` → http://localhost:5173.

## Drive

- No Playwright in the repo; install `playwright-core` in the scratchpad and launch with `executablePath: "/usr/bin/chromium"` (system Chromium; the ms-playwright cache also exists).
- The public site shows a full-screen loader for ~1.1s after every page load — wait ≥1.5s before screenshots or the loader covers the first viewport.
- Flows worth driving: home "Make an Appointment" (empty → error, bad phone → error, valid → success panel + row in DB), Contact "Request a Callback" form, footer callback band (phone only), FAQ accordion on /about, service tabs on /services, mobile menu at 390px (`button[aria-label="Toggle menu"]`).
- Forms POST to `/api/requests`; server accepts only names 2-60 chars, `[6-9]` 10-digit phones, and services from its SERVICE_OPTIONS list (keep client options in sync with server/src/controllers/requests.controller.js).
- Selector gotcha: desktop and mobile nav both render `<a>` links — use `:visible` or you'll hit the hidden desktop one; the footer also has Home/Gallery/etc. links.
