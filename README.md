# Daily Bloom 🌸 — Daily Habits Tracker

A personal/family habit tracker with two modes:
- **Absolute Best** — full target hit on every habit
- **Bare Minimum** — reduced target for busy days, still counts as a win

Built for Sri Lakshmi Devika, shareable with family members (each gets their own name + 4-digit PIN profile).

## Features

- Name + PIN login, multiple family profiles on one app
- 10 trackable habits (fully customizable targets, can hide/show any habit)
- Daily check-in screen with tap-to-log progress
- Inspiring quote shown every time the app opens
- "Bloom Garden" monthly calendar — visual flower-based heatmap of Absolute Best / Bare Minimum / Partial / Missed days
- Monthly counts: how many Absolute Best days vs Bare Minimum days
- Milestones (streaks, totals, comeback badges) and suggested challenges
- Fun milestone celebration ideas
- Shareable link for family members to join
- Data synced via Supabase (works across phone/desktop)

## Tech stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Supabase (Postgres) + lucide-react icons.

## Setup

### 1. Create a Supabase project
1. Go to [supabase.com](https://supabase.com) -> New project (free tier is enough).
2. Once created, go to **SQL Editor** -> New query -> paste the entire contents of `supabase/schema.sql` -> Run.
   - This creates all tables, security policies, and seeds your profile (Sri Lakshmi Devika, PIN `1234`) with the 10 default habits.
   - **Change your PIN after first login** via Supabase Table Editor -> `members` table (or extend Settings UI later).
3. Go to **Project Settings -> API**. Copy the **Project URL** and **anon public key**.

### 2. Configure environment variables
Copy `.env.local.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run locally
```bash
npm install
npm run dev
```
Visit `http://localhost:3000`.

### 4. Deploy to Vercel
1. Push this repo to GitHub (already done if you're reading this on GitHub).
2. Go to [vercel.com](https://vercel.com) -> **Add New Project** -> import this GitHub repo.
3. In the **Environment Variables** section, add the same two `NEXT_PUBLIC_SUPABASE_*` keys from step 2.
4. Click **Deploy**. Vercel gives you a live URL (e.g. `daily-bloom.vercel.app`) -- you can add a custom domain later under Project -> Settings -> Domains.
5. Open the link on your phone -> Share -> **Add to Home Screen** for an app-like icon.

## Adding family members
On the login screen, tap **Add a family member**, choose a name, 4-digit PIN, and emoji avatar. They get the same 10 default habits (customizable independently per person under Settings).

## Customizing habits
Settings tab -> tap the pencil icon next to any habit to change its Bare Minimum / Absolute Best targets, or toggle it hidden.

## Ideas to extend further
- Push notifications / daily reminder at a chosen time
- Weekly email/WhatsApp summary to family
- Per-habit notes or photos
- Leaderboard view comparing family members' consistency
- Dark mode toggle
