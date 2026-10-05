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
Docker network, and allows the configured Coup Origin or same-origin Referer
for Socket.IO handshakes. Explicitly foreign origins are rejected; requests
with neither Origin nor Referer are rejected for Socket.IO.
Game rooms live in memory and are lost if the API container restarts.

## Current release, rollout and rollback

Production currently runs `070c14f` from
`/opt/coup/releases/070c14f/deploy`, with Compose project `deploy`. This
release includes the current fork `master` at `02bcf3e` and fixes the Socket.IO
same-origin Referer check that blocked browser polling in `ff840d1`. The API
and web containers were activated on 2026-10-05. TLS, home, health, same-origin
Referer polling/WebSocket, allowed-Origin polling, and hostile Origin/Referer
probes passed afterward. The Codex runner remains on its existing release. See
`docs/plans/active/report_issue_13_F6.md` for independent probes and
`docs/plans/active/issue_13_hetzner_deployment.md` for the rollout record.

To activate a reviewed release, switch only the Coup Compose project with:

```sh
docker compose \
  --project-directory /opt/coup/releases/070c14f/deploy \
  -p deploy \
  --env-file /opt/coup/releases/070c14f/deploy/.env \
  -f /opt/coup/releases/070c14f/deploy/docker-compose.yml \
  up -d --wait
```

Then inspect `docker compose ps`, confirm API health, and repeat the HTTPS,
allowed-origin, rejected-origin, polling and WebSocket probes against
`coup.ejele.net`. Verify Mochila, Minecraft and the shared proxy remain up.

To restore the currently deployed source if the candidate causes an availability
failure, use the preserved `ce53c28` release directory and same Compose project:

```sh
docker compose \
  --project-directory /opt/coup/releases/ce53c28/deploy \
  -p deploy \
  --env-file /opt/coup/releases/ce53c28/deploy/.env \
  -f /opt/coup/releases/ce53c28/deploy/docker-compose.yml \
  up -d --wait
```

This rollback restores the CORS behavior that F6 found open on `ce53c28`; use
it only as a temporary availability recovery, then redeploy a fixed release.
Do not remove release directories or images. `docker compose down` stops the
stack and is not a rollback procedure.

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

The staging Compose service keys must remain uniquely named `st-coup-api` and
`st-coup-web`. Production Nginx resolves `coup-api` and `coup-web` on the same
Docker network; reusing those service keys in staging adds conflicting DNS
aliases and can route production requests to staging. After fixing a staging
Compose change, recreate only project `st-coup` and confirm its aliases remain
unique before probing production.

The staging API must allow only its configured browser origin for HTTP and
Socket.IO. For Socket.IO 2.5, same-origin browser polling can send a Referer URL
instead of Origin; compare its parsed `URL.origin` to the configured origin.
Verify an allowed staging client can create/join a room and upgrade
polling to WebSocket, while an arbitrary Origin is rejected for HTTP, polling,
and WebSocket. A release is not ready for production until these checks pass.

### Staging snapshot (2026-10-05)

The issue #13 fix is running as release `070c14f` at
`https://st-coup.ejele.net`. The stage API and web use separate containers and
image tags, publish no host ports, and share only the existing Docker network
with the public proxy. The stage certificate is separate; its systemd renewal
timer is enabled, and Certbot `renew --dry-run --cert-name st-coup.ejele.net`
passed.

Independent probes passed for TLS/home/health, allowed Origin and same-origin
Referer, and rejection of hostile Origin/Referer plus the case where both are
absent. A two-client polling game started with no Origin header and the staging
Referer; both clients received `g-updatePlayers`. The API was restarted to clear
the temporary game and returned healthy; web stayed up. See
`docs/plans/active/report_issue_13_F6.md` and
`docs/plans/active/report_issue_13_F6_orchestrator.md`. Production now runs
`070c14f`; its API recovered healthy during rollout and its same-origin
Referer polling/WebSocket and hostile-origin probes passed. Production rollback
was not exercised.
