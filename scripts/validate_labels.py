#!/usr/bin/env python3
"""Validate that every issue in the repository adheres to the canonical
label taxonomy.

The script fetches all issues (open + closed) and checks that:
1. Each issue contains **at least one** track label (deep-learning,
   data-science, web-development, ux-design).
2. Each issue contains **exactly one** priority label (priority/highest …
   priority/lowest).
3. No issue has labels outside the governed taxonomy (unless explicitly
   allow-listed).

It exits with status-code 0 if the repository is fully compliant, otherwise 1.
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
from typing import Dict, List, Set


try:
    from dotenv import load_dotenv  # type: ignore

    load_dotenv()
except ModuleNotFoundError:
    pass

from scripts.create_labels import _CANONICAL_LABELS
from scripts.github_client import GitHubClient


logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Helper sets for quick membership checks
# ---------------------------------------------------------------------------
_TRACK_LABELS: Set[str] = {
    lbl
    for lbl in _CANONICAL_LABELS
    if lbl
    in {"deep-learning", "data-science", "web-development", "ux-design", "project"}
}
_PRIORITY_LABELS: Set[str] = {
    lbl for lbl in _CANONICAL_LABELS if lbl.startswith("priority/")
}


# ---------------------------------------------------------------------------
# Validation logic
# ---------------------------------------------------------------------------


def _gather_all_issues(client: GitHubClient) -> List[Dict]:
    """Retrieve **all** issues via pagination in 100-item chunks."""
    page = 1
    per_page = 100
    all_issues: List[Dict] = []
    while True:
        batch = (
            client.get_rest(f"/issues?state=all&per_page={per_page}&page={page}") or []
        )
        if not batch:
            break
        all_issues.extend(batch)
        if len(batch) < per_page:
            break
        page += 1
    logger.info("Fetched %d issues for validation", len(all_issues))
    return all_issues


def validate_issues(issues: List[Dict]) -> bool:
    """Return *True* if all issues comply, else *False* with logs."""
    success = True

    for issue in issues:
        labels = {lbl["name"].lower() for lbl in issue.get("labels", [])}
        unknown = labels - set(_CANONICAL_LABELS)
        if unknown:
            logger.error(
                "Issue #%s ('%s') has non-canonical labels: %s",
                issue["number"],
                issue["title"],
                ", ".join(sorted(unknown)),
            )
            success = False

        # Track label validation
        track_matches = labels & _TRACK_LABELS
        if not track_matches:
            logger.error(
                "Issue #%s ('%s') is missing a track label "
                "(deep-learning/data-science/…)",
                issue["number"],
                issue["title"],
            )
            success = False
        if len(track_matches) > 1:
            logger.error(
                "Issue #%s ('%s') has multiple track labels: %s",
                issue["number"],
                issue["title"],
                ", ".join(sorted(track_matches)),
            )
            success = False

        # Priority label validation – exactly one priority/… label expected
        priority_matches = labels & _PRIORITY_LABELS
        if len(priority_matches) != 1:
            logger.error(
                "Issue #%s ('%s') must have exactly one priority label (found %d)",
                issue["number"],
                issue["title"],
                len(priority_matches),
            )
            success = False

    return success


# ---------------------------------------------------------------------------
# CLI glue
# ---------------------------------------------------------------------------


def _parse_args() -> argparse.Namespace:  # noqa: D401
    """Return the CLI arguments."""
    parser = argparse.ArgumentParser(
        description="Validate issue labels against the canonical taxonomy"
    )
    parser.add_argument("--owner", required=True, help="GitHub owner / organisation")
    parser.add_argument("--repo", required=True, help="Repository name")
    parser.add_argument("--token", help="GitHub token or $GITHUB_TOKEN")
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
    )
    return parser.parse_args()


def main() -> None:
    args = _parse_args()
    logging.basicConfig(
        level=getattr(logging, args.log_level),
        format="%(asctime)s - %(levelname)s - %(message)s",
    )

    token = args.token or os.getenv("GITHUB_TOKEN")
    if not token:
        logger.critical("❌ GitHub token not provided. Use --token or set $GITHUB_TOKEN")
        sys.exit(1)

    client = GitHubClient(token, args.owner, args.repo)
    issues = _gather_all_issues(client)

    ok = validate_issues(issues)
    if ok:
        logger.info("✅ All issues comply with label taxonomy")
        sys.exit(0)
    logger.error("❌ Label validation failed")
    sys.exit(1)


if __name__ == "__main__":
    main()
