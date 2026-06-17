# Production Deployment Guide — CreatorOS AI

This document provides deployment guidelines, production environment configurations, database migration protocols, and Docker orchestrations for **CreatorOS AI**.

---

## 1. Environment Configurations

Create a `.env` file in the root of your production deployment containing the following settings:

```env
# ─── DATABASE SETTINGS ──────────────────────────────────────
# PostgreSQL connection string
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>?sslmode=require"

# ─── REDIS SETTINGS (BullMQ & Cache) ────────────────────────
# Connection URI for Upstash Redis or a standard Redis TCP instance
REDIS_URL="redis://:<password>@<redis-host>:<port>"
# Optional fallback (Upstash REST API)
UPSTASH_REDIS_REST_URL="https://<host>.upstash.io"
UPSTASH_REDIS_REST_TOKEN="<token>"

# ─── NEXT.JS / CLERK SETTINGS ──────────────────────────────
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# ─── PAYMENTS (RAZORPAY) ────────────────────────────────────
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="<razorpay_secret>"
RAZORPAY_WEBHOOK_SECRET="<razorpay_webhook_secret>"
RAZORPAY_PLAN_ID_PRO="plan_PRO_ID"
RAZORPAY_PLAN_ID_AGENCY="plan_AGENCY_ID"

# ─── FILE STORAGE (CLOUDINARY) ──────────────────────────────
CLOUDINARY_CLOUD_NAME="<cloud_name>"
CLOUDINARY_API_KEY="<api_key>"
CLOUDINARY_API_SECRET="<api_secret>"

# ─── AI PROVIDERS KEYS ──────────────────────────────────────
GOOGLE_GENERATIVE_AI_KEY="AIzaSy..."
GROQ_API_KEY="gsk_..."
OPENAI_API_KEY="sk-proj-..."
AI_PROVIDER="gemini" # Default active provider ('gemini' | 'groq' | 'openai')
```

---

## 2. Docker & Container Orchestration

To compile and start the entire service stack (Database, Cache, Next.js Server, and Background Workers) locally or on a standard Linux Host:

### Run Stack via Docker Compose
```bash
# Build and run all services in the background
docker-compose up -d --build

# Verify container statuses
docker-compose ps

# Monitor background worker logs
docker-compose logs -f worker
```

---

## 3. Database Migration Protocols

Before routing customer traffic to the production cluster, run the schema synchronization scripts to configure PostgreSQL indexes and tables:

```bash
# Force migrate database structure
npx prisma db push

# (Alternatively) Run standard migrations:
# npx prisma migrate deploy
```

---

## 4. BullMQ & Serverless Scaling

* **Long-running instances (Railway, Render, AWS ECS):** Spins up the worker process (`npx tsx src/workers/ai-worker.ts`) to consume and process heavy AI generations asynchronously.
* **Serverless environments (Vercel):** The system automatically detects missing TCP Redis connections or serverless edge limits and switches seamlessly to database polling + `setImmediate` asynchronous scheduling, avoiding runtime timeout failures.

---

## 5. Free Hosting Stack Setup Guide (Step-by-Step)

Follow this roadmap to deploy the entire stack for free:

### Step 1: Create a Free PostgreSQL Database on Supabase
1. Go to [Supabase](https://supabase.com/) and sign up for a free account.
2. Click **New Project** and name it `creatoros-db`. Set a secure database password.
3. Once the database is ready, go to **Project Settings** > **Database**.
4. Scroll to the **Connection string** section and copy the **URI** connection string.
5. In your local `.env` or Vercel Environment Variables:
   - Set `DATABASE_URL` to this copied connection string (e.g., `postgresql://postgres.[username]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`).

### Step 2: Create a Free Redis Instance on Upstash (for Queue & Cache)
1. Go to [Upstash](https://upstash.com/) and register for a free account.
2. Click **Create Database**, select **Redis**, choose a region close to your database, and click **Create**.
3. Copy the **Redis URL** under the **Node.js** connection section.
4. Set `REDIS_URL` in your environment:
   - Format: `redis://default:[password]@[endpoint]:[port]`

### Step 3: Configure Free Resend Account (for OTP Email Verification)
1. Sign up on [Resend](https://resend.com/) for a free tier account (3,000 emails/month).
2. Go to the dashboard, click **API Keys**, and generate a new key.
3. Save it to your environment:
   - `RESEND_API_KEY=re_your_api_key`
4. *(Optional)* Add and verify your custom domain on Resend to send emails from your own domain instead of `onboarding@resend.dev`.

### Step 4: Deploy Next.js Web App on Vercel
1. Go to [Vercel](https://vercel.com/) and log in using your GitHub account.
2. Click **Add New** > **Project** and select your `CreatorOS-AI` repository.
3. In the **Environment Variables** section, copy and paste all the keys from your `.env` file:
   - `NEXT_PUBLIC_APP_URL` (Set to your Vercel deployment URL)
   - `DATABASE_URL` (Your Supabase connection string)
   - `REDIS_URL` (Your Upstash Redis connection string)
   - `RESEND_API_KEY` (Your Resend API key)
   - `NEXT_PUBLIC_BYPASS_CLERK=true` (If using the custom OTP email auth instead of Clerk)
   - `AI_PROVIDER=openai` (or `gemini` / `groq`)
   - `OPENAI_API_KEY`, `GOOGLE_GENERATIVE_AI_KEY`, etc.
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
4. Keep the Build Settings as default. Vercel will automatically run `npm run build` which triggers `prisma generate` first.
5. Click **Deploy**.

### Step 5: Initialize the Database Tables (Prisma Push)
Once Vercel has built your app, sync your database schema to Supabase:
1. Run the following command from your local machine terminal:
   ```bash
   npx prisma db push
   ```
   *(This connects to the `DATABASE_URL` specified in your local `.env` and configures the PostgreSQL tables, indexes, and relations on Supabase.)*
2. Your app is now live and fully operational!

