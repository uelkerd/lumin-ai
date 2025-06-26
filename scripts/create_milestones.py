#!/usr/bin/env python3
"""
Extract milestones from ROADMAP.md files and create them in GitHub
"""
import argparse
import logging
import os
import re
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

# Add the parent directory to the path so we can import github_client
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.github_client import GitHubClient

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def parse_roadmap_file(file_path: str) -> List[Dict]:
    """
    Parse a ROADMAP.md file to extract milestones

    Returns:
        List of milestone dictionaries with 'title', 'description', and 'due_on'
    """
    logger.info(f"Parsing roadmap file: {file_path}")

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Roadmap file not found: {file_path}")

    with open(file_path, 'r') as f:
        content = f.read()

    # Define patterns to match milestone information
    # Look for headings like "## Phase 1: Foundation (Weeks 1-3)"
    milestone_pattern = r'##\s+([\w\s]+)(?:\s*\(([^)]+)\))?\s*\n((?:(?!##).)+)'

    milestones = []

    # Extract milestone title, timeframe, and description
    matches = re.finditer(milestone_pattern, content, re.DOTALL)

    current_date = datetime.now()

    for match in matches:
        title = match.group(1).strip()
        timeframe = match.group(2).strip() if match.group(2) else None
        description = match.group(3).strip()

        # Try to parse timeframe to set due date
        due_on = None
        if timeframe:
            # Look for patterns like "Weeks 1-3", "Month 1", etc.
            weeks_match = re.search(r'Weeks?\s+(\d+)(?:-(\d+))?', timeframe, re.IGNORECASE)
            months_match = re.search(r'Months?\s+(\d+)(?:-(\d+))?', timeframe, re.IGNORECASE)

            if weeks_match:
                # If range like "Weeks 1-3", use the end week
                end_week = weeks_match.group(2) if weeks_match.group(2) else weeks_match.group(1)
                due_on = current_date + timedelta(weeks=int(end_week))
            elif months_match:
                end_month = months_match.group(2) if months_match.group(2) else months_match.group(1)
                due_on = current_date + timedelta(days=int(end_month) * 30)  # Approximate

        milestone = {
            "title": title,
            "description": description,
            "due_on": due_on.strftime("%Y-%m-%dT%H:%M:%SZ") if due_on else None
        }

        milestones.append(milestone)
        logger.info(f"Found milestone: {title}")

    return milestones


def create_github_milestones(
    client: GitHubClient, milestones: List[Dict], dry_run: bool = False
) -> List[Dict]:
    """
    Create milestones in GitHub

    Args:
        client: GitHub client
        milestones: List of milestone dictionaries with 'title', 'description', and 'due_on'
        dry_run: If True, only log actions without making changes

    Returns:
        List of created milestone data from GitHub
    """
    logger.info(f"Creating {len(milestones)} milestones on GitHub")

    # Get existing milestones to avoid duplicates
    existing_milestones = client.get_rest("/milestones?state=all") or []
    existing_titles = {m["title"] for m in existing_milestones}

    created_milestones = []

    for milestone in milestones:
        if milestone["title"] in existing_titles:
            logger.info(f"Skipping existing milestone: {milestone['title']}")
            continue

        logger.info(f"Creating milestone: {milestone['title']}")

        payload = {
            "title": milestone["title"],
            "state": "open",
            "description": milestone["description"]
        }

        if milestone["due_on"]:
            payload["due_on"] = milestone["due_on"]

        if dry_run:
            logger.info(f"DRY RUN: Would create milestone: {milestone['title']}")
            continue

        response = client.post_rest("/milestones", payload)

        if response:
            logger.info(f"✅ Created milestone: {milestone['title']}")
            created_milestones.append(response)
        else:
            logger.error(f"❌ Failed to create milestone: {milestone['title']}")

    return created_milestones


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Create GitHub milestones from ROADMAP.md files")
    parser.add_argument(
        "roadmap_file",
        help="Path to ROADMAP.md file or directory containing roadmap files"
    )
    parser.add_argument(
        "--token",
        required=True,
        help="GitHub personal access token"
    )
    parser.add_argument(
        "--owner",
        default="uelkerd",
        help="Repository owner (default: uelkerd)"
    )
    parser.add_argument(
        "--repo",
        default="lumin-ai",
        help="Repository name (default: lumin-ai)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview milestones without creating them"
    )

    args = parser.parse_args()

    # Initialize GitHub client
    client = GitHubClient(args.token, args.owner, args.repo)

    # Process roadmap files
    roadmap_files = []

    if os.path.isdir(args.roadmap_file):
        # Process all ROADMAP.md files in the directory
        for file in os.listdir(args.roadmap_file):
            if file.endswith("ROADMAP.md"):
                roadmap_files.append(os.path.join(args.roadmap_file, file))
    else:
        # Process a single roadmap file
        roadmap_files.append(args.roadmap_file)

    total_milestones = 0
    total_created = 0

    for roadmap_file in roadmap_files:
        try:
            milestones = parse_roadmap_file(roadmap_file)
            total_milestones += len(milestones)

            if not args.dry_run:
                created = create_github_milestones(client, milestones, args.dry_run)
                total_created += len(created)
            else:
                logger.info(f"DRY RUN: Would create {len(milestones)} milestones")

        except FileNotFoundError as e:
            logger.error(e)
            continue
        except Exception as e:
            logger.error(f"Error processing {roadmap_file}: {e}")
            continue

    if args.dry_run:
        logger.info(f"DRY RUN: Would create {total_milestones} milestones from {len(roadmap_files)} roadmap files")
    else:
        logger.info(f"Created {total_created} milestones from {len(roadmap_files)} roadmap files")


if __name__ == "__main__":
    main()