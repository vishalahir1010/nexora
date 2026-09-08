# NEXORA — Premium Multi-Category E-Commerce Platform

A full MERN-stack e-commerce application: React + Vite frontend, Node/Express + MongoDB backend,
JWT auth, DB-backed cart/wishlist with guest merge-on-login, server-verified Razorpay payments,
coupons, reviews (purchase-gated), order tracking, and an admin dashboard with charts.

> **Status note:** This is a working core, not the full 38-point spec in one pass. See
> "What's fully built vs. scaffolded" below before you rely on any one feature.

## Tech Stack

**Frontend:** React 18, Vite, Redux Toolkit, React Router 6, Tailwind CSS, React Hook Form,
Axios, Lucide icons, react-hot-toast, Recharts (admin charts)

**Backend:** Node.js, Express, MongoDB + Mongoose, JWT, bcryptjs, express-validator,
Razorpay SDK, Helmet, express-rate-limit, express-mongo-sanitize, xss-clean

## Features implemented and working end-to-end

- **Auth:** register/login/logout, JWT, bcrypt hashing, forgot/reset password (token flow),
  change password, protected + admin-only routes, role-based authorization
- **Catalog:** categories, brands, products with variants (size/color/stock), text search,
  search suggestions, full filtering (category, brand, price range, rating, size, color,
  in-stock) and sorting, server-side pagination
- **Product details:** image gallery, variant selection with per-variant stock validation,
  quantity selector, add to cart / buy now, wishlist toggle, specs, related products
- **Cart:** DB-backed for logged-in users; localStorage-backed for guests; guest cart merges
  into the DB cart automatically on login/register; live stock validation on every mutation
- **Wishlist:** DB-backed, move-to-cart, stock-aware
- **Checkout:** 3-step flow (address → delivery → payment), coupon application, server-computed
  pricing (items/discount/shipping/tax/total) — the frontend never sends totals, the backend
  always recalculates from the live cart
- **Payments:** Razorpay order creation + **server-side HMAC signature verification** before
  any order is marked paid; Cash on Delivery path that confirms immediately; payment failure/
  cancellation handling
- **Orders:** full lifecycle (pending → confirmed → processing → shipped → out_for_delivery →
  delivered / cancelled / returned), status history, visual tracking timeline, customer-side
  cancellation with automatic restock
- **Reviews:** rating + comment, **only allowed for products in a delivered order**, one review
  per user per product, live rating/breakdown recalculation
- **Coupons:** percentage/fixed, min order, max discount cap, expiry, usage limits (global +
  per-user), server-side validation
- **Admin:** dashboard KPIs (revenue, orders, customers, low stock), analytics with
  revenue-over-time / top-products / orders-by-status charts, product CRUD, category CRUD,
  order status management, user role/active-status management, coupon CRUD
- **Security:** Helmet, rate limiting (general + stricter on auth), mongo-sanitize, xss-clean,
  CORS locked to `CLIENT_URL`, no secrets in frontend, passwords never returned by any API
- **Seed data:** ~112 products across 8 categories and 10 brands, realistic variants/pricing/
  discounts/ratings, 2 sample coupons, first admin account from env vars

## What's new since the initial build

- **Fixed:** admin product form used to silently wipe a product's size/color variants
  on every edit save. Variants are now only touched when the "has variants" toggle is
  explicitly on, and are built fresh from an actual color/size/stock UI in the form.
- **Fixed:** `npm run seed` used to unconditionally delete all categories/brands/
  products/coupons on every run, including anything an admin had added through the
  dashboard. It now skips the destructive reseed if products already exist — use
  `npm run seed:force` to intentionally wipe and reseed.
- **Added:** real Cloudinary image upload (`/api/upload`), wired into the admin
  product form as a drag-and-drop-style file picker (URL paste still works as a
  fallback if Cloudinary isn't configured).
- **Added:** admin product form now has a real variants UI — add colors (with a
  color picker), add sizes, and set per-combination stock in a grid.
- **Added:** bulk actions on the admin product list (select multiple → mark active/
  archived/delete).
- **Added:** lightweight rich-text editor (bold/italic/lists/links) for product
  descriptions — no heavy dependency, stores HTML.
- **Added:** image zoom-on-hover on the product detail page (desktop), and a
  Quick View modal from the shop grid (hover → eye icon).
- **Added:** mobile bottom tab bar (Home/Shop/Wishlist/Cart/Account), sticky
  Add-to-Cart bar on the product page, iOS input-zoom bug fix, larger touch
  targets, and a mobile hamburger drawer for the admin panel.
- **Still not done:** CSV/Excel bulk product import (marked optional), and this
  code still hasn't been run against a live MongoDB instance in this environment
  — verify locally before relying on it.

## What's scaffolded, not fully built

Being upfront about the gap between this and the full spec you gave me:

- **Cloudinary:** the architecture is ready for it (image URLs are just stored strings on the
  Product model), but actual upload wiring isn't implemented — the admin product form takes
  image **URLs**, not file uploads.
- **Notifications:** backend model + API + the in-app list page exist and fire on real events
  (order placed, shipped, delivered, cancelled, payment success, password changed). There's no
  email/SMS delivery — that's a real infra dependency (SendGrid/SES/Twilio) I didn't wire up.
- **SEO metadata (Open Graph, per-page `<title>`/meta description injection):** URLs are already
  clean/slug-based; dynamic `<head>` tag injection (e.g. via `react-helmet-async`) isn't added.
- **Recently viewed products:** field exists on the User model; nothing currently writes to it.
- **Deployment configs** (`vercel.json`, `render.yaml`, etc.) aren't included — see Deployment
  section below for the manual steps instead.
- **No live database was run against this code in this environment** (sandboxed, no MongoDB
  access) — everything has been syntax-checked, boot-tested, and cross-verified field-by-field
  between models/controllers/seed script, but not exercised with real HTTP requests end to end.
  Run it locally and test the flows in section "Testing the core flows" before trusting it fully.

## Project Structure

```
nexora/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # business logic
│   ├── middleware/      # auth, error handling, validation
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── seed/            # database seed script
│   ├── utils/           # ApiError, apiResponse, generateToken
│   ├── validators/      # express-validator chains
│   └── server.js
└── frontend/
    └── src/
        ├── components/  # navbar, footer, product, cart, checkout, admin, common
        ├── pages/        # Home, Shop, ProductDetails, Cart, Checkout, Orders, Admin, etc.
        ├── redux/slices/ # auth, cart, wishlist, products, categories, orders, ui
        ├── services/     # one file per API resource, all routed through services/api.js
        ├── layouts/      # MainLayout, AuthLayout, AdminLayout
        └── hooks/        # useAuth, useCartTotals
```

## Installation

### Prerequisites
- Node.js 18+
- A MongoDB instance (local `mongod` or a free MongoDB Atlas cluster)
- A Razorpay account (test mode keys are free) if you want to exercise the payment flow

### Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env — at minimum set MONGODB_URI and JWT_SECRET
npm run seed        # creates admin account, categories, brands, ~112 products, 2 coupons
npm run dev          # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL defaults to http://localhost:5000/api, fine for local dev
npm run dev          # starts on http://localhost:5173
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` to `http://localhost:5000`
(see `vite.config.js`), so you don't strictly need CORS configured for local dev, but `server.js`
sets it up anyway via `CLIENT_URL`.

## Environment Variables

**backend/.env**
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/nexora
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@nexora.com
ADMIN_PASSWORD=ChangeThisPassword123!
ADMIN_NAME=Nexora Admin
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=
```

Never commit real `.env` files — both are already git-ignored.

## Admin Setup

The seed script creates exactly one admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD` /
`ADMIN_NAME` in `backend/.env`. Change the password env var before seeding in anything other
than a local throwaway database. Log in with those credentials at `/login`, then visit `/admin`.

## Testing the core flows

Once both servers are running and you've seeded the database:

1. **Shopper flow:** browse `/shop`, apply filters, open a product, select a variant, add to
   cart (try this both logged out and logged in — log in afterward and confirm the guest cart
   merges), go to `/checkout`, add an address, pick delivery, apply coupon `WELCOME10`, place
   an order with Cash on Delivery (Razorpay needs real test keys to complete).
2. **Order tracking:** open the order from `/account/orders`, confirm the timeline renders.
3. **Reviews:** as admin, change that order's status to `delivered` (`/admin/orders`), then
   go back to the product page as the customer and confirm the "Write a Review" form now works.
4. **Admin flow:** `/admin` → create a product, create a category, change an order's status,
   toggle a user's active status, create a coupon.

## API Overview

All responses follow `{ success, message, data }`. Key resource routes:

```
/api/auth        register, login, me, profile, change-password, forgot/reset-password
/api/products     list (filters/sort/pagination), detail, search-suggestions, admin CRUD
/api/categories   list, detail, admin CRUD
/api/brands       list, admin CRUD
/api/cart         get, add item, update item, remove item, clear, merge (guest→DB)
/api/wishlist     get, add, remove
/api/orders       pricing-preview, create, list mine, detail, cancel, admin list/status
/api/reviews      list by product, create (purchase-gated), update, delete
/api/coupons      apply, admin CRUD
/api/payments     create Razorpay order, verify (server-side signature check), mark failed
/api/addresses    list, add, update, delete, set-default
/api/notifications list mine, mark read, mark all read
/api/admin        dashboard overview, sales analytics
```

## Deployment

**Frontend (Vercel/Netlify):** set the build command to `npm run build`, output directory
`dist`, and set `VITE_API_URL` to your deployed backend's `/api` URL in the project's env vars.

**Backend (Render/Railway):** set the start command to `npm start`, and set all the variables
listed above in the platform's environment settings — never commit them. Set `CLIENT_URL` to
your deployed frontend's URL so CORS allows it.

**Database:** MongoDB Atlas — create a free cluster, add your backend host's IP (or `0.0.0.0/0`
for platforms with dynamic IPs) to the network access list, and use that connection string as
`MONGODB_URI`.

**Razorpay:** switch from test to live keys only once you're ready to accept real payments;
until then, use Razorpay's test mode and test card numbers.
