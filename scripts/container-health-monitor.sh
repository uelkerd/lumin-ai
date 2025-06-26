#!/bin/bash

# LUMIN.AI Container Health Monitor
# Comprehensive health checking and monitoring for the development container
# Usage: ./scripts/container-health-monitor.sh [--continuous] [--json] [--verbose]

set -euo pipefail

# Configuration
CONTAINER_NAME="lumin-ai-dev"
MONGODB_CONTAINER="lumin-governance-db"
LOG_FILE=".logs/container-health.log"
HEALTH_CHECK_INTERVAL=30
CONTINUOUS_MODE=false
JSON_OUTPUT=false
VERBOSE_MODE=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --continuous)
            CONTINUOUS_MODE=true
            shift
            ;;
        --json)
            JSON_OUTPUT=true
            shift
            ;;
        --verbose)
            VERBOSE_MODE=true
            shift
            ;;
        --interval)
            HEALTH_CHECK_INTERVAL="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [--continuous] [--json] [--verbose] [--interval SECONDS]"
            echo "  --continuous  Run health checks continuously"
            echo "  --json        Output results in JSON format"
            echo "  --verbose     Enable verbose logging"
            echo "  --interval    Set check interval in seconds (default: 30)"
            exit 0
            ;;
        *)
            echo "Unknown option $1"
            exit 1
            ;;
    esac
done

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Logging function
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    if [[ "$VERBOSE_MODE" == "true" ]] || [[ "$level" == "ERROR" ]]; then
        echo -e "${BLUE}[$timestamp]${NC} $message" >&2
    fi
}

# Health check results structure
declare -A health_results

# Check Docker daemon
check_docker_daemon() {
    log "INFO" "Checking Docker daemon status..."
    
    if ! docker info >/dev/null 2>&1; then
        health_results["docker_daemon"]="FAILED"
        log "ERROR" "Docker daemon is not running or accessible"
        return 1
    fi
    
    health_results["docker_daemon"]="HEALTHY"
    log "INFO" "Docker daemon is running"
    return 0
}

# Check container status
check_container_status() {
    local container_name=$1
    log "INFO" "Checking container status: $container_name"
    
    if ! docker ps --filter "name=$container_name" --format "table {{.Names}}" | grep -q "$container_name"; then
        health_results["${container_name}_status"]="NOT_RUNNING"
        log "ERROR" "Container $container_name is not running"
        return 1
    fi
    
    # Check container health status
    local health_status
    health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "none")
    
    if [[ "$health_status" == "healthy" ]]; then
        health_results["${container_name}_status"]="HEALTHY"
        log "INFO" "Container $container_name is healthy"
    elif [[ "$health_status" == "unhealthy" ]]; then
        health_results["${container_name}_status"]="UNHEALTHY"
        log "ERROR" "Container $container_name is unhealthy"
        return 1
    elif [[ "$health_status" == "starting" ]]; then
        health_results["${container_name}_status"]="STARTING"
        log "WARN" "Container $container_name is still starting"
    else
        health_results["${container_name}_status"]="NO_HEALTHCHECK"
        log "WARN" "Container $container_name has no health check configured"
    fi
    
    return 0
}

# Check container resource usage
check_container_resources() {
    local container_name=$1
    log "INFO" "Checking resource usage for: $container_name"
    
    if ! docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" "$container_name" >/dev/null 2>&1; then
        health_results["${container_name}_resources"]="UNAVAILABLE"
        log "ERROR" "Cannot retrieve resource stats for $container_name"
        return 1
    fi
    
    # Get resource usage
    local stats
    stats=$(docker stats --no-stream --format "{{.CPUPerc}}\t{{.MemPerc}}" "$container_name" 2>/dev/null)
    local cpu_percent memory_percent
    cpu_percent=$(echo "$stats" | cut -f1 | sed 's/%//')
    memory_percent=$(echo "$stats" | cut -f2 | sed 's/%//')
    
    # Check if resources are within acceptable limits
    if (( $(echo "$cpu_percent > 80" | bc -l) )); then
        health_results["${container_name}_resources"]="HIGH_CPU"
        log "WARN" "Container $container_name CPU usage is high: ${cpu_percent}%"
    elif (( $(echo "$memory_percent > 90" | bc -l) )); then
        health_results["${container_name}_resources"]="HIGH_MEMORY"
        log "WARN" "Container $container_name memory usage is high: ${memory_percent}%"
    else
        health_results["${container_name}_resources"]="HEALTHY"
        log "INFO" "Container $container_name resource usage is normal (CPU: ${cpu_percent}%, Memory: ${memory_percent}%)"
    fi
    
    return 0
}

# Check MongoDB connectivity
check_mongodb_connectivity() {
    log "INFO" "Checking MongoDB connectivity..."
    
    if ! docker exec "$MONGODB_CONTAINER" mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
        health_results["mongodb_connectivity"]="FAILED"
        log "ERROR" "MongoDB connectivity check failed"
        return 1
    fi
    
    health_results["mongodb_connectivity"]="HEALTHY"
    log "INFO" "MongoDB is accessible and responding"
    return 0
}

# Check development environment
check_dev_environment() {
    log "INFO" "Checking development environment in container..."
    
    # Check Python
    if ! docker exec "$CONTAINER_NAME" python3 --version >/dev/null 2>&1; then
        health_results["python_env"]="FAILED"
        log "ERROR" "Python is not accessible in container"
        return 1
    fi
    
    # Check Node.js
    if ! docker exec "$CONTAINER_NAME" node --version >/dev/null 2>&1; then
        health_results["nodejs_env"]="FAILED"
        log "ERROR" "Node.js is not accessible in container"
        return 1
    fi
    
    # Check pip packages
    if ! docker exec "$CONTAINER_NAME" pip list >/dev/null 2>&1; then
        health_results["pip_packages"]="FAILED"
        log "ERROR" "Pip packages check failed"
        return 1
    fi
    
    health_results["dev_environment"]="HEALTHY"
    log "INFO" "Development environment is accessible"
    return 0
}

# Check port connectivity
check_port_connectivity() {
    log "INFO" "Checking port connectivity..."
    
    local ports=(3000 8000 9000)
    local failed_ports=()
    
    for port in "${ports[@]}"; do
        if ! docker exec "$CONTAINER_NAME" ss -tuln | grep -q ":$port "; then
            failed_ports+=("$port")
        fi
    done
    
    if [[ ${#failed_ports[@]} -gt 0 ]]; then
        health_results["port_connectivity"]="PARTIAL"
        log "WARN" "Some ports are not bound: ${failed_ports[*]}"
    else
        health_results["port_connectivity"]="HEALTHY"
        log "INFO" "All expected ports are available"
    fi
    
    return 0
}

# Check disk usage
check_disk_usage() {
    log "INFO" "Checking disk usage..."
    
    local disk_usage
    disk_usage=$(docker exec "$CONTAINER_NAME" df -h /workspace | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if (( disk_usage > 90 )); then
        health_results["disk_usage"]="CRITICAL"
        log "ERROR" "Disk usage is critical: ${disk_usage}%"
        return 1
    elif (( disk_usage > 80 )); then
        health_results["disk_usage"]="HIGH"
        log "WARN" "Disk usage is high: ${disk_usage}%"
    else
        health_results["disk_usage"]="HEALTHY"
        log "INFO" "Disk usage is normal: ${disk_usage}%"
    fi
    
    return 0
}

# Generate health report
generate_health_report() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local overall_status="HEALTHY"
    
    # Determine overall status
    for status in "${health_results[@]}"; do
        if [[ "$status" == "FAILED" ]] || [[ "$status" == "CRITICAL" ]] || [[ "$status" == "UNHEALTHY" ]]; then
            overall_status="UNHEALTHY"
            break
        elif [[ "$status" == "PARTIAL" ]] || [[ "$status" == "HIGH" ]] || [[ "$status" == "HIGH_CPU" ]] || [[ "$status" == "HIGH_MEMORY" ]]; then
            overall_status="WARNING"
        fi
    done
    
    if [[ "$JSON_OUTPUT" == "true" ]]; then
        # Generate JSON output
        echo "{"
        echo "  \"timestamp\": \"$timestamp\","
        echo "  \"overall_status\": \"$overall_status\","
        echo "  \"checks\": {"
        local first=true
        for check in "${!health_results[@]}"; do
            if [[ "$first" == "true" ]]; then
                first=false
            else
                echo ","
            fi
            echo -n "    \"$check\": \"${health_results[$check]}\""
        done
        echo ""
        echo "  }"
        echo "}"
    else
        # Generate human-readable output
        echo
        echo "═══════════════════════════════════════════════"
        echo "  LUMIN.AI Container Health Report"
        echo "═══════════════════════════════════════════════"
        echo "Timestamp: $timestamp"
        echo
        
        case $overall_status in
            "HEALTHY")
                echo -e "Overall Status: ${GREEN}✅ HEALTHY${NC}"
                ;;
            "WARNING")
                echo -e "Overall Status: ${YELLOW}⚠️  WARNING${NC}"
                ;;
            "UNHEALTHY")
                echo -e "Overall Status: ${RED}❌ UNHEALTHY${NC}"
                ;;
        esac
        
        echo
        echo "Detailed Results:"
        echo "─────────────────────────────────────────────"
        
        for check in "${!health_results[@]}"; do
            local status="${health_results[$check]}"
            local icon color
            
            case $status in
                "HEALTHY")
                    icon="✅"; color="$GREEN"
                    ;;
                "WARNING"|"PARTIAL"|"HIGH"|"HIGH_CPU"|"HIGH_MEMORY")
                    icon="⚠️ "; color="$YELLOW"
                    ;;
                "FAILED"|"CRITICAL"|"UNHEALTHY"|"NOT_RUNNING")
                    icon="❌"; color="$RED"
                    ;;
                *)
                    icon="ℹ️ "; color="$BLUE"
                    ;;
            esac
            
            printf "%-25s %s %s%-15s%s\n" "$check" "$icon" "$color" "$status" "$NC"
        done
        
        echo
        echo "════════════════════════════════════════════════"
    fi
}

# Main health check function
run_health_check() {
    log "INFO" "Starting comprehensive health check..."
    health_results=()  # Reset results
    
    local checks=(
        "check_docker_daemon"
        "check_container_status $CONTAINER_NAME"
        "check_container_status $MONGODB_CONTAINER"
        "check_container_resources $CONTAINER_NAME"
        "check_container_resources $MONGODB_CONTAINER"
        "check_mongodb_connectivity"
        "check_dev_environment"
        "check_port_connectivity"
        "check_disk_usage"
    )
    
    local failed_checks=0
    
    for check in "${checks[@]}"; do
        if ! eval "$check"; then
            ((failed_checks++))
        fi
    done
    
    generate_health_report
    
    log "INFO" "Health check completed. Failed checks: $failed_checks"
    return $failed_checks
}

# Continuous monitoring function
run_continuous_monitoring() {
    log "INFO" "Starting continuous health monitoring (interval: ${HEALTH_CHECK_INTERVAL}s)"
    
    while true; do
        run_health_check
        
        if [[ "$JSON_OUTPUT" != "true" ]]; then
            echo
            echo "Next check in ${HEALTH_CHECK_INTERVAL} seconds... (Ctrl+C to stop)"
            echo
        fi
        
        sleep "$HEALTH_CHECK_INTERVAL"
    done
}

# Cleanup function
cleanup() {
    log "INFO" "Health monitoring stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    log "INFO" "Container health monitor started"
    
    if [[ "$CONTINUOUS_MODE" == "true" ]]; then
        run_continuous_monitoring
    else
        run_health_check
        exit $?
    fi
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 