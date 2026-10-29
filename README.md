# Study Break Timer ⏱️🌱

A calm, supportive study companion web application that helps students establish a sustainable rhythm of focused work and restorative breaks.

Designed to eliminate anxiety around long workloads, avoid burnout, and recognize genuine accomplishments without guilt.

---

## 🌟 Key Features

- **Accurate, Resilient Countdown**: Real timestamp-anchored countdown (`targetEndAt - now`) that survives browser backgrounding, device sleep, and page refreshes.
- **Supportive Study Rhythms**:
  - Focus duration presets (15, 25, 45, 60 minutes) and custom durations.
  - Gentle completion chime synthesized using the Web Audio API (no heavy media files).
  - Browser notifications for end-of-session alerts.
  - Automatic transition to mindful breaks with randomized restorative suggestions (stretches, hydration, 20-20-20 eye rest, box breathing, short walks).
- **Guilt-Free Progress Tracking**:
  - Tracks and celebrates only completed focus intervals.
  - Stopping early is handled without guilt and is never recorded as a failure.
  - Visual weekly study time bar chart (Monday through Sunday).
  - Searchable session history showing dates, tasks, and durations.
- **Account & Security (Supabase)**:
  - Email & password authentication with secure password recovery.
  - PostgreSQL schema with strict Row Level Security (RLS) ensuring each student accesses only their own private records.
  - Automated user profile creation using PostgreSQL triggers.
  - **Zero-Friction Local Mode**: Runs seamlessly out of the box with local storage caching before Supabase keys are configured.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 18)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict typing)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS)
- **Testing:** Node.js native test runner (`node:test`, `node:assert`)
- **Deployment:** Vercel & GitHub

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js** v18+ (v20+ recommended)
- **Git**

### 2. Installation
Clone or navigate to the project directory:
```bash
cd study-break-timer
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app runs immediately in **Local Demo Mode** so you can start timers, test breaks, and review progress right away.

---

## 🗄️ Supabase Setup & Database Migration

To connect live cloud authentication and PostgreSQL persistence:

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In your Supabase Project Settings → **API**, copy:
   - **Project URL**
   - **anon / public key**

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
```

### 3. Apply the Database Migration
1. Go to your Supabase Project Dashboard → **SQL Editor**.
2. Click **New Query**.
3. Copy and paste the contents of `supabase/migrations/20261029000000_init_schema.sql`.
4. Click **Run**.

This SQL script sets up:
- The `profiles` table and `study_sessions` table.
- Row Level Security (RLS) policies allowing users to read/write only their own data.
- The `on_auth_user_created` trigger that automatically provisions a profile row upon signup.

---

## 🧪 Testing

Run the automated test suite verifying countdown calculations, sleep resilience, and weekly study metrics:

```bash
npm test
```

Build for production to verify compilation and static generation:
```bash
npm run build
```

---

## 🚢 Publishing & Vercel Deployment

### 1. Push to GitHub
```bash
git remote add origin https://github.com/<your-username>/study-break-timer.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel
1. Log in to [vercel.com](https://vercel.com) and click **Add New Project**.
2. Select your `study-break-timer` GitHub repository.
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**.

### 3. Update Supabase Auth Redirect URLs
In your Supabase Dashboard:
1. Navigate to **Authentication** → **URL Configuration**.
2. Set **Site URL** to your Vercel URL (e.g., `https://study-break-timer.vercel.app`).
3. Add `https://study-break-timer.vercel.app/**` to **Redirect URLs**.

---

## 📄 License
MIT License. Built for students everywhere.
