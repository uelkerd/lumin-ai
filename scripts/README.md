# LUMIN.AI Project Management Scripts

This directory contains scripts for managing the LUMIN.AI project development workflow, including GitHub issue management, PRD parsing, and backlog maintenance.

## Scripts Overview

### `gh_issue_creator.py`

Creates GitHub issues from JSON data and optionally adds them to a project board.

**Usage:**

```bash
python scripts/gh_issue_creator.py issues.json --token YOUR_GITHUB_TOKEN
```

**Options:**

- `--token`: GitHub personal access token (required)
- `--owner`: Repository owner (default: "uelkerd")
- `--repo`: Repository name (default: "lumin-ai")
- `--project`: Project board name (default: "LUMIN Project Tracker")
- `--no-project`: Skip adding issues to project board
- `--delay`: Delay between issue creation in seconds (default: 1.0)
- `--dry-run`: Preview issues without creating them

### `prd_parser.py`

Parses Product Requirement Documents (PRDs) and converts them into structured JSON for GitHub issue creation.

**Usage:**

```bash
python scripts/prd_parser.py path/to/prd.md --output issues.json
```

### `prune_backlog.py`

Finds and closes GitHub issues that are no longer part of the MVP scope based on predefined criteria.

**Usage:**

```bash
python scripts/prune_backlog.py --token YOUR_GITHUB_TOKEN
```

**Options:**

- `--token`: GitHub personal access token (required)
- `--owner`: Repository owner (default: "LUMIN-AI-DEV")
- `--repo`: Repository name (default: "lumin-ai")
- `--dry-run`: Simulate the pruning process without closing any issues
- `--log-level`: Set the logging level (default: "INFO")

### `create_milestones.py`

Extracts milestones from ROADMAP.md files and creates them in GitHub.

**Usage:**

```bash
python scripts/create_milestones.py docs/architecture --token YOUR_GITHUB_TOKEN
```

**Options:**

- `--token`: GitHub personal access token (required)
- `--owner`: Repository owner (default: "uelkerd")
- `--repo`: Repository name (default: "lumin-ai")
- `--dry-run`: Preview milestones without creating them

### `create_epics.py`

Extracts epics from PRD files and creates them as labeled GitHub issues.

**Usage:**

```bash
python scripts/create_epics.py docs/architecture --token YOUR_GITHUB_TOKEN
```

**Options:**

- `--token`: GitHub personal access token (required)
- `--owner`: Repository owner (default: "uelkerd")
- `--repo`: Repository name (default: "lumin-ai")
- `--dry-run`: Preview epics without creating them
- `--no-project`: Skip adding epics to project board

### `link_issues_to_docs.py`

Links existing GitHub issues to relevant sections in documentation files, helping to maintain traceability between requirements and implementation.

**Usage:**

```bash
python scripts/link_issues_to_docs.py docs/architecture --token YOUR_GITHUB_TOKEN
```

**Options:**

- `--token`: GitHub personal access token (required)
- `--owner`: Repository owner (default: "uelkerd")
- `--repo`: Repository name (default: "lumin-ai")
- `--query`: GitHub search query to filter issues (default: "is:open is:issue no:projectcard")
- `--dry-run`: Preview changes without updating issues

### `setup_github_token.sh`

Interactive script to guide you through creating a GitHub token with the correct permissions and test its validity.

**Usage:**

```bash
./scripts/setup_github_token.sh
```

## Error Handling

All scripts include proper error handling and logging. If you encounter issues:

1. Check your GitHub token permissions
2. Ensure you're running the scripts from the project root directory
3. Check the log output for specific error messages

## Common Issues

### Relative Import Errors

If you see errors related to imports, make sure you're running the scripts from the project root directory:

```bash
# Correct
cd /path/to/lumin-ai
python scripts/prune_backlog.py --token YOUR_TOKEN

# Incorrect
cd /path/to/lumin-ai/scripts
python prune_backlog.py --token YOUR_TOKEN
```

### GitHub API Rate Limiting

The GitHub API has rate limits. If you hit these limits, the scripts will show appropriate error messages. Wait a few minutes before trying again.

### Permission Issues

Make sure your GitHub token has the necessary permissions:

- `repo` scope for repository access
- `project` scope for project board integration

Run `./scripts/setup_github_token.sh` to verify your token's permissions.
