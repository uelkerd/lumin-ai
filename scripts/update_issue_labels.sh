#!/bin/bash
# Update GitHub issue labels using GitHub CLI
# This script updates all issues to ensure they have valid track and priority labels

set -e

# Set default owner and repo if not provided
OWNER=${1:-uelkerd}
REPO=${2:-lumin-ai}

# Check if GitHub CLI is installed and authenticated
if ! command -v gh &>/dev/null; then
  echo "Error: GitHub CLI is not installed. Please install it first."
  exit 1
fi

if ! gh auth status &>/dev/null; then
  echo "Error: GitHub CLI is not authenticated. Please run 'gh auth login' first."
  exit 1
fi

echo "🔄 Starting label update for $OWNER/$REPO..."

# Get all issues (open and closed)
echo "📋 Fetching all issues..."
issues=$(gh issue list --repo "$OWNER/$REPO" --state all --limit 1000 --json number,title,labels)

# Track labels
TRACK_LABELS=("deep-learning" "data-science" "web-development" "ux-design" "project")
DEFAULT_TRACK="project"

# Priority labels
PRIORITY_LABELS=("priority/highest" "priority/high" "priority/medium" "priority/low" "priority/lowest")
DEFAULT_PRIORITY="priority/medium"

# Label mapping for non-canonical labels
declare -A LABEL_MAP
LABEL_MAP["enhancement"]="project"
LABEL_MAP["bug"]="project"
LABEL_MAP["documentation"]="project"
LABEL_MAP["dependencies"]="project"
LABEL_MAP["python"]="data-science"
LABEL_MAP["ux"]="ux-design"

# Process each issue
echo "$issues" | jq -c '.[]' | while read -r issue; do
  number=$(echo "$issue" | jq -r '.number')
  title=$(echo "$issue" | jq -r '.title')
  labels=$(echo "$issue" | jq -r '.labels[].name')

  echo -e "\n🏷️  Processing issue #$number: \"$title\""

  # Check if issue has at least one track label
  has_track_label=false
  for label in $labels; do
    for track in "${TRACK_LABELS[@]}"; do
      if [ "$label" == "$track" ]; then
        has_track_label=true
        break 2
      fi
    done
  done

  # Check if issue has exactly one priority label
  priority_count=0
  has_priority_label=""
  for label in $labels; do
    for priority in "${PRIORITY_LABELS[@]}"; do
      if [ "$label" == "$priority" ]; then
        priority_count=$((priority_count + 1))
        has_priority_label=$label
        break
      fi
    done
  done

  # Labels to add
  labels_to_add=()

  # Add track label if missing
  if [ "$has_track_label" = false ]; then
    echo "  - Missing track label: Adding '$DEFAULT_TRACK'"
    labels_to_add+=("$DEFAULT_TRACK")
  fi

  # Fix priority label
  if [ $priority_count -eq 0 ]; then
    echo "  - Missing priority label: Adding '$DEFAULT_PRIORITY'"
    labels_to_add+=("$DEFAULT_PRIORITY")
  elif [ $priority_count -gt 1 ]; then
    echo "  - Multiple priority labels: Keeping only '$has_priority_label'"
    # We'll handle this with a separate action to remove other priority labels
  fi

  # Apply the changes
  if [ ${#labels_to_add[@]} -gt 0 ]; then
    label_args=""
    for label in "${labels_to_add[@]}"; do
      label_args+=" --add-label \"$label\""
    done

    echo "  - Updating issue with labels: ${labels_to_add[*]}"
    eval "gh issue edit $number --repo $OWNER/$REPO $label_args"
  else
    echo "  - No label changes needed"
  fi
done

echo -e "\n✅ Label update complete!"
