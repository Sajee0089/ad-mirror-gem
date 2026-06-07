# Supabase Integration & Frontend Implementation Guide

## Overview

This deployment branch (`deploy/supabase-setup`) includes complete Supabase integration and a fully functional classified ads website frontend.

## 🗂️ **New Files Created**

### Database Layer
- **`supabase/migrations/001_create_ads_table.sql`** - Ads table schema with RLS
- **`supabase/migrations/002_create_rpc_functions.sql`** - RPC functions for views/favorites
- **`supabase/migrations/003_create_blog_posts_table.sql`** - Blog posts table

### Supabase Configuration
- **`supabase/config.toml`** - Edge functions configuration
- **`supabase/functions/*/deno.json`** - Individual function configs
- **`.env.example`** - Environment variables template

### Frontend Integration
- **`src/integrations/supabase.ts`** - Supabase client & API service
- **`src/integrations/store.ts`** - Zustand state management
- **`src/hooks/useQueries.ts`** - React Query hooks

### Pages
- **`src/pages/HomePage.tsx`** - Landing page with featured ads
- **`src/pages/AdsPage.tsx`** - Browsable ads with filters
- **`src/pages/AdDetailPage.tsx`** - Individual ad detail view
- **`src/pages/BlogPage.tsx`** - Blog posts listing
- **`src/pages/BlogPostPage.tsx`** - Individual blog post

### Components
- **`src/components/AdsList.tsx`** - Grid of ads with cards
- **`src/components/AdDetail.tsx`** - Ad detail component
- **`src/components/BlogList.tsx`** - Featured blog posts
- **`src/components/Layout.tsx`** - Header, nav, footer

### Configuration
- **`src/App.tsx`** - App routing setup
- **`src/lib/queryClient.ts`** - React Query configuration

---

## 🚀 **Deployment Instructions**

### Step 1: Merge Branch to Main
```bash
# Create PR from deploy/supabase-setup → main
# Or merge directly:
git checkout main
git merge deploy/supabase-setup
git push origin main
```

### Step 2: Apply Database Migrations
```bash
# Authenticate
supabase login

# Link to project
supabase link --project-id webpiillbgbwgjzkbece

# Apply migrations
supabase db push
```

### Step 3: Deploy Edge Functions
```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy boost-views
supabase functions deploy publish-scheduled
supabase functions deploy sitemap
```

### Step 4: Environment Setup
```bash
# Copy template
cp .env.example .env.local

# Edit .env.local with:
# - VITE_SUPABASE_URL: https://webpiillbgbwgjzkbece.supabase.co
# - VITE_SUPABASE_ANON_KEY: (from Supabase dashboard → Settings → API)
```

### Step 5: Install & Test
```bash
npm install
npm run dev
```

---

## 🏗️ **Architecture**

### Frontend Stack
- **Framework**: React 18 + TypeScript + Vite
- **State Management**: Zustand + React Query
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **SEO**: React Helmet Async

### Backend Stack
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth
- **RPC Functions**: PostgreSQL procedures
- **Edge Functions**: Deno (boost-views, publish-scheduled, sitemap)

### API Integration
```
┌─────────────────────┐
│   React Components  │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  React Query Hooks  │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Supabase Client    │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  PostgreSQL (RPC)   │
└─────────────────────┘
```

---

## 📊 **Database Schema**

### ads table
```sql
id (UUID)
title VARCHAR(500)
description TEXT
category VARCHAR(100)
district VARCHAR(100)
status VARCHAR(50) - pending|scheduled|approved|rejected
view_count INT (0-100000)
favorite_count INT
slug VARCHAR(500) UNIQUE
user_id UUID
phone VARCHAR(20)
email VARCHAR(255)
images JSONB
price DECIMAL
duration_days INT
created_at TIMESTAMP
updated_at TIMESTAMP
scheduled_at TIMESTAMP
approved_at TIMESTAMP
rejected_at TIMESTAMP
```

### blog_posts table
```sql
id (UUID)
title VARCHAR(500)
content TEXT
excerpt TEXT
slug VARCHAR(500) UNIQUE
author_id UUID
category VARCHAR(100)
tags JSONB
featured_image VARCHAR(1000)
view_count INT
status VARCHAR(50) - draft|published|archived
seo_title VARCHAR(500)
seo_description VARCHAR(500)
seo_keywords VARCHAR(500)
created_at TIMESTAMP
updated_at TIMESTAMP
published_at TIMESTAMP
```

---

## 🔌 **RPC Functions**

### 1. increment_view_count_by
```sql
increment_view_count_by(_ad_id UUID, _count INT)
-- Increments view count (capped at 100,000)
```

### 2. increment_favorite_count_by
```sql
increment_favorite_count_by(_ad_id UUID, _count INT)
-- Increments favorite count
```

### 3. publish_scheduled_ads
```sql
publish_scheduled_ads()
-- Publishes scheduled ads where scheduled_at <= NOW()
```

---

## 🔑 **Environment Variables**

```env
# Supabase
VITE_SUPABASE_URL=https://webpiillbgbwgjzkbece.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Optional
VITE_API_URL=http://localhost:5173
VITE_ENABLE_ANALYTICS=true
```

---

## 📱 **Pages & Routes**

| Path | Component | Description |
|------|-----------|-------------|
| `/` | HomePage | Landing page with featured ads & blog |
| `/ads` | AdsPage | Browse all ads with filters |
| `/ad/:slug` | AdDetailPage | Individual ad details |
| `/blog` | BlogPage | All blog posts |
| `/blog/:slug` | BlogPostPage | Individual blog post |

---

## 🎨 **Components**

### AdsList
- Displays grid of ads
- Loading skeleton
- Error handling
- Link to detail page

### AdDetail
- Full ad information
- Images, price, contact
- Related ads section

### BlogList
- Featured blog posts grid
- Excerpt preview
- Read more link

### Layout
- Responsive header/nav
- Footer with links
- Mobile menu

---

## ✅ **Verification Checklist**

Before deploying to production:

- [ ] All migrations applied successfully
- [ ] RPC functions created and tested
- [ ] Edge functions deployed and verified
- [ ] Environment variables set correctly
- [ ] Frontend builds without errors
- [ ] Pages load and display data correctly
- [ ] API calls working (no CORS issues)
- [ ] Responsive design tested on mobile
- [ ] SEO metadata present (Helmet)
- [ ] Performance metrics acceptable

---

## 🐛 **Troubleshooting**

### Database Connection Issues
```bash
# Check project link
supabase status

# Re-link if needed
supabase link --project-id webpiillbgbwgjzkbece
```

### Edge Function Deployment Failed
```bash
# Check logs
supabase functions logs boost-views

# Re-authenticate
supabase logout
supabase login
```

### CORS Errors
- Verify edge functions have CORS headers configured
- Check Supabase API settings → CORS

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run build
```

---

## 📚 **Related Documentation**

- [Supabase Docs](https://supabase.com/docs)
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [PostgreSQL RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)

---

## 🔄 **Next Steps**

After deployment:

1. **Content**: Add initial ads and blog posts
2. **Authentication**: Implement user signup/login
3. **Admin Panel**: Create admin dashboard for content moderation
4. **Email**: Setup email notifications
5. **Analytics**: Integrate analytics tracking
6. **Performance**: Monitor and optimize queries
7. **Security**: Review RLS policies and authentication

---

**Status**: ✅ Complete & Ready for Deployment  
**Last Updated**: 2026-06-07  
**Project ID**: webpiillbgbwgjzkbece
