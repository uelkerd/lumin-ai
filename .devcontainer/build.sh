#!/bin/bash
set -e

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
export BUILDKIT_PROGRESS=plain
export COMPOSE_BAKE=true

echo "Building LUMIN.AI development container..."
cd "$(dirname "${BASH_SOURCE[0]}")" || exit 1

# Run docker buildx bake for optimized parallel builds
docker buildx bake --progress=plain --set *.context=".." --allow=fs.read=..

echo "Build complete! You can now use VS Code 'Remote-Containers: Reopen in Container' to start development."
