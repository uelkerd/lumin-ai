#!/bin/bash
# LUMIN.AI Devcontainer Optimization Test Script
# Tests the optimized container and measures improvements

set -e

echo "🔧 LUMIN.AI Container Optimization Test"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

# Test 1: Check if Docker is running
print_status "Checking Docker availability..."
if ! docker --version > /dev/null 2>&1; then
    print_error "Docker is not installed or not running"
    exit 1
fi
print_success "Docker is available"

# Test 2: Check current container size (if exists)
print_status "Checking existing container size..."
OLD_SIZE=$(docker images lumin-ai_devcontainer-lumin-dev-environment --format "table {{.Size}}" | tail -n +2 || echo "N/A")
if [ "$OLD_SIZE" != "N/A" ]; then
    print_warning "Current container size: $OLD_SIZE"
else
    print_status "No existing container found"
fi

# Test 3: Build optimized container
print_status "Building optimized container..."
cd "$(dirname "$0")/.."

if docker-compose -f .devcontainer/docker-compose.yml build --no-cache lumin-dev-environment; then
    print_success "Optimized container built successfully"
else
    print_error "Failed to build optimized container"
    exit 1
fi

# Test 4: Check new container size
print_status "Measuring optimized container size..."
NEW_SIZE=$(docker images lumin-ai_devcontainer-lumin-dev-environment --format "table {{.Size}}" | tail -n +2)
print_success "New container size: $NEW_SIZE"

# Test 5: Test container functionality
print_status "Testing container functionality..."

# Start container in detached mode
if docker-compose -f .devcontainer/docker-compose.yml up -d lumin-dev-environment; then
    print_success "Container started successfully"

    # Wait for container to be ready
    sleep 10

    # Test Python environment
    print_status "Testing Python environment..."
    if docker-compose -f .devcontainer/docker-compose.yml exec -T lumin-dev-environment python -c "import torch, pandas, numpy; print('✅ Core ML packages working')"; then
        print_success "Python ML environment working"
    else
        print_error "Python ML environment failed"
    fi

    # Test Jupyter
    print_status "Testing Jupyter installation..."
    if docker-compose -f .devcontainer/docker-compose.yml exec -T lumin-dev-environment jupyter --version > /dev/null 2>&1; then
        print_success "Jupyter is installed"
    else
        print_warning "Jupyter not working properly"
    fi

    # Test MongoDB connection
    print_status "Testing MongoDB tools..."
    if docker-compose -f .devcontainer/docker-compose.yml exec -T lumin-dev-environment mongosh --version > /dev/null 2>&1; then
        print_success "MongoDB tools available"
    else
        print_warning "MongoDB tools not working properly"
    fi

    # Test Node.js
    print_status "Testing Node.js..."
    if docker-compose -f .devcontainer/docker-compose.yml exec -T lumin-dev-environment node --version > /dev/null 2>&1; then
        NODE_VERSION=$(docker-compose -f .devcontainer/docker-compose.yml exec -T lumin-dev-environment node --version)
        print_success "Node.js is available: $NODE_VERSION"
    else
        print_warning "Node.js not working properly"
    fi

    # Stop container
    docker-compose -f .devcontainer/docker-compose.yml down

else
    print_error "Failed to start container"
    exit 1
fi

# Test 6: Compare sizes (if we had old size)
if [ "$OLD_SIZE" != "N/A" ]; then
    echo ""
    echo "📊 SIZE COMPARISON"
    echo "=================="
    echo "Old container: $OLD_SIZE"
    echo "New container: $NEW_SIZE"

    # Extract numeric values for comparison (basic implementation)
    OLD_NUM=$(echo $OLD_SIZE | grep -o '[0-9.]*' | head -1)
    NEW_NUM=$(echo $NEW_SIZE | grep -o '[0-9.]*' | head -1)

    if [ ! -z "$OLD_NUM" ] && [ ! -z "$NEW_NUM" ]; then
        if (( $(echo "$NEW_NUM < $OLD_NUM" | bc -l) )); then
            SAVINGS=$(echo "scale=1; $OLD_NUM - $NEW_NUM" | bc)
            print_success "Size reduced by approximately ${SAVINGS}GB"
        else
            print_warning "Container size not significantly reduced"
        fi
    fi
fi

echo ""
echo "🎉 OPTIMIZATION TEST COMPLETE"
echo "============================="
echo "The optimized container is ready for development!"
echo ""
echo "Next steps:"
echo "1. Open VS Code and reload the dev container"
echo "2. Verify all your tools work as expected"
echo "3. Check the .dockerignore is preventing large files from being copied"
echo ""
print_status "For monitoring: docker images | grep lumin-ai"
