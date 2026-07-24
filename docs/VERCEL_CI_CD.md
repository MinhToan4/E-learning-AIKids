# Vercel CI/CD

## One-time repository setup

1. Open Vercel **Account Settings → Tokens**.
2. Create a token named `github-aikid-deploy`.
3. Open GitHub repository **Settings → Secrets and variables → Actions**.
4. Create a repository secret:

   - Name: `VERCEL_TOKEN`
   - Value: the Vercel token created above

Do not commit the token or send it to another developer.

## Developer workflow

1. Create a feature branch and push changes.
2. Open a pull request. `Frontend CI` runs tests and the production build.
3. For a preview deployment, open **Actions → Deploy Vercel → Run workflow**,
   select the feature branch and choose `preview`.
4. Merge or push the approved changes into
   `codex/storymee-backend-integration` only after CI and preview pass.
5. A push to `codex/storymee-backend-integration` automatically deploys production to
   `https://app.aikid.vn`.

An authorized repository developer may also run **Deploy Vercel** manually and
choose `production`. The Vercel account password and token are never shared with
the developer.

## Avoid duplicate deployments

If Vercel Git Integration is also connected to this repository, either disable
its automatic deployments or remove the Git connection. Otherwise a push to
`codex/storymee-backend-integration` can create one deployment from Vercel Git
and another from GitHub Actions.

## Change the backend URL

Update `VITE_API_BASE_URL` in the Vercel project environment settings for both
Preview and Production. The workflow pulls those settings before every build.
