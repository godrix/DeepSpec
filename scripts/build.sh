#!/usr/bin/env bash
set -euo pipefail

rm -rf lib

npx esbuild src/bin/index.ts \
  --bundle \
  --platform=node \
  --format=esm \
  --target=node22 \
  --tree-shaking=true \
  --minify-syntax \
  --outfile=lib/bin/index.js \
  --banner:js='#!/usr/bin/env node'

chmod +x lib/bin/index.js

hookEntries=()
for entry in src/hooks/*.ts; do
  [[ -e "$entry" ]] && hookEntries+=("$entry:$(basename "$entry" .ts)")
done
for entry in src/hooks/*/index.ts; do
  [[ -e "$entry" ]] && hookEntries+=("$entry:$(basename "$(dirname "$entry")")")
done

for hookEntry in "${hookEntries[@]}"; do
  npx esbuild "${hookEntry%%:*}" \
    --bundle \
    --platform=node \
    --format=esm \
    --target=node22 \
    --tree-shaking \
    --minify-syntax \
    --outfile="lib/hooks/${hookEntry##*:}.mjs" \
    --banner:js='#!/usr/bin/env node'
done
