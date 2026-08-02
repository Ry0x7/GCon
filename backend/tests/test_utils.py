from datetime import date

import pytest
from git import Repo

import utils


def test_validate_commit_entries_normalizes_and_sorts():
    entries = utils.validate_commit_entries(
        [
            {"date": "2026-02-02", "count": 10},
            {"date": "2026-01-01", "count": 3},
        ]
    )

    assert entries == [
        {"date": "2026-01-01", "count": 3},
        {"date": "2026-02-02", "count": 10},
    ]


@pytest.mark.parametrize(
    ("entries", "message"),
    [
        ([], "non-empty list"),
        ([{"date": "2026-02-30", "count": 1}], "Invalid date"),
        ([{"date": "2026-01-01", "count": 2}], "one of 1, 3, 6, or 10"),
        ([{"date": "2026-01-01", "count": True}], "one of 1, 3, 6, or 10"),
        (
            [
                {"date": "2026-01-01", "count": 1},
                {"date": "2026-01-01", "count": 3},
            ],
            "Duplicate date",
        ),
    ],
)
def test_validate_commit_entries_rejects_invalid_payloads(entries, message):
    with pytest.raises(ValueError, match=message):
        utils.validate_commit_entries(entries)


def test_validate_commit_entries_limits_total_commits():
    entries = [
        {"date": f"2026-01-{day:02d}", "count": 10}
        for day in range(1, 12)
    ]

    with pytest.raises(ValueError, match="No more than 100 commits"):
        utils.validate_commit_entries(entries)


def test_commit_multiple_dates_creates_requested_commits(tmp_path, monkeypatch):
    remote_path = tmp_path / "remote.git"
    seed_path = tmp_path / "seed"
    remote = Repo.init(remote_path, bare=True)
    seed = Repo.init(seed_path, initial_branch="main")
    seed.config_writer().set_value("user", "name", "Tester").set_value(
        "user", "email", "tester@example.com"
    ).release()
    (seed_path / "README.md").write_text("seed\n", encoding="utf-8")
    seed.index.add(["README.md"])
    seed.index.commit("Initial commit")
    seed.create_remote("origin", str(remote_path)).push("main:main")
    remote.git.symbolic_ref("HEAD", "refs/heads/main")

    original_clone_from = Repo.clone_from

    def clone_local(_url, destination):
        return original_clone_from(str(remote_path), destination)

    monkeypatch.setattr(utils.Repo, "clone_from", clone_local)

    utils.commit_multiple_dates(
        token="unused",
        username="tester",
        email="tester@example.com",
        repo_name="unused",
        branch="main",
        entries=[{"date": "2026-01-02", "count": 3}],
    )

    commits = list(Repo(remote_path).iter_commits("main"))
    generated = commits[:3]
    assert len(commits) == 4
    assert all(commit.authored_datetime.date() == date(2026, 1, 2) for commit in generated)
    assert [commit.authored_datetime.minute for commit in reversed(generated)] == [0, 1, 2]
