#!/bin/bash
set -e

# This script is run inside the Docker container during build.
# It intelligently installs Python dependencies either from local wheel files
# (if they exist) or from PyPI.

PIP_INSTALL_CMD="pip install --no-cache-dir --retries 5 --timeout 300"
PIP_INSTALL_CMD_LARGE_PKG="pip install --no-cache-dir --retries 10 --timeout 600 --trusted-host files.pythonhosted.org"

# Always install numpy first
echo "--- Installing numpy... ---"
grep "^numpy==" /tmp/requirements-ds.txt | $PIP_INSTALL_CMD -r /dev/stdin

# Check if local wheels are available for torch and tensorflow
if [ -d "/tmp/wheels" ] && [ "$(find /tmp/wheels -name '*.whl' | wc -l)" -gt "0" ]; then
    echo "--- Found local wheels, installing torch and tensorflow from them... ---"
    find /tmp/wheels -name '*.whl' -exec sh -c '$PIP_INSTALL_CMD "$@"' _ {} \;

    echo "--- Installing remaining packages from requirements-ds.txt ---"
    grep -v -E "^(numpy|tensorflow|torch)==" /tmp/requirements-ds.txt | $PIP_INSTALL_CMD -r /dev/stdin
else
    echo "--- No local wheels found, installing torch and tensorflow from PyPI... ---"
    # Install tensorflow separately
    echo "--- Installing tensorflow... ---"
    grep "^tensorflow==" /tmp/requirements-ds.txt | $PIP_INSTALL_CMD_LARGE_PKG -r /dev/stdin

    # Install the rest of the packages (which includes torch)
    echo "--- Installing remaining packages (including torch)... ---"
grep -v -E "^(numpy|tensorflow)==" /tmp/requirements-ds.txt | $PIP_INSTALL_CMD -r /dev/stdin
fi 