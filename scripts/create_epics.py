#!/usr/bin/env python3
"""
Extract epics from PRD files and create them as labeled GitHub issues
"""
import argparse
import logging
import os
import re
import sys
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


def parse_prd_file(file_path: str) -> List[Dict]:
    """
    Parse a PRD.md file to extract epics
    
    Returns:
        List of epic dictionaries with 'title', 'body', 'labels', and 'milestone'
    """
    logger.info(f"Parsing PRD file: {file_path}")
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"PRD file not found: {file_path}")
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Extract the track name from the file name (e.g., "WebDev--PRD.md" -> "WebDev")
    file_name = os.path.basename(file_path)
    track_name = file_name.split('--')[0] if '--' in file_name else "General"
    
    # Define patterns to match epic information
    # Look for headings like "### Feature: User Authentication"
    epic_pattern = r'###\s+(.+?):\s+(.+?)\n((?:(?!###).)+)'
    
    epics = []
    
    # Extract epic title and description
    matches = re.finditer(epic_pattern, content, re.DOTALL)
    
    for match in matches:
        category = match.group(1).strip()  # e.g., "Feature", "Component", "Service"
        title = match.group(2).strip()
        description = match.group(3).strip()
        
        # Add source reference to description
        source_reference = f"\n\n---\n**Source**: [{file_name}](../../docs/architecture/{file_name})"
        description += source_reference
        
        # Determine labels based on category and track
        labels = [f"{track_name}", "epic"]
        
        if category.lower() == "feature":
            labels.append("feature")
        elif category.lower() == "component":
            labels.append("component")
        elif category.lower() == "service":
            labels.append("service")
            
        # Try to determine milestone from context
        milestone = None
        milestone_match = re.search(r'Phase\s+(\d+)|Week\s+(\d+)', description, re.IGNORECASE)
        if milestone_match:
            phase_num = milestone_match.group(1) or milestone_match.group(2)
            milestone = f"Phase {phase_num}"
        
        epic = {
            "title": f"{category}: {title}",
            "body": description,
            "labels": labels,
            "milestone": milestone
        }
        
        epics.append(epic)
        logger.info(f"Found epic: {epic['title']}")
    
    return epics


def create_github_epics(
    client: GitHubClient, epics: List[Dict], dry_run: bool = False, add_to_project: bool = True
) -> List[Dict]:
    """
    Create epics as GitHub issues with appropriate labels
    
    Args:
        client: GitHub client
        epics: List of epic dictionaries with 'title', 'body', 'labels', and 'milestone'
        dry_run: If True, only log actions without making changes
        add_to_project: Whether to add the epics to the project board
        
    Returns:
        List of created epic data from GitHub
    """
    logger.info(f"Creating {len(epics)} epics on GitHub")
    
    # Ensure the 'epic' label exists
    create_labels_if_needed(client, ["epic"], dry_run)
    
    # Get milestone numbers for assignment
    milestones = client.get_rest("/milestones") or []
    milestone_map = {m["title"]: m["number"] for m in milestones}
    
    created_epics = []
    
    for epic in epics:
        logger.info(f"Creating epic: {epic['title']}")
        
        # Find milestone number if specified
        milestone_number = None
        if epic["milestone"] and epic["milestone"] in milestone_map:
            milestone_number = milestone_map[epic["milestone"]]
        
        payload = {
            "title": epic["title"],
            "body": epic["body"],
            "labels": epic["labels"],
        }
        
        if milestone_number:
            payload["milestone"] = milestone_number
        
        if dry_run:
            logger.info(f"DRY RUN: Would create epic: {epic['title']}")
            continue
        
        response = client.post_rest("/issues", payload)
        
        if response:
            logger.info(f"✅ Created epic: {epic['title']}")
            created_epics.append(response)
            
            # Add to project if requested
            if add_to_project:
                add_issue_to_project(client, response["node_id"])
        else:
            logger.error(f"❌ Failed to create epic: {epic['title']}")
    
    return created_epics


def create_labels_if_needed(client: GitHubClient, label_names: List[str], dry_run: bool = False):
    """Create GitHub labels if they don't already exist"""
    existing_labels = client.get_rest("/labels") or []
    existing_label_names = {label["name"] for label in existing_labels}
    
    for name in label_names:
        if name in existing_label_names:
            logger.info(f"Label already exists: {name}")
            continue
            
        logger.info(f"Creating label: {name}")
        
        # Define color based on label name
        color = "6f42c1"  # Default purple for epics
        
        if name == "WebDev":
            color = "0075ca"  # Blue
        elif name == "DataSci":
            color = "008672"  # Green
        elif name == "DeepLearn":
            color = "d73a4a"  # Red
        elif name == "UX":
            color = "fbca04"  # Yellow
            
        if dry_run:
            logger.info(f"DRY RUN: Would create label: {name}")
            continue
            
        client.post_rest("/labels", {"name": name, "color": color})


def add_issue_to_project(client: GitHubClient, issue_node_id: str) -> bool:
    """Add an issue to the project board"""
    # Use GraphQL to find the project
    query = """
    {
      repository(owner: "%s", name: "%s") {
        projectsV2(first: 10) {
          nodes {
            id
            title
          }
        }
      }
    }
    """ % (client.owner, client.repo)
    
    result = client.post_graphql(query)
    
    if "data" not in result:
        logger.error("Failed to fetch projects")
        return False
    
    projects = result["data"]["repository"]["projectsV2"]["nodes"]
    project = next((p for p in projects if p["title"] == "LUMIN Project Tracker"), None)
    
    if not project:
        logger.error("Project 'LUMIN Project Tracker' not found")
        return False
    
    project_id = project["id"]
    
    # Add issue to project
    mutation = """
    mutation {
      addProjectV2ItemById(input: {
        projectId: "%s"
        contentId: "%s"
      }) {
        item {
          id
        }
      }
    }
    """ % (project_id, issue_node_id)
    
    result = client.post_graphql(mutation)
    
    if "data" in result and "addProjectV2ItemById" in result["data"]:
        logger.info("Added epic to project board")
        return True
    else:
        logger.error("Failed to add epic to project board")
        return False


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Create GitHub epics from PRD files")
    parser.add_argument(
        "prd_file", 
        help="Path to PRD.md file or directory containing PRD files"
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
        help="Preview epics without creating them"
    )
    parser.add_argument(
        "--no-project", 
        action="store_true", 
        help="Skip adding epics to project board"
    )
    
    args = parser.parse_args()
    
    # Initialize GitHub client
    client = GitHubClient(args.token, args.owner, args.repo)
    
    # Process PRD files
    prd_files = []
    
    if os.path.isdir(args.prd_file):
        # Process all PRD.md files in the directory
        for file in os.listdir(args.prd_file):
            if file.endswith("PRD.md"):
                prd_files.append(os.path.join(args.prd_file, file))
    else:
        # Process a single PRD file
        prd_files.append(args.prd_file)
    
    total_epics = 0
    total_created = 0
    
    for prd_file in prd_files:
        try:
            epics = parse_prd_file(prd_file)
            total_epics += len(epics)
            
            if not args.dry_run:
                created = create_github_epics(
                    client, epics, args.dry_run, not args.no_project
                )
                total_created += len(created)
            else:
                logger.info(f"DRY RUN: Would create {len(epics)} epics")
            
        except FileNotFoundError as e:
            logger.error(e)
            continue
        except Exception as e:
            logger.error(f"Error processing {prd_file}: {e}")
            continue
    
    if args.dry_run:
        logger.info(f"DRY RUN: Would create {total_epics} epics from {len(prd_files)} PRD files")
    else:
        logger.info(f"Created {total_created} epics from {len(prd_files)} PRD files")


if __name__ == "__main__":
    main()
