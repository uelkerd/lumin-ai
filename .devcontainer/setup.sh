#!/bin/bash
set -e

# LUMIN.AI Development Environment Setup Script
# This script runs after container creation to set up the development environment

echo "Setting up LUMIN.AI development environment..."

# Check if we're running as the expected user
if [ "$(whoami)" != "lumin-dev" ]; then
    echo "Warning: This script should run as lumin-dev user"
fi

# Create project directories if they don't exist
mkdir -p /workspace/data
mkdir -p /workspace/logs
mkdir -p /workspace/models

# Set up pre-commit hooks if available
if [ -f "/workspace/.pre-commit-config.yaml" ]; then
    echo "Installing pre-commit hooks..."
    cd /workspace
    pre-commit install
    echo "Pre-commit hooks installed successfully"
fi

# Set up git configuration if needed
if [ ! -f "/workspace/.git/config" ]; then
    echo "Warning: Git repository not initialized"
else
    echo "Git repository detected"
    # Set git user name and email if provided via environment variables
    if [ -n "$GIT_USER_NAME" ] && [ -n "$GIT_USER_EMAIL" ]; then
        git config --global user.name "$GIT_USER_NAME"
        git config --global user.email "$GIT_USER_EMAIL"
        echo "Git user configured as: $GIT_USER_NAME <$GIT_USER_EMAIL>"
    fi
fi

# Set proper permissions for development workflow
echo "Setting proper file permissions for development..."

# Set permissions only on necessary files and directories
# Avoid recursive chown/chmod on /workspace to prevent unintended side effects
if [ -d "/workspace/scripts" ]; then
    chmod 755 /workspace/scripts
    find /workspace/scripts -name "*.sh" -exec chmod +x {} \;
    echo "Scripts directory permissions updated"
fi

if [ -d "/workspace/src/api" ]; then
    find /workspace/src/api -name "*.py" -exec chmod +x {} \;
    echo "API scripts permissions updated"
fi

# Set up Python environment
echo "Setting up Python environment..."
pip install --upgrade pip wheel setuptools

# Set up Node.js environment
echo "Setting up Node.js environment..."
npm --version

echo "Setup complete! LUMIN.AI development environment is ready."
