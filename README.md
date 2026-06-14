# BoochBod Grid

Instagram grid preview tool for BoochBod — probiotic kombucha gummy brand.

## Setup

### 1. Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the SQL in `supabase/setup.sql`
3. Go to **Storage** → create 3 public buckets: `media`, `covers`, `avatars`
4. Go to **Authentication → Users** → Add user: `ignacioemmanuela96@gmail.com` with a password

### 2. Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in from Supabase **Settings → API**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import GitHub repo
3. Add environment variables in Vercel dashboard
4. Deploy — auto-deploys on every push to `main`

## Usage

- `/` — Public grid view
- `/login` — Admin login
- After login: drag to reorder, click tiles to edit, upload media, edit profile
