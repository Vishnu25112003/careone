# CareOne — Hosting & Infrastructure Reference

> **Who this is for:** Developers joining the project who need to understand how the production server works, why decisions were made, and how to operate it safely.
>
> For the step-by-step first-time setup, see [DEPLOYMENT.md](./DEPLOYMENT.md). This file is the reference you come back to afterwards.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Server Details](#2-server-details)
3. [Project Structure](#3-project-structure)
4. [Docker Services](#4-docker-services)
5. [Environment Variables](#5-environment-variables)
6. [How Deployments Work](#6-how-deployments-work)
7. [Common Operations](#7-common-operations)
8. [Design Decisions & Known Issues](#8-design-decisions--known-issues)
9. [Known Limitations & Future Work](#9-known-limitations--future-work)
10. [Troubleshooting Runbook](#10-troubleshooting-runbook)

---

## 1. Architecture Overview

```
Internet
   │
   ▼
[ nammaguide-nginx :80/:443 ]  ◄── the shared edge. NOT part of the CareOne
   │        │                          stack. SSL for every domain on this VPS.
   │        ├──► nammaguide.in, www., admin.        (static: /var/www/user,
   │        │                                        /var/www/admin + its API)
   │        ├──► c2kitchen.in, admin., www.         (C2K, via c2k-nginx:8081)
   │        └──► careone.example.com, www.…
   │                        │  proxy_pass http://careone-web:80
   │                        ▼
   │             [ careone-web ]  nginx:1.27-alpine
   │                   │        │  serves /var/www/site (baked into the image)
   │                   │        └──► /api/ ──► [ careone-api ] node:20-alpine
   │                   │                              │
   │                   │                              ▼
   │                   │                      [ careone-postgres ] :16-alpine
   │                   │                              │
   │                   │                              └── volume careone_postgres_data
   │                   └── also on the edge network, alias `careone-web`

Three containers on their own bridge network (careone-net) with their own
volume. Only careone-web is also attached to the edge network, and only so the
edge can resolve it by name. No CareOne container binds a public port.
```

### Key design decisions

| Decision | Why |
|---|---|
| CareOne runs its own nginx | It owns its static files and its `/api` routing, so the edge only needs to know one hostname maps to one container. Changing CareOne's internal routing never touches shared config. |
| Frontend is built in Docker | The VPS needs no Node.js for CareOne. The build is identical on a laptop and on the server. |
| `dist/` is gitignored | The image is the artifact. C2K commits `dist/` and pays for it with a `git restore`/`git clean` dance on every deploy. |
| Database in a container | Isolated from the other two projects' databases. Backup and restore are one command each. |
| No uploads volume | Gallery images stream to Cloudinary. Nothing is written to disk, so the API is fully stateless. |
| Loopback-only host ports | `5434`, `3003`, `8080` are for debugging. Nothing new is exposed, and no `ufw` rule was added. |

### CareOne vs C2K

| | C2K | CareOne |
|---|---|---|
| Owns ports 80/443 | No, not any more — it publishes 8081/8443 and is reached through `nammaguide-nginx` | No — reached through `nammaguide-nginx` |
| Frontend build | On the VPS, via nvm Node 22 | Inside Docker |
| `dist/` in git | Committed | Gitignored |
| SSL termination | Its own nginx | The shared edge |
| Local uploads | `backend_uploads` volume | None — Cloudinary only |
| Health endpoint | `/health` | `/api/health` |
| Entrypoint | Migrations | Migrations **and** admin seed |
| Frontends | Two (user + admin, separate domains) | One SPA; `/admin/*` is a client route |

---

## 2. Server Details

| Item | Value |
|---|---|
| Host | Hostinger VPS, Ubuntu 22.04 |
| Tenants | Three projects, three Linux users |
| CareOne user | `careone` — in the `docker` group, **not** in `sudo` |
| App directory | `/var/www/careone` |
| Backups | `/var/www/careone/backups/` (gitignored) |
| Docker volume | `careone_postgres_data` → `/var/lib/docker/volumes/careone_postgres_data/` |
| Repository | `git@github.com:Vishnu25112003/careone.git`, deploys from `main` |
| Edge container | `nammaguide-nginx` — owns 80/443, belongs to the NammaGuide project. **Not** `c2k-nginx`, which publishes 8081/8443 and sits behind it |
| Edge vhost | `/var/www/nammaguide/nginx/conf.d/careone-edge.conf`, sourced from this repo |
| Edge network | `nammaguide_nammaguide-net` — `docker-compose.yml`'s `edge-net` must match this exactly |
| Neighbour hostnames | `nammaguide.in`, `admin.nammaguide.in`, `c2kitchen.in`, `admin.c2kitchen.in` |
| Certificates | Host certbot, webroot `/var/www/certbot`, `/etc/letsencrypt/live/careone.example.com/` |
| Firewall | `ufw`: OpenSSH, 80, 443. CareOne added nothing. |

### Port map

| Service | Container port | Host binding | Reachable from |
|---|---|---|---|
| careone-postgres | 5432 | `127.0.0.1:5434` | the VPS only |
| careone-api | 5000 | `127.0.0.1:3003` | the VPS only |
| careone-web | 80 | `127.0.0.1:8080` | the VPS, plus the edge over docker DNS |

> 5432 and 5433 were already taken by the other two projects, as were 3001 and 3002. The convention on this box is that every non-edge service gets a `127.0.0.1:`-prefixed binding on a shifted port.

---

## 3. Project Structure

```
/var/www/careone/
├── docker-compose.yml          the whole stack
├── client/
│   ├── Dockerfile              node build -> nginx image with the site baked in
│   ├── .dockerignore           excludes ALL .env* on purpose (see section 5)
│   └── src/                    React SPA, incl. /admin routes
├── server/
│   ├── Dockerfile              two-stage; prisma generate in the builder
│   ├── docker-entrypoint.sh    derives DATABASE_URL, migrates, seeds, starts
│   ├── .dockerignore
│   ├── .env                    NOT in git. chmod 600. Feeds postgres AND api.
│   ├── .env.example
│   ├── prisma/                 schema, migrations, seed.js
│   └── src/                    Express app
├── nginx/                      mounted into careone-web, not baked in
│   ├── nginx.conf              global http block + forwarded-header maps
│   └── conf.d/
│       ├── careone.conf        the vhost: SPA + /api proxy
│       └── security.inc        header partial, included three times
├── deploy/edge/
│   └── careone-edge.conf       DEPLOYED INTO THE EDGE, not used by this stack
├── docs/
│   ├── DEPLOYMENT.md
│   └── HOSTING.md
├── backups/                    gitignored, created by cron and by CI
└── .github/workflows/deploy.yml
```

> `deploy/edge/careone-edge.conf` is the one file in this repository that is not used by this repository's stack. It is version-controlled here because it is CareOne's configuration; it just happens to be installed into the edge's directory.

---

## 4. Docker Services

### postgres

- `postgres:16-alpine`, container `careone-postgres`
- Credentials from `server/.env` via `env_file`
- `127.0.0.1:5434:5432` — loopback only
- Volume `postgres_data` → `careone_postgres_data`
- Healthcheck `pg_isready -U $POSTGRES_USER -d $POSTGRES_DB`, every 10s

### api

- Built from `server/Dockerfile`, container `careone-api`
- Same `env_file` as postgres — the `POSTGRES_*` values do double duty
- Waits for `postgres` to be **healthy**, not merely started
- `127.0.0.1:3003:5000`
- Healthcheck hits `/api/health`, with `start_period: 40s` so migrations and the seed have room on a cold start
- On start: derive `DATABASE_URL` → `prisma migrate deploy` → `node prisma/seed.js` → `node src/server.js`

### web

- Built from `client/Dockerfile`, container `careone-web`
- The compiled site is baked into the image at `/var/www/site`; the nginx config is bind-mounted from `./nginx`, so a config change is a restart and a site change is a rebuild
- `127.0.0.1:8080:80` for debugging
- On **both** networks: `careone-net` to reach the API, and `edge-net` with the alias `careone-web` so the edge can find it
- Depends on `api` with `service_started`, not `service_healthy` — the static site should render even while the API is still migrating

### Startup order

`postgres` (healthy) → `api` (started) → `web`.

---

## 5. Environment Variables

### Backend (`server/.env`)

One file, read by both the `postgres` and the `api` container.

| Variable | Purpose |
|---|---|
| `PORT` | API listen port inside the container. `5000`. |
| `CLIENT_ORIGIN` | CORS allowlist, comma-separated. |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Initialise the database **and** are what `DATABASE_URL` is built from |
| `JWT_SECRET` | Signs admin tokens. Changing it logs everyone out. |
| `JWT_EXPIRES_IN` | Token lifetime, `1d`. |
| `ADMIN_SEED_USERNAME` / `ADMIN_SEED_PASSWORD` | The admin login. Re-applied on every container start. |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | Gallery storage. Blank → uploads return 503. |
| `GOOGLE_PLACES_API_KEY` / `GOOGLE_PLACE_ID` | Live reviews on the homepage. |

### Frontend (build-time, compiled into the bundle)

`VITE_API_URL` only, supplied as a build argument in `docker-compose.yml` and set to `/api`.

There is no `client/.env` on the server, and `client/.dockerignore` excludes every `.env*` file from the image. That is deliberate: Vite's `.env.production` would otherwise silently win over the build argument, and the repository used to carry one pointing at a Render URL.

> Changing `VITE_API_URL` requires `docker compose up -d --build web`. A restart does nothing — the value is compiled into the JavaScript.

### The DATABASE_URL rule

`DATABASE_URL` is never set in `docker-compose.yml` and should not be added to `server/.env`. `server/docker-entrypoint.sh` derives it and forces the host to `postgres`:

```sh
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public"
```

The failure this prevents: someone puts `127.0.0.1:5434` in `server/.env` to run Prisma Studio, and the container silently starts talking to whatever answers on that address.

To use an external database, unset the three `POSTGRES_*` variables and set `DATABASE_URL` directly — the `if` guard leaves your value alone.

---

## 6. How Deployments Work

### Automated deploys via GitHub Actions (normal workflow)

Push to `main`. `.github/workflows/deploy.yml` SSHes in as `careone` and runs, in order:

1. an SSH reachability gate, retrying for ~5 minutes before the deploy step runs at all
2. copy `server/.env` aside, `git pull --ff-only`, copy it back
3. `docker compose up -d postgres`, wait for healthy (up to 60s)
4. a **verified** `pg_dump` — the deploy aborts if it fails or is truncated
5. `docker compose up -d --build api`; migrations run on container start
6. poll the API's health for up to two minutes; on failure, print 50 log lines and stop **without publishing the new frontend**
7. `docker compose up -d --build web`, then `nginx -t`

#### GitHub Secrets required

| Secret | Value |
|---|---|
| `VPS_HOST` | VPS IP |
| `VPS_USER` | `careone` |
| `VPS_SSH_KEY` | Private key whose public half is in `/home/careone/.ssh/authorized_keys` |
| `VPS_PORT` | Optional, defaults to `22` |

> Two different keys are in play. `~/.ssh/id_ed25519` on the VPS is a read-only GitHub **deploy key** so the server can pull. `~/.ssh/github_actions` is what Actions uses to get *in*. Do not reuse one for both.

### When you must SSH in manually

| Situation | Why CI cannot do it |
|---|---|
| Changing `server/.env` | Secrets never leave the server |
| Any edge change | Needs root, and touches other projects |
| Certificate issuance or renewal | Needs root |
| Restoring a backup | Deliberately manual |
| Changing a host port binding | Needs a port survey first |

### Manual deploy (emergency / CI is down)

```bash
cd /var/www/careone
git pull --ff-only origin main
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > backups/manual_$(date +%Y%m%d_%H%M%S).sql
docker compose up -d --build
docker compose ps
```

### If you only changed nginx config

```bash
docker compose restart web      # ./nginx is bind-mounted; no rebuild needed
```

### If you only changed the edge

```bash
sudo cp /var/www/careone/deploy/edge/careone-edge.conf /var/www/nammaguide/nginx/conf.d/
docker exec nammaguide-nginx nginx -t && docker exec nammaguide-nginx nginx -s reload
for h in nammaguide.in admin.nammaguide.in c2kitchen.in admin.c2kitchen.in; do \
  curl -so/dev/null -w "$h %{http_code}\n" https://$h; done   # neighbours survived?
```

> Always `reload`, never `restart`. A reload retires the old workers as they finish, so live requests to NammaGuide and C2K are never dropped.

---

## 7. Common Operations

### View live logs

```bash
docker compose logs -f api
docker compose logs --tail=100 web
```

### Restart a service

```bash
docker compose restart api      # after an env change
docker compose restart web      # after an nginx config change
```

### Stop everything / start everything

```bash
docker compose down             # keeps the volume
docker compose up -d
```

> Never `docker compose down -v` unless you intend to destroy the database. Never `docker system prune --volumes` on this box — it would take all three projects' data.

### Run a migration manually

```bash
docker compose exec api npx prisma migrate deploy
```

### Reset the admin password

```bash
nano server/.env               # change ADMIN_SEED_PASSWORD
docker compose restart api
```

### Open a database shell

```bash
docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'
```

### Create a backup

```bash
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > backups/manual_$(date +%Y%m%d_%H%M%S).sql
```

### Restore a backup

```bash
cat backups/backup_2026-08-19.sql | docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'
```

> The `sh -c '…$POSTGRES_USER…'` idiom is used everywhere so these commands keep working after a credential change.

### Check resource usage

```bash
docker stats --no-stream
df -h / && docker system df
```

### Verify the whole path after a change

```bash
curl -s http://127.0.0.1:8080/api/health                          # app -> its own nginx
docker exec nammaguide-nginx wget -qO- http://careone-web/api/health     # edge -> app
curl -s https://careone.example.com/api/health                    # internet -> everything
```

---

## 8. Design Decisions & Known Issues

### Inherited decisions (already fixed in the code)

#### Prisma engine must target OpenSSL 3 on Alpine

`server/prisma/schema.prisma` declares `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]`, and the runtime image installs `openssl`. Without both, the query engine fails to load inside the container and the API crashes on the first database call. Confirm with:

```bash
docker compose exec api ls node_modules/.prisma/client/ | grep musl
```

#### Migrations run through the entrypoint, not the image build

`server/package.json`'s `build` script chains `prisma generate && prisma migrate deploy && node prisma/seed.js`. The last two need a live database, so they cannot run during `docker build`. Only `prisma generate` happens at build time; `docker-entrypoint.sh` does the rest at start.

#### The Prisma client is generated at build time, not install time

`package.json` has `postinstall: prisma generate`, which would run before the schema is copied. Both `npm ci` calls use `--ignore-scripts` and generation happens as its own explicit step in the builder stage.

#### Security headers must be re-included in nested locations

nginx **drops every inherited `add_header`** in a block that defines one of its own. `security.inc` is therefore included three times in `careone.conf`: in the server block, in `location = /index.html`, and in `location /assets/`. Edit one and forget the others and the headers silently vanish from part of the site. Confirm with:

```bash
curl -sI https://careone.example.com/assets/index-<hash>.js | grep -i x-frame
```

#### Forwarded headers are passed through, not appended

CareOne is **two** proxy hops deep. `server/src/app.js` sets `app.set("trust proxy", 1)`, which reads the rightmost `X-Forwarded-For` entry. If `careone-web` used the conventional `$proxy_add_x_forwarded_for`, that rightmost entry would be the edge container's address and every visitor would share one rate-limit bucket — the enquiry form would lock out for everyone after five submissions.

So `careone.conf` forwards `$http_x_forwarded_for` unchanged, with `map` blocks in `nginx.conf` falling back to local values when the container is reached directly. The regression test is the six-IP probe in [DEPLOYMENT.md §10.3](./DEPLOYMENT.md#103-verify-the-real-client-ip-survives-both-proxy-hops).

### Issues to be aware of

#### Issue 1 — CareOne depends on the NammaGuide project's directory (ACCEPTED)

`careone-edge.conf` lives in `/var/www/nammaguide/nginx/conf.d/` because that is where the container that owns 80/443 reads its configuration. Consequences:

- A NammaGuide redeploy that rewrites that directory would drop CareOne offline until the file is replaced. Note that the edge also serves NammaGuide's own `admin/dist` and `user/dist` as static roots, so it is redeployed more often than a pure proxy would be.
- The edge has already changed hands once — C2K owned 80/443 before NammaGuide did. If it moves again, both CareOne's `edge-net` name (`nammaguide_nammaguide-net`) and this path have to be repointed.
- A syntax error in CareOne's vhost breaks **all three** sites, which is why every edge change is gated behind `nginx -t`.

Mitigation: the file is version-controlled in this repo, so restoring it is one `cp`. The real fix is Issue 2.

#### Issue 2 — No host-level edge (OPEN)

The clean architecture is nginx on the host as the single edge, with every project binding a loopback port. That would remove Issue 1 entirely. It was not done because it re-plumbs two live sites and requires relocating their certificates. Do it the next time all three projects need downtime anyway.

#### Issue 3 — `client/.env.production` used to override the build (FIXED)

The file is tracked in git and used to hold the Render URL, and Vite loads `.env.production` automatically during `vite build` — so a VPS build would have quietly kept calling Render. It now says `/api`, and more importantly `client/.dockerignore` excludes every `.env*` file so the build argument is the only source.

#### Issue 4 — Two `client_max_body_size` settings (ACCEPTED)

The limit is set in both `nginx/nginx.conf` and `deploy/edge/careone-edge.conf`, because the edge sees the request first and would reject an oversized upload before CareOne's nginx ever saw it. Both must be raised together if multer's 5 MB cap ever changes.

#### Issue 5 — Backups sit on the same disk as the database (OPEN)

`/var/www/careone/backups/` is on the same filesystem as the Docker volume. A disk failure takes both. Copying the nightly dump off-box is unfinished work.

#### Issue 6 — No restore has been rehearsed (OPEN)

The backup path is exercised on every deploy; the restore path never has been. An untested backup is a guess.

---

## 9. Known Limitations & Future Work

### Docker builds run on the production server

Deploys compile the React app on the VPS, competing for CPU and memory with two other live projects. Building in CI and pushing an image to a registry would fix it, at the cost of registry setup and credentials on the box.

### No staging environment

`main` goes straight to production. The verified pre-deploy `pg_dump` and the health gate are what stand in for a staging tier.

### Single-server architecture

Everything is on one VPS: three projects, three databases, one edge. There is no redundancy. The API itself is stateless — JWT auth, no sessions, no local files — so it would scale horizontally without changes if the database moved off-box first.

### No error tracking or metrics

Failures are visible only in `docker compose logs`. Nothing alerts if the site goes down; you find out when someone tells you.

### Automated database backups are local-only

Nightly cron at 03:00, 30-day retention, same disk. See Issue 5.

### Docker log rotation

If not already configured for this VPS by an earlier project, `/etc/docker/daemon.json` should cap log growth for all containers:

```json
{ "log-driver": "json-file", "log-opts": { "max-size": "10m", "max-file": "3" } }
```

Then `sudo systemctl restart docker`. Unbounded container logs fill the disk, and a full disk takes Postgres down with it.

### The gallery depends entirely on Cloudinary

There is no local fallback: if Cloudinary credentials are wrong or the account is suspended, uploads return 503 and existing images 404 from their Cloudinary URLs. The database keeps the records, not the files.

---

## 10. Troubleshooting Runbook

### All services down after a reboot

Containers use `restart: always`, so they should return on their own. If not:

```bash
cd /var/www/careone && docker compose up -d && docker compose ps
```

Check the edge came back too — CareOne being healthy is invisible if `nammaguide-nginx` is not running.

### careone-api is "Restarting"

```bash
docker compose logs --tail=50 api
```

- `ADMIN_SEED_PASSWORD` empty → the seed exits 1 by design
- Postgres not healthy → migrations cannot connect
- A migration failed against existing data → restore the pre-deploy dump

### The API cannot authenticate to Postgres

`POSTGRES_PASSWORD` changed after the volume was initialised. That variable only applies on the volume's **first** run.

```bash
docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" -c "ALTER USER \"$POSTGRES_USER\" WITH PASSWORD '"'"'new-password'"'"';"'
docker compose restart api
```

### 502 Bad Gateway

Work outwards; the first failing step is the break:

```bash
docker compose ps
curl -s http://127.0.0.1:8080/api/health
docker exec nammaguide-nginx wget -qO- http://careone-web/api/health
```

If the first two pass and the public URL still 502s, the edge's `proxy_pass` target does not match the network alias in `docker-compose.yml`.

### The edge cannot resolve careone-web

```bash
docker inspect careone-web --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}'
```

It must list both `careone_careone-net` and the edge network. If the edge network is missing, `docker compose up -d web`. If the network name itself changed, fix `edge-net`'s `name:` in `docker-compose.yml`.

### 404 on frontend routes after a refresh

The SPA fallback is missing or the config is not mounted:

```bash
docker compose exec web grep try_files /etc/nginx/conf.d/careone.conf
docker compose restart web
```

### 404s on CSS/JS right after a deploy

A cached `index.html` referencing the previous build's hashed filenames.

```bash
curl -sI https://careone.example.com/index.html | grep -i cache-control   # must include no-store
```

### The enquiry form rate-limits everyone at once

Forwarded headers are being appended instead of passed through. See Section 8 and the six-IP probe.

### A font, image or script is blocked in the console

The CSP in `nginx/conf.d/security.inc` is missing that origin. Add it to the right directive and `docker compose restart web` — and remember the file is included three times.

### Gallery upload returns 413

`client_max_body_size` too low in one of the two nginx layers. Both must allow it; the edge sees the request first.

### Gallery upload returns 503

Cloudinary credentials missing or wrong in `server/.env`. The API returns a clean 503 rather than failing obscurely.

### CORS errors in the browser

Unexpected — the site and the API share an origin. It means the bundle was built with an absolute `VITE_API_URL` instead of `/api`:

```bash
docker compose exec web grep -o 'onrender\.com' /var/www/site/assets/*.js || echo "clean"
docker compose up -d --build web
```

### The SSL certificate expired

```bash
sudo certbot certificates
sudo certbot renew
docker exec nammaguide-nginx nginx -s reload
```

If renewal succeeded but the browser still shows the old certificate, the renewal deploy hook is not reloading the edge. See [DEPLOYMENT.md §9.4](./DEPLOYMENT.md#94-confirm-renewal-will-reload-the-edge).

### Out of disk space

```bash
df -h /
docker system df
docker image prune -f
find /var/www/careone/backups -name "*.sql" -mtime +30 -delete
```

> `docker image prune -f` only removes untagged images. Never add `-a` or `--volumes` on this VPS.

### An edge reload broke the other sites

```bash
sudo rm /var/www/nammaguide/nginx/conf.d/careone-edge.conf
docker exec nammaguide-nginx nginx -t && docker exec nammaguide-nginx nginx -s reload
```

CareOne goes offline; the other two return. Fix the vhost, re-test, reinstall.

### GitHub Actions deploy fails

- **"i/o timeout"** before the script runs — the reachability gate gave up. Check `fail2ban-client status sshd` and the Hostinger firewall
- **"pg_dump failed" / "dump is truncated"** — working as designed; the deploy stopped *before* migrations ran
- **"the API failed to come up"** — the previous frontend is still being served. Read the 50 printed log lines, fix, re-run
