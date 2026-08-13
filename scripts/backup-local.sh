#!/usr/bin/env bash
# BTM Local Backup Script
#
# Run this BEFORE any production change.
# Also usable for on-demand backups from your Mac.
#
# Usage:
#   bash scripts/backup-local.sh
#   bash scripts/backup-local.sh --reason "before auth migration"
#
# Requires:
#   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set in environment,
#   or available in /Users/hmad/besttravelmorocco/.env.production

set -euo pipefail

REASON="${2:-on-demand}"
TIMESTAMP=$(date -u '+%Y-%m-%d_%H-%M-%S')
BACKUP_ROOT="${HOME}/BTM-Backups"
BACKUP_DIR="${BACKUP_ROOT}/${TIMESTAMP}"
ADMIN_SRC="/Users/hmad/BTM-worktrees/btm-admin-tour-arch"
PUBLIC_SRC="/Users/hmad/Desktop/BTM Work/besttravelmorocco-seo-v4-6"
ENV_FILE="/Users/hmad/besttravelmorocco/.env.production"

echo ""
echo "════════════════════════════════════════════════"
echo "  BTM Local Backup — ${TIMESTAMP}"
echo "  Reason: ${REASON}"
echo "════════════════════════════════════════════════"

# ── Load env if not already set ──────────────────────────────────────────────
if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  if [ -f "$ENV_FILE" ]; then
    echo "Loading env from ${ENV_FILE}..."
    set -a
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
  else
    echo "ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY not set."
    echo "       Either export them or ensure ${ENV_FILE} exists."
    exit 1
  fi
fi

mkdir -p "$BACKUP_DIR"

# ── 1. Database export ────────────────────────────────────────────────────────
echo ""
echo "[1/4] Exporting database..."

export SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY

DB_OUT="${BACKUP_DIR}/db"
mkdir -p "$DB_OUT"

node "${ADMIN_SRC}/scripts/backup-db.js" 2>&1 | tee "${BACKUP_DIR}/backup-db.log"

# Move backup-output to our backup dir
if [ -d "${ADMIN_SRC}/backup-output" ]; then
  # Find the most recent timestamped dir inside backup-output
  LATEST_DB_DIR=$(ls -td "${ADMIN_SRC}/backup-output/"*/ 2>/dev/null | head -1)
  if [ -n "$LATEST_DB_DIR" ]; then
    cp -r "$LATEST_DB_DIR"* "$DB_OUT/" 2>/dev/null || true
    cp -r "$LATEST_DB_DIR" "$DB_OUT/" 2>/dev/null || true
  fi
fi

echo "  Database export done."

# ── 2. Admin source snapshot ──────────────────────────────────────────────────
echo ""
echo "[2/4] Snapshotting admin source..."

SRC_OUT="${BACKUP_DIR}/admin-source"
mkdir -p "$SRC_OUT"

rsync -a \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='backup-output' \
  --exclude='.env*' \
  --exclude='backups/*.json' \
  "${ADMIN_SRC}/" \
  "$SRC_OUT/"

echo "  Admin source done."

# ── 3. Public site source snapshot ───────────────────────────────────────────
echo ""
echo "[3/4] Snapshotting public site source..."

PUB_OUT="${BACKUP_DIR}/public-site-source"
mkdir -p "$PUB_OUT"

rsync -a \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.env*' \
  "${PUBLIC_SRC}/" \
  "$PUB_OUT/"

echo "  Public site source done."

# ── 4. Manifest ───────────────────────────────────────────────────────────────
echo ""
echo "[4/4] Writing manifest..."

# Git commit info
GIT_COMMIT=$(cd "$ADMIN_SRC" && git rev-parse HEAD 2>/dev/null || echo "unknown")
GIT_BRANCH=$(cd "$ADMIN_SRC" && git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

# File counts
ADMIN_COUNT=$(find "$SRC_OUT" -type f | wc -l | tr -d ' ')
PUBLIC_COUNT=$(find "$PUB_OUT" -type f | wc -l | tr -d ' ')
DB_COUNT=$(find "$DB_OUT" -type f -name "*.json" | wc -l | tr -d ' ')

cat > "${BACKUP_DIR}/backup-manifest.json" <<EOF
{
  "project": "Best Travel Morocco",
  "timestamp": "${TIMESTAMP}",
  "reason": "${REASON}",
  "completed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "git_commit": "${GIT_COMMIT}",
  "git_branch": "${GIT_BRANCH}",
  "components": {
    "database": { "status": "see backup-db.log", "files": ${DB_COUNT} },
    "admin_source": { "status": "OK", "files": ${ADMIN_COUNT} },
    "public_site_source": { "status": "OK", "files": ${PUBLIC_COUNT} }
  },
  "backup_dir": "${BACKUP_DIR}",
  "secrets_included": false,
  "note": "No .env files or secret values included in this backup."
}
EOF

echo "  Manifest written."

# ── Retention: keep last 14 local backups ─────────────────────────────────────
echo ""
echo "Applying retention (keep 14 most recent)..."
ls -dt "${BACKUP_ROOT}"/????-??-??_??-??-??/ 2>/dev/null | tail -n +15 | while read -r old; do
  echo "  Removing old backup: $old"
  rm -rf "$old"
done

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════"
echo "  Backup complete: ${TIMESTAMP}"
echo "  Location: ${BACKUP_DIR}"
echo "  DB files: ${DB_COUNT}"
echo "  Admin source files: ${ADMIN_COUNT}"
echo "  Public site files: ${PUBLIC_COUNT}"
echo "════════════════════════════════════════════════"
echo ""
echo "IMPORTANT: Verify before proceeding with any production change."
echo "           Check ${BACKUP_DIR}/backup-db.log for DB export status."
