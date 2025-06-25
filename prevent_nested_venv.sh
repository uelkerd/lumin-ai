#!/bin/bash

# This script modifies your .bashrc or .zshrc to prevent nested virtual environments
# Detect shell
if [[ "$SHELL" == *"zsh"* ]]; then
    RC_FILE="$HOME/.zshrc"
    echo "Detected ZSH shell"
elif [[ "$SHELL" == *"bash"* ]]; then
    RC_FILE="$HOME/.bashrc"
    echo "Detected Bash shell"
else
    echo "Unsupported shell: $SHELL"
    exit 1
fi

# Create backup
cp "$RC_FILE" "${RC_FILE}.bak"
echo "Created backup at ${RC_FILE}.bak"

# Add protection to shell configuration
cat >> "$RC_FILE" << 'VENV_GUARD'

# Prevent nested virtual environments
function activate_venv() {
    if [ -n "$VIRTUAL_ENV" ]; then
        echo "Warning: Already in a virtual environment. Deactivating current one first."
        deactivate
    fi

    if [ -d ".venv" ]; then
        source .venv/bin/activate
    elif [ -d "venv" ]; then
        source venv/bin/activate
    else
        echo "No virtual environment found in current directory."
    fi
}

# Override the 'source' command for common virtual environment activations
function safe_source() {
    if [[ "$1" == *"venv/bin/activate" || "$1" == *".venv/bin/activate" ]]; then
        if [ -n "$VIRTUAL_ENV" ]; then
            echo "Warning: Already in a virtual environment. Deactivating current one first."
            deactivate
        fi
    fi
    builtin source "$@"
}
alias source=safe_source

VENV_GUARD

echo "Added protection against nested virtual environments to $RC_FILE"
echo "To apply changes, restart your terminal or run: source $RC_FILE"
echo "To activate a virtual environment safely, use: activate_venv"
