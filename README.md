# Mini Lead Distribution System

This is a complete, self-contained Lead Distribution Web Application built with **Next.js (App Router)**, **React**, **Tailwind CSS**, and **PostgreSQL**. 

It implements strict database-level constraints for uniqueness and utilizes robust row-level locking (`SELECT ... FOR UPDATE`) within transactions to handle concurrent lead distributions without race conditions.

## Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL (v14+ recommended) running locally

## 1. Database Setup

1. Make sure your local PostgreSQL server is running.
2. In the root directory, create a `.env.local` file (or update the existing one) and set the `DATABASE_URL` to match your local PostgreSQL credentials. The default is:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lead_distribution
   ```
   *Note: Ensure the database `lead_distribution` is created before running the setup if your Postgres setup requires explicit database creation, or change the URL to an existing database (like `postgres`)*
3. Open a terminal, navigate to the root folder, and run the setup script to create tables and seed data:
   ```bash
   node scripts/setup-db.js
   ```

## 2. Running the Application

1. Install all dependencies:
   ```bash
   npm install
   ```
2. Start the Next.js development server:
   ```bash
   npm run dev
   ```
3. Open the displayed local URL (typically http://localhost:3000) in your browser.

## Features & Testing

- **Request Service (`/request-service`):** A public-facing form. Submitting a lead with the same phone number and service type will be blocked cleanly by a PostgreSQL compound index constraint.
- **Dashboard (`/dashboard`):** A live view of all 8 providers, their quotas, and assigned leads. Automatically updates via a 2-second short poll.
- **Test Tools (`/test-tools`):**
  - **Reset Provider Quota:** Tests the webhook endpoint (`POST /api/webhook/reset-quota`).
  - **Idempotency Test:** Fires 3 concurrent webhook requests with the same UUID. The backend uses the `processed_webhooks` table constraint to ensure only one query is processed.
  - **Concurrency Test:** Blasts 10 parallel requests to `/api/request-service`. The backend's `SELECT ... FOR UPDATE` row locks guarantee that quotas aren't over-allocated even under heavy concurrent load.
