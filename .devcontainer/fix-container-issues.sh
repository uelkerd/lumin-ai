fix_npm_permissions() {
    log "Fixing potential NPM permission issues..."
    if [ -d "node_modules" ] && [ "$(stat -c %U node_modules)" == "root" ]; then
        log "node_modules is owned by root, attempting to fix..."
        sudo chown -R $USER:$USER node_modules/ 2>/dev/null || {
            log "Warning: Could not change node_modules ownership, trying alternative fix"
            rm -rf node_modules
            log "Removed node_modules, will reinstall with correct permissions"
        }
    else
        log "NPM permissions appear to be correct. No action needed."
    fi
}

# Function to fix Git LFS issues
