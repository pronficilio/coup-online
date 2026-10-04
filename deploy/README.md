# Coup on Hetzner

This Compose project runs the selected Coup release on the existing
`mochila_default` Docker network. It publishes no host ports; the shared Nginx
container routes `coup.ejele.net` to `coup-web` and sends `/createNamespace`,
`/exists/*`, and `/socket.io/*` to `coup-api`.

## Build and start

First create a release directory from the selected clean commit and the
reviewed production overlay:

```sh
deploy/package-release.sh 55be894 /tmp/coup-release-modern
cd /tmp/coup-release-modern/deploy
docker compose up -d --build
docker compose ps
docker compose logs --tail=100
```

The package script records the full source SHA in `RELEASE_SHA` and sets the
image tag from that SHA. The web image builds the React app with
`REACT_APP_BACKEND_URL` set to
`https://coup.ejele.net`. The API uses Node 24, listens on port 8000 inside the
Docker network, and allows the Coup origin for HTTP and Socket.IO handshakes.
Game rooms live in memory and are lost if the API container restarts.

## Stop and rollback

Keep the complete release directory and images to support rollback. To restore
the previous release, run `docker compose up -d` from
`/opt/coup/releases/1e4685f/deploy`; its Compose defaults select the original
`1e4685f` images. New releases include a `.env` with their image tag. To stop
the stack, run `docker compose down` from the active release's `deploy/`
directory.

## Shared Nginx and TLS

The host's existing `mochila-proxy-1` owns ports 80 and 443. Keep that proxy;
do not start a second public reverse proxy. Back up
`/opt/mochila/deploy/nginx.conf` before replacing it. First install
`nginx-hetzner-acme.conf`, run `docker exec mochila-proxy-1 nginx -t`, and
reload Nginx. Make the Certbot root traversable (`chmod 711
/opt/mochila/certbot`); its private child directories stay mode `700`. Then
issue the certificate with the existing Certbot account:

```sh
docker run --rm -v /opt/mochila/certbot:/etc/letsencrypt \
  certbot/certbot:latest certonly --non-interactive --webroot \
  --webroot-path /etc/letsencrypt/webroot --cert-name ejele.net \
  --account <existing-account-id> --agree-tos --no-eff-email \
  -d ejele.net -d www.ejele.net -d coup.ejele.net
```

After issuance, install `nginx-hetzner-final.conf`, test it, and reload. It
routes `ejele.net` to Mochila, redirects `www.ejele.net` to the apex, and
routes Coup's app/API/Socket.IO paths to the two Coup containers. The TLS
fallback and the existing Mochila upstream remain in place.

Install `coup-certbot-renew.service` and `.timer` in `/etc/systemd/system`,
then run `systemctl daemon-reload` and
`systemctl enable --now coup-certbot-renew.timer`. Test the stored renewal
configuration with:

```sh
docker run --rm -v /opt/mochila/certbot:/etc/letsencrypt \
  certbot/certbot:latest renew --dry-run --cert-name ejele.net
```

The service renews only `ejele.net` and reloads the shared proxy after a
successful renewal.

Keep each release source under a separate directory or archive so rollback
uses the matching source and image tag. This project must not publish ports 80
or 443; those belong to Mochila's shared Nginx proxy.

## Staging at `st-coup.ejele.net`

Staging runs as a separate Compose project on the existing `mochila_default`
network. Its containers and image tags are separate from production, publish
no host ports, and route only from the `st-coup.ejele.net` Nginx virtual host.
Do not add the Codex runner overlay to staging unless that feature is under test.

Package the exact reviewed source commit, then create a private `.env` in the
staging release directory with its short revision and staging hostname:

```sh
deploy/package-release.sh <reviewed-sha> /opt/coup/staging/<short-sha>
cd /opt/coup/staging/<short-sha>/deploy
cat > .env <<'EOF'
COUP_REVISION=<short-sha>
CORS_ORIGIN=https://st-coup.ejele.net
REACT_APP_BACKEND_URL=https://st-coup.ejele.net
EOF
docker compose -p st-coup -f staging-compose.yml up -d --build --wait
docker compose -p st-coup -f staging-compose.yml ps
```

Issue a separate certificate for `st-coup.ejele.net` using the existing
Certbot volume and HTTP-01 webroot. Install the matching staging virtual host
from `nginx-hetzner-final.conf`, run `docker exec mochila-proxy-1 nginx -t`,
then reload Nginx. The production certificate is not replaced. The dedicated
`st-coup-certbot-renew.service` and `.timer` renew only the staging certificate
and reload the proxy after successful renewal.

The staging API must allow only its configured browser origin for HTTP and
Socket.IO. Verify an allowed staging client can create/join a room and upgrade
polling to WebSocket, while an arbitrary Origin is rejected for HTTP, polling,
and WebSocket. A release is not ready for production until these checks pass.
