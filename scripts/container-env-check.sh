#!/bin/bash

# LUMIN.AI Container Environment Check
# Checks the development environment from inside the container
# Usage: ./scripts/container-env-check.sh

set -euo pipefail

echo "🔍 LUMIN.AI Container Environment Check"
echo "========================================"
echo

# Check basic system info
echo "📋 System Information:"
echo "   Hostname: $(hostname)"
echo "   User: $(whoami)"
echo "   Working Directory: $(pwd)"
echo "   Available Memory: $(free -h | grep '^Mem:' | awk '{print $7}' || echo 'Unknown')"
echo "   Disk Usage: $(df -h . | tail -1 | awk '{print $5}' || echo 'Unknown')"
echo

# Check Python environment
echo "🐍 Python Environment:"
if command -v python3 >/dev/null 2>&1; then
    echo "   ✅ Python version: $(python3 --version)"
    echo "   📦 Pip version: $(pip --version | cut -d' ' -f2)"
    
    # Check key packages
    echo "   🔍 Key packages:"
    for pkg in numpy pandas jupyter flask fastapi; do
        if python3 -c "import $pkg" 2>/dev/null; then
            version=$(python3 -c "import $pkg; print($pkg.__version__)" 2>/dev/null || echo "unknown")
            echo "      ✅ $pkg: $version"
        else
            echo "      ❌ $pkg: not installed"
        fi
    done
else
    echo "   ❌ Python not available"
fi
echo

# Check Node.js environment
echo "🟢 Node.js Environment:"
if command -v node >/dev/null 2>&1; then
    echo "   ✅ Node.js version: $(node --version)"
    echo "   📦 NPM version: $(npm --version)"
    
    # Check if node_modules exists
    if [ -d "node_modules" ]; then
        module_count=$(find node_modules -maxdepth 1 -type d | wc -l)
        echo "   📁 Node modules: $((module_count - 1)) packages installed"
    else
        echo "   📁 Node modules: not installed"
    fi
else
    echo "   ❌ Node.js not available"
fi
echo

# Check development tools
echo "🛠️ Development Tools:"
tools=("git" "curl" "wget" "vim" "code")
for tool in "${tools[@]}"; do
    if command -v "$tool" >/dev/null 2>&1; then
        echo "   ✅ $tool: available"
    else
        echo "   ❌ $tool: not available"
    fi
done
echo

# Check ports
echo "🔌 Port Availability:"
ports=(3000 8000 9000)
for port in "${ports[@]}"; do
    if command -v nc >/dev/null 2>&1; then
        if ! nc -z localhost "$port" 2>/dev/null; then
            echo "   ✅ Port $port: available"
        else
            echo "   🟡 Port $port: in use"
        fi
    else
        echo "   ℹ️  Port $port: cannot check (nc not available)"
    fi
done
echo

# Check file permissions
echo "📁 File Permissions:"
write_test_dirs=(. scripts docs .monitoring)
for dir in "${write_test_dirs[@]}"; do
    if [ -d "$dir" ]; then
        if touch "$dir/.test_write" 2>/dev/null; then
            rm -f "$dir/.test_write"
            echo "   ✅ $dir: writable"
        else
            echo "   ❌ $dir: not writable"
        fi
    else
        echo "   ⚠️  $dir: does not exist"
    fi
done
echo

# Check database connectivity (if available)
echo "🗄️  Database Connectivity:"
if command -v mongosh >/dev/null 2>&1; then
    echo "   ✅ MongoDB client: available"
    # Try to connect to common MongoDB URIs
    mongo_hosts=("mongodb://localhost:27017" "mongodb://governance-db:27017")
    for host in "${mongo_hosts[@]}"; do
        if timeout 5 mongosh "$host" --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
            echo "   ✅ MongoDB connection: $host"
            break
        else
            echo "   ❌ MongoDB connection: $host (failed)"
        fi
    done
else
    echo "   ❌ MongoDB client: not available"
fi
echo

# Check VS Code integration
echo "💻 VS Code Integration:"
if [ -n "${VSCODE_PID:-}" ] || [ -n "${REMOTE_CONTAINERS:-}" ]; then
    echo "   ✅ VS Code: connected"
    if [ -d ".vscode" ]; then
        echo "   📁 VS Code settings: present"
    fi
else
    echo "   ⚠️  VS Code: not detected (may be running outside container)"
fi
echo

# Performance check
echo "⚡ Performance Check:"
start_time=$(date +%s%N)
python3 -c "import math; [math.sqrt(i) for i in range(10000)]" 2>/dev/null
end_time=$(date +%s%N)
duration=$((($end_time - $start_time) / 1000000))
echo "   🧮 Python performance: ${duration}ms (10k sqrt operations)"

if command -v node >/dev/null 2>&1; then
    start_time=$(date +%s%N)
    node -e "for(let i=0; i<10000; i++) Math.sqrt(i);" 2>/dev/null
    end_time=$(date +%s%N)
    duration=$((($end_time - $start_time) / 1000000))
    echo "   🟢 Node.js performance: ${duration}ms (10k sqrt operations)"
fi
echo

echo "========================================="
echo "✅ Environment check completed!"
echo
echo "📊 Summary:"
echo "   - Python environment: $(command -v python3 >/dev/null 2>&1 && echo "Ready" || echo "Not available")"
echo "   - Node.js environment: $(command -v node >/dev/null 2>&1 && echo "Ready" || echo "Not available")"
echo "   - Development tools: $(command -v git >/dev/null 2>&1 && echo "Ready" || echo "Missing")"
echo "   - File permissions: $(touch . /.test_write 2>/dev/null && rm -f ./.test_write && echo "OK" || echo "Issues detected")"
echo
echo "🚀 Ready for development!" 