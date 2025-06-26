#!/usr/bin/env python3
import argparse
import logging
import sys
import os

# Add the parent directory to the path so we can import github_client
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.github_client import GitHubClient

# Issues to find and close based on our MVP scope refinement
ISSUES_TO_CLOSE = [
    "Export Functionality",
    "Geographic Visualizations",
    "Guided Tutorial",
    "Customizable Views",
    "Predictive Modeling",
]

def setup_logging(log_level):
    """Set up logging configuration."""
    logging.basicConfig(level=log_level,
                        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                        datefmt='%Y-%m-%dT%H:%M:%S')

def prune_github_issues(token, owner, repo, dry_run=False):
    """
    Find and close GitHub issues that are no longer in the MVP scope.
    """
    logger = logging.getLogger(__name__)
    logger.info("Starting backlog pruning process...")

    gh_client = GitHubClient(token=token, owner=owner, repo=repo)

    logger.info(f"Fetching all open issues for repository: {owner}/{repo}")

    all_issues = []
    page = 1
    while True:
        issues_page = gh_client.get_rest('/issues', params={'state': 'open', 'page': page, 'per_page': 100})
        if not issues_page:
            break
        all_issues.extend(issues_page)
        page += 1

    issues_to_be_closed = []
    for issue in all_issues:
        if issue['title'] in ISSUES_TO_CLOSE:
            issues_to_be_closed.append(issue)

    if not issues_to_be_closed:
        logger.info("No issues found that match the titles for pruning. Backlog is already aligned.")
        return

    logger.info(f"Found {len(issues_to_be_closed)} issues to close:")
    for issue in issues_to_be_closed:
        logger.info(f"  - #{issue['number']}: {issue['title']}")

    if dry_run:
        logger.info("Dry run is enabled. No issues will be closed.")
        return

    logger.info("Proceeding to close issues...")
    for issue in issues_to_be_closed:
        issue_number = issue['number']
        endpoint = f"/issues/{issue_number}"
        try:
            gh_client.post_rest(endpoint, {'state': 'closed'})
            logger.info(f"Successfully closed issue #{issue_number}: {issue['title']}")
        except Exception as e:
            logger.error(f"Failed to close issue #{issue_number}: {e}")

    logger.info("Backlog pruning process completed.")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Prune GitHub issues that are out of the revised MVP scope.")
    parser.add_argument("--token", required=True, help="GitHub personal access token.")
    parser.add_argument("--owner", default="LUMIN-AI-DEV", help="Repository owner.")
    parser.add_argument("--repo", default="lumin-ai", help="Repository name.")
    parser.add_argument("--dry-run",
                        action="store_true",
                        help="Simulate the pruning process without closing any issues.")
    parser.add_argument("--log-level",
                        default="INFO",
                        choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
                        help="Set the logging level.")

    args = parser.parse_args()

    setup_logging(args.log_level.upper())

    prune_github_issues(token=args.token,
                        owner=args.owner,
                        repo=args.repo,
                        dry_run=args.dry_run)