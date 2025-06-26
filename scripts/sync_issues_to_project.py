#!/usr/bin/env python3
"""
LUMIN.AI GitHub Issue to Project Syncer
Adds existing GitHub issues to the LUMIN Project Tracker board.
"""

import argparse
import sys
import time
from .gh_issue_creator import GitHubIssueCreator

def main():
    parser = argparse.ArgumentParser(
        description='Sync existing GitHub issues to a project board.'
    )
    parser.add_argument(
        '--token',
        required=True,
        help='GitHub personal access token (needs repo and project scopes)'
    )
    parser.add_argument(
        '--owner',
        default='uelkerd',
        help='GitHub repository owner (default: uelkerd)'
    )
    parser.add_argument(
        '--repo',
        default='lumin-ai',
        help='GitHub repository name (default: lumin-ai)'
    )
    parser.add_argument(
        '--project',
        default='LUMIN Project Tracker',
        help='Project board name (default: LUMIN Project Tracker)'
    )
    parser.add_argument(
        '--since-issue',
        type=int,
        default=28,
        help='Start syncing from this issue number (default: 28, based on recent creation)'
    )
    parser.add_argument(
        '--delay',
        type=float,
        default=1.0,
        help='Delay between API calls in seconds (default: 1.0)'
    )

    args = parser.parse_args()

    creator = GitHubIssueCreator(args.token, args.owner, args.repo)

    print(f"🔍 Finding project '{args.project}'...")
    creator.project_id = creator.find_project(args.project)
    if not creator.project_id:
        print(f"❌ Error: Project '{args.project}' not found. Please check the name and your token permissions.")
        sys.exit(1)

    creator.project_field_id, creator.backlog_option_id = creator.get_project_field_info(creator.project_id)
    if not creator.project_field_id or not creator.backlog_option_id:
        print("⚠️  Warning: Could not find 'Status' field or 'Backlog' option. Issues will be added but not set to Backlog.")

    issues_to_add = creator.get_issues_to_sync(args.since_issue)

    if not issues_to_add:
        print("✅ No issues found to sync. Everything is up to date.")
        return

    print(f"\nFound {len(issues_to_add)} issues to add to project '{args.project}'.")
    confirm = input("Continue? (y/N): ")
    if confirm.lower() != 'y':
        print("Aborted.")
        return

    print("\n🚀 Syncing issues to project board...\n")
    for i, issue in enumerate(issues_to_add, 1):
        print(f"Processing {i}/{len(issues_to_add)}: Adding issue #{issue['number']}")
        creator.add_issue_to_project(issue['node_id'])
        if i < len(issues_to_add):
            time.sleep(args.delay)

    print("\n🎉 Sync complete!")

if __name__ == "__main__":
    main()