# LUMIN.AI Project Management Workflow Example

This document demonstrates how to use the project management scripts together to set up a complete GitHub project structure based on the PRD, MVP, and ROADMAP documents.

## Prerequisites

1. A GitHub personal access token with `repo` and `project` scopes
2. The LUMIN.AI repository cloned locally

## Step 1: Set Up Your GitHub Token

First, use the `setup_github_token.sh` script to verify your token has the necessary permissions:

```bash
./scripts/setup_github_token.sh
```

Follow the interactive prompts to create a token with proper permissions.

## Step 2: Create Milestones from Roadmaps

Extract milestones from the ROADMAP documents and create them in GitHub:

```bash
python scripts/create_milestones.py docs/architecture --token YOUR_GITHUB_TOKEN --dry-run
```

When you're confident with the results, remove the `--dry-run` flag to create the milestones.

## Step 3: Create Epics from PRDs

Extract epics from the PRD documents and create them as labeled GitHub issues:

```bash
python scripts/create_epics.py docs/architecture --token YOUR_GITHUB_TOKEN --dry-run
```

Remove the `--dry-run` flag to create the epics when you're ready.

## Step 4: Parse PRDs for Individual Issues

Parse the PRD documents to extract individual issues and save them as JSON:

```bash
python scripts/prd_parser.py docs/architecture/WebDev--PRD.md --output webdev_issues.json
python scripts/prd_parser.py docs/architecture/DataSci--PRD.md --output datasci_issues.json
python scripts/prd_parser.py docs/architecture/DeepLearn--PRD.md --output deeplearn_issues.json
python scripts/prd_parser.py docs/architecture/UX--PRD.md --output ux_issues.json
```

## Step 5: Create Individual Issues

Create the individual issues from the JSON files and add them to the project board:

```bash
python scripts/gh_issue_creator.py webdev_issues.json --token YOUR_GITHUB_TOKEN --dry-run
```

Again, remove the `--dry-run` flag when you're ready to create the issues.

## Step 6: Link Issues to Documentation

Link the created issues back to the relevant sections in the documentation for traceability:

```bash
python scripts/link_issues_to_docs.py docs/architecture --token YOUR_GITHUB_TOKEN --dry-run
```

Remove the `--dry-run` flag to add the documentation links to the issues.

## Step 7: Prune Backlog for MVP Focus (Optional)

To focus on the MVP, you can prune the backlog to close issues that aren't part of the current MVP scope:

```bash
python scripts/prune_backlog.py --token YOUR_GITHUB_TOKEN --dry-run
```

Remove the `--dry-run` flag to actually close the issues when you're ready.

## Putting It All Together: One-Liner Script

Here's a bash one-liner that executes the entire workflow:

```bash
#!/bin/bash

# Set your GitHub token
TOKEN="your_github_token"

# Create milestones and epics
python scripts/create_milestones.py docs/architecture --token $TOKEN
python scripts/create_epics.py docs/architecture --token $TOKEN

# Parse PRDs and create issues
for track in WebDev DataSci DeepLearn UX; do
  python scripts/prd_parser.py docs/architecture/${track}--PRD.md --output ${track,,}_issues.json
  python scripts/gh_issue_creator.py ${track,,}_issues.json --token $TOKEN
done

# Link issues to documentation
python scripts/link_issues_to_docs.py docs/architecture --token $TOKEN
```

Save this as `setup_project.sh` in the scripts directory and make it executable with `chmod +x scripts/setup_project.sh` to run the entire workflow at once.

## Conclusion

By using these scripts together, you can quickly set up a well-organized GitHub project structure that maintains traceability between your product documentation and implementation tasks, making it easier to track progress and manage the project.
