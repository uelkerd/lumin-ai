#!/bin/bash
set -e

# ANSI color codes for prettier output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
    echo -e "${BLUE}[LUMIN.AI]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Docker and Buildx availability
check_prerequisites() {
    print_message "Checking prerequisites..."

    if ! command -v docker &> /dev/null; then
        print_error "Docker not found! Please install Docker first."
        exit 1
    fi

    if ! docker info > /dev/null 2>&1; then
        print_error "Docker daemon not running. Please start Docker."
        exit 1
    fi

    # Check if BuildKit is available
    if ! docker buildx version > /dev/null 2>&1; then
        print_warning "Docker Buildx not available. Enabling BuildKit through environment variables."
    else
        print_success "Docker Buildx available."
    fi
}

# Load environment variables
load_env_vars() {
    print_message "Loading build environment variables..."

    # Directory where this script is located
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

    # Source build environment variables if they exist
    if [ -f "${SCRIPT_DIR}/.env.build" ]; then
        set -a
        source "${SCRIPT_DIR}/.env.build"
        set +a
        print_success "Build environment variables loaded."
    else
        print_warning "No .env.build file found. Using default settings."
    fi

    # Ensure BuildKit is enabled
    export DOCKER_BUILDKIT=1
    export COMPOSE_DOCKER_CLI_BUILD=1
    export COMPOSE_BAKE=${COMPOSE_BAKE:-true}

    # Print key settings
    print_message "Building with COMPOSE_BAKE=${COMPOSE_BAKE}"
}

# Clean up any previous builds (optional)
cleanup() {
    print_message "Cleaning up previous builds (optional)..."

    read -p "Do you want to clean previous build cache? (y/N): " CLEAN_CACHE
    if [[ "$CLEAN_CACHE" == "y" || "$CLEAN_CACHE" == "Y" ]]; then
        docker builder prune -f --filter type=exec.cachemount
        print_success "Build cache cleaned."
    else
        print_message "Skipping cache cleanup."
    fi
}

# Run the optimized build
run_build() {
    print_message "Building the development container with optimizations..."

    # Directory where this script is located
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    PROJECT_ROOT="$( cd "${SCRIPT_DIR}/.." && pwd )"

    # Run docker compose build with optimization flags
    cd "${SCRIPT_DIR}" || exit 1

    if [ "$COMPOSE_BAKE" = "true" ]; then
        # Use docker buildx bake for optimized parallel builds
        # Set context to project root to find all required files
        docker buildx bake --progress=plain --set *.context="${PROJECT_ROOT}" --allow=fs.read=..
    else
        # Regular docker compose build
        docker compose build \
        docker compose build \
            --progress=plain
    fi

    BUILD_STATUS=$?

    if [ $BUILD_STATUS -eq 0 ]; then
        print_success "Build completed successfully!"
    else
        print_error "Build failed with status code: ${BUILD_STATUS}"
        exit $BUILD_STATUS
    fi
}

# Main execution flow
main() {
    print_message "=== LUMIN.AI Optimized Container Build ==="
    check_prerequisites
    load_env_vars
    cleanup
    run_build
    print_message "=== Build process complete ==="
    print_message "You can now use 'Remote-Containers: Reopen in Container' to start development."
}

# Execute the script
main "$@"
