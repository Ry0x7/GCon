import hmac
import os
import secrets
import time
from datetime import datetime, timedelta, timezone
from urllib.parse import urlsplit

import requests
from cryptography.fernet import Fernet
from dotenv import load_dotenv
from flask import Flask, jsonify, make_response, redirect, request
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    get_jwt_identity,
    jwt_required,
    unset_jwt_cookies,
)
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError

from utils import (
    get_github_user,
    encrypt_token,
    decrypt_token,
    ensure_repo_exists,
    commit_multiple_dates,
    get_github_commit_email,
    validate_commit_entries,
)

load_dotenv()


def required_env(name):
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"{name} is required")
    return value


GITHUB_CLIENT_ID = required_env("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = required_env("GITHUB_CLIENT_SECRET")
DATABASE_URL = required_env("DATABASE_URL")
JWT_SECRET_KEY = required_env("JWT_SECRET_KEY")
FLASK_SECRET_KEY = required_env("FLASK_SECRET_KEY")
FERNET_SECRET_KEY = required_env("FERNET_SECRET_KEY")
FRONTEND_URL = required_env("FRONTEND_URL").rstrip("/")
frontend_parts = urlsplit(FRONTEND_URL)
FRONTEND_ORIGIN = f"{frontend_parts.scheme}://{frontend_parts.netloc}"
GITHUB_CALLBACK_URL = os.getenv(
    "GITHUB_CALLBACK_URL", "http://localhost:5000/auth/github/callback"
)

app = Flask(__name__)
CORS(app, origins=[FRONTEND_ORIGIN], supports_credentials=True)

app.secret_key = FLASK_SECRET_KEY

app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_pre_ping": True,
    "pool_recycle": 250,
}
app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)
app.config["JWT_TOKEN_LOCATION"] = ["headers"]

db = SQLAlchemy(app)
jwt = JWTManager(app)

fernet = Fernet(FERNET_SECRET_KEY.encode())

REPO_NAME = "gcon-contributions"
REPO_PRIVATE = True


def db_retry(fn, retries=2, delay=1):
    for attempt in range(retries + 1):
        try:
            return fn()
        except SQLAlchemyError:
            db.session.rollback()
            if attempt < retries:
                time.sleep(delay)
            else:
                raise


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    github_id = db.Column(db.Integer, unique=True, nullable=False)
    username = db.Column(db.String(100), nullable=False)
    encrypted_token = db.Column(db.Text, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    avatar_url = db.Column(db.String(255), nullable=True)
    commit_email = db.Column(db.String(255), nullable=False)
    total_commits = db.Column(db.Integer, nullable=False, default=0)


@app.teardown_request
def cleanup_session(exception=None):
    if exception:
        db.session.rollback()


@app.route("/api/user", methods=["GET"])
@jwt_required()
def get_user():
    user_id = get_jwt_identity()
    user = db_retry(lambda: db.session.get(User, user_id))

    if user is None:
        return jsonify({"success": False, "error": "User not found"}), 404

    return jsonify(
        {
            "success": True,
            "user": {
                "username": user.username,
                "avatar_url": user.avatar_url,
            },
        }
    ), 200


@app.route("/auth/github")
def github_login():
    state = secrets.token_urlsafe(32)
    params = {
        "client_id": GITHUB_CLIENT_ID,
        "redirect_uri": GITHUB_CALLBACK_URL,
        "scope": "repo read:user user:email",
        "state": state,
    }
    authorization_url = requests.Request(
        "GET", "https://github.com/login/oauth/authorize", params=params
    ).prepare().url
    response = make_response(redirect(authorization_url))
    response.set_cookie(
        "github_oauth_state",
        state,
        max_age=600,
        httponly=True,
        secure=GITHUB_CALLBACK_URL.startswith("https://"),
        samesite="Lax",
    )
    return response


@app.route("/auth/github/callback")
def github_callback():
    code = request.args.get("code")
    state = request.args.get("state")
    expected_state = request.cookies.get("github_oauth_state")

    if (
        not code
        or not state
        or not expected_state
        or not hmac.compare_digest(state, expected_state)
    ):
        return jsonify({"success": False, "error": "Invalid OAuth callback"}), 400

    token_res = requests.post(
        "https://github.com/login/oauth/access_token",
        headers={"Accept": "application/json"},
        data={
            "client_id": GITHUB_CLIENT_ID,
            "client_secret": GITHUB_CLIENT_SECRET,
            "code": code,
        },
        timeout=20,
    )
    token_res.raise_for_status()
    access_token = token_res.json().get("access_token")
    if not access_token:
        return (
            jsonify(
                {"success": False, "error": "GitHub did not return an access token"}
            ),
            400,
        )

    gh_user = get_github_user(access_token)
    commit_email = get_github_commit_email(access_token, gh_user)
    encrypted = encrypt_token(access_token, fernet)

    user = db_retry(lambda: User.query.filter_by(github_id=gh_user["id"]).first())

    if user is None:
        user = User(
            github_id=gh_user["id"],
            username=gh_user["login"],
            encrypted_token=encrypted,
            avatar_url=gh_user["avatar_url"],
            commit_email=commit_email,
        )
        db.session.add(user)
    else:
        user.encrypted_token = encrypted
        user.username = gh_user["login"]
        user.avatar_url = gh_user["avatar_url"]
        user.commit_email = commit_email

    db.session.commit()

    jwt_token = create_access_token(identity=str(user.id))
    response = make_response(redirect(f"{FRONTEND_URL}/select-dates?token={jwt_token}"))
    response.delete_cookie("github_oauth_state")
    return response


@app.route("/api/submit-dates", methods=["POST"])
@jwt_required()
def submit_dates():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"success": False, "error": "A JSON body is required"}), 400
    try:
        entries = validate_commit_entries(data.get("entries"))
    except ValueError as error:
        return jsonify({"success": False, "error": str(error)}), 400

    user = db_retry(lambda: db.session.get(User, user_id))
    if user is None or not user.encrypted_token:
        return jsonify({"success": False, "error": "User not found"}), 404
    token = decrypt_token(user.encrypted_token, fernet)

    try:
        branch = ensure_repo_exists(token, user.username, REPO_NAME, REPO_PRIVATE)

        commit_multiple_dates(
            token=token,
            username=user.username,
            email=user.commit_email,
            repo_name=REPO_NAME,
            branch=branch,
            entries=entries,
        )

        total_commits = sum(entry["count"] for entry in entries)
        user.total_commits += total_commits
        db_retry(lambda: db.session.commit())

        return jsonify(
            {
                "success": True,
                "message": f"Created {total_commits} commits",
                "date_count": len(entries),
                "commit_count": total_commits,
            }
        ), 200

    except Exception as error:
        app.logger.error("Commit generation failed: %s", type(error).__name__)
        return (
            jsonify(
                {
                    "success": False,
                    "error": "GitHub could not create the requested commits",
                }
            ),
            500,
        )


@app.route("/api/logout", methods=["POST"])
@jwt_required()
def logout():
    user = db_retry(lambda: db.session.get(User, get_jwt_identity()))
    token = decrypt_token(user.encrypted_token, fernet)

    # Revoke GitHub token
    requests.delete(
        f"https://api.github.com/applications/{GITHUB_CLIENT_ID}/token",
        auth=(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET),
        json={"access_token": token},
        timeout=20,
    )

    user.encrypted_token = ""
    db.session.commit()

    response = jsonify({"success": True})
    unset_jwt_cookies(response)
    return response, 200


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"}), 200


@app.route("/api/stats", methods=["GET"])
def get_stats():
    total_users = db_retry(
        lambda: db.session.query(db.func.count(User.id)).scalar()
    )
    total_commits = db_retry(
        lambda: db.session.query(
            db.func.coalesce(db.func.sum(User.total_commits), 0)
        ).scalar()
    )
    return jsonify({"total_users": total_users, "total_commits": total_commits}), 200


# if __name__ == "__main__":
#     app.run(debug=True, host="0.0.0.0", port=5000)
