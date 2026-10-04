# LUMEN — Codex Cloud Build Brief

## Goal
Turn this starter into a production-quality personal game library whose visual language is influenced by Apple product pages and Apple TV: content-first, cinematic, minimal, spacious, motion-led, and never dashboard-like.

## Non-negotiable visual rules
- Artwork is the visual center. UI chrome recedes.
- Use huge editorial typography and generous negative space.
- Prefer full-bleed sections and deliberate composition over grids of generic cards.
- Glass/translucency is secondary material, not the whole design.
- Motion should feel inertial and calm: 300–900ms, restrained spring/easing, no flashy bounce.
- Alternate dark cinematic sections with warm white editorial sections.
- Avoid purple SaaS gradients, neon borders, excessive pills, generic analytics widgets, and AI-dashboard styling.
- Keep a strong Apple-like information hierarchy without copying Apple trademarks, product assets, or exact page layouts.

## Phase 1 — Finish the visual prototype
1. Install dependencies and run the project.
2. Fix TypeScript/runtime/responsive issues.
3. Improve hero image crossfades and ambient color transitions.
4. Add scroll-linked motion to the statement and timeline sections.
5. Add refined loading/skeleton behavior.
6. Make keyboard navigation work across rails with Left/Right + Enter.
7. Add Cmd/Ctrl+K search overlay.

## Phase 2 — Build real pages
Implement:
- Home
- Library
- Game detail
- Statistics
- Timeline

The Library must feel like an Apple editorial collection, not a Steam clone. Hide complexity by default.

## Phase 3 — Artwork/provider architecture
Create provider adapters:
- local
- steam
- rawg
- igdb

Default demo must continue to work with local/mock data and no credentials. Add documented local artwork overrides under public/games/<id>/.

## Phase 4 — Personal archive features
Add:
- favorite
- status
- personal score
- playtime
- completedAt
- notes
- collections
- firstPlayedAt
- lastPlayedAt

Persist demo edits locally first. No backend yet.

## Phase 5 — TV mode
Create a full-screen TV mode:
- larger type and covers
- keyboard/controller-oriented focus
- directional navigation
- minimal text
- cinematic background

## Quality gate
Before considering a phase complete:
- Run the app.
- Inspect Home at 1440×900, 1920×1080, and mobile width.
- Remove visual clutter.
- Ensure no obvious layout shifts.
- Ensure keyboard focus is visible.
- Ensure motion respects prefers-reduced-motion.
- Update README with screenshots and architecture notes.

Do not stop at functional. Iterate on typography, spacing, image crops, layering, and transition timing until the UI feels cohesive and premium.
