#!/bin/bash
set -u
APP="$HOME/apps/ride-together"
LOG="$APP/logs/watchdog.log"
HOST="tgranks.com"
IP="162.254.39.60"
API_ROOT="$APP/apps/api"

mkdir -p "$APP/logs" "$API_ROOT/tmp"

log() { echo "[$(date -Iseconds)] $*" >> "$LOG"; }

probe() {
  local url="$1"
  curl -sk -o /dev/null -w "%{http_code}" --max-time 60 --resolve "${HOST}:443:${IP}" "$url" 2>/dev/null \
    || curl -s -o /dev/null -w "%{http_code}" --max-time 60 --resolve "${HOST}:80:${IP}" "${url/https/http}" 2>/dev/null \
    || echo 000
}

check() {
  local url="$1"
  local label="$2"
  local code
  code=$(probe "$url")
  if [ "$code" = "200" ]; then
    return 0
  fi
  sleep 15
  code=$(probe "$url")
  if [ "$code" = "200" ]; then
    return 0
  fi
  log "$label health failed twice (HTTP $code); restarting passenger app"
  touch "$API_ROOT/tmp/restart.txt"
  # Also bounce via CloudLinux selector when available
  if command -v cloudlinux-selector >/dev/null 2>&1; then
    cloudlinux-selector restart --json --interpreter=nodejs --app-root=apps/ride-together/apps/api \
      >>"$LOG" 2>&1 || true
  fi
}

check "https://${HOST}/api/health" "ride-together-api"
check "https://${HOST}/" "ride-together-web"
