#!/bin/bash
# LUMIN.AI Development Environment Health Check Script
# This script verifies that the development environment is properly set up and working

set -e
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'

echo -e "${BLUE}=== LUMIN.AI Development Environment Health Check ===${NC}"
echo -e "${BLUE}====================================================${NC}"

# Function to check if docker is running
check_docker() {
    echo -e "\n${BLUE}Checking Docker...${NC}"
    if command -v docker &> /dev/null; then
        docker_version=$(docker --version)
        echo -e "${GREEN}✓ Docker installed: ${docker_version}${NC}"
        
        # Check if Docker daemon is running
        if docker info &> /dev/null; then
            echo -e "${GREEN}✓ Docker daemon is running${NC}"
        else
            echo -e "${RED}✗ Docker daemon is not running. Please start Docker Desktop or Docker service.${NC}"
            exit 1
        fi
    else
        echo -e "${RED}✗ Docker is not installed. Please install Docker to use the development environment.${NC}"
        exit 1
    fi
}

# Function to check if BuildKit is enabled
check_buildkit() {
    echo -e "\n${BLUE}Checking BuildKit...${NC}"
    if [ "$DOCKER_BUILDKIT" == "1" ]; then
        echo -e "${GREEN}✓ Docker BuildKit is enabled${NC}"
    else
        echo -e "${YELLOW}⚠ Docker BuildKit is not enabled. For better build performance, run:${NC}"
        echo -e "  export DOCKER_BUILDKIT=1"
        echo -e "  export COMPOSE_DOCKER_CLI_BUILD=1"
    fi
}

# Function to check development containers
check_containers() {
    echo -e "\n${BLUE}Checking development containers...${NC}"
    
    # Check if lumin-ai-dev container exists
    if docker ps -a --filter "name=lumin-ai-dev" --format '{{.Names}}' | grep -q "lumin-ai-dev"; then
        # Check if container is running
        if docker ps --filter "name=lumin-ai-dev" --format '{{.Names}}' | grep -q "lumin-ai-dev"; then
            echo -e "${GREEN}✓ lumin-ai-dev container is running${NC}"
        else
            echo -e "${YELLOW}⚠ lumin-ai-dev container exists but is not running.${NC}"
            echo -e "  Start it with: docker start lumin-ai-dev"
        fi
    else
        echo -e "${YELLOW}⚠ lumin-ai-dev container not found. Build the development environment:${NC}"
        echo -e "  cd $(git rev-parse --show-toplevel)"
        echo -e "  .devcontainer/build.sh"
    fi
    
    # Check if MongoDB container exists
    if docker ps -a --filter "name=lumin-governance-db" --format '{{.Names}}' | grep -q "lumin-governance-db"; then
        # Check if container is running
        if docker ps --filter "name=lumin-governance-db" --format '{{.Names}}' | grep -q "lumin-governance-db"; then
            echo -e "${GREEN}✓ MongoDB container is running${NC}"
        else
            echo -e "${YELLOW}⚠ MongoDB container exists but is not running.${NC}"
            echo -e "  Start it with: docker start lumin-governance-db"
        fi
    else
        echo -e "${YELLOW}⚠ MongoDB container not found. Start the development environment:${NC}"
        echo -e "  cd $(git rev-parse --show-toplevel)"
        echo -e "  docker-compose -f .devcontainer/docker-compose.yml up -d"
    fi
}

# Function to check MongoDB connection
check_mongodb() {
    echo -e "\n${BLUE}Checking MongoDB connection...${NC}"
    
    if command -v python3 &> /dev/null; then
        if [ -f "scripts/test_mongodb_connection.py" ]; then
            echo "Running MongoDB connection test..."
            if python3 scripts/test_mongodb_connection.py; then
                echo -e "${GREEN}✓ MongoDB connection successful${NC}"
            else
                echo -e "${RED}✗ MongoDB connection failed. Check logs above for details.${NC}"
            fi
        else
            echo -e "${YELLOW}⚠ MongoDB connection test script not found.${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Python3 not found, skipping MongoDB connection test.${NC}"
    fi
}

# Function to check volume mounts
check_volumes() {
    echo -e "\n${BLUE}Checking persistent volumes...${NC}"
    
    volumes=("lumin-ai-governance-data" "lumin-ai-governance-logs" "lumin-ai-python-packages" "lumin-ai-node-modules" "lumin-ai-jupyter-data" "lumin-ai-logs")
    
    for volume in "${volumes[@]}"; do
        if docker volume ls --format '{{.Name}}' | grep -q "$volume"; then
            echo -e "${GREEN}✓ Volume $volume exists${NC}"
        else
            echo -e "${YELLOW}⚠ Volume $volume not found.${NC}"
        fi
    done
}

# Function to check pre-commit hooks
check_precommit() {
    echo -e "\n${BLUE}Checking pre-commit hooks...${NC}"
    
    if command -v pre-commit &> /dev/null; then
        pre_commit_version=$(pre-commit --version)
        echo -e "${GREEN}✓ pre-commit installed: ${pre_commit_version}${NC}"
        
        if [ -f ".pre-commit-config.yaml" ]; then
            echo -e "${GREEN}✓ pre-commit config found${NC}"
            
            # Check if hooks are installed
            if [ -f ".git/hooks/pre-commit" ]; then
                echo -e "${GREEN}✓ pre-commit hooks installed${NC}"
            else
                echo -e "${YELLOW}⚠ pre-commit hooks not installed. Install them with:${NC}"
                echo -e "  pre-commit install"
            fi
        else
            echo -e "${YELLOW}⚠ .pre-commit-config.yaml not found${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ pre-commit not installed. Install it with:${NC}"
        echo -e "  pip install pre-commit"
        echo -e "  pre-commit install"
    fi
}

# Run all checks
check_docker
check_buildkit
check_containers
check_mongodb
check_volumes
check_precommit

echo -e "\n${BLUE}====================================================${NC}"
echo -e "${GREEN}Development environment health check completed!${NC}"
echo -e "${BLUE}====================================================${NC}" 