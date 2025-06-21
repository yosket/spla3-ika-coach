# Splatoon 3 SplatNet 3 Data Import — Alternative Methods to **nxapi**

> **Date:** 2025‑06‑21

When the `nxapi` server or CDN is down and you cannot fetch battle data, use one of the _fully offline_ OSS tools below.  
All methods rely on **official Nintendo tokens** and run **entirely on your machine**, so external outages do not affect them.

---

## 1. `s3s` (Python)

### Install & Login

```bash
pip install --upgrade s3s          # one‑time
python -m s3s -n                   # shows login URL
# log in → copy redirect URL → paste into CLI
```

The token is stored in `~/.config/s3s/`.  
To export the latest 50 battles:

```bash
python -m s3s --latest --output battles.json --dry-run
```

*Remove `--dry-run` to upload to stat.ink automatically.*

---

## 2. `s3si.ts` (Deno / TypeScript)

### Quick start

```bash
# install Deno (if needed)
curl -fsSL https://deno.land/install.sh | sh

# run tool
deno run -Ar https://raw.githubusercontent.com/spacemeowx2/s3si.ts/main/s3si.ts   --list-method latest --exporter file
```

*Creates `profile.json` + `battles_*.json`.  Docker & GUI builds are available in the repo.*

---

## 3. `SplatNet3_Scraper` (Python)

Pure‑Python library that bypasses `nxapi` entirely.

```bash
pip install splatnet3_scraper

python - <<'PY'
from splatnet3_scraper.auth import login
from splatnet3_scraper.battles import get_battles

sess = login(session_token="PASTE_YOUR_TOKEN")
battles = get_battles(sess, count=50)
print(battles[0])
PY
```

You can craft your own GraphQL queries to fetch **stage list, X‑Power history, catalog progress**, etc.

---

## 4. Integrating into the Coaching Backend

| Your backend lang | Recommended tool | Integration tip |
|-------------------|------------------|-----------------|
| **Python**        | `s3s` or `SplatNet3_Scraper` | call as library or subprocess |
| **Node / TS**     | `s3si.ts`        | run via `deno run` or `deno compile` binary |
| **Mixed stack**   | Docker images    | each tool has an official Dockerfile |

---

## 5. API Rate & BAN Risk

* Read‑only access to your own data — **no BAN cases reported** (as of 2025‑06).  
* Avoid excessive polling: **< 5 requests/sec** is a safe baseline.  
* Explain “self‑responsibility” in your ToS for any commercial service.

---

_Enjoy uninterrupted analytics even when `nxapi` is offline!_
