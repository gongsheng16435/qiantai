# LUMEN repository instructions

This repository is a visual product prototype. Preserve a premium Apple-inspired editorial feel while keeping the identity original.

## Read when relevant
- Read CODEX_BRIEF.md before substantial UI/UX work.
- Read README.md for current architecture and run commands.

## Working rules
- Keep the interface content-first and cinematic; UI chrome must recede.
- Prefer large typography, strong image composition, whitespace, and calm motion over dense controls.
- Do not copy Apple trademarks, copyrighted Apple imagery, or exact layouts.
- Do not introduce a backend until the local-first prototype is visually complete.
- Keep demo mode usable without API keys.
- When adding external artwork/providers, preserve a local fallback.
- Respect prefers-reduced-motion and visible keyboard focus.

## Validation
For UI changes, run:
1. npm run build
2. npm run dev -- --host 0.0.0.0
3. Inspect desktop and mobile layouts if browser tooling is available.
