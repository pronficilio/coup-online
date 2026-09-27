#!/usr/bin/env bash
set -euo pipefail

source_sha="${1:-55be894}"
output_dir="${2:-/tmp/coup-release-deploy-${source_sha:0:12}}"
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(git -C "$script_dir" rev-parse --show-toplevel)"

git -C "$repo_root" cat-file -e "${source_sha}^{commit}"
if [[ -e "$output_dir" ]]; then
  printf 'Refusing to overwrite existing path: %s\n' "$output_dir" >&2
  exit 1
fi

mkdir -p "$output_dir"
git -C "$repo_root" archive "$source_sha" | tar -x -C "$output_dir"
mkdir -p "$output_dir/deploy"
cp -a "$script_dir/." "$output_dir/deploy/"
cp "$repo_root/.dockerignore" "$output_dir/.dockerignore"
cp "$script_dir/production-overlay/server/index.js" "$output_dir/server/index.js"
cp "$script_dir/production-overlay/server/package.json" "$output_dir/server/package.json"
cp "$script_dir/production-overlay/server/package-lock.json" "$output_dir/server/package-lock.json"
printf '%s\n' "$source_sha" > "$output_dir/RELEASE_SHA"
printf 'COUP_REVISION=%s\n' "${source_sha:0:7}" > "$output_dir/deploy/.env"

printf 'Prepared Coup source %s at %s\n' "$source_sha" "$output_dir"
