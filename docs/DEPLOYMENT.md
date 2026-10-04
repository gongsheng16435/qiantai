# Deployment status

**Live site: https://gongsheng16435.github.io/qiantai/**

The initial publication succeeded in [GitHub Actions run 37234920696](https://github.com/gongsheng16435/qiantai/actions/runs/37234920696). The current release is available at the live site above; [the workflow history](https://github.com/gongsheng16435/qiantai/actions/workflows/pages.yml) records subsequent deployments. The repository is configured to use GitHub Actions for Pages. Future application pushes to `main` trigger the same workflow; it can also be started manually from [Actions](https://github.com/gongsheng16435/qiantai/actions/workflows/pages.yml).

## Verified on the published site

- HTTPS returned HTTP 200 with certificate verification enabled.
- The home page and locally bundled hero photograph loaded.
- Cmd/Ctrl+K search opened the selected game's detail page.
- Direct hash links to Library, Timeline, Statistics, and TV mode loaded successfully.
- Mobile navigation opened the 20-game library with no horizontal overflow.
- Chromium reported no JavaScript exceptions or failed HTTP resources during these checks.

The cloud environment can now access the GitHub API and Pages host. Its HTTPS proxy CA was explicitly trusted for the Chromium validation session; TLS verification was not disabled.

## Deployment structure

`.github/workflows/pages.yml` runs a frozen `npm ci` installation and `npm run build`, configures Pages, uploads `dist`, and deploys with the official GitHub Pages actions. Relative Vite assets and hash routing support the `/qiantai/` project path without server rewrites.

To change deployment settings, use [Settings → Pages](https://github.com/gongsheng16435/qiantai/settings/pages). No API credentials are required by the deployed application. Personal records remain in localStorage on each visitor's browser and are not sent to GitHub.
