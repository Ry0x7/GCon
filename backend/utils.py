import json
import os
import random
import shutil
import string
import tempfile
from datetime import date, datetime, timedelta, timezone

import requests
from cryptography.fernet import Fernet
from git import Repo


COMMIT_PRESETS = frozenset({1, 3, 6, 10})
MAX_DATES = 200
MAX_TOTAL_COMMITS = 500


def encrypt_token(token: str, fernet: Fernet) -> str:
    return fernet.encrypt(token.encode()).decode()


def decrypt_token(token: str, fernet: Fernet) -> str:
    return fernet.decrypt(token.encode()).decode()


def github_headers(token):
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }


def validate_commit_entries(entries):
    if not isinstance(entries, list) or not entries:
        raise ValueError("entries must be a non-empty list")
    if len(entries) > MAX_DATES:
        raise ValueError(f"No more than {MAX_DATES} dates can be submitted at once")

    normalized = []
    seen_dates = set()

    for entry in entries:
        if not isinstance(entry, dict):
            raise ValueError("Each entry must contain a date and count")

        date_string = entry.get("date")
        count = entry.get("count")

        if not isinstance(date_string, str):
            raise ValueError("Each date must use YYYY-MM-DD format")
        try:
            parsed_date = date.fromisoformat(date_string)
        except ValueError as error:
            raise ValueError(f"Invalid date: {date_string}") from error
        if parsed_date.isoformat() != date_string:
            raise ValueError(f"Invalid date: {date_string}")
        if date_string in seen_dates:
            raise ValueError(f"Duplicate date: {date_string}")
        if type(count) is not int or count not in COMMIT_PRESETS:
            raise ValueError("Commit count must be one of 1, 3, 6, or 10")

        seen_dates.add(date_string)
        normalized.append({"date": date_string, "count": count})

    total_commits = sum(entry["count"] for entry in normalized)
    if total_commits > MAX_TOTAL_COMMITS:
        raise ValueError(
            f"No more than {MAX_TOTAL_COMMITS} commits can be created at once"
        )

    return sorted(normalized, key=lambda entry: entry["date"])


def ensure_repo_exists(token, username, repo_name, is_repo_private):
    url = f"https://api.github.com/repos/{username}/{repo_name}"
    response = requests.get(url, headers=github_headers(token), timeout=20)

    if response.status_code == 200:
        return response.json()["default_branch"]
    if response.status_code != 404:
        response.raise_for_status()

    create_response = requests.post(
        "https://api.github.com/user/repos",
        headers=github_headers(token),
        json={"name": repo_name, "private": is_repo_private, "auto_init": True},
        timeout=20,
    )
    create_response.raise_for_status()
    return create_response.json()["default_branch"]


def get_github_user(token):
    response = requests.get(
        "https://api.github.com/user",
        headers=github_headers(token),
        timeout=20,
    )
    response.raise_for_status()
    return response.json()


def get_github_commit_email(token, github_user):
    response = requests.get(
        "https://api.github.com/user/emails",
        headers=github_headers(token),
        timeout=20,
    )
    if response.ok:
        emails = response.json()
        primary = next(
            (item["email"] for item in emails if item.get("primary") and item.get("verified")),
            None,
        )
        if primary:
            return primary

    return f'{github_user["id"]}+{github_user["login"]}@users.noreply.github.com'


def random_suffix():
    return "".join(random.choices(string.ascii_letters + string.digits, k=10))


def commit_multiple_dates(token, username, email, repo_name, branch, entries):
    repo_url = f"https://{token}:x-oauth-basic@github.com/{username}/{repo_name}.git"
    tmp_dir = tempfile.mkdtemp(prefix="gcon-")

    try:
        repo = Repo.clone_from(repo_url, tmp_dir)
        repo.git.checkout(branch)
        repo.config_writer().set_value("user", "name", username).release()
        repo.config_writer().set_value("user", "email", email).release()
        file_path = os.path.join(tmp_dir, "contributions.json")

        for entry in entries:
            commit_day = entry["date"]
            for sequence in range(entry["count"]):
                commit_time = datetime.fromisoformat(
                    f"{commit_day}T12:00:00+00:00"
                ) + timedelta(minutes=sequence)
                data = {
                    "date": commit_day,
                    "sequence": sequence + 1,
                    "nonce": random_suffix(),
                }

                with open(file_path, "w", encoding="utf-8") as contribution_file:
                    json.dump(data, contribution_file, indent=2)

                repo.index.add([file_path])
                repo.index.commit(
                    message=f"Contribution for {commit_day} ({sequence + 1}/{entry['count']})",
                    author_date=commit_time,
                    commit_date=commit_time,
                )

        repo.remote(name="origin").push()
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)
