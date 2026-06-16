# Bing Webmaster And IndexNow Access

_Last updated: 2026-06-15 by Codex._

Trusted Bums uses Bing Webmaster Tools, the public sitemap, and IndexNow to help Microsoft discover and report on public pages. Bing traffic reports are search-performance reports: if Bing shows zero traffic, that can mean the site has no Bing impressions or clicks yet, even when indexing is technically working.

## Current Public Setup

- Site: `https://trustedbums.com/`
- Bing verification meta tag: `F262EC5D731F39A7B9C8912DF741F807`
- Sitemap: `https://trustedbums.com/sitemap.xml`
- Robots: `https://trustedbums.com/robots.txt`
- IndexNow key file: `https://trustedbums.com/c6e13fa24dba32bdab55120a5dab7df3.txt`

## Local Checks

Run the public Bing health check:

```bash
pnpm bing:health
```

This verifies that production serves:

- homepage `200`
- Bing verification meta tag
- `robots.txt` with the sitemap directive
- XML sitemap
- IndexNow key file with the expected key

Submit current public URLs to IndexNow:

```bash
pnpm bing:indexnow
```

IndexNow success means Bing received the URL list. It does not guarantee that Bing will immediately rank, show impressions for, or send traffic to those URLs.

## Bing Webmaster API

The API key is generated inside Bing Webmaster Tools. The current Trusted Bums key is stored locally outside git at `.secrets/bing-webmaster.env` and in GitHub Actions as:

```bash
BING_WEBMASTER_API_KEY=
```

Optional site override:

```bash
BING_SITE_URL=https://trustedbums.com
```

Submit the sitemap through Bing Webmaster API:

```bash
pnpm bing:webmaster submit-feed
```

Submit all public route URLs through Bing Webmaster API:

```bash
pnpm bing:webmaster submit-urls
```

Pull Bing rank and traffic stats:

```bash
pnpm bing:webmaster traffic
```

If `traffic` returns zero rows or rows with zero impressions/clicks, the likely issue is demand/content performance, not crawler setup. Check Bing Webmaster Tools Site Explorer, URL Inspection, Search Performance, IndexNow Insights, and SEO reports before treating this as a technical failure.

## Deploy Automation

The DreamHost deploy workflow now:

1. Verifies production crawler assets.
2. Submits public URLs to IndexNow.
3. Submits the sitemap and public URLs through Bing Webmaster API when `BING_WEBMASTER_API_KEY` is configured in GitHub Secrets.

## Agent Rules

- Use `pnpm bing:health` before diagnosing Bing reporting as broken.
- Use `pnpm bing:indexnow` after public metadata, sitemap, or route changes.
- Use `pnpm bing:webmaster traffic` for aggregate Bing impressions and clicks when the API key is available.
- Do not commit the Bing Webmaster API key or export private Bing dashboard data into repo docs.

## References

- Microsoft says the Bing Webmaster API can access rank and traffic stats, link details, keyword details, crawl stats, and submit URLs or sitemaps.
- Microsoft documents `SubmitFeed` for sitemap/feed submission and `SubmitUrlBatch` for URL batches.
- Bing IndexNow setup requires a generated key, a hosted key file, URL submission, and verification in Bing Webmaster Tools.
