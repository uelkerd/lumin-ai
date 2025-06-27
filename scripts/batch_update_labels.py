#!/usr/bin/env python3
"""Batch update GitHub issues to comply with label taxonomy.

This script updates all existing issues to ensure they have:
1. At least one track label (deep-learning, data-science, web-development, ux-design, project)
2. Exactly one priority label (priority/highest ... priority/lowest)
3. Non-canonical labels are mapped to canonical ones where possible

Example usage:
    python -m scripts.batch_update_labels --owner uelkerd --repo lumin-ai --dry-run
    python -m scripts.batch_update_labels --owner uelkerd --repo lumin-ai
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
# Helper sets and mappings
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

# Map non-canonical labels to canonical ones
_LABEL_MAPPING = {
    "enhancement": "project",  # Default GitHub label → project
    "bug": "project",  # Default GitHub label → project
    "documentation": "project",  # Default GitHub label → project
    "dependencies": "project",  # Default GitHub label → project
    "python": "data-science",  # Programming language → data-science
    "ux": "ux-design",  # Short form → full form
}

# Default mappings if no appropriate labels can be determined
DEFAULT_TRACK_LABEL = "project"
DEFAULT_PRIORITY_LABEL = "priority/medium"

# ---------------------------------------------------------------------------
# Core functionality
# ---------------------------------------------------------------------------


def _gather_all_issues(client: GitHubClient) -> List[Dict]:
    """Retrieve all issues via pagination in 100-item chunks."""
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


def update_issue_labels(
    client: GitHubClient, issue: Dict, dry_run: bool = False
) -> None:
    """Update a single issue's labels to comply with taxonomy requirements."""
    issue_num = issue["number"]
    issue_title = issue["title"]
    current_labels = {lbl["name"].lower() for lbl in issue.get("labels", [])}
    new_labels = set(current_labels)  # Start with existing labels

    # Check for non-canonical labels and replace them
    non_canonical = current_labels - set(_CANONICAL_LABELS.keys())
    for label in non_canonical:
        if label in _LABEL_MAPPING:
            # Replace with canonical equivalent
            new_labels.remove(label)
            new_labels.add(_LABEL_MAPPING[label])
            logger.info(
                f"Issue #{issue_num}: Replacing '{label}' with '{_LABEL_MAPPING[label]}'"
            )

    # Check for track labels
    track_labels = new_labels & _TRACK_LABELS
    if not track_labels:
        # Try to infer from title or add default
        # For simplicity, we'll just add the default track label
        new_labels.add(DEFAULT_TRACK_LABEL)
        logger.info(
            f"Issue #{issue_num}: Adding default track label '{DEFAULT_TRACK_LABEL}'"
        )

    # Check for priority labels
    priority_labels = new_labels & _PRIORITY_LABELS
    if len(priority_labels) == 0:
        # No priority label, add default
        new_labels.add(DEFAULT_PRIORITY_LABEL)
        logger.info(
            f"Issue #{issue_num}: Adding default priority label '{DEFAULT_PRIORITY_LABEL}'"
        )
    elif len(priority_labels) > 1:
        # Too many priority labels, keep the highest one
        # priority/highest sorts first alphabetically
        highest_priority = sorted(list(priority_labels))[0]
        for label in priority_labels:
            if label != highest_priority:
                new_labels.remove(label)
        logger.info(
            f"Issue #{issue_num}: Keeping highest priority label '{highest_priority}'"
        )

    # Convert to list of strings (expected by GitHub API)
    new_labels_list = list(new_labels)

    # If labels changed, update the issue
    if set(new_labels_list) != current_labels:
        if not dry_run:
            logger.info(f"Updating labels for issue #{issue_num}: '{issue_title}'")
            client.patch_rest(f"/issues/{issue_num}", {"labels": list(new_labels_list)})
        else:
            logger.info(
                f"[DRY RUN] Would update labels for issue #{issue_num}: '{issue_title}'"
            )
            logger.info(f"  From: {sorted(list(current_labels))}")
            logger.info(f"  To:   {sorted(new_labels_list)}")
    else:
        logger.debug(f"No label changes needed for issue #{issue_num}")


def update_all_issues(client: GitHubClient, dry_run: bool = False) -> None:
    """Update all issues to comply with label taxonomy."""
    issues = _gather_all_issues(client)

    logger.info(f"Updating labels for {len(issues)} issues...")
    for issue in issues:
        update_issue_labels(client, issue, dry_run)

    logger.info("✅ Label update complete%s", " (dry-run)" if dry_run else "")


# ---------------------------------------------------------------------------
# CLI glue
# ---------------------------------------------------------------------------


def _parse_args() -> argparse.Namespace:
    """Return the CLI arguments."""
    parser = argparse.ArgumentParser(
        description="Batch update issue labels to comply with taxonomy"
    )
    parser.add_argument("--owner", required=True, help="GitHub owner / organisation")
    parser.add_argument("--repo", required=True, help="Repository name")
    parser.add_argument("--token", help="GitHub token or $GITHUB_TOKEN")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without modifying issues",
    )
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
    update_all_issues(client, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
