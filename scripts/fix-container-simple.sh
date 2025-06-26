#!/bin/bash

# Simple Container Issues Fix Script (No Sudo Required)
# Fixes what we can without root privileges

set -e

echo "🔧 Starting Simple Container Fix..."
echo "===================================="

# Create logs directory if it doesn't exist with correct permissions
mkdir -p /tmp/container-logs

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> /tmp/container-logs/fixes.log
}

log "Starting simple container fixes"

# 1. Remove problematic directories and recreate with correct permissions
echo "🔑 Fixing permissions by recreating directories..."
if [[ -d "node_modules" && "$(stat -c %U node_modules)" == "root" ]]; then
    log "Removing root-owned node_modules"
    rm -rf node_modules
    log "node_modules removed, will be recreated with correct permissions"
fi

# 2. Install NPM packages if package.json exists
echo "📋 Installing NPM packages..."
if [[ -f "package.json" ]]; then
    log "Running npm install"
    npm install --prefer-offline --no-audit
    log "NPM packages installed successfully"
else
    log "No package.json found"
fi

# 3. Install Python dependencies if they exist
echo "🐍 Installing Python dependencies..."
if [[ -f "requirements-dev.txt" ]]; then
    log "Installing Python dev requirements"
    pip install -r requirements-dev.txt --user
    log "Python dev requirements installed"
fi

if [[ -f "requirements-ds.txt" ]]; then
    log "Installing Python data science requirements"
    pip install -r requirements-ds.txt --user
    log "Python DS requirements installed"
fi

# 4. Setup pre-commit if possible
echo "🪝 Setting up pre-commit..."
if [[ -f ".pre-commit-config.yaml" ]]; then
    log "Installing pre-commit"
    pip install pre-commit --user
    pre-commit install 2>/dev/null || log "Warning: Could not install pre-commit hooks (permission issue)"
    log "Pre-commit setup attempted"
fi

# 5. Test what we can
echo "🧪 Testing installations..."
log "Node.js version: $(node --version 2>/dev/null || echo 'Not available')"
log "NPM version: $(npm --version 2>/dev/null || echo 'Not available')"
log "Python version: $(python --version 2>/dev/null || echo 'Not available')"
log "Pip version: $(pip --version 2>/dev/null || echo 'Not available')"

# 6. Check VS Code extensions
echo "📦 Checking VS Code extensions..."
if command -v code &> /dev/null; then
    log "VS Code CLI available"
else
    log "Note: VS Code CLI not available in container (normal)"
fi

echo "✅ Simple Container Fix Complete!"
echo "================================="
log "Simple fixes completed"

echo ""
echo "📊 STATUS:"
echo "- NPM permissions: Fixed by reinstall"
echo "- Python deps: Installed to user directory"
echo "- Pre-commit: Setup attempted"
echo "- Logs: Available in /tmp/container-logs/fixes.log"
echo ""
echo "ℹ️  NOTE: Some issues require root privileges and container rebuild to fully fix."
echo "🎉 Container should now work for development!"

log "Simple fix script completed" 