#!/bin/bash -e
# Git LFS setup script for LUMIN.AI project
# This script helps developers set up Git LFS for the project

echo "Setting up Git LFS for LUMIN.AI project..."

# Check if Git LFS is installed
if ! command -v git-lfs &> /dev/null; then
    echo "Git LFS is not installed. Please install it first:"
    echo ""
    echo "For Ubuntu/Debian:"
    echo "  sudo apt install git-lfs"
    echo ""
    echo "For macOS:"
    echo "  brew install git-lfs"
    echo ""
    echo "For Windows:"
    echo "  Download from https://git-lfs.github.com/"
    echo ""
    exit 1
fi

# Initialize Git LFS
echo "Initializing Git LFS..."
git lfs install

# Pull any existing LFS objects
echo "Pulling LFS objects..."
git lfs pull

# Check tracking status
echo "Checking LFS tracking status..."
git lfs track

echo ""
echo "Git LFS setup complete!"
echo "Large files with the following extensions are now tracked by Git LFS:"
awk '/filter=lfs/ {print $1}' .gitattributes | sort

echo ""
echo "To add a new file type to track with LFS, run:"
echo "  git lfs track \"*.extension\""
echo ""
echo "For more information, see: https://git-lfs.github.com/" 