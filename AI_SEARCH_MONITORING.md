# Allbound Vacations — AI Search Visibility & Off-Site Authority Playbook

Operational guide for measuring, maintaining, and growing visibility for **Allbound Vacations** (`https://allboundvacations.com`) across AI search engines, answer engines, and traditional search.

---

## 1. GA4 Custom AI Channel Group & Referral Event Tracking

Allbounds loads GA4 (`G-J0GBBZ0SZZ`) in `frontend/index.html` and fires a lightweight, once-per-session custom event `ai_referral_landing` from `frontend/src/lib/ai-analytics.ts` (wired on mount in `frontend/src/App.tsx`).

### 1.1 Create the "AI Search / Assistants" Custom Channel Group
1. Open GA4 (`G-J0GBBZ0SZZ`) → **Admin** → **Data display** → **Channel groups**.
2. Click **Create new channel group** (or copy **Default channel group** and name it `Default + AI Search`).
3. Click **Add new channel**:
   - **Channel name:** `AI Search / Assistants`
   - **Condition:** `Source` → `matches regex` (or `matches partial regex`) → paste:
     ```regex
     (?i)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|copilot\.microsoft\.com|gemini\.google\.com|grok\.x\.ai|you\.com|phind\.com|meta\.ai|edgeservices\.bing\.com|poe\.com)
     ```
4. **Reorder:** Drag `AI Search / Assistants` **above** `Referral` so GA4 classifies AI referrals before falling back to generic Referral traffic.
5. Save the channel group and set it as the primary dimension in **Reports → Acquisition → Traffic acquisition**.

### 1.2 Register Custom Dimensions for `ai_referral_landing`
The `ai_referral_landing` event sends four parameters:
- `ai_source` (e.g., `chatgpt`, `perplexity`, `claude`, `copilot`, `gemini`, `grok`, `openai`, `you`, `phind`, `meta_ai`)
- `landing_path` (e.g., `/packages/uganda/3-day-bwindi-gorilla-trekking/`)
- `referrer_host` (e.g., `chatgpt.com`, `perplexity.ai`, or empty when UTM-only)
- `utm_source` (e.g., `chatgpt.com` — automatically appended by ChatGPT Search)

To slice reports by these fields:
1. Go to **Admin → Data display → Custom definitions → Create custom dimension**.
2. Register event-scoped dimensions for `ai_source`, `landing_path`, and `referrer_host`.
3. View performance in **Reports → Engagement → Events → `ai_referral_landing`**, or build a **Free-form Exploration** with rows `ai_source` / `landing_path` and metrics `Event count`, `Sessions`, and key conversion events (inquiry / booking submissions).

### 1.3 Accounting for "Dark AI" Mobile Direct Traffic
Native mobile apps (ChatGPT, Claude, Perplexity, Gemini on iOS/Android) frequently strip the HTTP `Referer` header when opening links in an in-app browser, causing those visits to appear as **Direct** in GA4.

Mitigate blind spots by:
- **Deep-URL Direct Proxy:** Track **Direct** sessions whose landing page is a deep content URL (`/packages/*`, `/destinations/*`, `/hotels/*`, `/blog/*`) rather than `/` — spikes on specific itineraries often correlate with AI citations.
- **UTM Attribution:** Keep `utm_source=chatgpt.com` (and similar AI UTMs) unstripped across redirects; `detectAiReferrer()` captures these even when `document.referrer` is empty.
- **Self-Reported Attribution:** Include an optional *"How did you hear about Allbound Vacations?"* field on inquiry/booking forms with an explicit **"AI Assistant (ChatGPT / Perplexity / Google AI)"** option.

---

## 2. Google Search Console (GSC)

### 2.1 AI Overviews & AI Mode Monitoring
Google folds AI Overviews and AI Mode impressions/clicks into standard Web search performance in GSC. Monitor weekly/monthly:
- **Performance → Search results:** Filter by high-intent informational and comparison queries (e.g., `best time to trek gorillas in uganda`, `uganda vs rwanda gorilla trekking`, `kenya tanzania safari itinerary`, `allbound vacations`).
- **Impressions ↑ / CTR ↓ divergence:** Rising impressions with flat or declining CTR on informational blog/destination pages is the primary signal of AI Overview inclusion. Pair this with branded search volume (`allbound vacations`) and direct deep-page conversions.
- **Top cited page types:** Ensure destination guides, FAQ sections, and package pages maintain clear summary answers, structured data (`TouristTrip`, `FAQPage`, `Organization`), and up-to-date pricing/seasons.

### 2.2 Verifying Resolution of the 521 Redirect Exclusions
Allbounds normalized canonical URLs to trailing slashes and consolidated legacy `/countries/*` routes to `/destinations/*`. To confirm GSC clears the 521 "Page with redirect" exclusions:
1. Open **GSC → Indexing → Pages → Why pages aren't indexed → Page with redirect**.
2. Spot-check sample URLs with **URL Inspection** to confirm:
   - Non-trailing-slash URLs `301` cleanly to the trailing-slash canonical.
   - The trailing-slash canonical returns `200 OK` with a self-referencing `<link rel="canonical">`.
3. Open **GSC → Indexing → Sitemaps** and verify `https://allboundvacations.com/sitemap.xml` shows **Success** and only lists canonical trailing-slash `200 OK` URLs.
4. Click **Validate Fix** on the "Page with redirect" bucket and re-check after 14–28 days as Google recrawls.

---

## 3. Bing Webmaster Tools & IndexNow

Bing powers Microsoft Copilot and serves as a key discovery/grounding index for several AI assistants.

### 3.1 Claim Site & Submit Sitemap
1. Sign in to [Bing Webmaster Tools](https://www.bing.com/webmasters) and add `https://allboundvacations.com` (importing directly from verified GSC is fastest).
2. Submit `https://allboundvacations.com/sitemap.xml` under **Sitemaps**.

### 3.2 Configure IndexNow (One-Time Production Setup)
The backend already supports IndexNow via `INDEXNOW_KEY` and `INDEXNOW_ENABLED` (`backend/app/core/config.py`). To activate:
1. Generate a 32-character hex key:
   ```bash
   openssl rand -hex 16
   ```
2. Create the ownership verification file at `frontend/public/<INDEXNOW_KEY>.txt` containing **only** the key string (no extra text), and deploy the frontend so `https://allboundvacations.com/<INDEXNOW_KEY>.txt` returns `200 OK` with the key.
   - *(Note: `backend/app/main.py` also exposes `/{INDEXNOW_KEY}.txt` if that path is routed to the backend.)*
3. Set environment variables in the backend production environment:
   ```env
   INDEXNOW_KEY=<your-32-char-hex-key>
   INDEXNOW_ENABLED=true
   ```
4. Verify key file accessibility:
   ```bash
   curl -sI "https://allboundvacations.com/<INDEXNOW_KEY>.txt"
   ```

### 3.3 Monitor Bing AI Performance
- Check **Bing Webmaster Tools → AI Performance / Copilot** (as rolled out) for citation counts, grounding queries, and top cited pages.
- Review **IndexNow** submission logs and **Crawl Control / Crawl Information** monthly to confirm `0` 4xx/5xx crawl errors.

---

## 4. Cloudflare Dashboard & Edge Verification

### 4.1 WAF & AI Crawl Control
`frontend/public/robots.txt` explicitly allows AI search, citation, and training crawlers. Ensure Cloudflare does **not** override `robots.txt` with blocks or challenges:
1. In **Cloudflare Dashboard → Security → Bots / AI Crawl Control**:
   - Confirm **"Block AI Scrapers and Crawlers"** is **OFF** (or configured to **Allow** for search/citation bots).
   - Confirm the following verified bots are **Allowed** (not Challenged or Blocked):
     - OpenAI: `OAI-SearchBot`, `ChatGPT-User`, `GPTBot`
     - Anthropic: `Claude-SearchBot`, `Claude-User`, `ClaudeBot`
     - Perplexity: `PerplexityBot`, `Perplexity-User`
     - Google & Apple: `Googlebot`, `Google-Extended`, `Applebot`, `Applebot-Extended`
2. In **Security → Events**, filter by User-Agent / Bot category monthly and verify **200 OK** dominance vs **403 / 429 / 5xx** responses. Any `403` or `Managed Challenge` on `OAI-SearchBot`, `Claude-SearchBot`, or `PerplexityBot` should be whitelisted via a WAF Skip rule.

### 4.2 Edge Verification (`curl` Checks)
Run these checks after any Cloudflare Worker, Pages, or `robots.txt` deployment:

```bash
# 1. Verify /llms.txt is reachable and non-empty
curl -sI https://allboundvacations.com/llms.txt
curl -s https://allboundvacations.com/llms.txt | head -n 30

# 2. Verify Accept: text/markdown content negotiation
curl -sI -H "Accept: text/markdown" https://allboundvacations.com/
curl -s -H "Accept: text/markdown" https://allboundvacations.com/packages/ | head -n 40

# 3. Verify robots.txt allows AI bots and advertises Content-Signal + Sitemap
curl -s https://allboundvacations.com/robots.txt

# 4. Verify AI search bot User-Agents receive 200 OK (not 403/5xx)
for ua in "OAI-SearchBot/1.0" "Claude-SearchBot/1.0" "PerplexityBot/1.0" "GPTBot/1.2"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -A "$ua" https://allboundvacations.com/)
  echo "$ua -> HTTP $code"
done
```

---

## 5. Off-Site Entity & Authority Checklist

AI models triangulate brand trustworthiness from third-party citations and entity consistency. Keep the canonical entity details identical everywhere:

- **Canonical Name:** `Allbound Vacations`
- **Canonical URL:** `https://allboundvacations.com`
- **Email:** `bookings@allboundvacations.com`
- **Uganda Office (Kampala):** `+(256) 782 594 008`
- **Kenya Office (Nairobi):** `+(254) 723 927 458`
- **Social Profiles (`sameAs`):** `facebook.com/AllboundVacations`, `instagram.com/AllboundVacations`, `twitter.com/AllboundVacations`, `youtube.com/AllboundVacations`

### Priority Off-Site Profiles
- [ ] **Google Business Profile:** Claimed & verified listings for Kampala (Uganda) and Nairobi (Kenya) with matching phone numbers, website URL, safari/tour operator categories, photos, and active review responses.
- [ ] **Apple Business Connect:** Claimed brand & office locations (feeds Apple Maps, Siri, and Apple Intelligence).
- [ ] **TripAdvisor & SafariBookings:** Complete operator profile, linked to `https://allboundvacations.com`, with systematic post-trip client review requests.
- [ ] **Trustpilot:** Claimed profile with consistent brand description and review collection workflow.
- [ ] **Reddit:** Authentic, non-spammy expert answers (gorilla permit logistics, migration timing, Kampala/Nairobi transit tips) in `r/safari`, `r/Uganda`, `r/Kenya`, `r/travel`, and `r/Africa` — Reddit is heavily weighted in AI search grounding.
- [ ] **YouTube Transcripts:** Publish destination/itinerary walkthroughs on `@AllboundVacations` with clean spoken scripts, accurate captions/transcripts, and canonical links to matching `/packages/` and `/destinations/` pages.
- [ ] **East African Tourism Boards & Trade Directories:** Ensure active directory listings with backlinks to `https://allboundvacations.com` on:
  - Uganda Tourism Board (UTB) & Association of Uganda Tour Operators (AUTO)
  - Kenya Tourism Board (Magical Kenya) & Kenya Association of Tour Operators (KATO)

---

## 6. Quarterly AI Prompt Audit Template

Run this audit once per quarter (incognito / logged-out sessions where possible) across **ChatGPT (Search)**, **Perplexity**, **Claude**, **Google AI Overviews / AI Mode**, and **Bing Copilot**.

| Quarter | Prompt | Engine | Allbounds Cited? (Y/N) | Cited URL | Accuracy / Pricing / Office Info Correct? | Competitors Cited | Action Item |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| YYYY-Q# | "Best East Africa tour operators based in Kampala and Nairobi" | ChatGPT / Perplexity / Claude / Google / Copilot | | | | | |
| YYYY-Q# | "Best tour operator for Bwindi gorilla trekking in Uganda" | ChatGPT / Perplexity / Claude / Google / Copilot | | | | | |
| YYYY-Q# | "Tailor-made Kenya and Tanzania Great Migration safari packages" | ChatGPT / Perplexity / Claude / Google / Copilot | | | | | |
| YYYY-Q# | "Luxury Uganda gorilla trekking and Masai Mara combo itinerary" | ChatGPT / Perplexity / Claude / Google / Copilot | | | | | |
| YYYY-Q# | "Scheduled group trips to East Africa and Zanzibar" | ChatGPT / Perplexity / Claude / Google / Copilot | | | | | |
| YYYY-Q# | "What is Allbound Vacations and is it legitimate?" (Brand entity check) | ChatGPT / Perplexity / Claude / Google / Copilot | | | | | |

### Quarterly Review Cadence
1. **Export GA4** `AI Search / Assistants` channel sessions, `ai_referral_landing` counts by `ai_source`, and conversion rate.
2. **Check GSC** redirect exclusion count (confirm trending to `0`) and AI-heavy informational query trends.
3. **Check Cloudflare** AI bot 200 vs 4xx/5xx ratio and run the `curl` verification block above.
4. **Complete the Prompt Audit table** and update weak destination/package pages or off-site profiles where competitors outrank or facts are outdated.
