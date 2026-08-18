# CareOne Nursing Services — Website Implementation Plan

**Version:** 1.0 (FINAL — All decisions confirmed)
**Date:** 10 July 2026
**Project Type:** Full-stack home nursing services website with Admin Panel
**Status:** Approved for build. Phase 0 pending "start" command.

---

## 1. PROJECT OVERVIEW

CareOne Nursing Services is a home-based healthcare/nursing company serving
**Pondicherry & Surrounding Areas**, operating **24/7**. The website is a
client-facing marketing + enquiry platform with an internal admin panel to
monitor customer requests and manage the gallery.

This started as a static site plan, but was upgraded to full-stack because:

- Enquiry requests must be **stored in a database** and monitored in admin
- Gallery must be **managed from admin** (upload/delete images)
- Admin access requires **authentication**

**Reference sites used for UI direction:**

- CareOne flyer (brand source of truth: colors, services, taglines)
- sainahomecare.com (layout structure, callback form, vision/mission,
  footer popular links, trust badges)
- Generic medical templates (MedCare, MEDArt, Divi Hospital, Cardiologist)
  for hero/utility-bar/overlap-card patterns

---

## 2. BRAND & CONTENT (SOURCE OF TRUTH)

| Item              | Value                                                     |
| ----------------- | --------------------------------------------------------- |
| Brand name        | CareOne Nursing Services                                   |
| Tagline           | Compassionate Care. Professional Service. Better Life.     |
| Promise lines     | "Your Care, Our Promise" / "We Care Like Family"           |
| Phone / WhatsApp  | 8838562250                                                 |
| Website domain    | careonenursing.in                                          |
| Service area      | Pondicherry & Surrounding Areas (NO street address shown)  |
| Operating hours   | 24/7                                                       |
| Language          | English only                                               |
| Email             | `care@careonenursing.in` — published on Contact page + footer. WhatsApp remains the primary follow-up channel. |
| Logo              | Provided by Dev4 during development (Phase 1). Placeholder until then. |
| Photos            | Provided by Dev4 later. Clean placeholders until then.     |
| Social media      | Placeholder icons with `#` links. Real URLs swapped in later. |

---

## 3. COLOR SYSTEM (Tailwind tokens)

Source of truth is the `@theme {}` block in `client/src/index.css` (Tailwind v4,
CSS-first — there is no `tailwind.config.js`). Values below are the v3 palette,
derived from the blue logo mark; the token names still read `teal` for historical
reasons but now hold the logo's sky blue.

| Token      | Hex       | Usage                                              |
| ---------- | --------- | -------------------------------------------------- |
| teal       | `#1B74B7` | Primary — headings, icon circles, buttons, links   |
| teal-light | `#3FA0D8` | Second stop of the signature CTA gradient          |
| teal-pale  | `#C0E0F5` | Tints — banner rings, decorative blobs             |
| mint       | `#EBF5FC` | Lightest brand tint                                |
| navy       | `#143366` | Navbar, footer, service titles, dark sections      |
| navy-deep  | `#0E2651` | Deepest navy — hero scrims                         |
| maroon     | `#6E1E32` | Legacy accent — admin panel status chips only      |
| gold       | `#C9A24B` | Legacy accent — admin panel badges only            |
| soft       | `#F2F7FC` | Alternate section backgrounds                      |
| ink        | `#33415C` | Strong body text                                   |
| body       | `#5E6C86` | Body text                                          |
| white      | `#FFFFFF` | Base background                                    |

Shadows and scrims are built from two rgba bases: `rgba(27,116,183,α)` (blue) and
`rgba(20,51,102,α)` (navy).

Rule: maroon and gold are **admin-only** and never appear on the public site.
Blue + navy carry the site.

---

## 4. TECH STACK (CONFIRMED)

| Layer            | Technology                                          |
| ---------------- | ---------------------------------------------------- |
| Frontend         | React 18 + Vite + Tailwind CSS                       |
| Routing          | react-router-dom                                     |
| Backend          | Node.js + Express                                    |
| Database         | PostgreSQL + Prisma ORM                              |
| Auth             | JWT (single admin), bcrypt password hashing          |
| Image storage    | Cloudinary (gallery uploads)                         |
| Reviews          | Google Places API → cached in PostgreSQL             |
| Enquiry follow-up| WhatsApp deep links only (`wa.me`). No transactional email/EmailJS — the published address is for inbound contact only. |

---

## 5. PROJECT STRUCTURE

```
careone/
├─ client/                              # React + Vite + Tailwind
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ layout/
│  │  │  │  ├─ TopBar.jsx               # phone, 24/7 badge, social icons
│  │  │  │  ├─ Navbar.jsx               # logo + 5 links + Book CTA
│  │  │  │  ├─ Footer.jsx               # 4 columns (see section 9)
│  │  │  │  └─ Container.jsx            # max-width wrapper
│  │  │  ├─ ui/
│  │  │  │  ├─ Button.jsx               # primary / outline / whatsapp variants
│  │  │  │  ├─ SectionHeading.jsx       # small label + big title + gold divider
│  │  │  │  ├─ ServiceCard.jsx          # ICON CIRCLE style (flyer style)
│  │  │  │  ├─ SubServiceItem.jsx       # small icon row under category
│  │  │  │  ├─ FeatureCard.jsx          # hero overlap highlight cards
│  │  │  │  ├─ WhyUsItem.jsx            # check icon + text
│  │  │  │  ├─ TrustBadge.jsx           # About section 4 badges
│  │  │  │  ├─ CTABand.jsx              # maroon "We Care Like Family" band
│  │  │  │  ├─ ReviewCard.jsx           # Google review: stars, author, text
│  │  │  │  └─ SuccessModal.jsx         # "Request received!" popup
│  │  │  ├─ forms/
│  │  │  │  └─ EnquiryForm.jsx          # name, phone, service dropdown, message
│  │  │  └─ admin/
│  │  │     ├─ AdminLayout.jsx          # sidebar + outlet
│  │  │     ├─ StatCard.jsx             # dashboard counters
│  │  │     ├─ RequestRow.jsx           # request table row + status chip
│  │  │     ├─ StatusChip.jsx           # NEW / CONTACTED / CLOSED
│  │  │     └─ GalleryUploader.jsx      # upload + preview + delete
│  │  ├─ pages/
│  │  │  ├─ public/
│  │  │  │  ├─ Home.jsx                 # long-scroll (see section 8.1)
│  │  │  │  ├─ About.jsx
│  │  │  │  ├─ Services.jsx
│  │  │  │  ├─ Gallery.jsx
│  │  │  │  └─ Contact.jsx
│  │  │  └─ admin/
│  │  │     ├─ Login.jsx
│  │  │     ├─ Dashboard.jsx
│  │  │     ├─ Requests.jsx
│  │  │     └─ GalleryManager.jsx
│  │  ├─ data/
│  │  │  ├─ site.js                     # phone, area, hours, taglines (HARDCODED)
│  │  │  ├─ services.js                 # 5 categories + sub-services + additional
│  │  │  ├─ features.js                 # hero overlap cards
│  │  │  └─ whyus.js                    # why-choose-us points
│  │  ├─ lib/
│  │  │  ├─ api.js                      # fetch wrapper with base URL
│  │  │  └─ auth.js                     # token store, ProtectedRoute helper
│  │  ├─ App.jsx                        # routes (public + protected admin)
│  │  ├─ main.jsx
│  │  └─ index.css                      # Tailwind + tokens
│  ├─ tailwind.config.js
│  └─ index.html
└─ server/                              # Node + Express
   ├─ prisma/
   │  ├─ schema.prisma
   │  └─ seed.js                        # seeds admin user (bcrypt hashed)
   ├─ src/
   │  ├─ routes/
   │  │  ├─ auth.routes.js
   │  │  ├─ requests.routes.js
   │  │  ├─ gallery.routes.js
   │  │  └─ reviews.routes.js
   │  ├─ controllers/
   │  │  ├─ auth.controller.js
   │  │  ├─ requests.controller.js
   │  │  ├─ gallery.controller.js
   │  │  └─ reviews.controller.js
   │  ├─ middleware/
   │  │  ├─ auth.middleware.js          # JWT verify guard
   │  │  └─ error.middleware.js
   │  ├─ services/
   │  │  ├─ googleReviews.service.js    # fetch + 6h cache logic
   │  │  └─ cloudinary.service.js       # upload / destroy
   │  ├─ app.js
   │  └─ server.js
   ├─ .env.example
   └─ package.json
```

---

## 6. DATABASE SCHEMA (Prisma / PostgreSQL)

```prisma
model Admin {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String                        // bcrypt hash
  createdAt DateTime @default(now())
}

enum RequestStatus {
  NEW
  CONTACTED
  CLOSED
}

model Request {
  id        Int           @id @default(autoincrement())
  name      String
  phone     String
  service   String                        // one of 5 categories or "Other"
  message   String?
  status    RequestStatus @default(NEW)
  createdAt DateTime      @default(now())
}

model GalleryImage {
  id        Int      @id @default(autoincrement())
  title     String?
  category  String?
  imageUrl  String                        // Cloudinary secure URL
  publicId  String                        // Cloudinary public_id (for delete)
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
}

model CachedReview {
  id         Int      @id @default(autoincrement())
  authorName String
  rating     Int
  text       String
  photoUrl   String?
  reviewTime DateTime
  fetchedAt  DateTime @default(now())
}
```

**Seed file (`prisma/seed.js`):** creates one admin —
username `admin`, temporary password (bcrypt hashed). Dev4 changes it
after first login. No registration route exists anywhere.

---

## 7. API ENDPOINTS

### Public (no auth)

| Method | Endpoint          | Purpose                                              |
| ------ | ----------------- | ---------------------------------------------------- |
| POST   | `/api/requests`   | Save enquiry form → Request row with status NEW      |
| GET    | `/api/gallery`    | List gallery images (ordered by sortOrder)           |
| GET    | `/api/reviews`    | Serve cached Google reviews; refresh if stale > 6h   |

### Auth

| Method | Endpoint          | Purpose                                              |
| ------ | ----------------- | ---------------------------------------------------- |
| POST   | `/api/auth/login` | username + password → JWT token                      |

### Admin (JWT required)

| Method | Endpoint                    | Purpose                                    |
| ------ | --------------------------- | ------------------------------------------ |
| GET    | `/api/admin/stats`          | Counts: new requests, total, gallery count |
| GET    | `/api/admin/requests`       | List requests; `?status=` filter optional  |
| PATCH  | `/api/admin/requests/:id`   | Update status (NEW/CONTACTED/CLOSED)       |
| DELETE | `/api/admin/requests/:id`   | Delete a request                           |
| POST   | `/api/admin/gallery`        | Upload image (multipart → Cloudinary)      |
| PATCH  | `/api/admin/gallery/:id`    | Edit title/category/sortOrder              |
| DELETE | `/api/admin/gallery/:id`    | Delete (DB row + Cloudinary destroy)       |

### Validation rules (POST /api/requests)

- `name`: required, 2–60 chars
- `phone`: required, 10-digit Indian mobile (regex `^[6-9]\d{9}$`)
- `service`: required, must be one of the 6 dropdown values
- `message`: optional, max 500 chars
- Basic rate limiting on this endpoint (spam protection)

---

## 8. SERVICES DATA (CONFIRMED MAPPING)

### 8.1 Departments (7) — source of truth is `client/src/data/services.js`

| # | Department                | Sub-services                                                             |
| - | ------------------------- | ---------------------------------------------------------------------- |
| 1 | Supportive Management     | Daily living support · Medication management · Care coordination · Monitoring |
| 2 | Bedridden Patient Care    | Bed sore management · Catheterization · Ryles tube insertion · Hygiene & repositioning |
| 3 | Stroke Patient Care       | Physiotherapy at home · Rehab & mobility support · Vitals monitoring   |
| 4 | Tracheostomy Patient Care | Airway management · Suctioning · Infection prevention · ICU care at home |
| 5 | Post Operative Care       | Wound dressing · Injections & IV therapy · Doctor visits · Recovery monitoring |
| 6 | Medical Equipment Rental  | Oxygen concentrators · Hospital beds · Wheelchairs · Suction machines  |
| 7 | Palliative Care           | Pain management · Comfort care · Family support                        |

**Baby Care: EXCLUDED (Dev4 decision).**
**Ambulance Services: REMOVED (Dev4 decision, 2026-08-18).**
**Elder Care: renamed to Supportive Management (Dev4 decision, 2026-08-18).**

### 8.2 Additional Services strip on the home page

- Medical Equipment Rental (oxygen concentrators, hospital beds, wheelchairs, suction machines)
- Palliative Care

Note this strip is hardcoded in `client/src/pages/public/Home.jsx`, duplicating
copy that also lives in `services.js`.

### 8.3 Enquiry form dropdown values (8)

Derived in code as `enquiryServiceOptions` = the 7 department names +
`Not sure — need guidance`. **The server duplicates this list as `SERVICE_OPTIONS`
in `server/src/controllers/requests.controller.js` (plus `Other`) and nothing
enforces the sync — change both together or enquiries 400.**

---

## 9. PUBLIC PAGES — SECTION BY SECTION

### 9.1 Home (long-scroll, Saina-style hybrid)

1. **TopBar** — phone (tap-to-call), "24/7 Service" badge, social placeholder icons
2. **Navbar** — logo | Home · About · Services · Gallery · Contact | "Book a Nurse" CTA button
3. **Hero** — heading "Compassionate Care at Your Doorstep", subtext, 2 CTAs
   (Book a Nurse → scrolls to form section · Call Now → tel link), nurse image placeholder
4. **Feature overlap cards (4)** — Skilled & Verified Nurses · 24/7 Support ·
   Home Nursing Care · Trusted & Reliable (overlapping hero bottom edge)
5. **About snippet** — 2 short paragraphs + 4 TrustBadges
   (Experienced Caregivers · 24/7 Support Available · Personalized Care Plans ·
   Trusted Home Healthcare) + image placeholder + "Know More" → /about
6. **Services section** — SectionHeading + 5 category ServiceCards (icon circles);
   each card links to its section anchor on /services
7. **Additional Services strip** — 3 items, compact row
8. **Why Choose Us** — 5 points from flyer (Qualified & Verified Nurses ·
   Personalized Care Plans · Affordable & Reliable · Hygienic & Safe Care ·
   Support You Can Trust)
9. **Maroon CTA band** — "We Care Like Family" + phone + Book button
10. **Google Reviews section** — ReviewCards from `/api/reviews`
    (stars, author, text, "via Google" tag). Hidden gracefully if cache empty.
11. **Enquiry form section** — split layout like Saina: left = "Why CareOne" text +
    big phone number; right = EnquiryForm card
12. **Footer**

### 9.2 About

- Page hero strip (navy) with title
- Who we are + mission paragraphs
- **Our Vision** + **Our Mission** blocks (Saina pattern)
- "Your Care, Our Promise" values (compassion, dignity, hygiene)
- 4 TrustBadges + Why Choose Us detailed
- CTA band

### 9.3 Services

- Page hero strip
- For each of the 5 categories: anchor section → icon circle + title +
  description + SubServiceItem rows
- Additional Services strip
- CTA band → enquiry

### 9.4 Gallery

- Page hero strip
- Responsive image grid from `GET /api/gallery`
- Optional category filter chips (only if categories exist in data)
- Empty state: "Gallery coming soon"

### 9.5 Contact

- Page hero strip
- Call + WhatsApp big buttons, 24/7 badge, "Pondicherry & Surrounding Areas"
- EnquiryForm (same component as Home)
- SuccessModal on submit: "Request received! Our team will contact you shortly."

### 9.6 Footer (all pages, 4 columns)

1. Logo + short blurb + phone
2. **Quick Links** — Home, About, Services, Gallery, Contact
3. **Popular Links** — the 5 service categories (link to /services anchors)
4. **Get In Touch** — "Pondicherry & Surrounding Areas" · phone · WhatsApp ·
   social placeholder icons
- Bottom bar: © 2026 CareOne Nursing Services. All Rights Reserved.

---

## 10. ADMIN PANEL — PAGE BY PAGE

Route base: `/admin` (all protected except login).

### 10.1 Login (`/admin/login`)

- Username + password → `POST /api/auth/login` → JWT stored → redirect to dashboard
- Wrong credentials → inline error. No registration, no forgot-password (single admin).

### 10.2 Dashboard (`/admin`)

- StatCards: **New Requests** · **Total Requests** · **Gallery Images**
- Latest 5 requests preview table → "View all" → Requests page

### 10.3 Requests (`/admin/requests`)

- Table: Name · Phone · Service · Message · Date · Status · Actions
- Filter tabs: All / New / Contacted / Closed
- **Status chip dropdown** per row → PATCH status
- **WhatsApp reply button** per row → opens
  `https://wa.me/91<phone>?text=<prefilled>` in new tab.
  Prefilled: "Hello <name>, this is CareOne Nursing Services regarding your
  <service> request."
- Delete with confirm dialog
- **No outbound email from the admin panel** — follow-up is WhatsApp/phone only.
  (`care@careonenursing.in` is published on the public site for inbound contact.)

### 10.4 Gallery Manager (`/admin/gallery`)

- Upload: file picker → preview → optional title/category → POST (Cloudinary)
- Grid of existing images with edit (title/category/sortOrder) + delete (confirm)

---

## 11. KEY FLOWS

### 11.1 Enquiry flow

User fills form (name, phone, service dropdown, message) →
`POST /api/requests` → saved status NEW → SuccessModal shown →
appears in admin Requests → admin taps WhatsApp button → chats with customer →
updates status CONTACTED → later CLOSED.

### 11.2 Google Reviews flow (lazy cache)

`GET /api/reviews` → if `CachedReview.fetchedAt` newest row older than **6 hours**
(or table empty) → server calls Google Places API (Place Details, reviews field)
→ upserts into `CachedReview` → returns rows. If Google call fails → serve stale
cache silently. API key lives **server-side only** in `.env`.

Constraint: Places API returns **max ~5 reviews**. Requires client's
**Google Business Profile** to exist with reviews.

### 11.3 Gallery flow

Admin uploads → multer memory → Cloudinary upload → save `imageUrl` + `publicId`
→ public Gallery page renders grid. Delete removes Cloudinary asset + DB row.

---

## 12. ENVIRONMENT VARIABLES (`server/.env`)

```
DATABASE_URL=postgresql://user:pass@localhost:5432/careone
JWT_SECRET=<random 32+ chars>
JWT_EXPIRES_IN=1d
ADMIN_SEED_USERNAME=admin
ADMIN_SEED_PASSWORD=<temp password, change after first login>
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GOOGLE_PLACES_API_KEY=          # provided at Phase 9
GOOGLE_PLACE_ID=                # provided at Phase 9
CLIENT_ORIGIN=http://localhost:5173
PORT=5000
```

Client `.env`: `VITE_API_URL=http://localhost:5000/api`

---

## 13. PHASE PLAN (WITH STOP GATES)

> Rule: at every **STOP**, Dev4 verifies and explicitly approves before the
> next phase begins. No skipping gates.

### Phase 0 — Scaffold ⛔ STOP
- Monorepo: `client/` (Vite + React + Tailwind + tokens + router with all
  routes stubbed) and `server/` (Express boot + Prisma schema + migration +
  seed.js runs successfully against local PostgreSQL)
- Deliverable: both apps run; DB has Admin seeded.

### Phase 1 — Layout shell
- TopBar, Navbar (Gallery link included), Footer (4 columns), Container
- Logo slot ready — **Dev4 provides logo here**; placeholder until received.

### Phase 2 — UI kit + data files
- Button, SectionHeading, ServiceCard, SubServiceItem, FeatureCard, WhyUsItem,
  TrustBadge, CTABand, ReviewCard, SuccessModal
- `site.js`, `services.js` (full mapping from section 8), `features.js`, `whyus.js`

### Phase 3 — Home page
- All 12 sections from 9.1. Reviews section uses placeholder data for now.

### Phase 4 — About + Services pages
- Vision/Mission, anchors, sub-service rows, additional strip.

### Phase 5 — Contact + enquiry end-to-end ⛔ STOP
- EnquiryForm → validation → `POST /api/requests` → row in DB → SuccessModal.
- Deliverable: submit a real test request, verify in DB.

### Phase 6 — Auth
- Login page, JWT issue/verify, auth middleware, ProtectedRoute on client,
  seeded admin login works.

### Phase 7 — Admin: Dashboard + Requests
- Stats endpoint + StatCards; Requests table with filters, status PATCH,
  WhatsApp reply button, delete.

### Phase 8 — Gallery
- Cloudinary service, admin GalleryManager (upload/edit/delete),
  public Gallery page + navbar link live.

### Phase 9 — Google Reviews ⛔ STOP (needs credentials)
- **Dev4 provides GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID here.**
- googleReviews.service with 6h cache, `/api/reviews`, wire ReviewCards on Home.
- Fallback behavior verified (stale cache / empty / API failure).

### Phase 10 — Polish & final review ⛔ STOP
- Responsive pass (mobile-first), hover/focus states, loading + empty states,
  form error states, 404 page, favicon, meta tags (title/description per page,
  Pondicherry keywords), final walkthrough with Dev4.

---

## 14. PENDING ITEMS (ON DEV4)

| Item                          | Needed at | Until then          |
| ----------------------------- | --------- | ------------------- |
| Logo file (PNG/SVG)           | Phase 1   | Text placeholder    |
| Real photos (hero/about)      | Any time  | Clean placeholders  |
| Social media URLs             | Any time  | `#` placeholder icons |
| Google Business Profile exists + has reviews | Before Phase 9 | Placeholder reviews |
| GOOGLE_PLACES_API_KEY         | Phase 9   | —                   |
| GOOGLE_PLACE_ID               | Phase 9   | —                   |
| Change seeded admin password  | After Phase 6 | Temp seed password |

---

## 15. LOCKED DECISIONS LOG (for traceability)

1. Stack: React + Vite + Tailwind / Node + Express / **PostgreSQL + Prisma** / Cloudinary
2. Language: English only
3. Email: `care@careonenursing.in` published on the public site (Contact card + footer);
   follow-up from the admin panel is still WhatsApp-only
4. Enquiry requests: stored in DB, monitored in admin
5. Admin: single user, **seed-file based**, JWT auth, no settings page
6. Reviews: **fetched from Google** (Places API) with server-side 6h cache
7. Gallery: admin-managed via Cloudinary, public page + navbar item
8. Layout: **hybrid** — long-scroll Home + dedicated About/Services/Gallery/Contact
9. Service cards: **icon circles (flyer style)** — not photo cards
10. Services: **5 main categories + flyer items as sub-services**; Baby Care excluded
11. Additional Services strip: Equipment Rental · Palliative Care
12. Form dropdown: 7 departments + "Not sure — need guidance"
13. Address shown: **"Pondicherry & Surrounding Areas" only** — no street address
14. Hours: 24/7
15. Colors: blue `#1B74B7` · navy `#143366` · maroon `#6E1E32` (admin) · gold `#C9A24B` (admin)

---

*End of plan. Workflow rule in force: this file is the source of truth.
Any change is proposed → approved by Dev4 → then updated here → then coded.*
