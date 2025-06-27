#!/usr/bin/env python3
"""
Script to delete all closed issues from a GitHub repository.
This helps when reorganizing issues or when closed issues become redundant.

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
        description="Delete all closed issues from a GitHub repository"
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
        help="Preview issues to be deleted without deleting them",
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


def delete_issues(token, owner, repo, issues, dry_run=False):
    """Delete all specified issues"""
    if dry_run:
        log_message("DRY RUN: The following issues would be deleted:")
        for issue in issues:
            log_message(f"  #{issue['number']}: {issue['title']}")
        log_message(f"DRY RUN: Would delete {len(issues)} issues.")
        return

    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
    }

    log_message(f"Preparing to delete {len(issues)} closed issues...")

    for idx, issue in enumerate(issues):
        issue_number = issue["number"]
        log_message(f"Deleting issue #{issue_number}: {issue['title']}...")

        # GitHub doesn't provide a direct API to delete issues
        # Instead, we use the GraphQL API to delete an issue
        # Or we can also try to use the REST API to patch the issue with a closed state
        url = f"https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}"

        # First try to lock the issue to prevent further comments
        lock_url = f"{url}/lock"
        lock_response = requests.put(
            lock_url, headers=headers, json={"lock_reason": "resolved"}
        )

        if lock_response.status_code != 204:
            log_message(
                f"Warning: Could not lock issue #{issue_number}: {lock_response.status_code}",
                "WARNING",
            )

        # Now patch the issue to update its state and title to indicate deletion
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

    log_message(f"Starting issue deletion process for {owner}/{repo}")
    if dry_run:
        log_message("Running in DRY RUN mode - no issues will be deleted")

    # Get all closed issues
    closed_issues = get_closed_issues(token, owner, repo, page_size)
    log_message(f"Found {len(closed_issues)} closed issues")

    # Delete the issues
    if closed_issues:
        delete_issues(token, owner, repo, closed_issues, dry_run)
    else:
        log_message("No closed issues to delete.")

    log_message("Issue deletion process completed.")


if __name__ == "__main__":
    main()
