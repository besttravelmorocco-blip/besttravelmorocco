#!/bin/bash
# Fix images on the 3 Webflow-imported blog posts (draft only, safe to re-run)
# Run from: cd /Users/hmad/besttravelmorocco && bash run-fix-blog-images.sh
set -e
cd "$(dirname "$0")"

export $(grep -v '^#' .env.local | grep -v '^$' | xargs)

echo ""
echo "=== Fix Blog Images ==="
node migration/webflow-cms-import/fix-blog-images.js
