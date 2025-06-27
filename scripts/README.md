# LUMIN.AI Maintenance Scripts

This directory contains various maintenance and utility scripts for the LUMIN.AI project.

## Docker Cleanup Script

**File:** `docker-cleanup.sh`

A comprehensive script to clean up Docker resources and prevent build conflicts during development.

### Usage

```bash
# Clean only LUMIN.AI specific containers, volumes, and images
./scripts/docker-cleanup.sh

# Perform full Docker system cleanup (all resources)
./scripts/docker-cleanup.sh --full

# Skip confirmation prompts
./scripts/docker-cleanup.sh --force

# Full cleanup without prompts
./scripts/docker-cleanup.sh --full --force

# Show help
./scripts/docker-cleanup.sh --help
```

### What it does

**Default mode** (LUMIN.AI only):
- Stops and removes all containers with "lumin-ai" in the name
- Removes all volumes with "lumin-ai" in the name
- Removes all images with "lumin-ai" prefix

**Full cleanup mode** (--full flag):
- All of the above, plus:
- Prunes all unused containers
- Prunes all unused volumes
- Prunes all unused images
- Prunes all unused networks

### When to use

- **Before building DevContainers** - Prevents volume conflicts and "recreate" prompts
- **After failed builds** - Cleans up partially created resources
- **Regular maintenance** - Frees up disk space from accumulated Docker resources
- **Switching branches** - Ensures clean state when switching between feature branches

### Safety features

- Confirmation prompts by default (use `--force` to skip)
- Colored output for clear status indication
- Docker daemon health check before execution
- Graceful error handling for missing resources

## Other Scripts

### `dev_env_check.sh`
Checks the development environment setup and dependencies.

### `test_mongodb_connection.py`
Tests MongoDB connection for development and testing environments.

## Contributing

When adding new maintenance scripts:

1. Make them executable: `chmod +x scripts/your-script.sh`
2. Add comprehensive help text with `--help` flag
3. Use colored output for better UX
4. Include safety confirmations for destructive operations
5. Update this README with documentation 