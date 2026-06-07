# Deployment Guide for ad-mirror-gem

## 📋 Prerequisites

- Node.js & npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Supabase CLI installed: `npm install -g supabase`
- GitHub CLI installed (for managing secrets): `gh` ([install](https://cli.github.com/))

## 🚀 Step 1: Local Setup

### 1.1 Clone and Install Dependencies

```bash
git clone https://github.com/Sajee0089/ad-mirror-gem.git
cd ad-mirror-gem
npm install
```

### 1.2 Authenticate with Supabase

```bash
supabase login
```

Follow the prompt to create an access token at https://app.supabase.com/account/tokens

### 1.3 Link to Your Project

```bash
supabase link --project-id webpiillbgbwgjzkbece
```

When prompted for the database password, use the password you set up in Supabase dashboard.

## 🔧 Step 2: Database Migrations

### 2.1 Apply Migrations Locally (Testing)

```bash
supabase db pull  # Get current schema from Supabase
supabase migration list  # List available migrations
```

### 2.2 Apply Migrations to Production

```bash
supabase db push
```

This will run all migrations in `supabase/migrations/` on your Supabase project.

### 2.3 Verify Migrations

```bash
supabase db list  # List all tables
```

You should see:
- `ads` table
- `blog_posts` table
- RPC functions: `increment_view_count_by`, `increment_favorite_count_by`, `publish_scheduled_ads`

## 🔌 Step 3: Deploy Edge Functions

### 3.1 Deploy All Functions

```bash
supabase functions deploy
```

### 3.2 Deploy Specific Function

```bash
supabase functions deploy boost-views
supabase functions deploy publish-scheduled
supabase functions deploy sitemap
```

### 3.3 Verify Deployment

```bash
supabase functions list
```

Expected output:
```
boost-views       (verified)
publish-scheduled (verified)
sitemap          (verified)
```

## 🔑 Step 4: Environment Setup

### 4.1 Get Your Supabase Keys

Go to https://app.supabase.com/project/webpiillbgbwgjzkbece/settings/api

Copy:
- Project URL: `https://webpiillbgbwgjzkbece.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 4.2 Create `.env.local` File

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_SUPABASE_URL=https://webpiillbgbwgjzkbece.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4.3 Setup GitHub Secrets (For CI/CD)

```bash
gh secret set SUPABASE_ACCESS_TOKEN --body "your_access_token"
gh secret set SUPABASE_DB_PASSWORD --body "your_db_password"
```

## 🧪 Step 5: Testing

### 5.1 Test Edge Functions Locally

```bash
# Start local Supabase instance
supabase start

# Test boost-views function
curl -X POST http://localhost:54321/functions/v1/boost-views \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"

# Stop local instance
supabase stop
```

### 5.2 Test in Development

```bash
npm run dev
```

Visit `http://localhost:5173` and test the application.

### 5.3 Run Tests

```bash
npm test
```

## 🌐 Step 6: Deploy Frontend

### 6.1 Build for Production

```bash
npm run build
```

### 6.2 Preview Build

```bash
npm run preview
```

### 6.3 Deploy to Vercel

The app is already deployed to [Vercel](https://ad-mirror-gem.vercel.app).

To redeploy:
```bash
git push origin main
```

Vercel will automatically build and deploy!

## ⚙️ Step 7: Configure Edge Function Triggers (Optional)

### 7.1 Set Up Boost Views Cron Job

In Supabase dashboard → Functions → boost-views:
- Click "Schedule"
- Set frequency: Daily at 00:00 UTC

### 7.2 Set Up Publish Scheduled Cron Job

In Supabase dashboard → Functions → publish-scheduled:
- Click "Schedule"
- Set frequency: Every 15 minutes

### 7.3 Set Up Sitemap Generation Cron Job

In Supabase dashboard → Functions → sitemap:
- Click "Schedule"
- Set frequency: Daily at 02:00 UTC

## ✅ Verification Checklist

- [ ] Local setup complete (`npm install` successful)
- [ ] Supabase linked (`supabase link` successful)
- [ ] Migrations applied (`supabase db push` successful)
- [ ] Tables created (verify in Supabase dashboard)
- [ ] RPC functions deployed (verify in SQL Editor)
- [ ] Edge functions deployed (`supabase functions list` shows all 3)
- [ ] Environment variables set (`.env.local` created)
- [ ] Frontend runs locally (`npm run dev` successful)
- [ ] Build successful (`npm run build` no errors)
- [ ] GitHub secrets set (for CI/CD)

## 🐛 Troubleshooting

### Issue: "Project not found"
```bash
supabase link --project-id webpiillbgbwgjzkbece
```

### Issue: "Database password incorrect"
Get the correct password from: https://app.supabase.com/project/webpiillbgbwgjzkbece/settings/database

### Issue: "Edge functions not deploying"
```bash
# Check logs
supabase functions logs boost-views

# Re-authenticate
supabase logout
supabase login
```

### Issue: "CORS errors in frontend"
Ensure edge functions have correct CORS headers (already configured in code).

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Database Migrations](https://supabase.com/docs/guides/database/migrations)
- [RLS Policies](https://supabase.com/docs/guides/database/postgres/row-level-security)

## 🆘 Need Help?

1. Check the [Troubleshooting](#troubleshooting) section
2. Review Supabase documentation
3. Check GitHub Issues for similar problems
4. Open a new issue with details about your problem

---

**Last Updated**: 2026-06-07
**Project**: ad-mirror-gem
**Supabase Project ID**: webpiillbgbwgjzkbece
