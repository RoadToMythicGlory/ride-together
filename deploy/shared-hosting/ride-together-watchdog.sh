#!/bin/bash
# Keep user-space Postgres + Nest API daemon alive on shared hosting.
set -u
APP="$HOME/apps/ride-together"
API="$HOME/apps/ride-api"
LOG="$APP/logs/watchdog.log"
BIN="$HOME/micromamba/envs/ride-pg/bin"
PGDATA="$APP/pgdata"
HOST="tgranks.com"

mkdir -p "$APP/logs"

log() { echo "[$(date -Iseconds)] $*" >> "$LOG"; }

# --- Postgres (127.0.0.1:5433 only) ---
if [ -x "$BIN/pg_isready" ]; then
  if ! "$BIN/pg_isready" -h 127.0.0.1 -p 5433 >/dev/null 2>&1; then
    log "postgres down; starting"
    if [ -f "$APP/logs/pg-up.sh" ]; then
      /bin/bash "$APP/logs/pg-up.sh" >>"$LOG" 2>&1 || true
    else
      nohup "$BIN/postgres" -D "$PGDATA" -p 5433 -h 127.0.0.1 >>"$APP/logs/postgres.log" 2>&1 &
      sleep 2
    fi
  fi
fi

# --- API daemon on 127.0.0.1:3001 ---
if ! curl -s --max-time 3 http://127.0.0.1:3001/health | grep -q '"ok"'; then
  log "api down; starting"
  if [ -f "$APP/logs/api-start.sh" ]; then
    /bin/bash "$APP/logs/api-start.sh" >>"$LOG" 2>&1 || true
  fi
fi

# --- Public proxy smoke check ---
code=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 20 "https://${HOST}/api/health" 2>/dev/null || echo 000)
if [ "$code" != "200" ]; then
  log "public /api/health failed HTTP $code; bounce api"
  if [ -f "$APP/logs/api.pid" ]; then
    kill "$(cat "$APP/logs/api.pid")" 2>/dev/null || true
    sleep 1
  fi
  /bin/bash "$APP/logs/api-start.sh" >>"$LOG" 2>&1 || true
fi
