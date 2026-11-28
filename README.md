# Wei Xia — Personal Website (`ericwxia.xyz`)

Standalone, zero-cost static website replacing Wix for **https://www.ericwxia.xyz/**. All text, press & research links, essays, vector figures, photography, background audio, and music videos (`Romantic Earth`, `风味角落`) are bundled locally under `assets/` with zero runtime dependency on Wix servers.

## Directory Layout

```text
ericwxia-website/
├── index.html                          # Minimalist Zen homepage (bio, portrait, Scholar, 3 media highlights, 2 recent writings)
├── media/index.html                    # Media Coverage (8 features across Gemini, YouTube, Meet, Voice Search, Google AI, Pixel, ML science)
├── blog/index.html                     # Blog index with category/search filter & interactive 5-heart likes
├── blog/categories/随笔/index.html     # Category route parity
├── personal/index.html                 # Personal bio & oil canvas artwork
├── post/romantic-earth-v-0-1/index.html# Essay 1 + HTML5 MV + SVG Figures 1–2 + Eq. 1 + Table 1 + right-margin TOC
├── post/纽约风味角落/index.html         # Essay 2 + 风味角落 audio bar & full-width 4:3 MV + 15-photo NYC gallery & lightbox
├── post/ny-flavor-corners/index.html   # Clean ASCII alias for Essay 2
├── blog-feed.xml                       # RSS 2.0 feed preserving Wix blog feed URL
├── 404.html                            # Custom 404 page
├── CNAME                               # Custom domain for GitHub Pages (www.ericwxia.xyz)
├── _headers                            # Strict CSP & cache headers (Cloudflare Pages / Netlify)
├── sitemap.xml                         # Search engine sitemap
├── .github/workflows/deploy.yml        # Automated GitHub Pages deployment workflow
└── assets/
    ├── css/styles.css                  # Soft dimmed-graphite dark design system (#24262b)
    ├── js/main.js                      # Audio player, blog likes, search/category filter, TOC spy, lightbox
    ├── images/                         # Optimized portrait & 15 NYC gallery photos (5.0 MB total)
    └── media/                          # romantic-earth-mv.mp4, nyc-flavor-mv.mp4, & nyc-flavor-bgm.mp3
```

## Local Preview

```bash
# Bound strictly to localhost (127.0.0.1) for local verification:
python3 -m http.server 8765 --bind 127.0.0.1
```

## Free Hosting & Leaving Wix ($0/month)

### Option A: GitHub Pages (Recommended)

1. Create a public repository named **`ericwxia.github.io`** at `https://github.com/new` under your `ericwxia` account (leave it empty — do not initialize with a README).
2. Push this directory (`origin` is already configured to `https://github.com/ericwxia/ericwxia.github.io.git`):
   ```bash
   cd ~/Projects/ericwxia-website
   git push -u origin main
   ```
3. In **https://github.com/ericwxia/ericwxia.github.io/settings/pages**:
   - Under **Build and deployment**, set **Source** to **GitHub Actions** (uses `.github/workflows/deploy.yml`).
   - Within ~1 minute, verify the live preview at **https://ericwxia.github.io/**.
   - After updating NameSilo DNS below, enter **`www.ericwxia.xyz`** under **Custom domain**, click **Save**, and enable **Enforce HTTPS** once the certificate finishes provisioning.

### Option B: Cloudflare Pages

1. Connect the GitHub repo (or upload via `npx wrangler pages deploy .`) in the Cloudflare Dashboard under **Workers & Pages**.
2. Build command: *(leave blank)* · Build output directory: `/`.
3. Add custom domains `ericwxia.xyz` and `www.ericwxia.xyz` (`_headers` automatically applies strict CSP and 1-year asset caching).

### Step-by-Step DNS Cutover (NameSilo → GitHub Pages / Cloudflare) & Cancelling Wix

`ericwxia.xyz` is already registered at **NameSilo** (not Wix); Wix only hosts its nameservers (`ns10.wixdns.net`, `ns11.wixdns.net`), and there are no MX email records on the domain.

1. **Switch Nameservers at NameSilo**:
   - Log in to **NameSilo → Domain Manager**, select `ericwxia.xyz`, and click **Change Nameservers**.
   - Replace `ns10.wixdns.net` / `ns11.wixdns.net` with NameSilo's default nameservers (`ns1.dnsowl.com`, `ns2.dnsowl.com`, `ns3.dnsowl.com`) — or Cloudflare's nameservers if using Cloudflare Pages.
2. **Add GitHub Pages DNS Records** (in NameSilo **Manage DNS**):
   - `CNAME` record: `www` → `ericwxia.github.io`
   - Four `A` records for `@` (`ericwxia.xyz`):
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
3. **Cancel Wix Premium Plan**:
   - Once `https://www.ericwxia.xyz` loads from GitHub Pages / Cloudflare Pages with HTTPS active, open **Wix Account Settings → Subscriptions**, select your **Website Plan**, and click **Cancel Plan** to stop recurring monthly charges.
