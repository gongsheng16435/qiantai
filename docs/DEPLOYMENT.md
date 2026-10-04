# Deployment status

The GitHub Actions Pages workflow is configured in `.github/workflows/pages.yml` with a frozen npm installation, TypeScript/Vite build, artifact upload, and deployment job. Hash routes and relative assets have been verified against the production build served under `/qiantai/`.

Expected destination: `https://gongsheng16435.github.io/qiantai/`.

The cloud environment can read this repository through its injected HTTPS Git proxy. Direct requests to `api.github.com` and `gongsheng16435.github.io` returned egress proxy HTTP 403. Their network requirements have been saved in the environment configuration draft; the draft does not apply runtime access by itself. No token values are needed in chat.

Before the first deployment, select **Settings → Pages → Build and deployment → Source: GitHub Actions**. Then the workflow can deploy on a push to `main`, or be dispatched from the Actions tab. The successful deployment job supplies the authoritative published URL. A live deployment has not yet been confirmed from this environment.
