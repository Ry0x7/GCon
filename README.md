# GCon

GCon creates dated commits with four per-day intensity presets: **1, 3, 6, or 10 commits**. It is a full-stack React and Flask application that authenticates with GitHub, creates a private `gcon-contributions` repository, and pushes the selected contribution pattern.

This project is intended for learning, testing, and visual experimentation. Contribution counts are not a measure of productivity and should not be presented as one.

## Features

- GitHub OAuth authentication with server-validated state
- GitHub-style calendar with four commit intensity levels
- Per-date controls and a live batch total
- Strict server-side payload and batch validation
- Encrypted GitHub token storage
- Verified GitHub commit email selection with a noreply fallback
- Aggregate user and generated-commit statistics

## Project Structure

- `frontend/`: React, TypeScript, Vite, Tailwind CSS, and Radix UI
- `backend/`: Flask, SQLAlchemy, GitPython, PostgreSQL, and JWT

## Local Setup

### Backend

1. Create a GitHub OAuth app. Use `http://localhost:5000/auth/github/callback` as its callback URL.
2. Copy `backend/.env.example` to `backend/.env` and fill in every value.
3. Generate a Fernet key with `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`.
4. Install and initialize the backend:

```bash
cd backend
uv sync
uv run python -c "from app import app, db; app.app_context().push(); db.create_all()"
uv run flask run
```

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

The frontend runs at `http://localhost:5173`. Use that URL for the OAuth app homepage and `FRONTEND_URL`.

## Verification

```bash
cd backend
uv run pytest

cd frontend
npm run lint
npm run build
```

Private repository contributions only appear on a GitHub profile when the user enables private contribution visibility. GitHub may take time to refresh the graph.

## Attribution

GCon is derived from [CommitFill](https://github.com/kamalkoranga/commitfill) by Kamal Koranga and retains its MIT license and copyright notice. See [LICENSE](LICENSE).
