#!/bin/bash

# LUMIN.AI Docker Cleanup Script
# This script removes old Docker containers, volumes, and images to free up space
# and prevent conflicts during development container builds.

set -e

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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to stop and remove LUMIN.AI containers
cleanup_lumin_containers() {
    print_status "Stopping and removing LUMIN.AI containers..."
    
    # Stop containers if they're running
    local containers=$(docker ps -q --filter "name=lumin-ai")
    if [ ! -z "$containers" ]; then
        docker stop $containers
        print_success "Stopped running LUMIN.AI containers"
    fi
    
    # Remove containers (both running and stopped)
    local all_containers=$(docker ps -aq --filter "name=lumin-ai")
    if [ ! -z "$all_containers" ]; then
        docker rm $all_containers
        print_success "Removed LUMIN.AI containers"
    else
        print_status "No LUMIN.AI containers found"
    fi
}

# Function to remove LUMIN.AI volumes
cleanup_lumin_volumes() {
    print_status "Removing LUMIN.AI volumes..."
    
    local volumes=$(docker volume ls -q --filter "name=lumin-ai")
    if [ ! -z "$volumes" ]; then
        docker volume rm $volumes 2>/dev/null || true
        print_success "Removed LUMIN.AI volumes"
    else
        print_status "No LUMIN.AI volumes found"
    fi
}

# Function to remove LUMIN.AI images
cleanup_lumin_images() {
    print_status "Removing LUMIN.AI images..."
    
    local images=$(docker images -q --filter "reference=lumin-ai*")
    if [ ! -z "$images" ]; then
        docker rmi $images 2>/dev/null || true
        print_success "Removed LUMIN.AI images"
    else
        print_status "No LUMIN.AI images found"
    fi
}

# Function to prune unused Docker resources
prune_docker_system() {
    print_status "Pruning unused Docker resources..."
    
    # Prune containers
    docker container prune -f
    
    # Prune volumes
    docker volume prune -f
    
    # Prune images
    docker image prune -f
    
    # Prune networks
    docker network prune -f
    
    print_success "Docker system pruned"
}

# Function to show disk space saved
show_disk_usage() {
    print_status "Docker disk usage after cleanup:"
    docker system df
}

# Main cleanup function
main() {
    echo "============================================"
    echo "     LUMIN.AI Docker Cleanup Script"
    echo "============================================"
    echo
    
    check_docker
    
    # Parse command line arguments
    FULL_CLEANUP=false
    FORCE=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --full)
                FULL_CLEANUP=true
                shift
                ;;
            --force|-f)
                FORCE=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo
                echo "Options:"
                echo "  --full     Perform full system cleanup (includes all Docker resources)"
                echo "  --force    Skip confirmation prompts"
                echo "  --help     Show this help message"
                echo
                echo "Examples:"
                echo "  $0                    # Clean only LUMIN.AI resources"
                echo "  $0 --full            # Clean all Docker resources"
                echo "  $0 --full --force    # Clean all Docker resources without prompts"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    # Confirmation prompt (unless --force is used)
    if [ "$FORCE" = false ]; then
        if [ "$FULL_CLEANUP" = true ]; then
            print_warning "This will remove ALL Docker containers, volumes, images, and networks."
            print_warning "This action cannot be undone!"
        else
            print_warning "This will remove LUMIN.AI Docker containers, volumes, and images."
        fi
        echo
        read -p "Are you sure you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Cleanup cancelled"
            exit 0
        fi
    fi
    
    echo
    print_status "Starting cleanup..."
    
    # Always clean LUMIN.AI specific resources
    cleanup_lumin_containers
    cleanup_lumin_volumes
    cleanup_lumin_images
    
    # If full cleanup is requested, prune all Docker resources
    if [ "$FULL_CLEANUP" = true ]; then
        prune_docker_system
    fi
    
    show_disk_usage
    
    echo
    print_success "Cleanup completed successfully!"
    echo
    print_status "You can now run 'docker-compose up' to build fresh containers."
}

# Run main function with all arguments
main "$@" 