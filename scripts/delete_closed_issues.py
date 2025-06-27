#!/usr/bin/env python3
"""
Script to mark all closed issues as deleted in a GitHub repository.
This helps when reorganizing issues or when closed issues become redundant.

Note: GitHub does not allow true deletion of issues through the API.
This script marks issues as deleted by updating their titles and bodies.

Usage:
  python delete_closed_issues.py --token GITHUB_TOKEN [--owner OWNER] [--repo REPO] [--dry-run]
"""

import argparse
import sys
import time
from datetime import datetime

import requests


def setup_argparser():
    parser = argparse.ArgumentParser(
        description="Mark all closed issues as deleted in a GitHub repository"
    )
    parser.add_argument("--token", required=True, help="GitHub personal access token")
    parser.add_argument(
        "--owner", default="uelkerd", help="Repository owner (default: uelkerd)"
    )
    parser.add_argument(
        "--repo", default="lumin-ai", help="Repository name (default: lumin-ai)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview issues to be marked as deleted without modifying them",
    )
    parser.add_argument(
        "--page-size",
        type=int,
        default=100,
        help="Number of issues per page (default: 100)",
    )
    return parser.parse_args()


def log_message(message, level="INFO"):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"{timestamp} - {level} - {message}")


def get_closed_issues(token, owner, repo, page_size):
    """Get all closed issues from the repository"""
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
    }

    closed_issues = []
    page = 1

    while True:
        log_message(f"Fetching page {page} of closed issues...")
        url = f"https://api.github.com/repos/{owner}/{repo}/issues?state=closed&per_page={page_size}&page={page}"
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            log_message(
                f"Error fetching issues: {response.status_code} - {response.text}",
                "ERROR",
            )
            sys.exit(1)

        issues = response.json()

        # If no more issues, break
        if not issues:
            break

        # Add issues that are not pull requests (GitHub API returns PRs as issues)
        for issue in issues:
            if "pull_request" not in issue:
                closed_issues.append(
                    {
                        "number": issue["number"],
                        "title": issue["title"],
                        "closed_at": issue["closed_at"],
                    }
                )

        # Check if we've reached the last page
        link_header = response.headers.get("Link", "")
        if 'rel="next"' not in link_header:
            break

        page += 1
        # Rate limit protection
        time.sleep(0.5)

    return closed_issues


def mark_issues_as_deleted(token, owner, repo, issues, dry_run=False):
    """Mark all specified issues as deleted by updating their titles and bodies"""
    if dry_run:
        log_message("DRY RUN: The following issues would be marked as deleted:")
        for issue in issues:
            log_message(f"  #{issue['number']}: {issue['title']}")
        log_message(f"DRY RUN: Would mark {len(issues)} issues as deleted.")
        return

    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
    }

    log_message(f"Preparing to mark {len(issues)} closed issues as deleted...")
    log_message(
        "NOTE: GitHub does not allow complete deletion of issues through the API."
    )
    log_message(
        "      Issues will be marked as deleted by updating their titles and locking them."
    )

    for idx, issue in enumerate(issues):
        issue_number = issue["number"]
        # Skip if already marked as deleted
        if issue["title"].startswith("[DELETED]"):
            log_message(f"Skipping issue #{issue_number} - already marked as deleted")
            continue

        log_message(f"Marking issue #{issue_number} as deleted: {issue['title']}...")

        # First try to lock the issue to prevent further comments
        lock_url = (
            f"https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}/lock"
        )
        lock_response = requests.put(
            lock_url, headers=headers, json={"lock_reason": "resolved"}
        )

        if lock_response.status_code != 204:
            log_message(
                f"Warning: Could not lock issue #{issue_number}: {lock_response.status_code}",
                "WARNING",
            )

        # Now patch the issue to update its state and title to indicate deletion
        url = f"https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}"
        update_data = {
            "state": "closed",
            "title": f"[DELETED] {issue['title']}",
            "body": "This issue has been marked as deleted during repository cleanup.",
        }

        update_response = requests.patch(url, headers=headers, json=update_data)

        if update_response.status_code != 200:
            log_message(
                f"Error updating issue #{issue_number}: {update_response.status_code} - {update_response.text}",
                "ERROR",
            )
            continue

        log_message(f"  ✓ Successfully marked issue #{issue_number} as deleted")

        # Rate limit protection
        if idx > 0 and idx % 10 == 0:
            log_message(
                f"Processed {idx}/{len(issues)} issues. Pausing to respect rate limits..."
            )
            time.sleep(2)
        else:
            time.sleep(0.5)

    log_message(f"✅ Successfully processed {len(issues)} closed issues.")


def main():
    args = setup_argparser()
    token = args.token
    owner = args.owner
    repo = args.repo
    dry_run = args.dry_run
    page_size = args.page_size

    log_message(f"Starting issue cleanup process for {owner}/{repo}")
    log_message(
        "NOTE: GitHub doesn't allow complete deletion of issues through their API."
    )
    log_message(
        "      This script will mark issues as deleted by updating their titles and locking them."
    )

    if dry_run:
        log_message("Running in DRY RUN mode - no issues will be modified")

    # Get all closed issues
    closed_issues = get_closed_issues(token, owner, repo, page_size)
    log_message(f"Found {len(closed_issues)} closed issues")

    # Mark the issues as deleted
    if closed_issues:
        mark_issues_as_deleted(token, owner, repo, closed_issues, dry_run)
    else:
        log_message("No closed issues to mark as deleted.")

    log_message("Issue cleanup process completed.")


if __name__ == "__main__":
    main()
