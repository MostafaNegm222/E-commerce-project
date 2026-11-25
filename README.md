# E-Commerce API

## 1. Description

The back end of an online store, built with Node.js, Express and MongoDB. It handles the full shopping flow: accounts (including Google sign-in), a product catalogue with images, categories, a shopping cart, and orders paid by card with Stripe or cash on delivery. Admin routes are protected by role.

## 2. Technologies and Versions

- Node.js with Express ^5.2.1
- MongoDB with Mongoose ^9.10.1
- JWT ^9.0.3 (auth), bcryptjs ^3.0.3 (password hashing), google-auth-library ^11.1.0 (Google sign-in)
- Stripe ^22.6.2 (card checkout, EGP)
- Multer ^2.4.0 with multer-storage-cloudinary ^4.0.0 and Cloudinary ^1.41.3 (image upload)
- Nodemailer ^10.0.10 (email), slugify ^1.6.9, nanoid ^3.3.19
- Helmet ^8.3.0, express-rate-limit ^8.7.0, cors ^2.8.6, morgan ^1.12.1, dotenv ^18.0.1
- Jest ^30.5.2 (tests), nodemon ^3.1.14 (dev)

## 3. Requirements and Dependencies

- Node.js installed
- A MongoDB database (local or Atlas)
- Cloudinary, Stripe and SMTP credentials for the related features
- Dependencies are installed with `npm install` (see `package.json`)

## 4. Installation and Run Steps

```bash
git clone https://github.com/MostafaNegm222/E-commerce-project.git
cd E-commerce-project
npm install
cp .env.example .env   # then fill in the values (see section 5)
npm start              # nodemon api/index.js
```

## 5. Environment Variables

Listed in `.env.example` (no secrets are stored in the repo):

| Variable | Purpose |
| --- | --- |
| `PORT` | Port the API listens on |
| `LOCAL_DATABASE_LINK` / `PRODUCTION_DATABASE_LINK` | MongoDB connection strings |
| `NODE_ENV` | Environment switch (development / production) |
| `SALT_ROUND` | bcrypt salt rounds |
| `SECRET_KEY` | Secret used to sign JWTs |
| `USER_EMAIL`, `USER_PASS` | SMTP account for outgoing email |
| `FRONTEND_LINK` | Allowed CORS origin (the storefront URL) |
| `CLOUDINARY_CLOUD`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary image storage |

## 6. Usage and Main Features

- **Accounts (`/auth`)**: sign up with profile image upload (Cloudinary), email confirmation with a one-time code, resend code, login, logout, Google sign-in with an ID token, forgot/reset password by email, and `GET/PATCH/DELETE /auth/me` for the logged-in user's profile. Sign-in routes are rate limited to 5 requests per 3 minutes.
- **Products (`/products`)**: public list with filtering (`gt`, `gte`, `lt`, `lte`), search, sort and pagination; get by id or slug; related products. Admin: create and update with a cover image and up to 5 more images, soft delete, permanent delete, list deleted products, product statistics.
- **Categories (`/category`)**: public read; admin create, update, soft delete and delete with image upload.
- **Cart (`/cart`)**: get, add a product (with colour and size), change quantity, remove an item, clear. Checks stock and uses the discounted price when a product has one.
- **Orders (`/order`)**: cash order from the cart, or a Stripe Checkout session (currency EGP); a Stripe webhook (`/webhook-checkout`) creates the paid order. Users see their own orders; admins mark orders paid, delivered, or set the status.
- **Admin users (`/users`)**: list, create, view, change role, soft delete, restore and delete users.
- **General**: Helmet, CORS, request logging, global rate limit of 100 requests per 15 minutes, one global error handler, and a 404 response for unknown routes. Code is organized one folder per feature under `Features/` (route, controller, service, model).

## 7. Screenshots / Demo

No live demo; the API runs locally.

## 8. Running Tests

```bash
npm test
```

Jest unit tests live in `tests/`.
