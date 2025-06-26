#!/bin/bash
# Quick health check for LUMIN.AI containers

echo "🔍 LUMIN.AI Quick Health Check"
echo "=============================="

# Check Docker daemon
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker daemon is not running"
    exit 1
fi
echo "✅ Docker daemon is running"

# Check containers
containers=("lumin-ai-dev" "lumin-governance-db")
for container in "${containers[@]}"; do
    if docker ps --filter "name=$container" --format "{{.Names}}" | grep -q "$container"; then
        echo "✅ Container $container is running"
    else
        echo "❌ Container $container is not running"
    fi
done

# Check MongoDB
if docker exec lumin-governance-db mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
    echo "✅ MongoDB is accessible"
else
    echo "❌ MongoDB is not accessible"
fi

# Check development environment
if docker exec lumin-ai-dev python3 --version >/dev/null 2>&1; then
    echo "✅ Python environment is ready"
else
    echo "❌ Python environment is not ready"
fi

if docker exec lumin-ai-dev node --version >/dev/null 2>&1; then
    echo "✅ Node.js environment is ready"
else
    echo "❌ Node.js environment is not ready"
fi

echo "=============================="
echo "✅ Quick health check completed!" 