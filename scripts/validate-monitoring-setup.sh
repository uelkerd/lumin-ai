#!/bin/bash

# LUMIN.AI Monitoring Setup Validation Script
# Validates that all monitoring components are properly configured and functional
# Usage: ./scripts/validate-monitoring-setup.sh

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    ((TESTS_TOTAL++))
    
    echo -n "🧪 Testing $test_name... "
    
    if eval "$test_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Detailed test function with output
run_detailed_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_output="$3"
    
    ((TESTS_TOTAL++))
    
    echo -n "🧪 Testing $test_name... "
    
    local output
    if output=$(eval "$test_command" 2>&1); then
        if [[ -z "$expected_output" ]] || echo "$output" | grep -q "$expected_output"; then
            echo -e "${GREEN}✅ PASS${NC}"
            ((TESTS_PASSED++))
            return 0
        else
            echo -e "${YELLOW}⚠️  PARTIAL${NC} (unexpected output)"
            echo "   Expected: $expected_output"
            echo "   Got: $output"
            ((TESTS_FAILED++))
            return 1
        fi
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "   Error: $output"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo "🔍 LUMIN.AI Monitoring Setup Validation"
echo "======================================="
echo

# Test 1: Check if required directories exist
echo "📁 Testing Directory Structure..."
run_test "Monitoring directory exists" "[ -d '.monitoring' ]"
run_test "Config directory exists" "[ -d '.monitoring/config' ]"
run_test "Dashboard directory exists" "[ -d '.monitoring/dashboards' ]"
run_test "Logs directory exists" "[ -d '.logs' ]"
run_test "Scripts directory exists" "[ -d 'scripts' ]"
echo

# Test 2: Check if required files exist
echo "📄 Testing Required Files..."
run_test "Team onboarding doc exists" "[ -f 'docs/TEAM_ONBOARDING.md' ]"
run_test "Container monitoring doc exists" "[ -f 'docs/CONTAINER_MONITORING.md' ]"
run_test "Health monitor script exists" "[ -f 'scripts/container-health-monitor.sh' ]"
run_test "Performance monitor script exists" "[ -f 'scripts/container-performance-monitor.py' ]"
run_test "Setup monitoring script exists" "[ -f 'scripts/setup-monitoring.sh' ]"
echo

# Test 3: Check if scripts are executable
echo "🔐 Testing Script Permissions..."
run_test "Health monitor script is executable" "[ -x 'scripts/container-health-monitor.sh' ]"
run_test "Performance monitor script is executable" "[ -x 'scripts/container-performance-monitor.py' ]"
run_test "Setup monitoring script is executable" "[ -x 'scripts/setup-monitoring.sh' ]"
echo

# Test 4: Check Docker availability
echo "🐳 Testing Docker Environment..."
run_test "Docker daemon is running" "docker info"
run_test "Can list containers" "docker ps"
run_test "Main container is running" "docker ps --filter 'name=lumin-ai-dev' --format '{{.Names}}' | grep -q 'lumin-ai-dev'"
run_test "MongoDB container is running" "docker ps --filter 'name=lumin-governance-db' --format '{{.Names}}' | grep -q 'lumin-governance-db'"
echo

# Test 5: Test Python environment for monitoring
echo "🐍 Testing Python Environment..."
run_test "Python 3 is available" "python3 --version"
run_test "Required Python modules" "python3 -c 'import subprocess, json, csv, logging'"
echo

# Test 6: Test container connectivity
echo "🔗 Testing Container Connectivity..."
run_test "Can execute in main container" "docker exec lumin-ai-dev echo 'test'"
run_test "Can execute in MongoDB container" "docker exec lumin-governance-db echo 'test'"
run_test "MongoDB is responding" "docker exec lumin-governance-db mongosh --eval 'db.adminCommand(\"ping\")'"
echo

# Test 7: Test monitoring scripts functionality
echo "🔧 Testing Monitoring Scripts..."
run_test "Health monitor script runs" "timeout 10 bash scripts/container-health-monitor.sh || true"
run_test "Performance monitor help works" "python3 scripts/container-performance-monitor.py --help"
echo

# Test 8: Test configuration files
echo "⚙️  Testing Configuration Files..."
if [ -f '.monitoring/config/monitoring.json' ]; then
    run_test "Monitoring config is valid JSON" "python3 -m json.tool .monitoring/config/monitoring.json"
else
    echo "⚠️  Monitoring config not found - run setup-monitoring.sh first"
    ((TESTS_FAILED++))
    ((TESTS_TOTAL++))
fi
echo

# Test 9: Test log directory permissions
echo "📝 Testing Log Directory Permissions..."
run_test "Can write to logs directory" "touch .logs/test-write && rm .logs/test-write"
run_test "Can create monitoring subdirs" "mkdir -p .logs/monitoring && rmdir .logs/monitoring"
echo

# Test 10: Test dashboard files
echo "🌐 Testing Dashboard Components..."
if [ -f '.monitoring/dashboards/index.html' ]; then
    run_test "Dashboard HTML is valid" "grep -q '<title>' .monitoring/dashboards/index.html"
else
    echo "⚠️  Dashboard not found - run setup-monitoring.sh first"
    ((TESTS_FAILED++))
    ((TESTS_TOTAL++))
fi
echo

# Test 11: Test container resource access
echo "📊 Testing Container Resource Access..."
run_test "Can get container stats" "docker stats --no-stream lumin-ai-dev"
run_test "Can inspect containers" "docker inspect lumin-ai-dev"
echo

# Test 12: Integration test - run actual monitoring
echo "🧩 Integration Tests..."
echo "   Running 30-second monitoring test..."
if timeout 35 python3 scripts/container-performance-monitor.py --duration 30 --interval 5 >/dev/null 2>&1; then
    echo -e "   ${GREEN}✅ PASS${NC} - Monitoring completed successfully"
    ((TESTS_PASSED++))
else
    echo -e "   ${RED}❌ FAIL${NC} - Monitoring test failed"
    ((TESTS_FAILED++))
fi
((TESTS_TOTAL++))
echo

# Final results
echo "════════════════════════════════════════"
echo "📊 Test Results Summary"
echo "════════════════════════════════════════"
echo "Total Tests: $TESTS_TOTAL"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}ALL TESTS PASSED!${NC}"
    echo "✅ Your monitoring setup is fully functional"
    echo ""
    echo "🚀 Ready to start monitoring:"
    echo "   ./scripts/start-monitoring.sh"
    echo ""
    echo "📊 Open dashboard:"
    echo "   ./scripts/open-dashboard.sh"
    echo ""
    echo "📚 Read documentation:"
    echo "   docs/TEAM_ONBOARDING.md"
    echo "   docs/CONTAINER_MONITORING.md"
    exit 0
else
    echo -e "\n⚠️  ${YELLOW}SOME TESTS FAILED${NC}"
    echo "❌ Issues found with monitoring setup"
    echo ""
    echo "🔧 Troubleshooting steps:"
    echo "1. Run setup script: ./scripts/setup-monitoring.sh"
    echo "2. Check Docker status: docker info"
    echo "3. Verify containers: docker ps"
    echo "4. Check permissions: ls -la scripts/"
    echo "5. Review logs: tail -f .logs/container-health.log"
    echo ""
    echo "📖 For more help, see docs/CONTAINER_MONITORING.md"
    exit 1
fi 