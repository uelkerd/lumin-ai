#!/usr/bin/env python3
"""
LUMIN.AI PRD Parser
This script parses markdown PRD files to generate a JSON file of issues
for the gh_issue_creator.py script.
"""

import os
import json
import re
import logging
from typing import List, Dict, Optional
import argparse
import sys

# Setup logging
logger = logging.getLogger(__name__)

def parse_markdown_to_issues(file_path: str) -> List[Dict]:
    """
    Parses a single markdown file and extracts issues from headings.
    - Level 2 headings (##) are considered main issues/epics.
    - Level 3 headings (###) are considered sub-tasks.
    """
    issues = []

    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    current_issue = None

    # Extract labels from filename
    basename = os.path.basename(file_path)
    filename_parts = re.split(r'--|_|\.', basename)
    labels = [part.lower() for part in filename_parts if part and part not in ['prd', 'md', 'mvp', 'roadmap']]

    for line in lines:
        h3_match = re.match(r'^###\s+(.*)', line)
        h2_match = re.match(r'^##\s+(.*)', line)

        if match := h3_match or h2_match:
            if current_issue:
                # Clean up body content
                current_issue['body'] = "".join(current_issue['body']).strip()
                issues.append(current_issue)

            title = match.group(1).strip()

            # Skip table of contents
            if 'table of contents' in title.lower():
                current_issue = None
                continue

            current_issue = {
                "title": title,
                "body": [],
                "labels": labels
            }
        elif current_issue:
            current_issue['body'].append(line)

    if current_issue:
        current_issue['body'] = "".join(current_issue['body']).strip()
        issues.append(current_issue)

    return issues

def main():
    parser = argparse.ArgumentParser(
        description='Parse LUMIN.AI PRD files into a JSON format for issue creation.'
    )
    parser.add_argument(
        'prd_directory',
        help='Path to the directory containing PRD markdown files.'
    )
    parser.add_argument(
        '--output-file',
        default='issues.json',
        help='Path to the output JSON file (default: issues.json)'
    )
    parser.add_argument(
        '--log-level',
        default='INFO',
        choices=['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'],
        help='Set the logging level (default: INFO)'
    )

    args = parser.parse_args()

    # Configure logging
    logging.basicConfig(level=getattr(logging, args.log_level),
                        format='%(asctime)s - %(levelname)s - %(message)s')

    all_issues = []

    if not os.path.isdir(args.prd_directory):
        logger.critical(f"Error: Directory '{args.prd_directory}' not found.")
        sys.exit(1)

    logger.info(f"🔍 Parsing PRD files from '{args.prd_directory}'...")

    for filename in os.listdir(args.prd_directory):
        if filename.endswith(('_prd.md', 'PRD.md')):
            file_path = os.path.join(args.prd_directory, filename)
            logger.info(f"   - Processing {filename}")
            issues = parse_markdown_to_issues(file_path)
            all_issues.extend(issues)

    try:
        with open(args.output_file, 'w', encoding='utf-8') as f:
            json.dump(all_issues, f, indent=2)
    except IOError as e:
        logger.critical(f"Error writing to output file '{args.output_file}': {e}")
        sys.exit(1)

    logger.info(f"\n✅ Successfully parsed {len(all_issues)} issues.")
    logger.info(f"📝 Output written to '{args.output_file}'")
    logger.info("\nNext step: Run the issue creator script in dry-run mode:")
    logger.info(f"python scripts/gh_issue_creator.py {args.output_file} --token YOUR_TOKEN --dry-run")


if __name__ == "__main__":
    main()