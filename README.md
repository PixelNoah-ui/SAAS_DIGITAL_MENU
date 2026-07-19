<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:7C2D12,100:F97316&height=180&section=header&text=DigitalMenu&fontSize=52&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=QR-Powered%20Restaurant%20Ordering%20Platform&descAlignY=58&descSize=18"/>

# 🍽️ Digital Menu — QR-Based Restaurant Ordering SaaS

<img src="https://readme-typing-svg.demolab.com/?font=Tinos&weight=600&size=20&duration=2500&pause=900&color=F97316&center=true&vCenter=true&width=680&lines=Next.js+16+%2B+Express+5+%2B+Prisma+7;Scan-a-QR%2C+Order-from-the-Table;Session-Based+Guest+Ordering+(No+Login);Admin%2FManager+Dashboard+%26+QR+Card+Generation" alt="Typing SVG" />

**A full-stack "scan the QR, order from your table" system: guests order without creating an account via a table-scoped session, while staff manage the menu, tables, and live orders through a role-gated API.**

[![GitHub Repo](https://img.shields.io/badge/GitHub-PixelNoah--ui%2FSAAS__DIGITAL__MENU-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/PixelNoah-ui/SAAS_DIGITAL_MENU)
[![License](https://img.shields.io/badge/License-Not%20detected-lightgrey?style=for-the-badge)](#-license)

![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?style=flat-square&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma%207-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Zustand](https://img.shields.io/badge/State-Zustand-443E38?style=flat-square)
![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel&logoColor=white)

</div>

---

## 📖 Overview

A **two-package monorepo** (`frontend/` — Next.js 16, `backend/` — Express 5 + Prisma 7 + PostgreSQL) built around a single idea: a guest scans a table's QR code, gets a short-lived **table session** (no account needed), browses the menu, and places orders that staff see and manage in real time via status updates. Table QR tokens, printable QR cards (generated server-side with Puppeteer + `qrcode` + `sharp`, and emailed out), menu items, and orders all live behind a role-gated Express API (`ADMIN` / `MANAGER` / `STAFF`).

There is no admin frontend in this repo — the `frontend/` package is entirely the guest-facing ordering experience; admin/manager routes exist only as API endpoints.

---

## 🖼️ Screenshots

<table>
<tr>
<td width="25%"><img src="docs/screenshots/home.jpg" width="100%"><p align="center"><sub>Menu home</sub></p></td>
<td width="25%"><img src="docs/screenshots/product_details.jpg" width="100%"><p align="center"><sub>Item details</sub></p></td>
<td width="25%"><img src="docs/screenshots/checkout.jpg" width="100%"><p align="center"><sub>Checkout / cart</sub></p></td>
<td width="25%"><img src="docs/screenshots/myorder.jpg" width="100%"><p align="center"><sub>My Orders</sub></p></td>
</tr>
</table>

---

## ✨ Features

**Guest ordering (no account):** scan a table's QR (`/[qrToken]`) → table stored in a persisted Zustand store → browse/search/filter the menu → add to a persisted cart → checkout creates an `OrderSession` (or reuses an active one) scoped to that table via an `httpOnly` `session_token` cookie → track status on `/active` (My Orders).

**Session-scoped ordering rules:** sessions auto-expire (`SESSION_EXPIRE_MINUTES`), and each session is rate-limited to `ORDER_LIMIT_PER_WINDOW` orders per `ORDER_WINDOW_MINUTES` (429 once exceeded) — guarding against runaway order spam from one table.

**Admin/Manager (API-only, no dashboard UI in this repo):** menu CRUD with Cloudinary-style image processing (`multer` + `sharp`), table CRUD with QR-token generation, a printable QR **card** image rendered via headless Chrome (Puppeteer) and emailed to staff, order lifecycle management (`PENDING → PREPARING → READY → DELIVERED / CANCELLED`), unread-order counters, manager/staff account management, restaurant profile (name/phone/address/Telegram), and dashboard metrics by period.

**Auth:** two separate cookie-based systems — `token` (JWT, 7-day expiry, `bcryptjs` hashing, 5-attempt lockout for 15 min) for staff (`ADMIN`/`MANAGER`/`STAFF`), and `session_token` for anonymous table sessions. They never overlap: public signup only ever creates `STAFF` accounts.

---

## 🧰 Tech Stack

<div align="center">

![Next.js](https://skillicons.dev/icons?i=nextjs) ![React](https://skillicons.dev/icons?i=react) ![TypeScript](https://skillicons.dev/icons?i=typescript) ![TailwindCSS](https://skillicons.dev/icons?i=tailwind) ![NodeJS](https://skillicons.dev/icons?i=nodejs) ![Express](https://skillicons.dev/icons?i=express) ![PostgreSQL](https://skillicons.dev/icons?i=postgres) ![Prisma](https://skillicons.dev/icons?i=prisma) ![Vercel](https://skillicons.dev/icons?i=vercel)

</div>

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, shadcn/ui (Radix), TanStack Query, Zustand (persisted stores), Sonner toasts |
| Backend | Express 5, TypeScript, Prisma 7 + `@prisma/adapter-pg` over PostgreSQL |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` for staff; a separate `OrderSession` model + `session_token` cookie for guests |
| QR / Images | `qrcode` (guest scan tokens) + `puppeteer` + `sharp` (printable QR cards rendered to PNG) |
| Images (menu) | `multer` → `sharp` → Cloudinary |
| Email | `nodemailer` (password reset + QR card delivery) |
| Security | `helmet`, `express-rate-limit` (global 200 req/15min), `cors` allow-list, `cookie-parser`, per-session order-rate limiting |
| Deploy (inferred) | Vercel (frontend) — no `vercel.json`/Dockerfile for the backend |

---

## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph FE["frontend (Next.js)"]
        QR["/[qrToken] scan handler"]
        Menu["/ menu browsing"]
        Cart["Cart (Zustand, persisted)"]
        Active["/active — My Orders"]
    end
    subgraph BE["backend (Express)"]
        Routers["/api/* routers"]
        SessionMW["sessionMiddleware"]
        AuthMW["protect / restrictTo"]
        Ctrls["Controllers"]
    end
    subgraph Ext["External services"]
        PG[("PostgreSQL")]
        Cloudinary["Cloudinary"]
        Chrome["Headless Chrome (Puppeteer)"]
        Mail["SMTP (Nodemailer)"]
    end

    QR -->|"POST /tables/scan"| Routers
    Cart -->|"POST /orders"| Routers
    Active -->|"GET /orders/session"| Routers
    Routers --> SessionMW
    Routers --> AuthMW
    AuthMW --> Ctrls
    SessionMW --> Ctrls
    Ctrls --> PG
    Ctrls --> Cloudinary
    Ctrls --> Chrome
    Ctrls --> Mail
```

**Guest ordering flow:** scan QR → resolve table → create/reuse `OrderSession` → browse menu → cart → `POST /api/orders` validates items, checks session expiry and the per-window order-rate limit, then creates the `Order` + `OrderItem`s.

```mermaid
sequenceDiagram
    participant G as Guest
    participant API as Backend
    participant DB as PostgreSQL

    G->>API: POST /api/tables/scan { qrToken }
    API->>DB: find table by qrToken
    API-->>G: table details
    G->>API: POST /api/sessions { tableId }
    API->>DB: create/reuse active OrderSession
    API-->>G: session_token cookie (httpOnly)
    G->>API: POST /api/orders { tableId, items, sessionToken }
    API->>DB: validate session + rate limit + items
    API->>DB: create Order + OrderItems
    API-->>G: 201 created order
```

**Entity relationships:**

```mermaid
erDiagram
    TABLE ||--o{ ORDER : has
    TABLE ||--o{ ORDER_SESSION : has
    ORDER_SESSION ||--o{ ORDER : contains
    ORDER ||--o{ ORDER_ITEM : contains
    MENU_ITEM ||--o{ ORDER_ITEM : "ordered as"

    TABLE {
        string id PK
        int tableNumber UK
        string qrToken UK
        enum status
    }
    MENU_ITEM {
        string id PK
        string category
        decimal price
        boolean isAvailable
    }
    ORDER_SESSION {
        string id PK
        string sessionToken UK
        enum status
        datetime expiresAt
    }
    ORDER {
        string id PK
        enum status
        decimal totalAmount
        boolean isRead
    }
    ADMIN_USER {
        string id PK
        string email UK
        enum role
    }
```

---

## 📁 Folder Structure

```text
SAAS_DIGITAL_MENU/
├── docs/
│   ├── API.md                   # endpoint reference (auth, menu, orders, sessions, tables...)
│   ├── DATABASE.md              # Prisma schema + ER diagram
│   ├── DEPLOYMENT.md            # frontend/backend deploy notes
│   ├── CODE_QUALITY_AUDIT.md    # known issues (see below)
│   ├── IMPROVEMENTS.md          # roadmap notes
│   └── screenshots/
├── backend/
│   ├── prisma/schema.prisma      # Table, MenuItem, Order, OrderSession, OrderItem, AdminUser, RestaurantInfo
│   └── src/
│       ├── controller/           # auth, menu, order, session, table, manager, restaurant, dashboard
│       ├── router/               # one router per resource, mounted under /api
│       ├── middleware/           # restrictTo, sessionMiddleware (guest sessions), uploadImages
│       ├── utils/                # generateQrCodeDataUrl, generateQrCardImage (Puppeteer), sendEmail
│       └── index.ts / server.ts
└── frontend/
    └── app/
        ├── [qrToken]/            # QR scan landing → stores table → redirects home
        ├── page.tsx              # menu browsing (search/filter via SearchFilter)
        ├── cart/                 # cart + checkout
        ├── active/               # "My Orders" for the current table session
        ├── (api)/                # typed fetch wrappers (getMenu, createOrder, scanTable, ...)
        └── InvalidPage/          # shown when a QR token doesn't resolve
```

---

## ⚙️ Installation

```bash
git clone https://github.com/PixelNoah-ui/SAAS_DIGITAL_MENU.git
cd SAAS_DIGITAL_MENU

# Backend
cd backend
npm install
cp ../.env.example .env       # fill in values — see below
npm run generate               # prisma generate
npx prisma migrate deploy
npm run dev                    # http://localhost:8000

# Frontend (separate terminal)
cd ../frontend
npm install
cp .env.example .env.local     # NEXT_PUBLIC_API_URL etc.
npm run dev                    # http://localhost:3000
```

---

## 🔑 Environment Variables

From the repo's root `.env.example`:

```bash
# Application
NODE_ENV=development
PORT=8000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Authentication
JWT_SECRET=replace-with-a-secure-secret

# Session settings (guest table sessions)
SESSION_EXPIRE_HOURS=3
SESSION_EXPIRE_MINUTES=15
ORDER_LIMIT_PER_WINDOW=3
ORDER_WINDOW_MINUTES=10

# Email (password reset + QR card delivery)
EMAIL_HOST=smtp.example.com
EMAIL_USERNAME=admin@example.com
EMAIL_PASSWORD=replace-with-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

> The backend's CORS allow-list (`index.ts`) only permits `pixeldigital.me`, `www.pixeldigitalmenu.me`, and a handful of `localhost`/LAN dev origins — API calls from any other origin will be blocked by CORS.

---

## 🗄️ Database

PostgreSQL via Prisma 7. Core models: `Table` (with unique `tableNumber` and `qrToken`), `MenuItem`, `Order` → `OrderItem`, `OrderSession` (holds the guest's active table session and its expiry), `AdminUser` (role enum: `ADMIN`/`MANAGER`/`STAFF`, with lockout fields), and a single-row `RestaurantInfo`. Full field list and the ER diagram are in [`docs/DATABASE.md`](docs/DATABASE.md).

**Not implemented:** a payments table or customer account model — ordering is entirely session-based with no payment step.

---

## 📡 API Summary

Base path `/api`, mounted in `backend/src/index.ts`. Full request/response shapes are documented in [`docs/API.md`](docs/API.md).

| Resource | Routes | Notes |
|---|---|---|
| `/auth` | signup, login, logout, forgot/reset-password, me, updatePassword | Signup is public but always creates a `STAFF` account |
| `/menu-items` | list (public, search/filter/paginate), create/update/delete (admin/manager) | ⚠️ `/menu-items/getAdminMenus` has no auth middleware despite being the admin UI's data source |
| `/orders` | create (public, session-scoped), session list, full admin list/status updates | Session-rate-limited (`ORDER_LIMIT_PER_WINDOW` per `ORDER_WINDOW_MINUTES`) |
| `/sessions` | create/reuse (public), get current, close | Table-scoped guest session, `session_token` cookie |
| `/tables` | scan (public), full CRUD (admin/manager) | Table creation generates a QR token + a printable QR card image, emailed via Nodemailer |
| `/managers` | staff CRUD | ADMIN-only throughout |
| `/restaurant-info` | read (public), write (admin/manager) | ⚠️ see security note below |
| `/dashboard` | stats by period (`7d`/`30d`/`365d`/`all`) | Admin/manager only |

---





## 🔭 Next Steps

Straight from this repo's own [`IMPROVEMENTS.md`](docs/IMPROVEMENTS.md), plus the audit findings above:

1. Fix the `room` field mismatch in `restaurantController.ts` / the Prisma schema
2. Add auth to `/menu-items/getAdminMenus`
3. Standardize API response envelopes (`status` vs `success`)
4. Add payment integration, customer accounts, and real-time (WebSocket) kitchen updates
5. Add automated tests, CI/CD, and OpenAPI/Swagger docs
6. Add a `LICENSE`, and replace the `frontend/README.md` default `create-next-app` boilerplate

---

## 🤝 Contributing

Fork → branch → `npm install` in both `backend/` and `frontend/` → run `npm run generate` after any Prisma schema change → match the existing `catchAsync`/`AppError` controller pattern → open a PR. If your change touches a route's auth, check both `protect`/`restrictTo` (staff) and `sessionMiddleware` (guest sessions) — they're separate systems and easy to mix up.

---

## 📄 License

Not detected — no `LICENSE` file in the repo.

---

## 👤 Author

**PixelNoah** — Addis Ababa, Ethiopia — [@PixelNoah-ui](https://github.com/PixelNoah-ui)

<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:7C2D12,100:F97316&height=120&section=footer&animation=fadeIn"/>

</div>
