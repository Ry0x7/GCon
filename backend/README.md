# GCon Backend

The Flask API handles GitHub OAuth, encrypted token storage, commit generation, and aggregate statistics.

## Environment

- `GITHUB_CLIENT_ID`: GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth app client secret
- `DATABASE_URL`: PostgreSQL or SQLAlchemy database URL
- `FERNET_SECRET_KEY`: URL-safe Fernet key used to encrypt OAuth tokens
- `JWT_SECRET_KEY`: Secret used to sign API access tokens
- `FLASK_SECRET_KEY`: Flask application secret
- `FRONTEND_URL`: Frontend origin, such as `http://localhost:5173`
- `GITHUB_CALLBACK_URL`: Exact callback URL configured on the GitHub OAuth app

## Commands

```bash
uv sync
uv run python -c "from app import app, db; app.app_context().push(); db.create_all()"
uv run flask run
uv run pytest
```

The OAuth callback URL is `<backend-origin>/auth/github/callback`.
