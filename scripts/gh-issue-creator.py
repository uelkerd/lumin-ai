#!/usr/bin/env python3
"""
LUMIN.AI GitHub Issue Creator with Project Board Integration
Automates creation of GitHub issues from parsed PRD requirements
and adds them to the LUMIN Project Tracker board
"""

import json
import requests
import time
from typing import List, Dict, Optional, Tuple
import argparse
import sys

class GitHubIssueCreator:
    def __init__(self, token: str, owner: str, repo: str):
        self.token = token
        self.owner = owner
        self.repo = repo
        self.base_url = f"https://api.github.com/repos/{owner}/{repo}"
        self.headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json"
        }
        self.graphql_url = "https://api.github.com/graphql"
        self.project_id = None
        self.project_field_id = None
        self.backlog_option_id = None
        
    def get_milestones(self) -> Dict[str, int]:
        """Fetch existing milestones and return mapping"""
        url = f"{self.base_url}/milestones"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code != 200:
            print(f"Error fetching milestones: {response.status_code}")
            return {}
            
        milestones = {}
        for milestone in response.json():
            milestones[milestone['title']] = milestone['number']
            
        return milestones
    
    def graphql_query(self, query: str) -> Dict:
        """Execute a GraphQL query"""
        response = requests.post(
            self.graphql_url,
            json={'query': query},
            headers=self.headers
        )
        
        if response.status_code != 200:
            print(f"GraphQL query failed: {response.status_code}")
            print(response.text)
            return {}
            
        return response.json()
    
    def find_project(self, project_name: str) -> Optional[str]:
        """Find project by name and get its ID"""
        query = f"""
        {{
          repository(owner: "{self.owner}", name: "{self.repo}") {{
            projectsV2(first: 10) {{
              nodes {{
                id
                title
              }}
            }}
          }}
        }}
        """
        
        result = self.graphql_query(query)
        
        if 'data' not in result:
            return None
            
        projects = result['data']['repository']['projectsV2']['nodes']
        
        for project in projects:
            if project['title'] == project_name:
                print(f"✅ Found project: {project['title']}")
                return project['id']
                
        return None
    
    def get_project_field_info(self, project_id: str) -> Tuple[Optional[str], Optional[str]]:
        """Get the Status field ID and Backlog option ID"""
        query = f"""
        {{
          node(id: "{project_id}") {{
            ... on ProjectV2 {{
              fields(first: 20) {{
                nodes {{
                  ... on ProjectV2Field {{
                    id
                    name
                  }}
                  ... on ProjectV2SingleSelectField {{
                    id
                    name
                    options {{
                      id
                      name
                    }}
                  }}
                }}
              }}
            }}
          }}
        }}
        """
        
        result = self.graphql_query(query)
        
        if 'data' not in result:
            return None, None
            
        fields = result['data']['node']['fields']['nodes']
        
        for field in fields:
            if field.get('name') == 'Status' and 'options' in field:
                field_id = field['id']
                for option in field['options']:
                    if option['name'] == 'Backlog':
                        print(f"✅ Found Status field and Backlog option")
                        return field_id, option['id']
                        
        return None, None
    
    def add_issue_to_project(self, issue_id: str) -> bool:
        """Add an issue to the project and set it to Backlog"""
        if not self.project_id:
            return False
            
        # First, add the issue to the project
        mutation = f"""
        mutation {{
          addProjectV2ItemById(input: {{
            projectId: "{self.project_id}"
            contentId: "{issue_id}"
          }}) {{
            item {{
              id
            }}
          }}
        }}
        """
        
        result = self.graphql_query(mutation)
        
        if 'data' not in result or 'addProjectV2ItemById' not in result['data']:
            print(f"Failed to add issue to project")
            return False
            
        item_id = result['data']['addProjectV2ItemById']['item']['id']
        
        # Then, set it to Backlog status
        if self.project_field_id and self.backlog_option_id:
            update_mutation = f"""
            mutation {{
              updateProjectV2ItemFieldValue(input: {{
                projectId: "{self.project_id}"
                itemId: "{item_id}"
                fieldId: "{self.project_field_id}"
                value: {{
                  singleSelectOptionId: "{self.backlog_option_id}"
                }}
              }}) {{
                projectV2Item {{
                  id
                }}
              }}
            }}
            """
            
            update_result = self.graphql_query(update_mutation)
            
            if 'data' in update_result:
                print(f"   ✅ Added to Backlog")
                return True
            else:
                print(f"   ⚠️  Added to project but couldn't set to Backlog")
                return True
                
        return True
    
    def create_issue(self, issue_data: Dict, add_to_project: bool = True) -> bool:
        """Create a single issue on GitHub and optionally add to project"""
        url = f"{self.base_url}/issues"
        
        # Map milestone name to number
        milestones = self.get_milestones()
        milestone_number = None
        
        if 'milestone' in issue_data:
            milestone_name = issue_data['milestone']
            if milestone_name in milestones:
                milestone_number = milestones[milestone_name]
            else:
                print(f"Warning: Milestone '{milestone_name}' not found")
        
        # Prepare issue payload
        payload = {
            "title": issue_data['title'],
            "body": issue_data['body'],
            "labels": issue_data.get('labels', []),
        }
        
        if milestone_number:
            payload['milestone'] = milestone_number
            
        if 'assignees' in issue_data and issue_data['assignees']:
            payload['assignees'] = issue_data['assignees']
        
        # Create the issue
        response = requests.post(url, json=payload, headers=self.headers)
        
        if response.status_code == 201:
            issue = response.json()
            print(f"✅ Created issue #{issue['number']}: {issue['title']}")
            
            # Add to project board if requested
            if add_to_project and self.project_id:
                self.add_issue_to_project(issue['node_id'])
                
            return True
        else:
            print(f"❌ Failed to create issue: {issue_data['title']}")
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    
    def create_issues_batch(self, issues: List[Dict], delay: float = 1.0, 
                           project_name: Optional[str] = None) -> Dict:
        """Create multiple issues with rate limiting and optional project board integration"""
        results = {
            'created': 0,
            'failed': 0,
            'total': len(issues)
        }
        
        # Set up project board integration if requested
        if project_name:
            print(f"\n🔍 Setting up project board integration...")
            self.project_id = self.find_project(project_name)
            
            if self.project_id:
                self.project_field_id, self.backlog_option_id = self.get_project_field_info(self.project_id)
                if not self.project_field_id:
                    print("⚠️  Warning: Could not find Status field in project")
            else:
                print(f"⚠️  Warning: Project '{project_name}' not found. Issues will be created without project assignment.")
        
        print(f"\n🚀 Creating {len(issues)} issues on GitHub...\n")
        
        for i, issue in enumerate(issues, 1):
            print(f"Processing {i}/{len(issues)}: {issue['title']}")
            
            if self.create_issue(issue, add_to_project=bool(project_name)):
                results['created'] += 1
            else:
                results['failed'] += 1
            
            # Rate limiting to avoid hitting API limits
            if i < len(issues):
                time.sleep(delay)
        
        return results

def validate_issues_json(issues_data: List[Dict]) -> bool:
    """Validate the structure of issues JSON"""
    required_fields = ['title', 'body']
    
    for i, issue in enumerate(issues_data):
        for field in required_fields:
            if field not in issue:
                print(f"Error: Issue {i+1} missing required field: {field}")
                return False
                
    return True

def main():
    parser = argparse.ArgumentParser(
        description='Create GitHub issues from LUMIN.AI PRD requirements with project board integration'
    )
    parser.add_argument(
        'json_file',
        help='Path to JSON file containing issues data'
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
        '--no-project',
        action='store_true',
        help='Skip adding issues to project board'
    )
    parser.add_argument(
        '--delay',
        type=float,
        default=1.0,
        help='Delay between issue creation in seconds (default: 1.0)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview issues without creating them'
    )
    
    args = parser.parse_args()
    
    # Load issues from JSON file
    try:
        with open(args.json_file, 'r') as f:
            issues_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: File '{args.json_file}' not found")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in file - {e}")
        sys.exit(1)
    
    # Validate issues structure
    if not validate_issues_json(issues_data):
        sys.exit(1)
    
    print(f"\n📊 Loaded {len(issues_data)} issues from {args.json_file}")
    
    # Dry run - just preview
    if args.dry_run:
        print("\n🔍 DRY RUN - Issues to be created:\n")
        for i, issue in enumerate(issues_data, 1):
            print(f"{i}. {issue['title']}")
            print(f"   Labels: {', '.join(issue.get('labels', []))}")
            print(f"   Milestone: {issue.get('milestone', 'None')}")
            print()
        return
    
    # Create GitHub client
    creator = GitHubIssueCreator(args.token, args.owner, args.repo)
    
    # Determine if we should use project board
    project_name = None if args.no_project else args.project
    
    # Confirm before proceeding
    print(f"\n⚠️  This will create {len(issues_data)} issues in {args.owner}/{args.repo}")
    if project_name:
        print(f"   Issues will be added to project: {project_name}")
    confirm = input("Continue? (y/N): ")
    
    if confirm.lower() != 'y':
        print("Aborted.")
        return
    
    # Create issues
    results = creator.create_issues_batch(issues_data, args.delay, project_name)
    
    # Summary
    print("\n" + "="*50)
    print("📈 SUMMARY")
    print("="*50)
    print(f"Total issues: {results['total']}")
    print(f"✅ Created: {results['created']}")
    print(f"❌ Failed: {results['failed']}")
    
    if results['failed'] == 0:
        print("\n🎉 All issues created successfully!")
    else:
        print(f"\n⚠️  {results['failed']} issues failed to create. Check the errors above.")

if __name__ == "__main__":
    main()

"""
Usage Instructions:

1. First, get a GitHub Personal Access Token:
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Generate new token with 'repo' and 'project' scopes
   - Copy the token

2. Save the JSON output from the web tool to a file (e.g., issues.json)

3. Run the script:
   python github_issue_creator.py issues.json --token YOUR_GITHUB_TOKEN

   This will:
   - Create all issues
   - Add them to "LUMIN Project Tracker" project
   - Place them in the Backlog column

4. Optional parameters:
   --dry-run              Preview without creating
   --delay 2.0            Set delay between issues (default 1 second)
   --owner uelkerd        Change repo owner
   --repo lumin-ai        Change repo name
   --project "My Board"   Use different project board
   --no-project           Skip project board integration

Examples:
   # Dry run to preview
   python github_issue_creator.py issues.json --token ghp_xxxxx --dry-run
   
   # Create issues and add to default project
   python github_issue_creator.py issues.json --token ghp_xxxxx
   
   # Create issues without project board
   python github_issue_creator.py issues.json --token ghp_xxxxx --no-project
   
   # Use custom project name
   python github_issue_creator.py issues.json --token ghp_xxxxx --project "Sprint Planning"

Note: The token needs both 'repo' and 'project' scopes for full functionality.
"""