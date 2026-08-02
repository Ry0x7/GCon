# Deploy GCon with GitHub Pages, Render, and Neon

The production layout is:

- **GitHub Pages** serves the Vite frontend.
- **GitHub Actions** runs CI and deploys the frontend.
- **Render** runs the containerized Flask API and commit generator.
- **Neon** stores users, encrypted GitHub tokens, and statistics.

## 1. Create the Neon Database

1. Create a project at [console.neon.tech](https://console.neon.tech/).
2. Open **Connect** and select the pooled connection option.
3. Copy the PostgreSQL connection string, including `sslmode=require`.
4. Save it for Render as `DATABASE_URL`.

The Render container runs `backend/init_db.py` when it starts, so initial tables are created automatically.

## 2. Determine the Frontend URL

For a repository named `GCon`, the standard Pages URL is:

```text
https://YOUR_GITHUB_USERNAME.github.io/GCon
```

Use this complete URL, including `/GCon`, as Render's `FRONTEND_URL`.

## 3. Create the GitHub OAuth App

Open [GitHub Developer Settings](https://github.com/settings/developers), select **OAuth Apps**, and create an app with:

```text
Homepage URL: https://YOUR_GITHUB_USERNAME.github.io/GCon
Callback URL: https://YOUR_RENDER_SERVICE.onrender.com/auth/github/callback
```

The Render URL may not be known yet. You can initially use `http://localhost:5000/auth/github/callback`, create the Render service, and then edit the OAuth app with the final Render URL.

Copy the OAuth Client ID and generate a Client Secret.

## 4. Deploy the Backend to Render

1. In Render, select **New > Blueprint**.
2. Connect this GitHub repository.
3. Render detects `render.yaml` and builds `backend/Dockerfile`.
4. Supply the prompted environment variables:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Neon pooled connection string |
| `GITHUB_CLIENT_ID` | OAuth app Client ID |
| `GITHUB_CLIENT_SECRET` | OAuth app Client Secret |
| `FERNET_SECRET_KEY` | Fernet encryption key |
| `FRONTEND_URL` | Full Pages URL, including repository path |
| `GITHUB_CALLBACK_URL` | Render URL plus `/auth/github/callback` |

Generate the Fernet key locally:

```powershell
cd backend
uv run python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

The Blueprint generates `JWT_SECRET_KEY` and `FLASK_SECRET_KEY` automatically.

After Render assigns its final `onrender.com` URL:

1. Set `GITHUB_CALLBACK_URL` to the final HTTPS URL plus `/auth/github/callback`.
2. Set the OAuth app callback URL to the exact same value.
3. Redeploy the Render service.
4. Confirm `https://YOUR_RENDER_SERVICE.onrender.com/api/health` returns `{"status":"ok"}`.

Free Render services sleep after 15 minutes of inactivity and can take about a minute to wake.

The included `Keep Render backend warm` workflow calls `/api/health` every 10 minutes using `VITE_API_URL` from the `gcon` environment. You can also run it manually from the Actions tab. Scheduled Actions are best-effort and can be delayed or disabled after prolonged repository inactivity; a paid Render instance is the only guaranteed always-on option.

## 5. Configure GitHub Pages

In the GitHub repository:

1. Open **Settings > Environments** and create or open the `gcon` environment.
2. Add an environment variable named `VITE_API_URL` with the Render origin only:

```text
https://YOUR_RENDER_SERVICE.onrender.com
```

3. Open **Settings > Pages**.
4. Under **Build and deployment**, select **GitHub Actions** as the source.
5. Run the **Deploy frontend to GitHub Pages** workflow, or push to `main`/`master`.

The workflow builds with `/<repository-name>/` as Vite's base path and creates a `404.html` fallback so OAuth redirects to `/select-dates` still load the application.

For a custom domain or a `USERNAME.github.io` repository, add an Actions variable named `VITE_BASE_PATH` with the value `/`.

## 6. Verify Production

1. Open the Pages URL.
2. Select **Sign In** and approve the GitHub OAuth request.
3. Confirm GitHub redirects through Render and back to the Pages dashboard.
4. Stamp a small template and submit it.
5. Confirm `gcon-contributions` is created and receives the requested commits.

## Updating

- Frontend changes are tested and deployed by GitHub Actions.
- Backend changes are tested by GitHub Actions and automatically deployed by Render.
- Neon persists independently of both deployments.
