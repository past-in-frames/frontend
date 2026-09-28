# Past In Frames — site

Next.js App Router front end. Readers arrive from social links to read a single
story, so every public page is prerendered and revalidated in the background
rather than rendered per request.

## Running locally

The site reads from the API, so start the backend (and its database tunnel)
first — see `../backend/README.md`.

```bash
cp .env.example .env.local
npm install
npm run dev   # http://localhost:3022
```

| Variable               | Purpose                                                  |
| ---------------------- | -------------------------------------------------------- |
| `API_URL`              | Backend origin. Server-side only; the browser never sees it |
| `NEXT_PUBLIC_SITE_URL` | Public origin used for canonical URLs, sitemap and social cards |

## Structure

- `src/app/(site)/` — reader-facing pages. The group layout renders the header
  and footer once and loads the category list for the navigation.
- `src/app/admin/` — the editor. Outside the `(site)` group so it never gets the
  public chrome, and excluded from indexing.
- `src/app/api/admin/` — thin proxies that attach the session cookie to API
  calls, so the token stays httpOnly and never reaches client JavaScript.
- `src/lib/api.ts` — the only place that talks to the backend. Marked
  `server-only`.

## URLs

A story lives at `/category/<category>/<slug>`. Categories are free text in the
database and slugified for the URL, so reaching a story through the wrong
category returns 404 and each story keeps one canonical address.

## Publishing

Only stories with status `published` appear on the site, in the sitemap and in
the navigation. Drafts are visible in the admin dashboard only.
