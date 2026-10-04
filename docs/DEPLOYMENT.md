# Deployment status

The complete source and Pages workflow were pushed to `main` in commit `d11cde1`.

[The first GitHub Actions run](https://github.com/gongsheng16435/qiantai/actions/runs/37234680112) reached `actions/configure-pages` after dependency installation and the production build, then failed because this repository does not yet have a Pages site. GitHub reported:

> Get Pages site failed. Please verify that the repository has Pages enabled and configured to build using GitHub Actions. Error: Not Found.

The installation and application build are not the deployment blocker. The site must first be enabled in repository settings.

## Finish the initial activation

1. Open [Settings → Pages](https://github.com/gongsheng16435/qiantai/settings/pages).
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Open the [deployment workflow](https://github.com/gongsheng16435/qiantai/actions/workflows/pages.yml), select **Run workflow**, and choose `main`.
4. Wait for both jobs to finish successfully. The `github-pages` environment will report the final URL.

Expected destination: **https://gongsheng16435.github.io/qiantai/**. This URL has not been verified live.

The cloud environment's injected HTTPS Git access successfully pushed the project and allowed the public workflow summary to be inspected. Direct requests to `api.github.com` and `gongsheng16435.github.io` returned egress proxy HTTP 403. Their network requirements are saved in the environment configuration draft; saving that draft does not apply runtime access by itself.

The official `configure-pages@v5` action documents that automatic enablement requires a token other than `GITHUB_TOKEN`, with Pages/admin authority. The workflow therefore does not pretend it can auto-enable a repository using its ordinary Actions token. No new credentials are needed if an authorized repository user enables Pages in Settings.

The production build was separately validated under `/qiantai/`, including asset loading, direct hash routes, personal editing, search, filters, and TV navigation. Once Pages is enabled, future pushes to `main` deploy automatically.
