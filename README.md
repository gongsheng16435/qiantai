# LUMEN — Personal Game Library

A little space for the worlds you love. A cinematic, local-first game archive with an original photographic identity, warm editorial typography, and quiet motion.

![LUMEN Discover on desktop](docs/screenshots/home-desktop.png)

## Run

Use Node **24** (tested with 24.19.0) and npm. No API keys, database, environment variables, or remote artwork service are required.

```bash
npm ci
npm run dev -- --host 0.0.0.0
```

```bash
npm run build     # TypeScript check followed by production build
npm run preview   # Serve the production output locally
```

`codex-cloud-setup.sh` installs from the committed lockfile and builds from the repository directory. Dependencies are pinned. `src/vite-env.d.ts` includes the Vite asset declarations required by TypeScript.

## The experience

- **Discover** — full-screen photography, three selectable featured worlds with crossfades, scroll-linked depth, recently played and favorite rails, curated collections, and editorial storytelling.
- **Library** — all 20 games, text search, favorites, genre/platform/status/collection filters, and sorting by recent activity, title, personal score, playtime, or release year. Collection links and favorite views have shareable hash routes.
- **Game detail** — cinematic artwork, metadata, editable status, personal score, playtime, first/last-played and completion dates, notes, and collections. The gallery opens a navigable lightbox.
- **Timeline** — personal history grouped by the year first played, with undated entries kept visible. Quiet image movement follows scrolling.
- **Statistics** — live totals, finished stories, favorites, average score, platform and genre breakdowns, score ranges, and release years. All figures derive from the same editable archive.
- **TV mode** — a focused, full-window experience with large imagery, a directional cover rail, an optional browser fullscreen control, and standard-mapped gamepad support.

Every default photograph is bundled locally. The demo uses atmospheric photographs and original typographic covers, **not official game screenshots**. The detail gallery labels this clearly. See [artwork sources and licensing](docs/ARTWORK.md).

![Library](docs/screenshots/library-desktop.png)

<details>
<summary>Mobile view</summary>
<img src="docs/screenshots/home-mobile.png" width="390" alt="LUMEN Discover on a phone" />
</details>

## Controls and accessibility

| Control                    | Behavior                                                |
| -------------------------- | ------------------------------------------------------- |
| Cmd/Ctrl + K               | Open or close global search                             |
| Up / Down in search        | Select a result                                         |
| Enter in search            | Open the selected game                                  |
| Left / Right on a cover    | Move between covers                                     |
| Home / End on a cover      | First / last cover in the rail                          |
| Enter on a cover           | Open game detail                                        |
| Escape                     | Close the current dialog; return from detail or TV mode |
| Up / Down in TV mode       | Move between the selected game action and the rail      |
| Gamepad D-pad / left stick | Browse in TV mode                                       |
| Gamepad A / B              | Open game / leave TV mode                               |

The interface includes a skip link, visible focus indicators, semantic form controls, modal focus containment and restoration, live save feedback, and `prefers-reduced-motion` support. Reduced motion removes parallax, entrance movement, crossfade timing, and smooth scrolling. Fullscreen depends on the browser allowing it; the full-window TV layout remains usable without it. Gamepad hardware was not available for physical-device validation.

## Personal data

Changes are stored under **`lumen.archive.v1` in localStorage**, scoped to the browser and site origin. Favorites, notes, collections, scores, hours, statuses, and dates survive reloads. There is no sign-in, tracking, backend, or cloud sync. Browser private mode or storage restrictions may prevent persistence; the UI reports that situation. Clearing this key restores the bundled demo archive. Moving from a local server to GitHub Pages creates a separate archive because the origin changes.

The initial collection and personal dates are illustrative demo data. Editing them updates the Library, Timeline, and Statistics views immediately.

## Structure

```text
src/
  App.tsx                 Hash routing, navigation, search shortcut, save feedback
  components/
    ui.tsx                Artwork fallback, covers, rails, reveal, accessible modal
    Search.tsx            Keyboard-navigable command search
  pages/
    Home.tsx              Discover and editorial collections
    Library.tsx           Search, filters, sorting, favorites
    Detail.tsx            Personal record editor and gallery
    Timeline.tsx          History grouped by personal dates
    Statistics.tsx        Archive-derived consumer statistics
    TV.tsx                Directional navigation and fullscreen
  data/games.ts           Typed 20-game demo dataset
  lib/archive.ts          Local persistence, field normalization, routing helpers
  lib/providers.ts        Local / Steam / RAWG / IGDB artwork adapters
  styles/global.css       Visual system, responsive layouts, reduced motion
public/
  artwork/                Bundled photographs
  games/manifest.json     Optional per-game artwork overrides
```

React + TypeScript + Vite, Framer Motion, and Lucide icons. Pages are loaded lazily. Routing uses `#/library`, `#/game/journey`, etc., so GitHub Pages deep links need no server rewrite. Vite uses a relative asset base, including when deployed below `/qiantai/`.

## Replace the artwork

Put authorized images under `public/games/<id>/`, then edit `public/games/manifest.json`:

```json
{
  "journey": {
    "hero": "games/journey/hero.jpg",
    "cover": "games/journey/cover.jpg",
    "screenshots": ["games/journey/scene-1.jpg", "games/journey/scene-2.jpg"]
  }
}
```

Paths are relative to the deployed site, so the same manifest works locally and on GitHub Pages. HTTPS image URLs are also accepted. Missing or failed images use a bundled local fallback. Omitted fields retain the default artwork. The manifest is loaded at startup.

`steamProvider(endpoint)`, `rawgProvider(endpoint)`, and `igdbProvider(endpoint)` expose an `ArtworkProvider.resolve(id, signal)` interface. They normalize provider-shaped responses from a **same-origin gateway**, requested with `?id=...`. Steam accepts its `appdetails` response, RAWG accepts a game response with `short_screenshots` or `screenshots`, and IGDB accepts its game response with expanded cover/artwork/screenshot `image_id` values. Keep API credentials in that future gateway, never in this client or a public environment variable. The static demo only invokes the local provider; live third-party integrations are extension points and have not been validated against credentialed services.

## GitHub Pages

The workflow in [`.github/workflows/pages.yml`](.github/workflows/pages.yml) installs with `npm ci`, builds, uploads `dist`, and deploys through GitHub's official Pages actions. It runs on pushes to `main` or a manual **Run workflow**.

1. In the repository's **Settings → Pages**, select **GitHub Actions** as the build/deployment source. Repository admin access may be required for this initial setting.
2. Push the finished source to `main`, or run **Deploy LUMEN to GitHub Pages** from Actions after the workflow reaches the default branch.
3. Wait for the deployment job to succeed. Its `github-pages` environment contains the confirmed deployment URL.

The expected project URL is **https://gongsheng16435.github.io/qiantai/**. This is the deployment target, not a claim that publication has succeeded. Setup-time requests to the GitHub API and this host were blocked by the cloud egress proxy (403); the network requirements have been saved in the cloud configuration draft. Activation and online verification require that access or the repository settings UI. [Deployment status](docs/DEPLOYMENT.md) records the actual result of the cloud run.

## Validation performed

- Frozen install (`npm ci`) and `npm run build`: passed.
- Chromium interactions: featured-artwork switching; Cmd/Ctrl+K and Enter search; editing then reloading notes, status, hours and score; favorites; all filter types and sorting; empty results; gallery open/close; cover arrows; TV arrows, Enter and Escape; mobile navigation; reduced motion.
- All six routes inspected at **1440×900, 1920×1080, and 390×844**, with no broken local images or document horizontal overflow.
- The built output was served under **`/qiantai/`** and the functional checks repeated, including direct hash-route loads. No browser JavaScript errors were recorded.
- Physical gamepad hardware, credentialed provider APIs, and successful live Pages deployment are separate from these local checks.
