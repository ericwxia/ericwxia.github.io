# Wei Xia — Personal Website (`ericwxia.xyz`)

Standalone, zero-cost static website replacing Wix for **https://www.ericwxia.xyz/**. All text, external press links, essays, figures, photography, AI song (`Caffeine Mode`), and music video (`Romantic Earth`) are bundled locally under `assets/` with zero runtime dependency on Wix servers.

## Directory Layout

```text
ericwxia-website/
├── index.html                          # Home (bio, contact, portrait, highlights)
├── media/index.html                    # Selected Media Coverage (7 features)
├── blog/index.html                     # Blog index with category & search filter
├── blog/categories/随笔/index.html     # Category route parity
├── personal/index.html                 # Personal bio & places lived
├── post/romantic-earth-v-0-1/index.html# Essay 1 + HTML5 MV + Figures 1-2 + Eq. 1 + Table 1
├── post/纽约风味角落/index.html         # Essay 2 + Caffeine Mode audio + 15-photo NYC gallery
├── post/ny-flavor-corners/index.html   # Clean ASCII alias for Essay 2
├── 404.html                            # Custom 404 page
├── CNAME                               # Custom domain for GitHub Pages (www.ericwxia.xyz)
├── _headers                            # Security & cache headers (Cloudflare Pages / Netlify)
├── sitemap.xml                         # Search engine sitemap
├── .github/workflows/deploy.yml        # Automated GitHub Pages deployment workflow
└── assets/
    ├── css/styles.css                  # Editorial design system (Light & Dark themes)
    ├── js/main.js                      # Theme toggle, audio player, search, lightbox
    ├── images/                         # Optimized portraits, figures, and NYC gallery photos
    └── media/                          # romantic-earth-mv.mp4 (14.7 MB) & caffeine-mode.mp3
```

## Local Preview

```bash
# Bound strictly to localhost (127.0.0.1) for local verification:
python3 -m http.server 8765 --bind 127.0.0.1
```

## Free Hosting & Leaving Wix ($0/month)

### Option A: GitHub Pages (Recommended)

1. Create a public repository on GitHub (e.g., `ericwxia/ericwxia.github.io` or `ericwxia/website`).
2. Push this directory:
   ```bash
   cd ~/Projects/ericwxia-website
   git remote add origin git@github.com:<YOUR_GITHUB_USERNAME>/<REPO_NAME>.git
   git push -u origin main
   ```
3. In GitHub **Settings → Pages**:
   - Under **Build and deployment**, set **Source** to **GitHub Actions** (uses `.github/workflows/deploy.yml`).
   - Confirm **Custom domain** shows `www.ericwxia.xyz` and check **Enforce HTTPS** once DNS propagates.

### Option B: Cloudflare Pages

1. Connect the GitHub repo (or upload this folder via `npx wrangler pages deploy .`) in the Cloudflare Dashboard under **Workers & Pages**.
2. Build command: *(leave blank)* · Build output directory: `/`.
3. Add custom domains `ericwxia.xyz` and `www.ericwxia.xyz` (the `_headers` file automatically configures CSP, clickjacking protection, and 1-year asset caching).

### Step-by-Step DNS Cutover & Cancelling Wix

1. **Check where `ericwxia.xyz` is registered** (`whois ericwxia.xyz`):
   - **If registered externally** (Namecheap, Porkbun, Spaceship, Squarespace/Google Domains, Cloudflare): replace the Wix nameservers (`ns*.wixdns.net`) with your registrar's default DNS (or Cloudflare's free DNS).
   - **If purchased directly inside Wix**: in **Wix Dashboard → Domains**, either point DNS records away or click **Transfer Away from Wix** to move the domain to Cloudflare Registrar / Porkbun (~$10–$12/yr at wholesale cost) *before* turning off domain auto-renew.
2. **Set DNS records** (for GitHub Pages):
   - `CNAME` record: `www` → `<YOUR_GITHUB_USERNAME>.github.io`
   - Four `A` records for `@` (`ericwxia.xyz`):
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
3. **Cancel Wix Premium Subscription**:
   - Once `https://www.ericwxia.xyz` loads from GitHub Pages / Cloudflare Pages with HTTPS active, go to **Wix Account Settings → Subscriptions**, select your **Website Plan**, and click **Cancel Plan** to stop recurring monthly charges.
