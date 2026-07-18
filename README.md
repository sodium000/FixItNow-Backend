# FixItNow

FixItNow is a TypeScript-based Express API for booking technicians, services, payments, reviews, and user management. The app uses Prisma for database access and Stripe for payment processing.

## Features

- User registration and authentication
- Technician profiles, availability updates, and booking status updates
- Service management and category creation for admin users
- Booking creation and retrieval
- Review creation for completed bookings
- Stripe payment checkout and webhook confirmation
- Role-based authorization for admin, customer, and technician routes

## Tech Stack

- TypeScript
- Express
- Prisma
- PostgreSQL (via `pg`)
- Stripe
- JWT authentication
- dotenv

## Project Structure

- `src/app.ts` - Express application setup and route registration
- `src/server.ts` - application bootstrap and Prisma database connection
- `src/config/index.ts` - environment configuration
- `src/lib/prisma.ts` - Prisma client export
- `src/modules` - feature modules for auth, users, bookings, services, payments, reviews, technicians
- `prisma/schema` - Prisma schema files

## Requirements

- Node.js 20+ (recommended)
- PostgreSQL database
- Stripe account for payment processing

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root.

3. Configure environment variables (example below).

4. Generate Prisma client and run migrations if needed:

```bash
npx prisma generate
npx prisma migrate deploy
```

## Environment Variables

The app reads configuration from `.env`. Required values:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@host:port/database
APP_URL=http://localhost:3000
BCRYPT_SALT_ROUNDS=10
JWT_ACCESS_EXPIRES_SECRET=your-access-secret
JWT_REFRESH_EXPIRES_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_CURRENCY=usd
STRIPE_PRODUCT_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

> Note: `APP_URL` must match the allowed CORS origin for the API.

## Scripts

- `npm run dev` - start dev server with `tsx watch`
- `npm run build` - compile TypeScript to `dist`
- `npm start` - run compiled production server
- `npm run stripe:webhook` - listen to Stripe webhook events and forward to local endpoint

## API Endpoints

### Auth

- `POST /api/auth/login` - user login
- `POST /api/auth/refresh-token` - refresh JWT tokens

### User

- `POST /api/auth/register` - register a new user
- `GET /api/auth/me` - get authenticated user profile

### Technician Public

- `GET /api/technicians` - get all technicians
- `GET /api/technicians/:id` - get a technician by ID
- `GET /api/allservice` - get all services

### Technician Authenticated

- `GET /api/technician/bookings` - get bookings for logged-in technician
- `PUT /api/technician/profile` - update technician profile
- `PUT /api/technician/availability` - update availability status
- `PATCH /api/technician/bookings/:id` - update booking status

### Admin

- `POST /api/admin/categories` - create a new category
- `GET /api/admin/categories` - get all categories
- `GET /api/admin/users` - get all users
- `GET /api/admin/bookings` - get all bookings

### Bookings

- `POST /api/bookings` - create a booking
- `GET /api/bookings` - get bookings for user or technician depending on auth
- `GET /api/bookings/:id` - get booking by ID

### Reviews

- `POST /api/reviews` - create a review

### Services

- `GET /api/services` - list services

### Payments

- `POST /api/payments` - create payment session
- `GET /api/payments/success` - payment success redirect
- `GET /api/payments/cancel` - payment cancel redirect
- `GET /api/payments/:id` - get payment by ID
- `POST /api/payments/confirm` - Stripe webhook endpoint

## Local Development

1. Start the server:

```bash
npm run dev
```

2. Confirm the server is running at `http://localhost:5000`.

3. Use Postman or another API client to test endpoints.

4. To receive Stripe webhooks locally:

```bash
npm run stripe:webhook
```

## Notes

- Ensure Prisma migrations and `DATABASE_URL` are correctly set.
- The app uses JWT and role-based auth, so include auth tokens for protected routes.
- Review the `prisma/schema` files for exact model relationships.

## License

MIT
