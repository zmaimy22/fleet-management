#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/Users/abojad/Documents/Projects/WORKPROGRAM/fleet-management"
PORT_WEB=8080
PORT_API=${PORT_API:-3001}

if ! command -v brew >/dev/null 2>&1; then echo "Homebrew not found"; exit 1; fi
BREW_PREFIX="$(brew --prefix)"
NGX_CONF="$BREW_PREFIX/etc/nginx/nginx.conf"
NGX_LOG_DIR="$BREW_PREFIX/var/log/nginx"
NGX_RUN_DIR="$BREW_PREFIX/var/run/nginx"

brew list nginx >/dev/null 2>&1 || brew install nginx

cd "$APP_DIR"
npm ci
npm run build

mkdir -p "$NGX_LOG_DIR" "$NGX_RUN_DIR"
cat >"$NGX_CONF"<<EOF
worker_processes auto;
error_log $NGX_LOG_DIR/error.log;
pid $NGX_RUN_DIR/nginx.pid;
events { worker_connections 1024; }
http {
  include $BREW_PREFIX/etc/nginx/mime.types;
  default_type application/octet-stream;
  log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                  '\$status \$body_bytes_sent "\$http_referer" '
                  '"\$http_user_agent" "\$http_x_forwarded_for"';
  access_log $NGX_LOG_DIR/access.log main;
  sendfile on; tcp_nopush on; tcp_nodelay on; keepalive_timeout 65;
  gzip on; gzip_comp_level 6; gzip_min_length 256;
  gzip_types text/plain text/css application/json application/javascript application/xml image/svg+xml;
  server {
    listen $PORT_WEB;
    server_name localhost;
    root $APP_DIR/dist;
    index index.html;
    location = /index.html {
      expires -1;
      add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0" always;
      add_header Pragma "no-cache" always;
    }
    location ~* \.html$ {
      expires -1;
      add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0" always;
    }
    location = /service-worker.js {
      expires -1;
      add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0" always;
    }
    location / { try_files \$uri \$uri/ /index.html; }
    location ~* \\.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff2?)\$ {
      expires 30d; access_log off;
      add_header Cache-Control "public, max-age=2592000";
      try_files \$uri =404;
    }
    location /api {
      proxy_pass http://127.0.0.1:$PORT_API;
      proxy_http_version 1.1;
      proxy_set_header Host \$host;
      proxy_set_header X-Real-IP \$remote_addr;
      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto \$scheme;
      proxy_set_header Connection "";
      proxy_read_timeout 60s;
    }
  }
}
EOF

nginx -t
brew services start nginx >/dev/null 2>&1 || brew services restart nginx

API_MAIN="$APP_DIR/server/server.js"
API_PID="$(pgrep -f "$API_MAIN" || true)"
if [[ -n "$API_PID" ]]; then kill "$API_PID" || true; fi
PORT="$PORT_API" nohup node "$API_MAIN" >/tmp/fleet-api.log 2>&1 & disown

echo "Web:  http://localhost:$PORT_WEB"
echo "API:  http://localhost:$PORT_WEB/api/health"

read -r -p "Launch Cloudflare temporary tunnel (trycloudflare.com)? [y/N] " ans
if [[ "$ans" =~ ^[yY]$ ]]; then
  if ! command -v cloudflared >/dev/null 2>&1; then brew install cloudflared; fi
  LOG="/tmp/cloudflared.$(date +%s).log"
  cloudflared tunnel --url "http://localhost:${PORT_WEB}" --no-autoupdate >"$LOG" 2>&1 &
  TUN_PID=$!
  URL=""
  for _ in {1..30}; do
    URL=$(grep -m1 -oE 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com' "$LOG" || true)
    [[ -n "$URL" ]] && break
    sleep 1
  done
  if [[ -n "$URL" ]]; then
    echo "Tunnel: $URL"
    printf "%s" "$URL" | pbcopy
    echo "Copied to clipboard"
  else
    echo "Tunnel URL not detected; tailing log (Ctrl+C to stop)…"
    tail -f "$LOG"
  fi
  read -r -p "Press Enter to stop tunnel…" _
  kill "$TUN_PID" 2>/dev/null || true
fi
