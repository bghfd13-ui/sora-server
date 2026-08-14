# ProjectSora server without RCC

This runs the public website, API, PostgreSQL, Redis, and HTTPS. It does not run RCC, the renderer, or game servers; keep those on the Windows PC temporarily.

## Deploy to Oracle Cloud

1. Create an Always Free Ubuntu VM. Open inbound TCP **80** and **443** both in Oracle security rules and Ubuntu firewall.
2. Point a DNS A-record (for example `sora.example.com`) to the VM public IP.
3. Push the source to a **private** GitHub repository. Never commit `deploy/.env`, local `appsettings.json`, database dumps, or credentials.
4. On the VM install Docker Engine and Compose, clone the repository, then run:

```bash
cd pekora-latest-src/deploy
cp .env.example .env
nano .env
docker compose up -d --build
docker compose logs -f --tail=100
```

## Move existing data

Export the local PostgreSQL database before the move, then restore it into the `postgres` container. Use your actual local database name:

```powershell
pg_dump -h 127.0.0.1 -U postgres -Fc my_db_name > C:\ProjectSora\sora-backup.dump
```

## Temporary RCC on the Windows PC

1. Keep RCC and `game-renderer` on the PC; `START-SORA.ps1` starts both. RCC listens locally on port `1621` and the renderer uses port `7832`.
2. In `game-renderer/config.json`, set `BaseUrl` to the public HTTPS site URL and leave `RCCUrl` pointing to the local RCC address. Do **not** expose port `1621` directly to the internet.
3. The PC must stay awake and connected. If it is off, avatar rendering and game sessions requiring RCC stop; the website/accounts stay online.
4. For outside players to join games while RCC is on the PC, the `GameServerIp` configured on the website must be a public address reachable by players and the required game ports must be forwarded in the router/firewall. Tailscale only works for players who also use your Tailnet, so it is suitable for private testing, not a public game. A Windows VPS is the safer later solution.

To update the website later: `docker compose up -d --build`. Back up PostgreSQL outside the VM regularly.
