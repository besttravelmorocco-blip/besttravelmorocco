# BTM Backup & Restore Guide

## Overview

| What | How | Where | Retention |
|------|-----|-------|-----------|
| Daily DB + config backup | GitHub Actions (automated) | GitHub Artifacts | 30 days |
| Pre-change backup | `bash scripts/backup-local.sh` | `~/BTM-Backups/` | 14 most recent |
| Backup manifests | Committed to git | `backups/manifests/` | Forever (git history) |

---

## Daily Automated Backup (GitHub Actions)

Runs every day at **02:00 UTC** via `.github/workflows/daily-backup.yml`.

### What is backed up
- All 30 production database tables (JSON format, paginated)
- DB schema reference (`db/schema.ts`)
- Configuration snapshot (secret presence/absence only — no values)
- Backup manifest with checksums and row counts

### What is NOT backed up automatically
- Public site source (not in this git repo — use local backup script)
- Raw secrets or env values

### Viewing backups
1. Go to: `https://github.com/besttravelmorocco-blip/besttravelmorocco/actions`
2. Click "Daily Database Backup"
3. Select a run → scroll to "Artifacts"
4. Download `btm-backup-YYYY-MM-DD_HH-MM-SS.zip`

### Triggering manually
GitHub Actions → "Daily Database Backup" → "Run workflow"

### Failure alerts
- GitHub sends an email to the repo owner on workflow failure (configure in GitHub account → Notifications)
- The workflow also sends an alert via Resend to `hello@besttravelmorocco.com`

---

## Pre-Change Local Backup

**Run this before every production change.**

```bash
bash /Users/hmad/BTM-worktrees/btm-admin-tour-arch/scripts/backup-local.sh --reason "before auth migration"
```

Backs up:
- Database (all tables via REST API)
- Admin source code (excluding secrets, node_modules, dist)
- Public site source code

Stored at: `~/BTM-Backups/YYYY-MM-DD_HH-MM-SS/`

Retention: last 14 backups kept automatically.

---

## Required GitHub Secrets

Add these in: `https://github.com/besttravelmorocco-blip/besttravelmorocco/settings/secrets/actions`

| Secret | Description |
|--------|-------------|
| `SUPABASE_URL` | `https://uxkfqxistjvtofskqtwy.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (from `.env.production`) |
| `RESEND_API_KEY` | Resend API key (for failure alerts) |

---

## Retention Policy

| Type | Retention | How |
|------|-----------|-----|
| GitHub Actions artifacts | 30 days | Automatic (configurable in workflow) |
| Local pre-change backups | 14 most recent | `backup-local.sh` cleans automatically |
| Git manifests | Forever | Committed to `backups/manifests/` |

**Recommendation:** Download and archive to Google Drive any backup from before a major change (database migration, auth change, CMS restructure). Keep at minimum:
- Last 7 daily backups
- One backup from each month

---

## Restore Procedures

### Restore a table from a GitHub Actions artifact

1. Download the artifact ZIP from GitHub Actions
2. Extract — find `{table_name}.json`
3. **Do NOT restore over production automatically**
4. For a test restore, use a separate Supabase project

**To a separate Supabase project:**
```bash
# Create a new Supabase project for testing
# Get its service role key and URL, then:

RESTORE_URL="https://your-test-project.supabase.co"
RESTORE_KEY="your-test-service-role-key"
TABLE="products"

curl -X POST "${RESTORE_URL}/rest/v1/${TABLE}" \
  -H "apikey: ${RESTORE_KEY}" \
  -H "Authorization: Bearer ${RESTORE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d @"${TABLE}.json"
```

**To restore a specific table to production** (requires explicit authorization):
```bash
# WARNING: This overwrites production data.
# Only run after explicit authorization.
# Always back up first.

TABLE="products"
BACKUP_FILE="path/to/products.json"

# Step 1: Back up the current state first
bash scripts/backup-local.sh --reason "pre-restore backup"

# Step 2: Delete existing rows (if doing a full replace)
# curl -X DELETE "${SUPABASE_URL}/rest/v1/${TABLE}?id=neq.null" ...

# Step 3: Insert backup rows
curl -X POST "${SUPABASE_URL}/rest/v1/${TABLE}" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d @"${BACKUP_FILE}"
```

### Restore public site source

The public site source is backed up at `~/BTM-Backups/{timestamp}/public-site-source/`.

To redeploy from backup:
```bash
BACKUP_DIR="$HOME/BTM-Backups/YYYY-MM-DD_HH-MM-SS"
cd "${BACKUP_DIR}/public-site-source"
npm install
npm run build
node prerender.cjs
npx vercel deploy --prod --force
```

### Restore admin source

The admin source is in git. To restore to a specific commit:
```bash
cd /Users/hmad/BTM-worktrees/btm-admin-tour-arch
git log --oneline -20       # find the commit before the problem
git checkout {commit-hash}  # check out that state
# redeploy using the admin deploy procedure
```

---

## Supabase Media / Storage

Supabase Storage buckets (images uploaded via CMS) are **not included** in this backup system.

**Supabase's built-in backups:**
- Supabase Pro plan includes daily Point-in-Time Recovery (PITR)
- Check your Supabase dashboard → Project Settings → Backups
- If on Free tier, consider upgrading or implementing a Storage sync script

**Recommended:** Periodically export the Supabase Storage bucket to Google Drive using the Supabase Storage API.

---

## Change Log

Record significant changes here or in the git commit message.

| Date | Change | Backup ID | Result |
|------|--------|-----------|--------|
| 2026-08-13 | Backup system created | — | — |

---

## Security Notes

- Backup artifacts on GitHub are private (private repo)
- No secret values are stored in manifests or config snapshots
- `backups/` in git only contains lightweight manifests (no data)
- Raw DB dumps are never committed to git (enforced by `backups/.gitignore`)
- `~/BTM-Backups/` on your Mac is local only — not pushed anywhere
