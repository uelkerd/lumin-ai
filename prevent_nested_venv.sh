#!/usr/bin/env bash

# prevent_nested_venv.sh - Script to prevent nested virtual environment activation
# Source this in your .zshrc to prevent nested virtualenv activations

function check_nested_venv() {
  # Check if we're already in a virtual environment
  if [[ -n "$VIRTUAL_ENV" ]]; then
    echo "⚠️  Warning: A virtual environment is already active at: $VIRTUAL_ENV"
    echo "❌  Nested virtual environments can cause dependency conflicts and path issues."
    echo "🔄  Please deactivate the current one with 'deactivate' before activating another."
    return 1
  else
    return 0
  fi
}

# Override the built-in source command to check for venv activation
function source() {
  local script_path="$1"
  local script_name=$(basename "$script_path")

  # Check if this is a venv activation script
  if [[ "$script_name" == "activate" || "$script_path" == *"activate" ]]; then
    if ! check_nested_venv; then
      return 1
    fi
  fi

  # Call the original source command
  builtin source "$@"
}

# Also override the . command which is an alias for source in most shells
function .() {
  local script_path="$1"
  local script_name=$(basename "$script_path")

  # Check if this is a venv activation script
  if [[ "$script_name" == "activate" || "$script_path" == *"activate" ]]; then
    if ! check_nested_venv; then
      return 1
    fi
  fi

  # Call the original source command
  builtin . "$@"
}

# Add a hook to check for python -m venv activations
function python() {
  if [[ "$1" == "-m" && "$2" == "venv" ]]; then
    echo "🔍 Detected venv creation attempt: python -m venv"
    if ! check_nested_venv; then
      return 1
    fi
  fi

  # Call the original python command
  command python "$@"
}

echo "🛡️  Nested virtualenv protection activated (prevent_nested_venv.sh)"
echo "✅  This script prevents accidental activation of nested Python virtual environments"
echo "ℹ️  To use this permanently, add 'source /path/to/prevent_nested_venv.sh' to your .zshrc file"
