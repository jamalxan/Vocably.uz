# Media backup into a Telegram channel

The media server has been lost twice with everything on it. This service keeps a second copy of the media
bucket (chat photos, videos, voice, files, avatars, stickers) in a private Telegram channel, and `restore.mjs`
rebuilds the bucket from that channel on any server.

## How it works

- `backup.mjs` runs next to Garage (`../docker-compose.yml`, service `backup`). Every minute it lists the bucket
  and uploads what is new or changed. A new file is in the channel one to two minutes after it was sent.
- Every object is encrypted (AES-256-GCM) before it leaves the server. The channel shows only files named like
  `16703650dff466d3.0`; neither names nor content can be read without `BACKUP_KEY`.
- A bot can upload 50 MB but download only 20 MB, so objects are stored in parts of at most 19 MiB. A 60 MB
  video is four messages.
- The **manifest** (which object is in which messages) is encrypted, uploaded and **pinned** in the channel
  after every change. A restore needs only: the bot token, the channel id and `BACKUP_KEY`.
- Deleted or replaced objects leave the restore set at once; their messages are removed from the channel after
  `RETENTION_DAYS` (30).
- If a large share of the bucket disappears at once (20 objects and 20 % or more), the backup is left untouched
  and the admin gets a Telegram message: a wiped server must not wipe its own backup.
- The admin chat (`ALERT_CHAT_ID`) gets one line a day with the totals, and a message when uploads keep failing.

## What you must keep outside the server

| What | Why |
|---|---|
| `BACKUP_KEY` | Without it the channel content cannot be decrypted. There is no way to recover it. |
| Bot token | Telegram file ids belong to the bot that uploaded them. If the bot is deleted the backup cannot be read. |
| Channel id | Where the manifest is pinned. Do not pin other messages in the channel and do not delete its messages. |

## Install

```bash
# on the media server, in /opt/vocably-media
sudo install -d -m 750 backup backup-state
sudo cp -r <repo>/infra/media/backup/{backup.mjs,restore.mjs,lib} backup/
sudo cp <repo>/infra/media/backup/backup.env.example backup.env && sudo chmod 600 backup.env   # fill it in
sudo docker compose --profile backup up -d backup
sudo docker logs -f vocably-media-backup        # JSON lines: start, pass, alert, error
```

The channel: create a private channel, add the bot as an administrator with the rights to post, delete and pin
messages, and put the channel id (`-100…`) into `BACKUP_CHAT_ID`.

## Check that the backup can be read

```bash
sudo docker compose --profile backup run --rm backup node restore.mjs --check 20   # 20 random objects
sudo docker compose --profile backup run --rm backup node restore.mjs --check      # everything
sudo docker compose --profile backup run --rm backup node restore.mjs --list
```

`--check` downloads, decrypts and verifies checksums and writes nothing. Run it after the first full upload and
from time to time: a backup that was never read back is a hope, not a backup.

## Restore after the server is lost

1. Bring up a new Garage and an empty bucket (`../README.md`, "Fresh install").
2. Run the restore anywhere that has Node 22 and reaches both Telegram and the new bucket:

```bash
export TELEGRAM_BOT_TOKEN=… BACKUP_CHAT_ID=-100… BACKUP_KEY=…
export S3_ENDPOINT=https://media.vocably.uz S3_ACCESS_KEY=… S3_SECRET_KEY=… S3_BUCKET=vocably-chat
node restore.mjs               # writes every object the bucket is missing; safe to run again
```

3. Start the `backup` service on the new server with the same `backup.env`. Without a local state it reads the
   pinned manifest and continues the existing backup; nothing is uploaded twice.

## Limits

- The database is not part of this backup (it lives in MongoDB Atlas).
- Only the bot that uploaded the files can download them. A different bot cannot read the channel.
- The manifest is one document (20 MB limit). At roughly 150 bytes per object compressed that is far beyond
  100 000 objects; `backup.mjs` stops with a clear error before the limit.

## Tests

`npx vitest run infra/media/backup` — crypto, manifest planning, a full backup → wipe → restore round trip against
in-memory fakes, the Telegram client's retry rules, and the S3 signer compared with the AWS SDK's.
