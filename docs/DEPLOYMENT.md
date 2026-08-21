# CareOne — Production Deployment Guide

> **Who this is for:** This guide assumes a Hostinger VPS that **already hosts two other projects — C2K and NammaGuide**, the domain `careone.example.com`, and SSH access as a user with `sudo`. Every command is explained so you understand what it does, not just what to type.

> **The edge on this VPS is `nammaguide-nginx`.** It is the container publishing `0.0.0.0:80` and `0.0.0.0:443`; `c2k-nginx` was demoted to `8081`/`8443` and is now reached *through* it. Every command in Sections 8, 9, 12 and 13 targets `nammaguide-nginx`. The three values this guide is now pinned to, all verified against the live box in [Section 2](#2-survey-the-existing-vps):
>
> | Value | Confirmed |
> |---|---|
> | Edge container | `nammaguide-nginx` |
> | Edge vhost directory | `/var/www/nammaguide/nginx/conf.d/` |
> | Edge docker network | `nammaguide_nammaguide-net` (already set in `docker-compose.yml`) |
>
> Existing hostnames the edge serves — and which must keep working after every reload: `nammaguide.in`, `admin.nammaguide.in`, `c2kitchen.in`, `admin.c2kitchen.in`.

> **Read this first if you already deployed C2K.** CareOne follows the same flow, but five things are genuinely different and will bite you if you copy the C2K steps verbatim:
>
> | Difference | C2K | CareOne |
> |---|---|---|
> | Ports 80/443 | *used to* own them — today it publishes 8081/8443 | **does not own them** — `nammaguide-nginx` does. CareOne is reached *through* it (Section 8), exactly as C2K now is |
> | Frontend build | `npm run build` on the VPS via nvm Node 22 | **built inside Docker** — this VPS needs no Node.js for CareOne at all |
> | `dist/` in git | committed, so every deploy starts with `git restore`/`git clean` | **gitignored** — the image is the artifact, and that whole dance is gone |
> | SSL | terminated by its own nginx | terminated by the **shared edge**; CareOne's own nginx is plain HTTP internally |
> | Seeding | entrypoint runs migrations only | entrypoint runs migrations **and** the admin seed on every start |

---

## Architecture Overview

```
Internet
   │
   ▼
[ nammaguide-nginx :80/:443 ]  ◄── THE EDGE. The only container on 0.0.0.0:80/443.
   │   │   │                       Terminates SSL for every domain on this box.
   │   │   │
   │   │   ├──► nammaguide's own domain ──► [ nammaguide-backend :5000 ]  (untouched)
   │   │   │
   │   │   ├──► c2kitchen.in, admin.c2kitchen.in                          (untouched)
   │   │   │         └──► [ c2k-nginx :8081/:8443 ] ──► [ c2k-backend ]
   │   │   │              ▲ NOT the edge — a second-tier nginx behind it
   │   │   │
   │   │   └──► careone.example.com   ◄── NEW. One vhost file, nothing else.
   │   │              │
   │   │              ▼
   │   │   [ careone-web :80 ]  ◄── nginx, serves the compiled React SPA
   │   │         │        │
   │   │         │        └──► /api/ ──► [ careone-api :5000 ] (Express)
   │   │         │                             │
   │   │         └── /var/www/site             ▼
   │   │             (baked into the image)  [ careone-postgres :5432 ]

CareOne's three containers run on their own private network (careone-net) with
their own volume. Only careone-web is also attached to the edge network, and
only so the edge can reach it by name. Nothing in the CareOne stack binds a
public port.

CareOne's shape is identical to C2K's: edge -> project nginx -> project API.
Two proxy hops, which is why the forwarded-header handling in Section 10.3
matters and why `app.set("trust proxy", 1)` is correct.
```

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Survey the Existing VPS](#2-survey-the-existing-vps)
3. [Create the CareOne User](#3-create-the-careone-user)
4. [Configure DNS](#4-configure-dns)
5. [Clone the Repository](#5-clone-the-repository)
6. [Configure Environment Variables](#6-configure-environment-variables)
7. [Build and Start the CareOne Stack](#7-build-and-start-the-careone-stack)
8. [Wire CareOne Into the Existing Edge](#8-wire-careone-into-the-existing-edge)
9. [Get SSL Certificates](#9-get-ssl-certificates)
10. [Verify the Deployment](#10-verify-the-deployment)
11. [Set Up GitHub Actions CI/CD](#11-set-up-github-actions-cicd)
12. [Maintenance](#12-maintenance)
13. [Troubleshooting](#13-troubleshooting)
14. [Scalability & Migration](#14-scalability--migration)

---

## 1. Prerequisites

### What you need before starting

| Item | Details |
|---|---|
| VPS | Hostinger VPS, Ubuntu 22.04, already running C2K and NammaGuide (six containers) |
| Free RAM | **at least 1 GB free** — the Docker image build compiles the React app. This VPS has 6.5 GiB available ([2.7](#27-check-free-memory-and-disk)) |
| Free disk | ~3 GB for images, database volume and backups. This VPS has 85 GiB free |
| Domain | `careone.example.com` — purchased, DNS control available |
| SSH access | A user with `sudo`, or root |
| GitHub repo | `git@github.com:Vishnu25112003/careone.git` |

### Replace the placeholder domain first

This repository ships with `careone.example.com` as a placeholder. Replace it everywhere in one command **before** you deploy:

```bash
# From the repository root, on your local machine
grep -rl 'careone\.example\.com' nginx/ deploy/ docs/ server/.env.example \
  | xargs sed -i 's/careone\.example\.com/YOUR-REAL-DOMAIN.com/g'
```

Commit and push that change, then continue.

### Why the build happens in Docker

C2K builds its frontends on the VPS, which means the VPS needs a matching Node.js version installed via nvm and kept in step with the project. CareOne builds inside the image instead. The trade-off:

- **You gain:** no Node.js on the host, no nvm sourcing in CI, no `dist/` in git, and a build that is identical on your laptop and on the server.
- **You pay:** roughly 200 MB of Docker build cache, and a build that runs on the VPS's CPU during deploys.

> If the VPS is memory-tight, add swap **before** the first build. See [Section 13](#problem-out-of-memory-during-the-docker-build). **Not required here** — [Section 2.7](#27-check-free-memory-and-disk) measured 6.5 GiB available with six containers already resident.

---

## 2. Survey the Existing VPS

**Everything in this section is read-only.** Two live projects are on this machine; confirm the assumptions this guide is built on before you change anything. Section 2.3 is the one that decides how the rest of the guide reads — do not skip it.

### 2.1 Connect to the VPS

```bash
ssh root@YOUR_VPS_IP
```

### 2.2 Confirm what owns ports 80 and 443

```bash
# -t TCP, -l listening, -n numeric ports, -p show the owning process
sudo ss -tlnp | grep -E ':80 |:443 '
```

Expected output — something is already there, and it is a docker proxy:

```
LISTEN 0 4096 0.0.0.0:80   0.0.0.0:* users:(("docker-proxy",pid=...))
LISTEN 0 4096 0.0.0.0:443  0.0.0.0:* users:(("docker-proxy",pid=...))
```

> This is the whole reason CareOne is deployed differently from C2K. Those ports are taken, and taking them away from a live site is not an option. CareOne will be reached *through* whatever holds them.

### 2.3 List the running containers and find the edge

```bash
docker ps --format 'table {{.Names}}\t{{.Ports}}'
```

This VPS returns:

```
NAMES                 PORTS
c2k-backend           127.0.0.1:3002->3001/tcp
c2k-postgres          127.0.0.1:5433->5432/tcp
c2k-nginx             0.0.0.0:8081->80/tcp, [::]:8081->80/tcp, 0.0.0.0:8443->443/tcp, [::]:8443->443/tcp
nammaguide-backend    5000/tcp
nammaguide-postgres   5432/tcp
nammaguide-nginx      0.0.0.0:80->80/tcp, [::]:80->80/tcp, 0.0.0.0:443->443/tcp, [::]:443->443/tcp
```

**Read that carefully, because it is not what the C2K guide led you to expect.**

| Container | Publishes | Role |
|---|---|---|
| `nammaguide-nginx` | `0.0.0.0:80`, `0.0.0.0:443` | **THE EDGE.** Everything from the internet enters here |
| `c2k-nginx` | `0.0.0.0:8081`, `0.0.0.0:8443` | *Not* the edge any more. It is a second-tier nginx that the edge forwards `c2kitchen.in` to |
| `nammaguide-backend`, `nammaguide-postgres` | nothing (`5000/tcp`, `5432/tcp` are container-internal only) | NammaGuide's app, reached only over its docker network |
| `c2k-backend`, `c2k-postgres` | loopback only | C2K's app |

The rule is mechanical: **the edge is whichever container publishes `0.0.0.0:80` and `0.0.0.0:443`.** A `0.0.0.0:8081->80` binding is a *client* of the edge, not the edge. So throughout this guide the edge container is `nammaguide-nginx`, and `c2k-nginx` is just one more neighbour whose site must keep working.

> This also means CareOne is being wired in exactly the way C2K already is — one vhost in the edge, forwarding to a project-owned nginx. You are following a path the box has already proven.

### 2.4 Find the edge's config directory, webroot and certificates

Three things must be true of the edge before Sections 8 and 9 can work. This one command answers all three:

```bash
docker inspect nammaguide-nginx --format '{{range .Mounts}}{{.Source}} -> {{.Destination}}{{"\n"}}{{end}}'
```

This VPS returns:

```
/var/www/nammaguide/nginx/conf.d      -> /etc/nginx/conf.d      # where CareOne's vhost goes
/var/www/nammaguide/nginx/nginx.conf  -> /etc/nginx/nginx.conf
/var/www/nammaguide/admin/dist        -> /var/www/admin
/var/www/nammaguide/user/dist         -> /var/www/user
/var/www/certbot                      -> /var/www/certbot       # the ACME webroot
/etc/letsencrypt                      -> /etc/letsencrypt       # so the edge can read CareOne's cert
```

**All three prerequisites are satisfied on this box.** Specifically:

| Mount | Why CareOne needs it |
|---|---|
| `/var/www/nammaguide/nginx/conf.d` | Section 8.3 copies `careone-edge.conf` here. This is the authoritative path — use it, not a guess |
| `/var/www/certbot` | Section 9.1's ACME challenge is served from here, and it is the same directory `certbot --webroot-path` writes into |
| `/etc/letsencrypt` | Section 9.2 issues the certificate on the host; the edge reads it through this mount without a restart |

Note what else is there: `admin/dist` and `user/dist` are NammaGuide's compiled frontends, served as static roots by this same nginx. So the edge is not a pure proxy — it is also NammaGuide's web server. That is one more reason a broken reload here is expensive, and one more reason to never `restart` it.

> If you are reading this on a *different* box and any of the three is missing, stop. Certbot writes on the host and the edge reads in the container; without `/etc/letsencrypt` mounted, `nginx -t` fails with "cannot load certificate", and without `/var/www/certbot` the ACME challenge cannot be served. The fix is a volume in *NammaGuide's* `docker-compose.yml` plus a recreate of `nammaguide-nginx` — a brief outage for `nammaguide.in` and `c2kitchen.in`. Plan that window before Section 9, not during it.

### 2.5 Find the edge's docker network

CareOne's `docker-compose.yml` attaches to this network so the edge can reach `careone-web` by name.

```bash
# Authoritative: what is nammaguide-nginx actually attached to?
docker inspect nammaguide-nginx --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}}{{"\n"}}{{end}}'
```

This VPS returns exactly one network:

```
nammaguide_nammaguide-net
```

That is the value already committed in `docker-compose.yml`, so there is **nothing to change** — verify and move on:

```bash
grep -A3 'edge-net:' /var/www/careone/docker-compose.yml   # after Section 5
#   edge-net:
#     external: true
#     name: nammaguide_nammaguide-net
```

> The doubled word is not a typo. Compose prefixes network names with the project directory, so a network declared as `nammaguide-net` inside `/var/www/nammaguide/docker-compose.yml` lands on disk as `nammaguide_nammaguide-net`. Copying the short name would fail with "network nammaguide-net not found".

Because the edge is on only one network, there is no ambiguity here. Re-run this check after any NammaGuide redeploy that renames its project directory or its network — that rename is invisible from CareOne's side until `docker compose up` fails.

### 2.6 Check the ports CareOne wants are free

CareOne binds three loopback ports. Your `docker ps` output shows `5433` (c2k-postgres) and `3002` (c2k-backend) taken, and CareOne's defaults deliberately avoid both. Confirm:

```bash
sudo ss -tlnp | grep -E ':5434 |:3003 |:8080 '
```

Expected output: **nothing at all** — and on this VPS that is what it returns, so no `ports:` edit is needed. If a port were taken, you would change the left-hand side of the mapping in `docker-compose.yml` and nothing else: the edge reaches CareOne over the docker network, not through a host port.

> Note `8081`/`8443` are in use by `c2k-nginx` and `8080` is what CareOne wants. They do not collide, but they are one keystroke apart — if you ever edit CareOne's `web` port mapping, re-run this grep.

### 2.7 Check free memory and disk

```bash
free -h        # look at the "available" column
df -h /        # and at "Avail" for /
```

This VPS returns:

```
               total        used        free      shared  buff/cache   available
Mem:           7.8Gi       1.3Gi       3.0Gi        42Mi       4.0Gi       6.5Gi
Swap:             0B          0B          0B

Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        96G   11G   85G  12% /
```

**No swap needed.** 6.5 GiB available against a React build that peaks well under 1 GiB is ample headroom, even with six containers resident. Skip the swap step in [Section 13](#problem-out-of-memory-during-the-docker-build) unless a build actually gets killed.

The number to watch is **`available`, not `free`.** `free` reads 3.0 GiB here, which looks tight; 4.0 GiB of that is reclaimable page cache, which the kernel hands back the moment a build asks for it. Disk is 85 GiB free against CareOne's ~3 GiB footprint — a non-issue.

> `Swap: 0B` is worth knowing. With no swap there is no cushion: if memory ever *does* run out, the OOM killer takes a process rather than the box slowing down. That is usually the right trade on a 7.8 GiB box, but it means the failure mode is abrupt.

### 2.8 Record the current state of the edge config

You are about to add a file to a directory that serves two live projects — NammaGuide *and*, via the 8081 hop, all of C2K. Save what works now, so a rollback is one `cp` away:

```bash
sudo cp -r /var/www/nammaguide/nginx/conf.d /root/conf.d.backup-$(date +%F)
ls /root/conf.d.backup-*
```

### 2.9 Record the baseline for the neighbour checks

After every edge reload you will confirm the other sites still work — so establish what "still work" looks like **now**, before you change anything.

First ask the edge itself which hostnames it answers for. `nginx -T` prints the fully-resolved config, every `include` expanded, which makes it the definitive list:

```bash
docker exec nammaguide-nginx nginx -T 2>/dev/null | grep server_name | sort -u
```

This VPS returns:

```
    server_name admin.nammaguide.in;
    server_name c2kitchen.in admin.c2kitchen.in www.c2kitchen.in;
    server_name nammaguide.in www.nammaguide.in admin.nammaguide.in;
    server_name nammaguide.in www.nammaguide.in;
```

Six hostnames across four server blocks:

| Hostname | Project |
|---|---|
| `nammaguide.in`, `www.nammaguide.in` | NammaGuide — served as static files by the edge itself |
| `admin.nammaguide.in` | NammaGuide admin |
| `c2kitchen.in`, `www.c2kitchen.in`, `admin.c2kitchen.in` | C2K — proxied on to `c2k-nginx` |

**No block mentions `careone.example.com`**, which is exactly what you want to see before Section 8: nothing is already claiming CareOne's name.

Baseline all six now:

```bash
for host in nammaguide.in www.nammaguide.in admin.nammaguide.in \
            c2kitchen.in www.c2kitchen.in admin.c2kitchen.in; do
  printf '%-24s %s\n' "$host" "$(curl -s -o /dev/null -w '%{http_code}' "https://$host")"
done
```

This VPS returns a clean sweep:

```
nammaguide.in            200
www.nammaguide.in        200
admin.nammaguide.in      200
c2kitchen.in             200
www.c2kitchen.in         200
admin.c2kitchen.in       200
```

**Six for six.** That is the baseline: after every edge reload from here on, this loop must still print six `200`s. There are no pre-existing failures to explain away, which is the best possible starting position — any non-200 you see later is unambiguously yours.

> Had any of these come back `502` or `000` today, that would be a pre-existing condition rather than something you caused. Establishing it *before* you touch shared config is what makes the distinction provable later.

> `nammaguide.in www.nammaguide.in` appearing twice, and `admin.nammaguide.in` appearing in two blocks, is normal: those are the port-80 redirect block and the port-443 site block for the same names. Four blocks, six names, three sites.

---

## 3. Create the CareOne User

Each project on this VPS runs under its own Linux user, so a mistake in one cannot reach into another's files.

### 3.1 Create the user

```bash
# Create user named 'careone' (you will be prompted for a password)
adduser careone

# Docker group: lets this user run docker without sudo
usermod -aG docker careone

# Copy your SSH key so you can log in directly as this user
rsync --archive --chown=careone:careone ~/.ssh /home/careone
```

> `careone` is deliberately **not** added to `sudo`. It never needs root: it only runs `docker compose` in its own directory. The two edge steps that do need root (Sections 8 and 9) are run as your existing admin user.

### 3.2 Create the application directory

```bash
sudo mkdir -p /var/www/careone
sudo chown careone:careone /var/www/careone
```

### 3.3 No firewall changes

```bash
sudo ufw status
```

CareOne opens **no new ports**. Its three host bindings are all on `127.0.0.1`, unreachable from the internet, and its public traffic arrives through the edge on 80/443, which is already allowed.

> If you find yourself editing `ufw` for CareOne, something is wrong — most likely a `ports:` entry in `docker-compose.yml` that lost its `127.0.0.1:` prefix.

### 3.4 Log in as the new user

```bash
exit                        # leave the root session
ssh careone@YOUR_VPS_IP     # everything from here runs as careone
```

---

## 4. Configure DNS

Point the domain at the VPS. Both records are needed: the apex serves the site, and `www` is redirected to it by the edge.

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `@` | `YOUR_VPS_IP` | 3600 |
| A | `www` | `YOUR_VPS_IP` | 3600 |

### Verify DNS is working

Do this **before** Section 9 — Let's Encrypt validates over the public DNS, and a certificate request against an unpropagated record burns one of your five attempts per hour.

```bash
dig +short careone.example.com
dig +short www.careone.example.com
```

Expected output — your VPS IP, twice:

```
203.0.113.45
203.0.113.45
```

> Propagation usually takes minutes but the TTL of any previous record applies. If the domain used to point at Vercel, wait out the old TTL before continuing.

---

## 5. Clone the Repository

### 5.1 Give the VPS read access to GitHub

```bash
# As the careone user
ssh-keygen -t ed25519 -C "careone-vps" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
```

Copy that public key into **GitHub → the careone repo → Settings → Deploy keys → Add deploy key**. Leave *Allow write access* **unchecked** — the server only ever pulls.

```bash
# Confirm it works (expect: "Hi <user>/careone! You've successfully authenticated")
ssh -T git@github.com
```

### 5.2 Clone

```bash
cd /var/www/careone
git clone git@github.com:Vishnu25112003/careone.git .
```

> The trailing `.` clones *into* the current directory rather than creating `/var/www/careone/careone`. The CI workflow expects the repository root to be exactly `/var/www/careone`.

---

## 6. Configure Environment Variables

### 6.1 Create the file

```bash
cd /var/www/careone
cp server/.env.example server/.env
chmod 600 server/.env      # readable only by the careone user
nano server/.env
```

### 6.2 Generate strong secrets

Run these locally on the VPS and paste the output into the file:

```bash
openssl rand -base64 32    # -> JWT_SECRET
openssl rand -base64 24    # -> POSTGRES_PASSWORD
```

### 6.3 What each variable does

| Variable | Notes |
|---|---|
| `PORT` | Leave at `5000`. The container port is fixed in `docker-compose.yml`. |
| `CLIENT_ORIGIN` | `https://careone.example.com,https://www.careone.example.com`. CORS only. |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Initialise the database **and** are the source `DATABASE_URL` is built from |
| `JWT_SECRET` | Changing it invalidates every issued admin token — that is how you force a logout |
| `JWT_EXPIRES_IN` | `1d` |
| `ADMIN_SEED_USERNAME` / `ADMIN_SEED_PASSWORD` | The admin panel login. **Required** — see below |
| `CLOUDINARY_*` | Gallery image storage. Blank means uploads return a clean 503 |
| `GOOGLE_PLACES_API_KEY` / `GOOGLE_PLACE_ID` | Live Google reviews on the homepage |

> **`ADMIN_SEED_PASSWORD` is not optional.** `server/prisma/seed.js` exits with status 1 when it is empty, which stops the container before the API ever listens. That is intentional: it fails the deploy loudly rather than quietly shipping a site with no way in.

### 6.4 How DATABASE_URL actually gets resolved

`DATABASE_URL` is **not** in the file, and should not be added. `server/docker-entrypoint.sh` builds it on every container start:

```sh
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public"
```

The host is hard-coded to `postgres`, the compose service name. This is deliberate: it makes it impossible for a `127.0.0.1:5434` value — the kind you would use for a local `psql` session — to leak into the container and have the API quietly talk to the wrong database.

To use an **external** database instead, unset the three `POSTGRES_*` variables and set `DATABASE_URL` directly. The `if` in the entrypoint then leaves your value alone.

### 6.5 The frontend needs no env file

`VITE_API_URL` is compiled into the JavaScript bundle at build time, and `docker-compose.yml` supplies it as a build argument set to `/api` — a relative path, because nginx serves the API from the same origin as the site.

> Nothing to create in `client/`. In fact `client/.dockerignore` excludes every `.env*` file from the image on purpose, so the build argument is the single source of truth and a stray env file cannot silently override it.

---

## 7. Build and Start the CareOne Stack

### 7.1 Build the images

```bash
cd /var/www/careone
docker compose build
```

This compiles the React app and generates the Prisma client. The first run takes a few minutes; later builds reuse the layer cache.

Expected output ends with:

```
✓ built in 4.10s
...
Successfully tagged careone-web
```

### 7.2 Start everything

```bash
docker compose up -d
```

> If this fails with `network nammaguide_nammaguide-net not found`, the external network name in `docker-compose.yml` does not match what you found in [Section 2.5](#25-find-the-edges-docker-network). Fix the `name:` under `edge-net` and retry.

### 7.3 Check all services are healthy

```bash
docker compose ps
```

Expected output — `postgres` and `api` **healthy**, `web` running:

```
NAME               STATUS
careone-postgres   Up 2 minutes (healthy)
careone-api        Up 1 minute (healthy)
careone-web        Up 1 minute
```

`careone-api` takes up to 40 seconds to report healthy on a cold start: it runs the database migrations and the admin seed before it starts listening.

### 7.4 Confirm the migrations and seed ran

```bash
docker compose logs api | tail -20
```

Expected output:

```
All migrations have been successfully applied.
Seeding admin user...
Admin user "admin" created.
Starting CareOne API...
CareOne API running on http://localhost:5000
```

### 7.5 Test the stack locally, before touching the edge

```bash
curl -s http://127.0.0.1:8080/api/health          # {"ok":true}
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8080/     # 200
```

> Get a clean result here first. Everything from this point on modifies shared configuration, and you do not want to be debugging CareOne and the edge at the same time.

---

## 8. Wire CareOne Into the Existing Edge

This is the only step that touches shared infrastructure. **A mistake here takes every site on this VPS down** — NammaGuide directly, and C2K through the 8081 hop — so each command is gated.

### 8.1 Check nothing in the edge already claims CareOne's hostname

An existing `default_server` or a wildcard `server_name` in the edge would swallow requests for `careone.example.com` before CareOne's vhost ever sees them.

```bash
docker exec nammaguide-nginx nginx -T 2>/dev/null | grep -E 'server_name|default_server' | sort -u
```

As of [Section 2.9](#29-record-the-baseline-for-the-neighbour-checks) this returns only NammaGuide's and C2K's six hostnames and **no** `careone.example.com`, so there is no conflict. Re-run it anyway — if someone has attempted this deploy before you, that is where you find out.

- **A `server_name careone.example.com` already present** — reconcile it, do not add a second. Duplicate `server_name` values make nginx warn and silently serve whichever file loads first alphabetically.
- **A `listen 443 ssl default_server`** — harmless. nginx matches `server_name` exactly first and only falls back to the default when nothing matches, so CareOne's vhost wins for its own name.

### 8.2 Confirm the edge can see CareOne

```bash
# From inside the edge container, resolve and call CareOne by its network alias
docker exec nammaguide-nginx wget -qO- http://careone-web/api/health
```

> `nginx:alpine` images have `wget`; Debian-based `nginx` images have neither `wget` nor `curl`. If you get "executable file not found", use this instead — it needs nothing installed in the container:
>
> ```bash
> docker run --rm --network "$(docker inspect nammaguide-nginx \
>   --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{end}}' | head -1)" \
>   alpine:3 wget -qO- http://careone-web/api/health
> ```

Expected output:

```
{"ok":true}
```

> If this fails with "bad address", `careone-web` is not attached to the edge network. Re-check [Section 2.5](#25-find-the-edges-docker-network) and run `docker compose up -d web` again.

### 8.3 Install the vhost

```bash
# Run as your sudo-capable admin user, not as careone
sudo cp /var/www/careone/deploy/edge/careone-edge.conf /var/www/nammaguide/nginx/conf.d/
```

> The file being version-controlled in the CareOne repository is the point: this is CareOne's configuration, it just happens to live in the edge's directory. When CareOne is retired, this one file is what you delete.

### 8.4 Comment out the HTTPS blocks for now

The certificate does not exist yet, and nginx refuses to start with an `ssl_certificate` it cannot read. Leave only the port-80 block active:

```bash
sudo nano /var/www/nammaguide/nginx/conf.d/careone-edge.conf
# Comment out both `listen 443 ssl;` server blocks (the www redirect and the
# site). Leave the `upstream` block and the `listen 80` block untouched.
```

### 8.5 Test and reload

```bash
docker exec nammaguide-nginx nginx -t
```

Expected output:

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

> **Do not proceed unless you see exactly that.** If the test fails, `sudo rm /var/www/nammaguide/nginx/conf.d/careone-edge.conf` and re-test — the other sites are untouched because nothing was reloaded.

```bash
docker exec nammaguide-nginx nginx -s reload
```

`reload` starts new workers with the new config and retires the old ones as they finish. Existing requests to NammaGuide and C2K are never dropped. **Never use `restart` here.**

### 8.6 Confirm the neighbours are still fine

```bash
for host in nammaguide.in admin.nammaguide.in c2kitchen.in admin.c2kitchen.in; do
  printf '%-24s %s\n' "$host" "$(curl -s -o /dev/null -w '%{http_code}' "https://$host")"
done
```

All four must still be `200`, matching the baseline from [Section 2.9](#29-record-the-baseline-for-the-neighbour-checks). Do this after **every** edge reload, for the rest of this document's life.

> `c2kitchen.in` is now two hops behind the edge (`nammaguide-nginx` → `c2k-nginx:8081` → `c2k-backend`), so a `502` there after a CareOne reload means the edge config, not C2K. Roll back with [Section 13](#problem-an-edge-reload-broke-the-other-sites) before investigating anything else.

---

## 9. Get SSL Certificates

Certbot runs on the **host**, using the webroot the edge already serves. There is no certbot container.

> **Prerequisite, already confirmed in [Section 2.4](#24-find-the-edges-config-directory-webroot-and-certificates):** `nammaguide-nginx` has both `/etc/letsencrypt` and `/var/www/certbot` bind-mounted from the host. Certbot writes on the host; the edge reads in the container. That is exactly the arrangement this section assumes, so the webroot flow below applies as written.
>
> Sanity-check that NammaGuide really does use host certbot rather than something else, because whatever it uses is what CareOne should use too:
>
> ```bash
> ls /etc/letsencrypt/live/
> systemctl list-timers | grep -i certbot
> ```
>
> Expect directories for `nammaguide.in` and `c2kitchen.in`, plus an active `certbot.timer`. If instead you find a certbot *container* or DNS-01 credentials, follow that pattern for CareOne rather than this section.

### 9.1 Confirm the ACME path is reachable

```bash
# The edge's port-80 block serves this directory over plain HTTP
echo "acme-test" | sudo tee /var/www/certbot/.well-known/acme-challenge/test-file
curl http://careone.example.com/.well-known/acme-challenge/test-file
```

Expected output:

```
acme-test
```

```bash
sudo rm /var/www/certbot/.well-known/acme-challenge/test-file
```

> If you get a 301 to HTTPS instead of the file, the `location /.well-known/acme-challenge/` block is being shadowed. It must come *before* the catch-all redirect in the port-80 server block.

### 9.2 Issue the certificate

```bash
sudo certbot certonly --webroot --webroot-path /var/www/certbot \
  -d careone.example.com -d www.careone.example.com \
  --email you@example.com --agree-tos --non-interactive
```

> The **first** `-d` decides the directory name under `/etc/letsencrypt/live/`. `careone-edge.conf` expects `/etc/letsencrypt/live/careone.example.com/`, so the apex must come first.

> Certbot on the host writes the certificate; the edge reads it through the `/etc/letsencrypt` mount. Confirm the container can actually see it before reloading:
>
> ```bash
> docker exec nammaguide-nginx ls /etc/letsencrypt/live/careone.example.com/
> ```
>
> `fullchain.pem` and `privkey.pem` must both be listed. If the directory is missing inside the container but present on the host, the mount is stale — `docker restart nammaguide-nginx` re-reads it, at the cost of a second or two of downtime for the other sites.

> Let's Encrypt allows **5 failed validations per hostname per hour**. Fix DNS and Section 9.1 before retrying, rather than re-running hopefully.

### 9.3 Restore the HTTPS blocks

```bash
sudo nano /var/www/nammaguide/nginx/conf.d/careone-edge.conf
# Un-comment both `listen 443 ssl;` server blocks.

docker exec nammaguide-nginx nginx -t && docker exec nammaguide-nginx nginx -s reload
```

### 9.4 Confirm renewal will reload the edge

Certificates renew automatically via the stock `certbot.timer`, but a renewed certificate on disk means nothing until nginx re-reads it. The edge already has a deploy hook for C2K — check it covers this:

```bash
ls /etc/letsencrypt/renewal-hooks/deploy/
cat /etc/letsencrypt/renewal-hooks/deploy/*.sh
```

The hook must reload **`nammaguide-nginx`**, the container that actually terminates TLS. Two traps here:

- An existing hook that reloads **`c2k-nginx`** is now reloading the wrong container. It was correct when C2K owned 80/443; it is not any more. That hook renewing C2K's certificate no longer makes the edge re-read it, which means C2K itself is quietly heading for an expired-certificate outage. Fix it — that is a real bug you just found, independent of CareOne.
- A hook that already reloads `nammaguide-nginx` covers CareOne automatically. The hook is per-container, not per-certificate, so one is enough for all three projects.

If no hook reloads the edge, create one:

```bash
sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-edge-nginx.sh >/dev/null <<'EOF'
#!/bin/sh
# Reload the edge nginx so it picks up any renewed certificate.
docker exec nammaguide-nginx nginx -s reload
EOF
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-edge-nginx.sh
```

```bash
# Rehearse the whole renewal without spending a rate-limit attempt
sudo certbot renew --dry-run
```

---

## 10. Verify the Deployment

### 10.1 Through the edge, over HTTPS

```bash
curl -s https://careone.example.com/api/health
curl -s -o /dev/null -w '%{http_code}\n' https://careone.example.com/
curl -s -o /dev/null -w '%{redirect_url}\n' http://careone.example.com/        # -> https://...
curl -s -o /dev/null -w '%{redirect_url}\n' https://www.careone.example.com/   # -> apex
```

### 10.2 Verify SSL

```bash
curl -sI https://careone.example.com | head -1                       # HTTP/2 200
curl -sI https://careone.example.com | grep -i strict-transport      # HSTS present
echo | openssl s_client -connect careone.example.com:443 -servername careone.example.com 2>/dev/null \
  | openssl x509 -noout -dates -subject
```

### 10.3 Verify the real client IP survives both proxy hops

CareOne sits behind **two** nginx layers, and the enquiry form is rate limited to 5 submissions per 15 minutes **per IP**. If the forwarded headers were wrong, every visitor would share one bucket and the sixth submission from anyone would lock the form for everyone.

```bash
# Six requests, six different client IPs. All six must be accepted.
for i in 1 2 3 4 5 6; do
  curl -s -o /dev/null -w "%{http_code} " -X POST https://careone.example.com/api/callbacks \
    -H 'Content-Type: application/json' -H "X-Forwarded-For: 203.0.113.$i" \
    -d '{"name":"probe","phone":"9999999999"}'
done; echo
```

Expected output:

```
201 201 201 201 201 201
```

> A `429` in that sequence means the rate limiter is keying on a proxy address rather than the visitor. See [Section 13](#problem-the-enquiry-form-rate-limits-everyone-at-once).

```bash
# Clean up the six probe rows afterwards, from the admin panel or:
docker compose exec -T postgres sh -c \
  'psql -U "$POSTGRES_USER" "$POSTGRES_DB" -c "DELETE FROM \"Request\" WHERE name = '"'"'probe'"'"';"'
```

### 10.4 In the browser

- Open `https://careone.example.com` — the homepage loads, fonts and images render
- Navigate to `/services`, `/gallery`, `/contact` — then **hard-refresh each one**. A 404 here means the SPA fallback is broken
- Submit the enquiry form — expect a success message
- Log in at `/admin/login` with `ADMIN_SEED_USERNAME` / `ADMIN_SEED_PASSWORD`
- The dashboard shows the enquiry you just submitted
- Upload a gallery image — this exercises multer, Cloudinary and `client_max_body_size` at both nginx layers
- Open the browser console and confirm there are no CSP violations

### 10.5 The neighbours, one more time

```bash
for host in nammaguide.in admin.nammaguide.in c2kitchen.in admin.c2kitchen.in; do
  printf '%-24s %s\n' "$host" "$(curl -s -o /dev/null -w '%{http_code}' "https://$host")"
done
```

---

## 11. Set Up GitHub Actions CI/CD

After this, pushing to `main` deploys automatically.

### 11.1 Create a dedicated deploy key

This is a **different key** from the one in Section 5.1. That one lets the VPS read GitHub; this one lets GitHub reach the VPS.

```bash
# As the careone user, on the VPS
ssh-keygen -t ed25519 -C "github-actions-careone" -f ~/.ssh/github_actions -N ""
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 11.2 Get the private key

```bash
cat ~/.ssh/github_actions
```

Copy the whole thing, `-----BEGIN` and `-----END` lines included.

### 11.3 Add the secrets

**GitHub → the careone repo → Settings → Secrets and variables → Actions:**

| Secret | Value |
|---|---|
| `VPS_HOST` | Your VPS IP |
| `VPS_USER` | `careone` |
| `VPS_SSH_KEY` | The private key from 11.2, in full |
| `VPS_PORT` | Only if SSH is not on 22 |

### 11.4 What the workflow does

`.github/workflows/deploy.yml`, in order:

1. Waits for the SSH port to actually accept a connection, retrying for ~5 minutes
2. Copies `server/.env` aside, pulls `main`, puts it back
3. Starts `postgres` and waits for it to report healthy
4. Takes a **verified** `pg_dump` — and **aborts the deploy** if the dump fails or is truncated
5. Rebuilds and restarts `api`; migrations run on container start
6. Polls the API's health for up to two minutes
7. Only then rebuilds and restarts `web`

> Step 4 is the one that matters. Migrations run automatically on every start, so that dump is the only thing standing between a bad migration and the data. A deploy that cannot produce a good backup does not happen at all.

> Step 7 is deliberately last. Publishing the new frontend before the API is confirmed healthy would point a new UI at an API that is still migrating, or has already failed.

### 11.5 Test the pipeline

```bash
git commit --allow-empty -m "Test CI/CD pipeline"
git push origin main
```

Watch it under the repo's **Actions** tab.

---

## 12. Maintenance

All commands run from `/var/www/careone` as the `careone` user.

### 12.1 Viewing logs

```bash
docker compose logs -f api          # follow the API
docker compose logs --tail=100 web  # last 100 nginx lines
docker compose logs postgres
```

### 12.2 Restarting services

```bash
docker compose restart api      # picks up server/.env changes
docker compose restart web      # picks up nginx/ config changes
docker compose up -d --build    # rebuild images and restart
```

### 12.3 Database backups

The daily job, as the `careone` user (`crontab -e`):

```
# 3:00 AM — daily database dump (CareOne runs an hour after C2K's 2:00 AM job
# so the two dumps never compete for disk and CPU)
0 3 * * * cd /var/www/careone && docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > /var/www/careone/backups/backup_$(date +\%Y-\%m-\%d).sql 2>> /var/www/careone/backups/cron.log

# 3:30 AM — delete backups (and pre-deploy snapshots) older than 30 days
30 3 * * * find /var/www/careone/backups -name "*.sql" -mtime +30 -delete
```

> The `\%` escaping is required. Cron treats a bare `%` as a newline and the command silently truncates at the date.

Restore:

```bash
cat backups/backup_2026-08-19.sql | docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'
```

> An untested backup is a guess. Restore one into a scratch database at least once, so the first time you run this is not during an outage.

### 12.4 Deploying manually, without GitHub Actions

```bash
cd /var/www/careone
git pull --ff-only origin main
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > backups/manual_$(date +%Y%m%d_%H%M%S).sql
docker compose up -d --build
docker compose ps
```

### 12.5 Updating environment variables

```bash
nano server/.env
docker compose restart api
```

No rebuild is needed — the file is read at container start through `env_file`.

> The exception is `VITE_API_URL`, which is not in this file at all. It is compiled into the bundle, so changing it means `docker compose up -d --build web`.

### 12.6 Running database migrations manually

```bash
docker compose exec api npx prisma migrate deploy
```

Rarely necessary — the entrypoint does this on every start.

### 12.7 Resetting the admin password

```bash
nano server/.env               # change ADMIN_SEED_PASSWORD
docker compose restart api     # the seed re-hashes and updates it on start
```

`server/prisma/seed.js` is idempotent: it creates the admin if missing and re-syncs the password when it has changed.

### 12.8 Opening a database shell

```bash
docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'
```

### 12.9 Monitoring disk space

```bash
df -h /
docker system df                # what Docker is holding
du -sh /var/www/careone/backups
docker image prune -f           # remove untagged leftovers from old builds
```

> Never run `docker system prune --volumes` on this VPS. It deletes the database volumes of **all three projects**.

---

## 13. Troubleshooting

### Problem: `docker compose up` fails with "network nammaguide_nammaguide-net not found"

```bash
docker network ls
```

The external network name in `docker-compose.yml` does not match reality. Correct the `name:` under `edge-net` and retry. See [Section 2.5](#25-find-the-edges-docker-network).

### Problem: `docker compose up` fails with "port is already allocated"

```bash
sudo ss -tlnp | grep -E ':5434 |:3003 |:8080 '
```

Another project claimed the port since you surveyed. Change the **host** side of the mapping in `docker-compose.yml` — the left number only — and restart. Nothing else needs to know: the edge reaches CareOne over the docker network, not through a host port.

### Problem: `careone-api` shows "Restarting" in `docker compose ps`

```bash
docker compose logs --tail=50 api
```

Common causes:

- `ADMIN_SEED_PASSWORD` is empty — the seed exits 1 on purpose
- The database is not healthy yet, so migrations cannot connect
- A migration failed against existing data

### Problem: the API cannot authenticate to Postgres

`POSTGRES_PASSWORD` was changed in `server/.env` after the volume was initialised. The variable only sets the password on the volume's **first** run; afterwards the database keeps its own copy.

```bash
docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" -c "ALTER USER \"$POSTGRES_USER\" WITH PASSWORD '"'"'the-new-password'"'"';"'
docker compose restart api
```

> Do **not** "fix" this by deleting the volume. `docker compose down -v` destroys all your data.

### Problem: the site returns 502 Bad Gateway

Work outwards from the app:

```bash
curl -s http://127.0.0.1:8080/api/health           # CareOne's own nginx -> API
docker exec nammaguide-nginx wget -qO- http://careone-web/api/health   # edge -> CareOne
docker compose ps
```

Whichever is the first to fail is where the break is. If the first two succeed and the public URL still 502s, the edge vhost's `proxy_pass` name does not match the network alias in `docker-compose.yml`.

### Problem: 404 when refreshing a route like /gallery

The SPA fallback is not being applied. `location / { try_files $uri $uri/ /index.html; }` must be present in `nginx/conf.d/careone.conf`, and that file must be mounted:

```bash
docker compose exec web cat /etc/nginx/conf.d/careone.conf | grep try_files
docker compose restart web
```

### Problem: the enquiry form rate-limits everyone at once

The API is seeing a proxy's address as the client. `nginx/conf.d/careone.conf` must **pass through** `X-Forwarded-For` (`$http_x_forwarded_for`), not append to it (`$proxy_add_x_forwarded_for`) — CareOne is two hops deep, and `app.set("trust proxy", 1)` reads the rightmost entry.

```bash
docker compose exec web grep X-Forwarded-For /etc/nginx/conf.d/careone.conf
```

Verify with the six-IP probe in [Section 10.3](#103-verify-the-real-client-ip-survives-both-proxy-hops).

### Problem: CSS or JS 404s right after a deploy

A cached `index.html` is pointing at asset filenames from the previous build. Confirm the no-cache header is being sent:

```bash
curl -sI https://careone.example.com/index.html | grep -i cache-control
```

It must include `no-store`. If it does not, the `location = /index.html` block is missing or shadowed.

### Problem: a font or image is blocked in the browser console

The Content-Security-Policy in `nginx/conf.d/security.inc` does not list that origin. Add it to the right directive — `font-src` for fonts, `img-src` for images — then `docker compose restart web`.

> Remember the header is included **three times** in `careone.conf`: once in the server block and once inside each `location` that adds a header of its own. nginx drops inherited `add_header` directives in any block that sets one, so an edit in only one place appears to work everywhere except on assets.

### Problem: gallery upload fails with 413

`client_max_body_size` must be at least 10M in **both** nginx layers — `nginx/nginx.conf` and the edge's `careone-edge.conf`. The edge sees the request first.

### Problem: the SSL certificate command fails

```bash
dig +short careone.example.com                      # must be the VPS IP
curl http://careone.example.com/.well-known/acme-challenge/test-file
```

Common causes:

- DNS has not propagated, or still points at the old host
- The ACME location is shadowed by the HTTPS redirect
- You have hit the limit of 5 failed validations per hostname per hour

### Problem: out of memory during the Docker build

The React build is the memory-hungry step. This should not happen on this VPS — [Section 2.7](#27-check-free-memory-and-disk) measured 6.5 GiB available — so if it does, something else on the box grew. Check `free -h` and `docker stats` first. If you do need a cushion, add swap:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

### Problem: careone.example.com serves NammaGuide's site (or C2K's) instead of CareOne

The request matched another vhost first. Ask nginx which server block it actually chose:

```bash
docker exec nammaguide-nginx nginx -T 2>/dev/null | grep -n 'server_name'
```

Two causes:

- CareOne's vhost is not loaded at all — the file is not in the directory the edge really reads. Re-check [Section 2.4](#24-find-the-edges-config-directory-webroot-and-certificates); a vhost copied into the wrong `conf.d` is silently ignored, and requests fall through to whatever is `default_server`.
- DNS for `careone.example.com` resolves somewhere else entirely. `dig +short careone.example.com` must be the VPS IP.

### Problem: an edge reload broke the other sites

```bash
sudo rm /var/www/nammaguide/nginx/conf.d/careone-edge.conf
docker exec nammaguide-nginx nginx -t && docker exec nammaguide-nginx nginx -s reload
```

That removes CareOne from the edge and restores the previous state. If the config is somehow still broken, restore the directory you saved in [Section 2.8](#28-record-the-current-state-of-the-edge-config).

### Problem: GitHub Actions deploy fails

- **"i/o timeout" before the script runs** — the reachability gate exhausted its retries. Check `fail2ban` and the Hostinger firewall
- **"pg_dump failed" / "dump is truncated"** — working as designed. The database was unreachable or the disk is full; the deploy stopped before migrations ran
- **"the API failed to come up"** — the previous frontend is still being served. Read the 50 log lines the workflow printed, fix, and re-run

---

## 14. Scalability & Migration

### How your data is actually stored right now

| Data | Where it lives | Survives `docker compose down`? |
|---|---|---|
| Enquiries, callbacks, admins, gallery records | Docker volume `careone_postgres_data` | Yes — but **not** `down -v` |
| Gallery image files | Cloudinary, not this server | Yes, entirely external |
| The compiled site | Baked into the `careone-web` image | Rebuilt from git each deploy |
| Backups | `/var/www/careone/backups/` | Yes, plain files on disk |

> The container is disposable; the volume is not.

CareOne stores **no files on disk**. `server/src/controllers/gallery.controller.js` uses multer's memory storage and streams straight to Cloudinary, which is why there is no uploads volume. Moving CareOne to another machine is: copy `server/.env`, restore a `pg_dump`, run `docker compose up -d`.

### When to scale — signals to watch for

| Signal | Command | What it means |
|---|---|---|
| Memory pressure | `free -h` | Builds getting killed; time for swap or more RAM |
| Disk filling | `df -h /` | Three projects, three volumes, three backup sets |
| Slow API | `docker stats careone-api` | Sustained high CPU under normal traffic |

Do not over-engineer early. A brochure site with an enquiry form on a shared VPS has a long runway.

### Removing CareOne from this VPS cleanly

The reason for the isolated stack. In full:

```bash
# 1. Take a final backup
cd /var/www/careone
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > ~/careone-final.sql

# 2. Remove the vhost from the shared edge, and reload
sudo rm /var/www/nammaguide/nginx/conf.d/careone-edge.conf
docker exec nammaguide-nginx nginx -t && docker exec nammaguide-nginx nginx -s reload

# 3. Stop and remove the stack. -v also destroys the database volume, which is
#    what you want here and never otherwise.
docker compose down -v

# 4. Remove the images, the files and the user
docker image rm careone-web careone-api
sudo rm -rf /var/www/careone
sudo deluser --remove-home careone

# 5. Revoke the certificate
sudo certbot delete --cert-name careone.example.com
```

The other two projects are untouched throughout. Nothing of CareOne's was ever inside their directories except the single vhost file removed in step 2.

### Decoupling from the shared edge

CareOne has exactly two dependencies on NammaGuide: the vhost file living in NammaGuide's `nginx/conf.d/`, and the `nammaguide_nammaguide-net` docker network. Both are named in one place each (Section 8.3 and `docker-compose.yml`), and both would have to be repointed if NammaGuide is retired or rebuilt with a different project name.

That the box already moved once — C2K used to own 80/443 and now publishes 8081/8443 — is the argument for fixing this properly. Every such move rewrites the edge name in two other projects' configs. The clean end state is nginx on the **host** as a single edge owned by nobody: each stack binds a loopback port, the host proxies to it, and no project's configuration lives inside another's repository or depends on another's network name.

That is a re-plumbing of live sites, so it is not part of this deployment. It is the right move the next time all three projects need downtime anyway.

### If CareOne outgrows one box

1. **Bigger VPS** — Hostinger resize, no configuration change
2. **Separate the database** — move Postgres to a managed provider (Neon, Supabase, RDS). Unset the three `POSTGRES_*` variables and set `DATABASE_URL` directly; `docker-entrypoint.sh` already handles that case
3. **Multiple app servers** — CareOne's API is stateless (JWT auth, no sessions, no local files), so it scales horizontally with no sticky-session work

---

## Quick Reference

| Task | Command |
|---|---|
| Deploy the latest code | `git push origin main` |
| Manual deploy | `cd /var/www/careone && git pull && docker compose up -d --build` |
| View API logs | `docker compose logs -f api` |
| Restart the API | `docker compose restart api` |
| Rebuild after a client change | `docker compose up -d --build web` |
| Apply an env change | `nano server/.env && docker compose restart api` |
| Apply an nginx change | `docker compose restart web` |
| Apply an edge change | `docker exec nammaguide-nginx nginx -t && docker exec nammaguide-nginx nginx -s reload` |
| Back up the database | `docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > backups/manual.sql` |
| Restore a backup | `cat backups/x.sql \| docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'` |
| Database shell | `docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'` |
| Reset the admin password | `nano server/.env && docker compose restart api` |
| Service status | `docker compose ps` |
| Health check | `curl -s https://careone.example.com/api/health` |
| Renew SSL manually | `sudo certbot renew` |
| Check disk usage | `df -h / && docker system df` |
| Check the neighbours | `for h in nammaguide.in admin.nammaguide.in c2kitchen.in admin.c2kitchen.in; do curl -so/dev/null -w "$h %{http_code}\n" https://$h; done` |

---

## Pre-Launch Checklist

**Configuration**

- [ ] `careone.example.com` replaced with the real domain everywhere (`grep -r 'careone\.example\.com'` returns nothing)
- [ ] `server/.env` created, filled, and `chmod 600`
- [ ] `JWT_SECRET` and `POSTGRES_PASSWORD` generated with `openssl rand`, not typed by hand
- [ ] `ADMIN_SEED_PASSWORD` set to something strong, and changed from whatever was used in development
- [ ] `CLIENT_ORIGIN` lists the real apex and www origins
- [ ] `CLOUDINARY_*` filled, or you accept that gallery uploads return 503
- [ ] `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID` filled, or the reviews section stays empty

**Infrastructure**

- [ ] The `careone` user exists and is in the `docker` group, not `sudo`
- [ ] The edge was identified by **who publishes `0.0.0.0:80/443`** — `nammaguide-nginx` on this box — not by copying the C2K guide
- [ ] `/etc/letsencrypt` and `/var/www/certbot` are both bind-mounted into `nammaguide-nginx` (verified: they are)
- [ ] `edge-net`'s `name:` is `nammaguide_nammaguide-net` — the doubled word is correct
- [ ] `nginx -T` on the edge shows no pre-existing `careone.example.com` server block
- [ ] All three host bindings in `docker-compose.yml` still start with `127.0.0.1:`
- [ ] No new `ufw` rules were added
- [ ] The edge config directory was backed up before the vhost was added
- [ ] SSL issued, and `certbot renew --dry-run` passes
- [ ] A renewal deploy hook reloads **`nammaguide-nginx`** — and any old hook pointing at `c2k-nginx` was corrected
- [ ] The daily backup cron is installed and has produced at least one file

**Verification**

- [ ] `https://careone.example.com` loads; `http://` and `www.` both redirect to it
- [ ] Every client route survives a hard refresh
- [ ] The enquiry form submits and the entry appears in the admin dashboard
- [ ] Admin login works, and a gallery upload succeeds
- [ ] The six-IP rate-limit probe in Section 10.3 returns six `201`s
- [ ] Browser console is free of CSP violations
- [ ] **All four neighbour hostnames still return their baseline status** — `nammaguide.in`, `admin.nammaguide.in`, `c2kitchen.in`, `admin.c2kitchen.in`
- [ ] A test push to `main` deploys green end to end
