#!/bin/bash
# LUMIN.AI CI Pipeline Script
# This script runs all validation and automation tasks for the LUMIN project

set -e  # Exit on any error

# Parse command line arguments
DRY_RUN="--dry-run"  # Default to dry-run mode
while [[ $# -gt 0 ]]; do
  case $1 in
    --create-issues)
      DRY_RUN=""  # Empty string means no dry-run flag
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Set up variables
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE=".reports/ci_report_${TIMESTAMP}.json"
GITHUB_TOKEN=${GITHUB_TOKEN:-$(grep GITHUB_TOKEN .env | cut -d '=' -f2)}
OWNER="uelkerd"
REPO="lumin-ai"
PROJECT_NAME="LUMIN Project Tracker"

# Create reports directory if it doesn't exist
mkdir -p .reports

# Initialize report structure
echo '{
  "timestamp": "'$(date -Iseconds)'",
  "repository": "'${OWNER}/${REPO}'",
  "project": "'${PROJECT_NAME}'",
  "total_duration": 0,
  "checks": [],
  "summary": {
    "total_checks": 0,
    "passed_checks": 0,
    "failed_checks": 0,
    "critical_failures": 0,
    "overall_status": false
  }
}' > $REPORT_FILE

# Function to add a check result to the report
add_check_result() {
  local name=$1
  local status=$2
  local message=$3
  local duration=$4
  local critical=$5

  # Update the checks array
  jq --arg name "$name" \
     --argjson status $status \
     --arg message "$message" \
     --argjson duration $duration \
     --argjson critical $critical \
     '.checks += [{
        "name": $name,
        "status": $status,
        "message": $message,
        "duration": $duration,
        "critical": $critical
      }]' $REPORT_FILE > ${REPORT_FILE}.tmp && mv ${REPORT_FILE}.tmp $REPORT_FILE
}

# Function to update the summary in the report
update_summary() {
  jq '.summary.total_checks = (.checks | length) |
      .summary.passed_checks = (.checks | map(select(.status == true)) | length) |
      .summary.failed_checks = (.checks | map(select(.status == false)) | length) |
      .summary.critical_failures = (.checks | map(select(.status == false and .critical == true)) | length) |
      .summary.overall_status = (.summary.critical_failures == 0)' $REPORT_FILE > ${REPORT_FILE}.tmp && mv ${REPORT_FILE}.tmp $REPORT_FILE
}

# Function to update the total duration in the report
update_duration() {
  local total_duration=$1
  jq --argjson duration $total_duration '.total_duration = $duration' $REPORT_FILE > ${REPORT_FILE}.tmp && mv ${REPORT_FILE}.tmp $REPORT_FILE
}

# Start the timer
START_TIME=$(date +%s.%N)

echo "🚀 Starting LUMIN.AI CI pipeline..."
echo "📊 Report will be saved to: $REPORT_FILE"

# Check 1: Fix issue labels
echo "🔄 Running issue label fixer..."
CHECK_START=$(date +%s.%N)
LABEL_FIXER_OUTPUT=$(python -m scripts.fix_issue_labels --owner $OWNER --repo $REPO --token $GITHUB_TOKEN 2>&1)
LABEL_FIXER_STATUS=$?
CHECK_END=$(date +%s.%N)
CHECK_DURATION=$(echo "$CHECK_END - $CHECK_START" | bc)

if [ $LABEL_FIXER_STATUS -eq 0 ]; then
  add_check_result "Issue Label Fixer" true "✅ Issue labels fixed successfully" $CHECK_DURATION false
else
  add_check_result "Issue Label Fixer" false "❌ Issue label fixer failed: $LABEL_FIXER_OUTPUT" $CHECK_DURATION true
fi

# Check 2: Project setup validation
echo "🔍 Validating project setup..."
CHECK_START=$(date +%s.%N)
VALIDATION_OUTPUT=$(python -m scripts.project_setup_validator --owner $OWNER --repo $REPO --token $GITHUB_TOKEN 2>&1)
VALIDATION_STATUS=$?
CHECK_END=$(date +%s.%N)
CHECK_DURATION=$(echo "$CHECK_END - $CHECK_START" | bc)

if [ $VALIDATION_STATUS -eq 0 ]; then
  add_check_result "Project Setup Validation" true "✅ Project setup validated successfully" $CHECK_DURATION true
else
  add_check_result "Project Setup Validation" false "❌ Validation failed: $VALIDATION_OUTPUT" $CHECK_DURATION true
fi

# Check 3: Label validation
echo "🏷️ Validating issue labels..."
CHECK_START=$(date +%s.%N)
LABEL_VALIDATION_OUTPUT=$(python -m scripts.validate_labels --owner $OWNER --repo $REPO --token $GITHUB_TOKEN 2>&1)
LABEL_VALIDATION_STATUS=$?
CHECK_END=$(date +%s.%N)
CHECK_DURATION=$(echo "$CHECK_END - $CHECK_START" | bc)

if [ $LABEL_VALIDATION_STATUS -eq 0 ]; then
  add_check_result "Label Validation" true "✅ Label validation passed" $CHECK_DURATION true
else
  add_check_result "Label Validation" false "❌ Label validation failed: $LABEL_VALIDATION_OUTPUT" $CHECK_DURATION true
fi

# Check 4: Generate issues from PRD documents
echo "📝 Generating issues from PRD documents..."
if [ -z "$DRY_RUN" ]; then
  echo "   ⚠️ CREATING ACTUAL ISSUES (not dry run)"
else
  echo "   ℹ️ Running in dry-run mode (no issues will be created)"
fi

CHECK_START=$(date +%s.%N)

# Process each track using the existing comprehensive solution
for TRACK in "project" "webdev" "datasci" "deeplearn" "ux"; do
  echo "   - Processing ${TRACK} track..."
  # Parse PRD files for this track
  python -m scripts.prd_parser docs/architecture --filter $TRACK --output-file ${TRACK}_issues.json

  # Create GitHub issues with proper metadata
  if [ "$TRACK" == "project" ]; then
    PRIORITY="high"
  else
    PRIORITY="medium"
  fi

  python -m scripts.gh_issue_creator ${TRACK}_issues.json --token $GITHUB_TOKEN \
    --add-track-milestone ${TRACK^} --priority $PRIORITY $DRY_RUN
done

# Clean up temporary files
rm -f project_issues.json webdev_issues.json datasci_issues.json deeplearn_issues.json ux_issues.json

CHECK_END=$(date +%s.%N)
CHECK_DURATION=$(echo "$CHECK_END - $CHECK_START" | bc)

if [ -z "$DRY_RUN" ]; then
  add_check_result "PRD Issue Generation" true "✅ Issues created from PRD documents" $CHECK_DURATION false
else
  add_check_result "PRD Issue Generation" true "✅ Dry run: Issues would be generated from PRD documents" $CHECK_DURATION false
fi

# Check 5: Organize issues into epics hierarchy
echo "🔗 Organizing issues into epics hierarchy..."
CHECK_START=$(date +%s.%N)

if [ -z "$DRY_RUN" ]; then
  EPIC_DRY_RUN=""
else
  EPIC_DRY_RUN="--dry-run"
fi

# Process each track's PRD files to create epics
EPIC_ORGANIZATION_STATUS=0
for TRACK_DIR in $(find docs/architecture -type f -name "*PRD.md" | sort); do
  echo "   - Creating epics from: $TRACK_DIR"
  EPIC_OUTPUT=$(python -m scripts.create_epics "$TRACK_DIR" --token $GITHUB_TOKEN --owner $OWNER --repo $REPO $EPIC_DRY_RUN 2>&1)
  CURRENT_STATUS=$?

  if [ $CURRENT_STATUS -ne 0 ]; then
    EPIC_ORGANIZATION_STATUS=1
    echo "     ❌ Epic creation failed: $EPIC_OUTPUT"
  fi
done

CHECK_END=$(date +%s.%N)
CHECK_DURATION=$(echo "$CHECK_END - $CHECK_START" | bc)

if [ $EPIC_ORGANIZATION_STATUS -eq 0 ]; then
  if [ -z "$DRY_RUN" ]; then
    add_check_result "Epic Issue Organization" true "✅ Issues organized into epics hierarchy" $CHECK_DURATION false
  else
    add_check_result "Epic Issue Organization" true "✅ Dry run: Issues would be organized into epics hierarchy" $CHECK_DURATION false
  fi
else
  if [ -z "$DRY_RUN" ]; then
    add_check_result "Epic Issue Organization" false "❌ Failed to organize issues into epics" $CHECK_DURATION false
  else
    add_check_result "Epic Issue Organization" false "❌ Dry run: Epic organization simulation failed" $CHECK_DURATION false
  fi
fi

# Calculate total duration
END_TIME=$(date +%s.%N)
TOTAL_DURATION=$(echo "$END_TIME - $START_TIME" | bc)
update_duration $TOTAL_DURATION

# Update the summary
update_summary

# Print the final status
if [ "$(jq -r '.summary.overall_status' $REPORT_FILE)" == "true" ]; then
  echo "✅ CI pipeline completed successfully!"
else
  echo "❌ CI pipeline failed. Check the report for details."
fi

echo "📊 Full report saved to: $REPORT_FILE"
