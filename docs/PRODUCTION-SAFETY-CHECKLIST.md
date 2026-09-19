# BTM — Production Safety Checklist

**Date:** 2026-08-12  
**Status:** PLANNING DOCUMENT — use before every production deployment  
**Applies to:** All changes touching the public website, admin site, or database

---

## How to Use This Checklist

1. Print or copy this checklist before every production deployment
2. Check each item explicitly — do not assume
3. If ANY item is ❌, STOP. Do not deploy. Fix the issue first.
4. If you are unsure about any item, STOP and ask.
5. Record the deployment date and which items you checked

---

## PRE-DEPLOYMENT: DATABASE STATE

Run these checks before making any code or config changes.

### DB-1 — Confirm canonical tour counts

```javascript
// Run via Node.js + pg:
// SELECT status, COUNT(*) FROM products WHERE category='morocco_tour' GROUP BY status
```

Expected (before any changes to tour statuses):
- [ ] published: 18 (includes `4-day-marrakech-desert-trip`)
- [ ] OR published: 17 (if `4-day-marrakech-desert-trip` was set to draft — record which state you are in before starting)
- [ ] draft: 19 (or 20 if above tour set to draft)
- [ ] archived: 2

If counts differ from expected: **STOP — investigate before continuing.**

### DB-2 — Confirm all 17 locked tours are published in `products`

```javascript
// SELECT id, status, title FROM products 
// WHERE id IN (
//   'colors-of-morocco','classic-morocco-tour','morocco-signature-highlights',
//   'morocco-s-great-escape','vibrant-morocco-and-desert','authentic-morocco-tour',
//   'iconic-morocco-journey','hidden-treasures','imperial-cities-sahara','landscapes-morocco',
//   'best-of-morocco','7-day-morocco-desert-coast-tour','marrakech-to-fes-through-the-sahara',
//   'tea-nomads-desert','3-days-marrakech-to-fes-desert-tour-via-the-sahara',
//   'sahara-desert-dream','sahara-3-days'
// )
```

- [ ] All 17 rows returned
- [ ] All 17 have status = 'published'
- [ ] No locked tour has status 'draft' or 'archived'

If any locked tour is missing or not published: **STOP — do not deploy.**

### DB-3 — Confirm locked tour content is unchanged

For a representative sample (at minimum check colors-of-morocco and marrakech-to-fes-through-the-sahara):

- [ ] Price matches known value (e.g., `colors-of-morocco` price = "From €990")
- [ ] SEO title present and not NULL
- [ ] SEO description present and not NULL
- [ ] Images array is non-empty

If any content field is missing or differs from expected: **STOP.**

### DB-4 — No unintended record changes

```javascript
// SELECT id, status, updated_at FROM products WHERE category='morocco_tour'
// ORDER BY updated_at DESC LIMIT 10
```

- [ ] No records show a recent `updated_at` that you did not intend to change
- [ ] No draft tours have been accidentally published
- [ ] No published tours have been accidentally archived

### DB-5 — Backup is recent

- [ ] Confirm last automatic backup ran within the last 2 days (check Google Drive)
- [ ] OR trigger a manual backup via `/api/backup` before proceeding with any DB changes

---

## PRE-DEPLOYMENT: LOCAL GIT STATE

### GIT-1 — Check working tree for surprises

```bash
git status
git diff --stat
```

- [ ] No uncommitted changes in files you did not intentionally modify
- [ ] `src/lib/dataSync.ts` shows the committed version (reads from `products`) — NOT the previous-session uncommitted change
- [ ] If `dataSync.ts` shows local changes, run: `git diff src/lib/dataSync.ts` — confirm no switch to `tours` table
- [ ] If an uncommitted switch to `tours` is present: **run `git checkout src/lib/dataSync.ts`** before building

### GIT-2 — Confirm you are on the correct branch

```bash
git branch
git log --oneline -5
```

- [ ] You are on the correct feature branch (not main, unless deploying a reviewed merge)
- [ ] The commit history shows only the changes you intended

### GIT-3 — No accidental files staged

```bash
git diff --staged
```

- [ ] No environment files (.env, .env.local, .env.production) are staged
- [ ] No credential files, service account JSON, or secrets are staged
- [ ] No migration files you did not intend to include are staged

### GIT-4 — Build succeeds locally

```bash
# For public site:
cd "/Users/hmad/Desktop/BTM Work/besttravelmorocco-seo-v4-6"
npm run build

# For admin site:
cd /Users/hmad/besttravelmorocco
npm run build
```

- [ ] TypeScript compilation: zero errors
- [ ] Build completes without errors
- [ ] No missing module errors

---

## PRE-DEPLOYMENT: PREVIEW VERIFICATION

**Always deploy to preview first. Never deploy directly to production.**

### PREV-1 — Create and verify preview deployment

```bash
# Public site:
cd "/Users/hmad/Desktop/BTM Work/besttravelmorocco-seo-v4-6"
npx vercel deploy    # No --prod flag

# Admin site:
cd /Users/hmad/besttravelmorocco
npx vercel deploy    # No --prod flag
```

- [ ] Preview URL is generated
- [ ] Preview URL is NOT `besttravelmorocco.com` (confirm it's a `.vercel.app` preview URL)

### PREV-2 — Verify locked tours in preview

Open each of these URLs in the preview deployment and confirm they return content:

- [ ] `/tours/colors-of-morocco` — loads, shows price, shows images
- [ ] `/tours/classic-morocco-tour` — loads, shows price, shows images
- [ ] `/tours/marrakech-to-fes-through-the-sahara` — loads, shows price, shows images
- [ ] `/tours/sahara-desert-dream` — loads, shows price, shows images
- [ ] `/tours/best-of-morocco` — loads, shows price, shows images
- [ ] Spot-check 3 more locked tours of your choice

If any locked tour returns 404, blank page, missing price, or missing images: **STOP — do not deploy to production.**

### PREV-3 — Verify tour listing in preview

- [ ] `/tours` listing page loads
- [ ] Expected number of tours appears in listing (17 or 18 depending on `4-day-marrakech` decision)
- [ ] No broken image placeholders on published locked tours
- [ ] Tour prices display correctly (e.g., "From €990", not "From €")

### PREV-4 — Verify homepage in preview

- [ ] Homepage loads
- [ ] Popular tours section shows at least 5 tours (the valid ones)
- [ ] If homepage popular tours were updated: confirm the correct replacement tours appear
- [ ] Navigation tour dropdown appears correctly

### PREV-5 — Verify admin in preview (admin changes only)

- [ ] Admin login works
- [ ] Sidebar shows correct labels
- [ ] Tours listing (ProductsPage) shows all expected products
- [ ] Edit a non-locked draft tour — confirm form loads correctly
- [ ] Confirm no locked tour content is editable beyond its normal fields

---

## PRE-DEPLOYMENT: PUBLIC WEBSITE PROTECTION

### PUB-1 — dataSync.ts source confirmed

- [ ] Open `src/lib/dataSync.ts` in the deployed/to-be-deployed code
- [ ] `fetchTours()` queries: `products WHERE category='morocco_tour' AND status='published'`
- [ ] `fetchTours()` does NOT query the `tours` table
- [ ] The `dbTourToTour()` function is NOT present (it belongs to the wrong version)

### PUB-2 — No locked tour content changed

- [ ] `src/data/content.ts` — not modified (LOCKED FILE)
- [ ] `src/pages/Booking.tsx` — not modified (LOCKED FILE)
- [ ] `src/pages/TailorMade.tsx` — not modified (LOCKED FILE)
- [ ] `src/pages/TourDetail.tsx` — not modified (LOCKED FILE)
- [ ] `src/services/emailService.ts` — not modified (LOCKED FILE)
- [ ] `vercel.json` — not modified (LOCKED FILE — public site)

### PUB-3 — No SEO changes

- [ ] No slug values changed in any tour record in `products`
- [ ] No redirect rules added or removed from vercel.json
- [ ] No canonical URL changes
- [ ] Sitemap generation is unchanged

---

## PRE-DEPLOYMENT: ADMIN PROTECTION

### ADM-1 — Admin locked files not modified

- [ ] `src/pages/Booking.tsx` — not modified
- [ ] Booking logic unchanged

### ADM-2 — Security requirements met

- [ ] All new admin routes have JWT verification
- [ ] No hardcoded credentials or keys in any modified files
- [ ] CORS headers are correct (only besttravelmorocco.com and admin.besttravelmorocco.com)
- [ ] All new POST/PUT endpoints have Zod validation

### ADM-3 — Pricing engine not accidentally broken

- [ ] Admin pricing engine page loads
- [ ] Tour picker in pricing engine shows the expected tours
- [ ] Existing pricing rules are still accessible

---

## PRE-DEPLOYMENT: FUNCTIONAL CHECKS

### FUNC-1 — Booking inquiry form

- [ ] Tour detail page on preview includes "Book This Tour" / inquiry form
- [ ] Form submission routes to correct email handler
- [ ] `src/services/emailService.ts` was NOT modified

### FUNC-2 — No broken routes

- [ ] No new routes were added without being tested in preview
- [ ] No routes were removed that are still linked from elsewhere
- [ ] 404 page still renders correctly

### FUNC-3 — No performance regressions

- [ ] Build size is similar to previous build (no unexpected large bundles)
- [ ] Preview pages load in a reasonable time

---

## PRODUCTION DEPLOYMENT

### DEPLOY-1 — Get explicit approval

- [ ] You have explicit approval in the current conversation to deploy this specific change
- [ ] The approval is for this exact set of changes — not a blanket approval from an earlier conversation
- [ ] The rollback URL (previous Vercel deployment) is noted below

**Previous Vercel deployment URL for rollback:** ________________________  
**Vercel deployment list command:** `npx vercel ls` or check Vercel dashboard

### DEPLOY-2 — Deploy

```bash
# Public site:
cd "/Users/hmad/Desktop/BTM Work/besttravelmorocco-seo-v4-6"
npx vercel deploy --prod --force

# Admin site:
cd /Users/hmad/besttravelmorocco
npx vercel deploy --prod --force
```

- [ ] Deployment completes without error
- [ ] Vercel URL confirms production deployment (shows `besttravelmorocco.com` or `admin.besttravelmorocco.com`)

### DEPLOY-3 — Post-deploy verification (production)

Immediately after deploy, verify on the LIVE production URLs:

- [ ] `besttravelmorocco.com` homepage loads
- [ ] `besttravelmorocco.com/tours/colors-of-morocco` loads with correct title, price, images
- [ ] `besttravelmorocco.com/tours/marrakech-to-fes-through-the-sahara` loads correctly
- [ ] `besttravelmorocco.com/tours/best-of-morocco` loads correctly
- [ ] Tours listing at `besttravelmorocco.com/tours` loads with correct count
- [ ] (Admin deploy) `admin.besttravelmorocco.com` loads and sidebar is correct

### DEPLOY-4 — Record deployment

Document the following for your records:

```
Deployment date: _______________
Changes deployed: _______________
Preview URL verified: _______________
Production URL verified: _______________
Previous deployment URL (for rollback): _______________
```

---

## ROLLBACK PROCEDURE

If anything goes wrong after production deployment:

### ROLL-1 — Immediate rollback (Vercel)

```bash
# Find previous deployment:
npx vercel ls

# Promote previous deployment:
npx vercel rollback [deployment-url]
```

OR via Vercel dashboard: Deployments → find previous deployment → Promote to Production

- [ ] Rollback completes (< 60 seconds typically)
- [ ] Verify `besttravelmorocco.com/tours/colors-of-morocco` is restored

### ROLL-2 — Database rollback (if DB was changed)

- [ ] Restore from most recent backup in Google Drive
- [ ] Verify record counts match pre-deployment baseline from DB-1 and DB-2

### ROLL-3 — Report what happened

After rolling back, document:
- What was deployed
- What went wrong
- What was rolled back to
- What DB state was restored to

---

## EMERGENCY CONTACTS

If a production issue is confirmed and rollback doesn't fix it immediately:

1. Verify Vercel status at vercel.com/status
2. Verify Supabase status at status.supabase.com
3. Check error logs in Vercel dashboard → Functions → Logs

---

## WHAT IS NEVER ALLOWED IN PRODUCTION

Regardless of any other instruction or approval:

- ❌ Never deploy code that reads from `tours` for the public website (the committed code reads from `products`)
- ❌ Never run `DROP TABLE tours` — 6 hard FK constraints depend on it
- ❌ Never change the slug, SEO title, SEO description, price, or image of any of the 17 locked tours
- ❌ Never modify `vercel.json` (redirects) without a separate, specific redirect plan review
- ❌ Never modify `src/pages/TourDetail.tsx`, `Booking.tsx`, `TailorMade.tsx`, `content.ts`, or `emailService.ts` without explicit per-file approval
- ❌ Never commit .env.local or any file containing DATABASE_URL, SUPABASE_KEY, or GOOGLE_SERVICE_ACCOUNT_JSON
- ❌ Never deploy the uncommitted `dataSync.ts` change from the previous session (which reads from `tours`)
- ❌ Never publish a tour record automatically — all new records must be created as draft
- ❌ Never delete a database record — archive it instead
- ❌ Never deploy to production without a preview deployment first

---

*End of checklist. No changes made. Use before every production deployment.*
