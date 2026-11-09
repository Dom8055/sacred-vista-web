# Sacred Vista — Wildlife Expeditions Website

Premium wildlife safari & travel website: React (CRA + Tailwind + Framer Motion + Lenis + React Three Fiber) frontend, FastAPI backend, MongoDB database.

## 1. Folder structure
```
backend/
  server.py          # FastAPI app: catalog, inquiries, admin auth (all routes under /api)
  seed_data.py       # SINGLE SOURCE OF CONTENT: segments, destinations, packages, gallery, prices, itineraries, images
  requirements.txt
  .env.example
frontend/
  public/            # index.html (SEO/OG/JSON-LD), favicon.svg, robots.txt, sitemap.xml
  src/
    App.js           # routes, layout, Lenis smooth scroll, page transitions
    data/site.js     # contact details, WhatsApp, socials, nav, FAQs, Why-us copy, legal content
    data/mapGeo.js   # India + Kenya outlines (Natural Earth, generated)
    context/         # CatalogContext (loads /api/catalog), AuthContext (admin)
    hooks/           # useLenis, useSeo
    lib/sv.js        # API client, INR formatting, image sizing, error helper
    components/
      layout/        # Header, Footer, FloatingActions (WhatsApp + back-to-top)
      sv/            # Logo, Motion (Reveal, MaskLines, Marquee), Cards, PageHero, Lightbox, InquiryForm, States
      home/          # Hero, HeroScene (Three.js), BrandStory, SegmentsShowcase, MapExplorer, WorldMap, Editorial, Closing, SegmentView
      ui/            # shadcn/ui primitives
    pages/           # Home, Packages, PackageDetails, Destinations, DestinationDetails, Gallery, Contact, LegalPage, Admin
```

## 2. Run locally on a Mac mini (Apple Silicon M1)

### One-time installs
1. Install Homebrew (Terminal):
   `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
2. Install tools:
   ```
   brew install python@3.11 node@20 yarn
   brew tap mongodb/brew && brew install mongodb-community@7.0
   brew services start mongodb-community@7.0
   ```
   (If `node`/`python3.11` aren't found, follow the "add to PATH" hint Homebrew prints, then open a new Terminal.)

### Backend (Terminal window 1)
```
cd sacred-vista/backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install fastapi "uvicorn[standard]" motor pymongo python-dotenv pydantic email-validator bcrypt pyjwt
cp .env.example .env          # then edit values (see section 3)
uvicorn server:app --reload --port 8001
```
Check: open http://localhost:8001/api/catalog — you should see JSON with 7 segments, 7 destinations, 10 packages, 8 gallery images.
(`requirements.txt` is a full environment freeze from the build server; the single `pip install` line above is all you need on a Mac.)

### Frontend (Terminal window 2)
```
cd sacred-vista/frontend
cp .env.example .env          # REACT_APP_BACKEND_URL=http://localhost:8001
yarn install
yarn start
```
Open http://localhost:3000. Admin desk: http://localhost:3000/admin.

## 3. Environment variables
backend/.env
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="sacred_vista"
CORS_ORIGINS="http://localhost:3000"
JWT_SECRET="<long random string — run: python3 -c 'import secrets;print(secrets.token_hex(32))'>"
ADMIN_EMAIL="you@example.com"
ADMIN_PASSWORD="<strong password>"
EMERGENT_EMAIL_KEY=<provided by Emergent>
EMAIL_FROM_NAME="Sacred Vista"
OWNER_EMAIL="you@example.com"
SITE_URL="https://your-domain.com"
```
frontend/.env
```
REACT_APP_BACKEND_URL=http://localhost:8001
```
The admin account is created on first backend start only if it doesn't exist. Changing ADMIN_PASSWORD later does not overwrite an existing admin.

## 4. Database (MongoDB) collections
| Collection | Purpose | Key fields |
|---|---|---|
| segments | 7 travel styles | id, name, label, headline, description, accent, image |
| destinations | 7 destinations | id, name, region, country, continent, lat, lng, tagline, description, banner, highlights[], wildlife[], best_time, best_months[12] (0 off, 1 good, 2 peak), getting_there, gallery[] |
| packages | 10 packages | id, title, destination_id, segment_id, duration_days, price_inr, featured, image, summary, overview, highlights[], itinerary[{day,title,location,activities[],travel}], inclusions[], exclusions[], info[], gallery[], group_size, best_season |
| gallery | 8 images g1–g8 | id, title, location, category (Wildlife/Landscape/Birds/Safari), image, shape |
| inquiries | form submissions | name, email, phone, segment, message, package_id, package_name, destination_id, status (new/contacted/booked/archived), created_at, ip |
| users | admin login | email, password_hash (bcrypt), role |
| login_attempts | brute-force lockout | identifier, count, last |

Catalog items from `backend/seed_data.py` are inserted on first backend start (and any new fields are added later), but existing records are never overwritten. **After launch, edit packages, prices and itineraries from the admin desk (`/admin` → Package editor)** — changes go live instantly. Destinations, segments and gallery are still seeded from `seed_data.py` (edit there before the first start, or update MongoDB directly). Contact info, socials, FAQs and legal text live in `frontend/src/data/site.js`.

### Email alerts
Every new inquiry sends a notification to `OWNER_EMAIL` through Emergent's managed email service (requires `EMERGENT_EMAIL_KEY`, `EMAIL_FROM_NAME`, `OWNER_EMAIL`, optional `SITE_URL` for the "Open the inquiry desk" button). Inquiries are always saved even if the email can't be sent. When running locally/self-hosted, keep the same variables; the managed key only works for this Emergent app.

## 5. API
- `GET /api/catalog` — all content
- `POST /api/inquiries` — server-validated inquiry (honeypot + 5 per 10 min per IP)
- `POST /api/auth/login`, `GET /api/auth/me` — admin auth (Bearer JWT, 8 h)
- `GET /api/admin/inquiries?status=` , `PATCH /api/admin/inquiries/{id}` — admin only
- `POST /api/admin/uploads` (admin, multipart JPG/PNG/WebP ≤ 10 MB → `{url}`), `GET /api/files/{path}` — public image serving from Emergent object storage (needs `EMERGENT_LLM_KEY`)
- `PUT /api/admin/packages/{id}` — admin only, validated package update (title, price, duration, texts, lists, itinerary)
- `GET /api/admin/packages` (includes retired), `POST /api/admin/packages` (create; id becomes /packages/{id}), `PATCH /api/admin/packages/{id}/retire` `{retired: true|false}` — retired packages are hidden from the public site but kept for restore

## 6. Routes
`/`, `/packages` (supports `?segment=`, `?destination=`, `?budget=`, `?sort=`, `?q=`, `?peak=1`), `/packages/:packageId` and legacy `/package-details?packageId=`, `/destinations` (`?region=asia|africa`), `/destinations/:destinationId` and legacy `/destination-details?destinationId=`, `/gallery`, `/contact` (`?package=`, `?destination=`, `?segment=`), `/privacy-policy`, `/terms-conditions`, `/payment-conditions`, `/admin/login`, `/admin`.

## 7. Deployment
- Easiest: Emergent one-click Deploy (frontend + backend + MongoDB).
- Self-host: frontend `yarn build` → any static host (Vercel/Netlify) with SPA fallback to index.html and `REACT_APP_BACKEND_URL` set to your API URL; backend on Render/Railway/Fly (`uvicorn server:app --host 0.0.0.0 --port 8001`) with MongoDB Atlas `MONGO_URL`; set `CORS_ORIGINS` to your site's domain.

## 8. Remaining configuration
- WhatsApp/phone `724960354` has 9 digits — confirm and add the country code (e.g. 91XXXXXXXXXX) in `frontend/src/data/site.js`.
- Studio address and social media URLs are placeholders (`null`) in `site.js`.
- Prices are SAMPLE INR values; legal pages are sample text for legal review.
- Photography is licensed stock (Unsplash/Pexels) used as placeholders — replace URLs in `seed_data.py` / `site.js` with your own images.
- Update `sitemap.xml` `<loc>` entries with your final domain.
