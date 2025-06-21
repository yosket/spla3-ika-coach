# Splatoon 3 AI Coaching Service — Full Specification (Snapshot v0.3)

**Date:** 2025‑06‑21  
**Recommended repository:** `spla3-ika-coach`

---

## 0. Purpose & Vision
Offer actionable, privacy‑preserving coaching for Splatoon 3:

* Pull battle JSON from SplatNet 3 (Nintendo Switch Online).
* Compute statistics (win‑rate, K/D, paint points, weapon & rule splits).
* Generate Japanese advice with GPT‑4o.
* _Phase 2_ will add video‑based insights (heat‑maps, clips).

---

## 1. Feature Roadmap
| Phase | Scope | Deliverables |
|-------|-------|--------------|
| **MVP** | JSON stats + GPT‑4o advice | Token vault, importer Lambda, stats engine, dashboard UI |
| Phase 2 | Video analysis | Clip extractor, heat‑maps, Vision‑LLM advice |
| Phase 3 | Social & billing | Discord bot, subscriptions, leaderboards |

---

## 2. User Journey (MVP)

1. **Sign‑up** – e‑mail Magic‑Link, no password.  
2. **Token acquisition** – user logs in to Nintendo via generated URL; lands on `…/callback?session_token_code=XYZ` (404).  
3. **Paste URL** – backend exchanges code → `session_token` (30 days).  
4. **Import matches** – fetch latest 50 battles.  
5. **Dashboard** – rule & weapon stats, sortable list.  
6. **Match detail** – per‑match stats + GPT‑4o advice, future heat‑map.  
7. **Re‑analyse** – regenerate advice.  
8. **Data deletion** – user can purge token & matches anytime.

---

## 3. System Architecture
```
Next.js 14 SPA
 ├─ Auth.js (Magic‑Link) → JWT
 ├─ Token Form
 └─ Dashboard UI
FastAPI Backend
 ├─ Auth Service
 ├─ Token Vault (AWS KMS + DynamoDB)
 ├─ Importer Lambda (nxapi)
 ├─ Stats Engine (Pandas)
 └─ LLM Adapter (Azure OpenAI GPT‑4o)
        │
   PostgreSQL (RDS)
        │
    Amazon S3 (assets)
```

---

## 4. API Surface
| Verb | Path | Description |
|------|------|-------------|
| POST | `/token` | Accept redirect URL → store encrypted `session_token` |
| POST | `/import` | Pull latest 50 battles |
| GET  | `/battles` | Paginated list |
| GET  | `/battles/{id}` | Detail + advice |
| POST | `/battles/{id}/refresh` | Recompute & regenerate advice |

---

## 5. Data Schema (excerpt)
```sql
CREATE TABLE battles (
  id BIGINT PRIMARY KEY,
  user_id UUID NOT NULL,
  rule TEXT,
  stage TEXT,
  weapon TEXT,
  result TEXT,
  kills INT,
  deaths INT,
  paint INT,
  raw_json JSONB,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 6. Token Flow Highlights
* Custom `redirect_uri` returns **404** so URL stays visible for copy.  
* Backend verifies PKCE challenge, exchanges code → `session_token`.  
* Token encrypted with AES‑256 (KMS); TTL 30 days; auto‑purge or manual delete.  
* Read‑only access—no purchases, no friend edits.

---

## 7. Security & Compliance
* AES‑256 + envelope encryption.  
* Data residency: Tokyo (ap‑northeast‑1).  
* `/user_delete` wipes all records.  
* Service is **unofficial**; users must accept Nintendo API risks.

---

## 8. Sample User Output
### Dashboard
* Turf War **58 %** win‑rate (K/D 1.15, 1 128 pt).  
* Weakest rule: Tower Control 42 % win‑rate.  

### Match Advice (GPT‑4o)
> __Weakness__: 初動30秒で中央を確保できず人数不利が多発。  
> __Drill__: プラベで中央高台取得を10回連続成功＋スペシャル即発動。  
> __Expected gain__: +12 pt win‑rate (peer dataset).

---

## 9. Limitations
* JSON lacks positional data → no heat‑maps/clip extraction (Phase 2 will use video).  
* Nintendo may revoke endpoints; contingency notice on FAQ.

---

## 10. 14‑Day Sprint Plan
| Day | Goal |
|-----|------|
| 1‑2 | Repo init, CI, Auth |
| 3‑4 | Token vault & exchange |
| 5‑6 | Importer Lambda |
| 7‑8 | Stats engine |
| 9 | Dashboard list |
| 10 | Match detail |
| 11 | GPT‑4o adapter |
| 12 | E2E tests |
| 13 | Security review |
| 14 | Internal α release |

---

_End of Snapshot v0.3_
