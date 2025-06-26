#!/bin/bash

echo "=== LUMIN.AI Devcontainer Build Monitor ==="
echo "Monitoring Docker build progress..."
echo "Started at: $(date)"
echo

# Check if build process is running
BUILD_PID=$(ps aux | grep "docker.*build.*lumin-ai" | grep -v grep | awk '{print $2}' | head -1)

if [ -n "$BUILD_PID" ]; then
    echo "✅ Build process found (PID: $BUILD_PID)"
    echo "⏳ Build is currently running..."
    echo

    # Try to get build context info
    echo "=== Build Context ==="
    docker images | grep lumin-ai || echo "No lumin-ai images found yet"
    echo

    # Check system resources
    echo "=== System Resources ==="
    echo "💾 Disk Usage:"
    df -h / | tail -1
    echo
    echo "🧠 Memory Usage:"
    free -h | grep Mem
    echo

    # Monitor for completion
    echo "=== Monitoring Build ==="
    echo "Waiting for build completion..."
    echo "You can press Ctrl+C to stop monitoring (build will continue)"

    # Simple monitoring loop
    COUNTER=0
    while ps -p $BUILD_PID > /dev/null 2>&1; do
        sleep 30
        COUNTER=$((COUNTER + 1))
        echo "⏱️  Build running for $((COUNTER * 30)) seconds..."

        # Check for any new images every 2 minutes
        if [ $((COUNTER % 4)) -eq 0 ]; then
            echo "📊 Current Docker images:"
            docker images | head -5
            echo
        fi
    done

    echo "✅ Build process completed!"
    echo "Finished at: $(date)"

    # Show final results
    echo
    echo "=== Final Results ==="
    docker images | grep lumin-ai

else
    echo "❌ No Docker build process found for lumin-ai"
    echo "The build may have completed or failed."
    echo
    echo "=== Current Docker Images ==="
    docker images | grep lumin-ai || echo "No lumin-ai images found"
fi
