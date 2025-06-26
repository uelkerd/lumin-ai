#!/bin/bash
#
# LUMIN.AI Project Setup Script
# This script sets up the entire GitHub project structure based on PRD, MVP, and ROADMAP docs.

set -e  # Exit on error

# ANSI color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display execution steps
function step() {
  echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Function to display success messages
function success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Function to display errors
function error() {
  echo -e "${RED}✗ $1${NC}" >&2
  exit 1
}

# Function to display warnings
function warning() {
  echo -e "${YELLOW}! $1${NC}"
}

# Check if token is provided
if [ -z "$1" ]; then
  error "Usage: $0 <github_token> [--dry-run]"
fi

TOKEN="$1"
DRY_RUN=""

# Check if dry run is requested
if [ "$2" = "--dry-run" ]; then
  DRY_RUN="--dry-run"
  warning "Running in DRY RUN mode (no changes will be made to GitHub)"
fi

# Make sure we're in the project root
if [ ! -d "scripts" ] || [ ! -d "docs/architecture" ]; then
  error "Please run this script from the project root directory"
fi

# Step 1: Verify token permissions
step "Verifying GitHub token permissions"
if ! curl -s -H "Authorization: token $TOKEN" https://api.github.com/user | grep -q "login"; then
  error "Invalid GitHub token or insufficient permissions"
fi
success "GitHub token verified"

# Step 2: Create milestones
step "Creating milestones from ROADMAP documents"
python scripts/create_milestones.py docs/architecture --token "$TOKEN" $DRY_RUN
success "Milestone creation completed"

# Step 3: Create epics
step "Creating epics from PRD documents"
python scripts/create_epics.py docs/architecture --token "$TOKEN" $DRY_RUN
success "Epic creation completed"

# Step 4 & 5: Parse PRDs and create issues
step "Parsing PRDs and creating issues"
for track in WebDev DataSci DeepLearn UX; do
  echo "Processing $track track..."
  python scripts/prd_parser.py "docs/architecture/${track}--PRD.md" --output "${track,,}_issues.json"
  python scripts/gh_issue_creator.py "${track,,}_issues.json" --token "$TOKEN" $DRY_RUN
  success "$track track processed"
done

# Step 6: Link issues to documentation
step "Linking issues to documentation"
python scripts/link_issues_to_docs.py docs/architecture --token "$TOKEN" $DRY_RUN
success "Documentation linking completed"

# Summary
if [ -z "$DRY_RUN" ]; then
  success "Project setup complete!"
else
  warning "Dry run completed. To create actual resources, run without --dry-run"
fi

echo -e "\n${BLUE}Next steps:${NC}"
echo -e "1. Visit your GitHub repository to review the created issues, milestones, and project board"
echo -e "2. Assign issues to team members"
echo -e "3. Start implementation of the MVP features"