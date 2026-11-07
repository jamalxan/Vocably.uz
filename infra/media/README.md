# Chat media server (Garage S3) + edge Caddy sites

Production host: Azure VM `test-server`, **20.219.147.37** (Ubuntu 24.04). The server is shared with the
jamolxon.uz project, which owns the edge Caddy (`jamolxon-caddy`, ports 80/443, network `jamolxon_edge`).
Vocably never edits that project's files; it only drops its own site file into the shared `sites/` folder.

| Path on server | What |
|---|---|
| `/opt/vocably-media/` | this folder: `docker-compose.yml`, `garage.toml` (600), `key.txt` (600), `meta/`, `data/` |
| `/opt/vocably-realtime/` | `realtime-server/` from this repo (+ `.env`, 600) |
| `/opt/jamolxon/edge/sites/vocably.caddy` | `media.vocably.uz` + `ws.vocably.uz` site blocks (copy of `vocably.caddy` here) |

## Fresh install

```bash
sudo install -d -m 750 /opt/vocably-media/{meta,data} && cd /opt/vocably-media
# copy docker-compose.yml + garage.toml.example (as garage.toml, fill the three secrets, chmod 600)
sudo docker compose up -d
G="sudo docker exec vocably-garage /garage"
$G layout assign -z dc1 -c 200G $($G node id -q | cut -d@ -f1) && $G layout apply --version 1
$G bucket create vocably-chat
$G key create vocably-app            # prints Key ID + Secret key -> Vercel S3_ACCESS_KEY / S3_SECRET_KEY
$G bucket allow --read --write --owner vocably-chat --key vocably-app
sudo install -m 644 vocably.caddy /opt/jamolxon/edge/sites/vocably.caddy
sudo docker exec jamolxon-caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
```

Vercel env: `S3_ENDPOINT=https://media.vocably.uz`, `S3_REGION=us-east-1`, `S3_BUCKET=vocably-chat`, plus the key.

## Network requirements (Azure NSG, inbound, source Any)

- TCP 80, 443 (Caddy, Let's Encrypt HTTP-01) — shared with jamolxon.uz
- TCP+UDP 3478, UDP 49160-49360 (coturn, see `realtime-server/`)

## DNS (ahost.uz, zone vocably.uz)

`media`, `ws`, `turn` → A 20.219.147.37, TTL 300.

## Gotchas

- AWS SDK v3 >= 3.729 adds `x-amz-checksum-crc32` to presigned PUT URLs and Garage rejects the upload
  (InvalidDigest): `src/lib/s3.js` sets `requestChecksumCalculation: 'WHEN_REQUIRED'`.
- Garage answers anonymous requests with 403; CORS (incl. OPTIONS preflight) is done by Caddy, not Garage.
