# LUMIN.AI Optimized Development Container

This directory contains configuration for a Docker-based development environment with advanced optimizations to ensure all team members have a consistent, performant setup for LUMIN.AI development.

## Quick Start

1. Ensure you have [Docker](https://www.docker.com/get-started) and [VS Code](https://code.visualstudio.com/) with the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension installed.

2. Copy the example environment files:
   ```bash
   cp .devcontainer/.env.example .devcontainer/.env
   cp .devcontainer/.env.build .devcontainer/.env.build  # Optional: for build optimizations
   ```

3. Modify `.env` with your preferred configuration.

4. Use the optimized build script (recommended for better performance):
   ```bash
   ./.devcontainer/build-optimized.sh
   ```

5. Open the project in VS Code and click "Reopen in Container" when prompted, or run the "Remote-Containers: Reopen in Container" command.

## Features

- Python 3.11 development environment with optimized package caching
- Node.js 20 for frontend development
- MongoDB database for governance analysis
- Jupyter Notebooks accessible on port 9000
- Docker-in-Docker capability for container development
- VS Code extensions pre-configured for Python and JavaScript/TypeScript development
- Pre-commit hooks for code quality management

## Build Optimizations

This development container implements several advanced optimizations:

- **Multi-stage builds**: Separates build dependencies from runtime dependencies
- **BuildKit cache mounts**: For faster package installations
- **Layer optimization**: Grouping of related installations for better caching
- **Parallel builds**: Using Docker Buildx Bake for concurrent building of multiple stages
- **Volume caching**: Persistent Python package cache across builds
- **Resource management**: Configurable CPU and memory limits

## Environment Variables

Key environment variables that can be configured:

- `COMPOSE_BAKE`: Set to "true" to use Docker Buildx Bake for better performance (default: true)
- `DOCKER_BUILDKIT`: Enables BuildKit for Docker builds (default: 1)
- `CONTAINER_MEMORY`: Memory limit for containers (default: 4g)
- `CONTAINER_CPUS`: CPU limit for containers (default: 2)

See `.env.example` and `.env.build` for more configuration options.

## Troubleshooting

If you encounter any issues with the container:

1. Try rebuilding with the optimized build script:
   ```bash
   ./.devcontainer/build-optimized.sh
   ```

2. Check Docker resources in Docker Desktop settings (increase memory/CPU if needed)

3. Review logs:
   ```bash
   docker logs lumin-ai-dev
   ```
