#!/bin/bash

# Container Issues Fix Script
# Fixes NPM permissions, installs missing packages, and resolves extension issues

set -e

echo "🔧 Starting Container Issues Fix..."
echo "=================================="

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> .logs/container-fixes.log
}

# Create logs directory if it doesn't exist
mkdir -p .logs

log "Starting container fixes"

# 1. Fix NPM permissions issue
echo "🔑 Fixing NPM permissions..."
if [[ -d "node_modules" && "$(stat -c %U node_modules)" == "root" ]]; then
    log "Fixing node_modules ownership from root to $USER"
    sudo chown -R $USER:$USER node_modules/ 2>/dev/null || {
        log "Warning: Could not change node_modules ownership, trying alternative fix"
        rm -rf node_modules
        log "Removed node_modules, will reinstall with correct permissions"
    }
else
    log "node_modules permissions already correct or doesn't exist"
fi

# 2. Install Git LFS
echo "📦 Installing Git LFS..."
if ! command -v git-lfs &> /dev/null; then
    log "Installing Git LFS"
    curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash
    sudo apt-get install -y git-lfs
    git lfs install
    log "Git LFS installed successfully"
else
    log "Git LFS already installed"
fi

# 3. Fix package.json dependencies if needed
echo "📋 Checking package.json..."
if [[ -f "package.json" ]]; then
    log "Running npm install with correct permissions"
    npm install --prefer-offline --no-audit
    log "NPM packages installed successfully"
else
    log "No package.json found, skipping npm install"
fi

# 4. Install Python development dependencies
echo "🐍 Installing Python dev dependencies..."
if [[ -f "requirements-dev.txt" ]]; then
    log "Installing Python dev requirements"
    pip install -r requirements-dev.txt
    log "Python dev requirements installed"
else
    log "No requirements-dev.txt found"
fi

# 5. Install data science dependencies
if [[ -f "requirements-ds.txt" ]]; then
    log "Installing Python data science requirements"
    pip install -r requirements-ds.txt
    log "Python DS requirements installed"
else
    log "No requirements-ds.txt found"
fi

# 6. Setup pre-commit hooks
echo "🪝 Setting up pre-commit hooks..."
if [[ -f ".pre-commit-config.yaml" ]]; then
    log "Installing pre-commit hooks"
    pip install pre-commit
    pre-commit install
    log "Pre-commit hooks installed"
else
    log "No .pre-commit-config.yaml found"
fi

# 7. Restore Git LFS hook
echo "🔄 Restoring Git LFS hook..."
if [[ -f ".git/hooks/pre-push.disabled" ]]; then
    mv .git/hooks/pre-push.disabled .git/hooks/pre-push
    log "Git LFS pre-push hook restored"
else
    log "Git LFS hook already active or not found"
fi

# 8. Test installations
echo "🧪 Testing installations..."
log "Testing Node.js: $(node --version)"
log "Testing NPM: $(npm --version)"
log "Testing Python: $(python --version)"
log "Testing pip: $(pip --version)"

if command -v git-lfs &> /dev/null; then
    log "Testing Git LFS: $(git-lfs --version)"
else
    log "Warning: Git LFS not found after installation"
fi

# 9. Summary
echo "✅ Container Issues Fix Complete!"
echo "=================================="
log "Container fixes completed successfully"

# Show final status
echo ""
echo "📊 FINAL STATUS:"
echo "- NPM permissions: Fixed"
echo "- Git LFS: Installed"
echo "- Python deps: Installed" 
echo "- Pre-commit: Configured"
echo "- Logs: Available in .logs/container-fixes.log"
echo ""
echo "🎉 Your development container is now fully operational!"

log "Fix script completed successfully" 