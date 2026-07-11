# CareOne Nursing Services

Full-stack home nursing services website — public marketing site + enquiry flow + admin panel.
Built per `careone-implementation-plan.md` (source of truth).

## Stack

- **Client:** React 18 + Vite + Tailwind CSS v4 + react-router-dom (`client/`)
- **Server:** Node.js + Express + Prisma + PostgreSQL (`server/`)
- **Auth:** JWT, single seeded admin (no registration)
- **Images:** Cloudinary (gallery) · **Reviews:** Google Places API with 6h server cache

## Local development

### 1. Database (Docker)

A dedicated Postgres runs in Docker on port **5433** (5432 is used by another project):

```bash
docker start careone-postgres   # already created; data persists in the careone_pgdata volume
```

### 2. Server

```bash
cd server
npm install
npx prisma migrate dev    # apply migrations
npm run seed              # creates the admin user (idempotent, never overwrites)
npm run dev               # http://localhost:5000
```

### 3. Client

```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

## Admin panel

- URL: `http://localhost:5173/admin/login`
- Seeded credentials: username `admin`, password from `ADMIN_SEED_PASSWORD` in `server/.env`
  (temporary — change after first login).

## Pending items (per plan §14)

| Item | Needed at | Until then |
| ---- | --------- | ---------- |
| Logo file (PNG/SVG) | Phase 1 | HeartPulse icon placeholder in Navbar/Footer |
| Real photos | Any time | `ImagePlaceholder` component |
| Social media URLs | Any time | `#` placeholders in `client/src/data/site.js` |
| `GOOGLE_PLACES_API_KEY` + `GOOGLE_PLACE_ID` | Phase 9 | Reviews section hidden gracefully |
| Cloudinary credentials | Before gallery upload | Upload returns a clear 503 error |

All brand content (phone, taglines, service area) is centralised in `client/src/data/site.js`.
Service categories/sub-services live in `client/src/data/services.js`.
