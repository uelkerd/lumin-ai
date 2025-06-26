# LUMIN.AI Optimized Development Container

This directory contains configuration for a Docker-based development environment with advanced optimizations to ensure all team members have a consistent, performant setup for LUMIN.AI development.

## Quick Start

1. Ensure you have [Docker](https://www.docker.com/get-started) and [VS Code](https://code.visualstudio.com/) with the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension installed.

2. Clone the repository and open it in VS Code:
   ```bash
   git clone https://github.com/yourusername/lumin-ai.git
   cd lumin-ai
   code .
   ```

3. Click "Reopen in Container" when prompted, or run the "Remote-Containers: Reopen in Container" command.

4. If you prefer to build manually or want to customize the build:
   ```bash
   ./.devcontainer/build.sh
   ```

5. Verify your development environment:
   ```bash
   ./scripts/dev_env_check.sh
   ```

## Features

- **Python 3.11** with all dependencies pre-installed
- **Node.js 20** for frontend development
- **MongoDB database** for governance analysis
- **Jupyter Notebooks** accessible on port 9000
- **Docker-in-Docker** capability for container development
- **VS Code extensions** pre-configured for Python and JavaScript/TypeScript development
- **Pre-commit hooks** for code quality management
- **Persistent volumes** for development data
- **Health monitoring** for all services

## MongoDB Integration

The development environment includes a MongoDB instance pre-configured for the LUMIN.AI project:

- **Host**: `governance-db` (from inside the container)
- **Port**: `27017`
- **Username**: `lumin`
- **Password**: `devpassword` (for development only)
- **Database**: `governance_analysis`

To test the MongoDB connection:

```bash
python3 scripts/test_mongodb_connection.py
```

## Persistent Data

The development environment is configured with several persistent volumes:

- `governance-data`: MongoDB data storage
- `governance-logs`: MongoDB logs
- `lumin-python-packages`: Python package cache
- `lumin-node-modules`: Node.js modules
- `lumin-jupyter-data`: Jupyter notebook data
- `lumin-logs`: Application logs

This ensures your development data persists across container restarts, rebuilds, and even host system reboots.

## Pre-commit Hooks

The environment includes pre-configured pre-commit hooks to maintain code quality:

- **Black & Ruff**: Python code formatting
- **ESLint**: JavaScript/TypeScript linting
- **Detect-secrets**: Security scanning for accidental credential exposure
- **Prevent-nested-venv**: Avoids creating nested virtual environments

You can activate the nested virtual environment prevention script manually:
```bash
source /workspaces/lumin-ai/prevent_nested_venv.sh
```
If you see `(.venv) (.venv)` in your prompt, you have nested environments and should run `deactivate` once before activating any environments.

Development secrets are allowlisted in `.allowlist` to prevent pre-commit hooks from blocking commits with known development credentials.

## Build Optimizations

This development container implements several advanced optimizations:

- **Multi-stage builds**: Separates build dependencies from runtime dependencies
- **BuildKit cache mounts**: For faster package installations
- **Layer optimization**: Grouping of related installations for better caching
- **Volume caching**: Persistent Python package cache across builds
- **Resource management**: Configurable CPU and memory limits

## Utility Scripts

Several utility scripts are provided to help with development:

- `scripts/dev_env_check.sh`: Verifies the development environment setup
- `scripts/test_mongodb_connection.py`: Tests connectivity to MongoDB
- `prevent_nested_venv.sh`: Prevents creating nested virtual environments
- `.devcontainer/build.sh`: Non-interactive build script

## Environment Variables

Key environment variables that can be configured:

- `COMPOSE_BAKE`: Set to "true" to use Docker Buildx Bake for better performance (default: true)
- `DOCKER_BUILDKIT`: Enables BuildKit for Docker builds (default: 1)
- `MONGODB_HOST`: MongoDB host (default: governance-db)
- `MONGODB_USERNAME`: MongoDB username (default: lumin)
- `MONGODB_PASSWORD`: MongoDB password (default: devpassword)
- `MONGODB_DATABASE`: MongoDB database name (default: governance_analysis)

## Troubleshooting

If you encounter any issues with the container:

1. Run the environment check script:
   ```bash
   ./scripts/dev_env_check.sh
   ```

2. Verify MongoDB connectivity:
   ```bash
   python3 scripts/test_mongodb_connection.py
   ```

3. Check Docker resources in Docker Desktop settings (increase memory/CPU if needed)

4. Review container logs:
   ```bash
   docker logs lumin-ai-dev
   docker logs lumin-governance-db
   ```

5. For pre-commit hook issues, try:
   ```bash
   pre-commit run --all-files
   ```

6. If secrets detection is blocking legitimate development credentials, ensure they're listed in `.allowlist`
