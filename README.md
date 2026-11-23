# E-Commerce API

The back end of an online store, built with Node.js, Express and MongoDB. It handles accounts (including Google sign-in), a product catalogue with images, categories, shopping carts, and orders paid by card with Stripe or cash on delivery. Admin routes are protected by role.

## What it does

**Accounts (`/auth`)**
- Sign up with profile image upload (Cloudinary), email confirmation with a one-time code, resend code, login, logout.
- Google sign-in with an ID token (`POST /auth/google`).
- Forgot and reset password by email.
- `GET/PATCH/DELETE /auth/me` for the logged-in user's own profile.
- Sign-in routes are rate limited to 5 requests per 3 minutes.

**Products (`/products`)**
- Public: list with filtering (`gt`, `gte`, `lt`, `lte`), search, sort and pagination, get by id or slug, related products.
- Admin: create and update with a cover image and up to 5 more images, soft delete, permanent delete, list deleted products, product statistics.

**Categories (`/category`)** public read, admin create, update, soft delete and delete with image upload.

**Cart (`/cart`)** get, add a product (with colour and size), change quantity, remove an item, clear. Checks stock and uses the discounted price when a product has one.

**Orders (`/order`)**
- Cash order from the cart, or a Stripe Checkout session (currency EGP). A Stripe webhook (`/webhook-checkout`) creates the paid order.
- Users see their own orders. Admins mark orders paid, delivered, or set the status.

**Admin users (`/users`)** list, create, view, change role, soft delete, restore and delete users.

**General** Helmet, CORS, request logging, a global rate limit of 100 requests per 15 minutes, a global error handler, and a 404 response for unknown routes.

## Tech stack

Node.js, Express 5, MongoDB with Mongoose 9, JWT, bcryptjs, Google Auth Library, Stripe, Multer with Cloudinary, Nodemailer, Helmet, express-rate-limit, slugify, nanoid. Tests use Jest.

## Project structure

```
├── api/index.js     # Entry point (connects to MongoDB, starts the server)
├── app.js           # Express app: middleware and routes
├── Features/        # One folder per feature: route, controller, service, model
│   ├── auth  users  products  category  cart  order
├── middlewares/     # auth, restrictTo, global error handler
├── utils/           # ApiFeatures (query builder), AppError, catchAsync, email helpers
├── config/          # MongoDB and Cloudinary
└── tests/           # Jest unit tests
```

## Run it locally

You need Node.js and a MongoDB database (a local one or Atlas).

```bash
npm install
cp .env.example .env     # then fill in the values
npm start                # nodemon api/index.js
```

Variables read by the code: `PORT`, `PRODUCTION_DATABASE_LINK` (the MongoDB connection string used by `config/connectDB.js`), `SALT_ROUND`, `SECRET_KEY` (JWT), `USER_EMAIL` and `USER_PASS` (mail account), `FRONTEND_LINK`, `NODE_ENV`, `CLOUDINARY_CLOUD`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLIENT_ID` (Google), `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`. `.env.example` lists most of them, so add the Google and Stripe ones yourself.

Open `http://localhost:5000/` (or your `PORT`) and you should get a welcome message.

## Tests

```bash
npm test
```

21 Jest unit tests cover the query builder, the auth and role middleware, the global error handler, `AppError` and `catchAsync`, and the cart service rules (product not found, out of stock, discount price, stock limit). Models are mocked, so no database is needed.

## Known gaps

- Controllers and the Stripe, Cloudinary and email integrations are not covered by tests.
- In `utils/ApiFeatures.js`, the `fields` option (field selection) and the default page size are rough edges and are not tested.
- The workflow file lives in `github/workflows/`, not `.github/workflows/`, so GitHub does not run it yet.
