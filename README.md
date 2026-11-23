# E-Commerce API

A REST API for an e-commerce platform, built with Node.js and Express. A live deployment is linked in the repository's About section.

## Tech Stack

- **Runtime/Framework:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Auth:** JWT + bcryptjs, Google sign-in (google-auth-library)
- **Payments:** Stripe
- **Uploads:** Multer + Cloudinary
- **Security:** Helmet, express-rate-limit
- **Other:** Nodemailer, slugify, Morgan, Jest (test runner configured)

## Project Structure

```
├── api/          # Application entry point
├── Features/     # Feature modules
├── config/       # Configuration
├── middlewares/  # Express middlewares
├── utils/        # Shared utilities
└── views/        # Server-rendered views
```

## Getting Started

```bash
npm install
cp .env.example .env   # fill in MongoDB, JWT, Stripe and Cloudinary values
npm start
```
