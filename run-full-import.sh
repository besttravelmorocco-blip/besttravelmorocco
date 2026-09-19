#!/bin/bash
# Full batch import — 21 tours + 3 blogs as draft
# Run from: cd /Users/hmad/besttravelmorocco && bash run-full-import.sh
set -e
cd "$(dirname "$0")"

export $(grep -v '^#' .env.local | grep -v '^$' | xargs)

echo ""
echo "=== Full Batch Import (21 tours + 3 blogs as draft) ==="
node migration/webflow-cms-import/import-full-batch.js

echo ""
echo "Done. Verify at admin.besttravelmorocco.com"
