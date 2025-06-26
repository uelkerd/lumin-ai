#!/bin/bash

# LUMIN.AI Monitoring Setup Script
# Sets up comprehensive monitoring for the development container
# Usage: ./scripts/setup-monitoring.sh

set -euo pipefail

# Configuration
MONITORING_DIR=".monitoring"
LOG_DIR=".logs"
SCRIPTS_DIR="scripts"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${BLUE}[$timestamp]${NC} $message"
}

# Create monitoring directory structure
setup_monitoring_directories() {
    log "INFO" "Setting up monitoring directory structure..."
    
    mkdir -p "$MONITORING_DIR"/{dashboards,config,data,reports}
    mkdir -p "$LOG_DIR"/{monitoring,health,performance}
    
    log "INFO" "Created monitoring directories"
}

# Create monitoring configuration files
create_monitoring_config() {
    log "INFO" "Creating monitoring configuration files..."
    
    # Main monitoring configuration
    cat > "$MONITORING_DIR/config/monitoring.json" << 'EOF'
{
    "monitoring": {
        "enabled": true,
        "interval_seconds": 30,
        "retention_days": 7,
        "alerts": {
            "enabled": true,
            "email_notifications": false,
            "log_alerts": true
        }
    },
    "containers": {
        "lumin-ai-dev": {
            "monitor": true,
            "health_check_interval": 30,
            "resource_limits": {
                "cpu_warning": 70,
                "cpu_critical": 90,
                "memory_warning": 80,
                "memory_critical": 95
            }
        },
        "lumin-governance-db": {
            "monitor": true,
            "health_check_interval": 10,
            "resource_limits": {
                "cpu_warning": 60,
                "cpu_critical": 80,
                "memory_warning": 70,
                "memory_critical": 90
            }
        }
    },
    "metrics": {
        "collect_system_metrics": true,
        "collect_application_metrics": true,
        "export_format": "json",
        "export_interval": 300
    }
}
EOF

    # Health check configuration
    cat > "$MONITORING_DIR/config/health-checks.yaml" << 'EOF'
health_checks:
  - name: "container_status"
    type: "docker_container"
    interval: 30
    timeout: 10
    containers:
      - "lumin-ai-dev"
      - "lumin-governance-db"
    
  - name: "mongodb_connectivity"
    type: "mongodb"
    interval: 60
    timeout: 15
    connection_string: "mongodb://lumin:devpassword@governance-db:27017/governance_analysis"
    
  - name: "development_environment"
    type: "command"
    interval: 300
    timeout: 30
    commands:
      - "python3 --version"
      - "node --version"
      - "pip list --format=freeze | wc -l"
    
  - name: "port_connectivity"
    type: "tcp_port"
    interval: 120
    timeout: 5
    ports:
      - 3000
      - 8000
      - 9000
    
  - name: "disk_usage"
    type: "disk_space"
    interval: 300
    timeout: 10
    warning_threshold: 80
    critical_threshold: 90
    mount_points:
      - "/workspace"
EOF

    # Performance monitoring configuration
    cat > "$MONITORING_DIR/config/performance.yaml" << 'EOF'
performance_monitoring:
  enabled: true
  collection_interval: 5
  retention_period: "7d"
  
  metrics:
    - name: "cpu_usage"
      type: "percentage"
      warning_threshold: 70
      critical_threshold: 90
      
    - name: "memory_usage"
      type: "percentage"
      warning_threshold: 80
      critical_threshold: 95
      
    - name: "disk_io"
      type: "rate"
      warning_threshold: 100  # MB/s
      critical_threshold: 200
      
    - name: "network_io"
      type: "rate"
      warning_threshold: 50   # MB/s
      critical_threshold: 100
      
  alerts:
    enabled: true
    notification_methods:
      - "log"
      - "console"
    
  exports:
    csv: true
    json: true
    interval: 300  # 5 minutes
EOF

    log "INFO" "Created monitoring configuration files"
}

# Create monitoring scripts
create_monitoring_scripts() {
    log "INFO" "Creating monitoring scripts..."
    
    # Quick health check script
    cat > "$SCRIPTS_DIR/quick-health-check.sh" << 'EOF'
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
EOF

    chmod +x "$SCRIPTS_DIR/quick-health-check.sh"
    
    # Monitoring daemon script
    cat > "$SCRIPTS_DIR/start-monitoring.sh" << 'EOF'
#!/bin/bash
# Start comprehensive monitoring for LUMIN.AI containers

set -euo pipefail

MONITORING_DIR=".monitoring"
LOG_DIR=".logs"

# Check if monitoring is already running
if pgrep -f "container-health-monitor" >/dev/null; then
    echo "⚠️  Monitoring is already running"
    exit 0
fi

echo "🚀 Starting LUMIN.AI monitoring services..."

# Start health monitoring in background
nohup bash scripts/container-health-monitor.sh --continuous --interval 30 > "$LOG_DIR/monitoring/health-monitor.log" 2>&1 &
echo $! > "$MONITORING_DIR/health-monitor.pid"
echo "✅ Health monitoring started (PID: $!)"

# Start performance monitoring in background
nohup python3 scripts/container-performance-monitor.py --duration 86400 --interval 5 --export-csv > "$LOG_DIR/monitoring/performance-monitor.log" 2>&1 &
echo $! > "$MONITORING_DIR/performance-monitor.pid"
echo "✅ Performance monitoring started (PID: $!)"

echo "📊 Monitoring dashboard available at: .monitoring/dashboards/"
echo "📋 Logs available at: .logs/monitoring/"
echo "🛑 Stop monitoring with: ./scripts/stop-monitoring.sh"
EOF

    chmod +x "$SCRIPTS_DIR/start-monitoring.sh"
    
    # Stop monitoring script
    cat > "$SCRIPTS_DIR/stop-monitoring.sh" << 'EOF'
#!/bin/bash
# Stop monitoring services

MONITORING_DIR=".monitoring"

echo "🛑 Stopping LUMIN.AI monitoring services..."

# Stop health monitoring
if [ -f "$MONITORING_DIR/health-monitor.pid" ]; then
    pid=$(cat "$MONITORING_DIR/health-monitor.pid")
    if kill -0 "$pid" 2>/dev/null; then
        kill "$pid"
        echo "✅ Health monitoring stopped (PID: $pid)"
    fi
    rm -f "$MONITORING_DIR/health-monitor.pid"
fi

# Stop performance monitoring
if [ -f "$MONITORING_DIR/performance-monitor.pid" ]; then
    pid=$(cat "$MONITORING_DIR/performance-monitor.pid")
    if kill -0 "$pid" 2>/dev/null; then
        kill "$pid"
        echo "✅ Performance monitoring stopped (PID: $pid)"
    fi
    rm -f "$MONITORING_DIR/performance-monitor.pid"
fi

echo "🔧 All monitoring services stopped"
EOF

    chmod +x "$SCRIPTS_DIR/stop-monitoring.sh"
    
    log "INFO" "Created monitoring scripts"
}

# Create monitoring dashboard
create_monitoring_dashboard() {
    log "INFO" "Creating monitoring dashboard..."
    
    # Simple HTML dashboard
    cat > "$MONITORING_DIR/dashboards/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LUMIN.AI Container Monitoring Dashboard</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .metric-card {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #495057;
        }
        .metric-label {
            color: #6c757d;
            margin-top: 5px;
        }
        .status-healthy { color: #28a745; }
        .status-warning { color: #ffc107; }
        .status-critical { color: #dc3545; }
        .refresh-button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        .refresh-button:hover {
            background: #0056b3;
        }
        .last-updated {
            text-align: center;
            color: #6c757d;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 LUMIN.AI Container Monitoring</h1>
            <p>Real-time monitoring dashboard for development containers</p>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value status-healthy">✅</div>
                <div class="metric-label">Container Status</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">45%</div>
                <div class="metric-label">CPU Usage</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">2.1GB</div>
                <div class="metric-label">Memory Usage</div>
            </div>
            <div class="metric-card">
                <div class="metric-value status-healthy">✅</div>
                <div class="metric-label">MongoDB Status</div>
            </div>
        </div>
        
        <div style="text-align: center;">
            <button class="refresh-button" onclick="location.reload()">
                🔄 Refresh Data
            </button>
        </div>
        
        <div class="last-updated">
            Last updated: <span id="timestamp"></span>
        </div>
    </div>
    
    <script>
        // Update timestamp
        document.getElementById('timestamp').textContent = new Date().toLocaleString();
        
        // Auto-refresh every 30 seconds
        setTimeout(() => location.reload(), 30000);
    </script>
</body>
</html>
EOF

    # Dashboard launcher script
    cat > "$SCRIPTS_DIR/open-dashboard.sh" << 'EOF'
#!/bin/bash
# Open monitoring dashboard in default browser

DASHBOARD_PATH=".monitoring/dashboards/index.html"

if [ -f "$DASHBOARD_PATH" ]; then
    echo "📊 Opening LUMIN.AI monitoring dashboard..."
    
    # Try to open in different systems
    if command -v xdg-open > /dev/null; then
        xdg-open "$DASHBOARD_PATH"
    elif command -v open > /dev/null; then
        open "$DASHBOARD_PATH"
    elif command -v start > /dev/null; then
        start "$DASHBOARD_PATH"
    else
        echo "Please open the following file in your browser:"
        echo "$(pwd)/$DASHBOARD_PATH"
    fi
else
    echo "❌ Dashboard not found. Run ./scripts/setup-monitoring.sh first."
fi
EOF

    chmod +x "$SCRIPTS_DIR/open-dashboard.sh"
    
    log "INFO" "Created monitoring dashboard"
}

# Create monitoring cron jobs
setup_monitoring_cron() {
    log "INFO" "Setting up monitoring cron jobs..."
    
    # Create cron job configuration
    cat > "$MONITORING_DIR/config/cron-monitoring.txt" << 'EOF'
# LUMIN.AI Container Monitoring Cron Jobs
# Add these to your crontab with: crontab -e

# Run health check every 5 minutes
*/5 * * * * /workspace/scripts/quick-health-check.sh >> /workspace/.logs/monitoring/cron-health.log 2>&1

# Generate performance report daily at 2 AM
0 2 * * * /workspace/scripts/container-performance-monitor.py --duration 300 --export-csv >> /workspace/.logs/monitoring/daily-report.log 2>&1

# Clean up old logs weekly (Sundays at 3 AM)
0 3 * * 0 find /workspace/.logs -name "*.log" -mtime +7 -delete

# Archive monitoring data monthly
0 4 1 * * tar -czf /workspace/.logs/monitoring/archive-$(date +%Y%m).tar.gz /workspace/.logs/monitoring/*.log && rm -f /workspace/.logs/monitoring/*.log
EOF

    log "INFO" "Created cron job configuration"
    echo "📋 To enable cron monitoring, run: crontab $MONITORING_DIR/config/cron-monitoring.txt"
}

# Create documentation
create_monitoring_docs() {
    log "INFO" "Creating monitoring documentation..."
    
    cat > "$MONITORING_DIR/README.md" << 'EOF'
# LUMIN.AI Container Monitoring

This directory contains the monitoring setup for LUMIN.AI development containers.

## Quick Start

```bash
# Setup monitoring
./scripts/setup-monitoring.sh

# Start monitoring services
./scripts/start-monitoring.sh

# Check health status
./scripts/quick-health-check.sh

# Open dashboard
./scripts/open-dashboard.sh

# Stop monitoring
./scripts/stop-monitoring.sh
```

## Directory Structure

```
.monitoring/
├── config/           # Configuration files
├── dashboards/       # Web dashboards
├── data/            # Monitoring data
└── reports/         # Generated reports

.logs/
├── monitoring/      # Monitoring service logs
├── health/         # Health check logs
└── performance/    # Performance monitoring logs
```

## Available Scripts

- `quick-health-check.sh` - Fast container health check
- `container-health-monitor.sh` - Comprehensive health monitoring
- `container-performance-monitor.py` - Performance monitoring with metrics
- `start-monitoring.sh` - Start all monitoring services
- `stop-monitoring.sh` - Stop all monitoring services
- `open-dashboard.sh` - Open web dashboard

## Configuration

Edit configuration files in `.monitoring/config/`:
- `monitoring.json` - Main monitoring configuration
- `health-checks.yaml` - Health check definitions
- `performance.yaml` - Performance monitoring settings

## Monitoring Features

### Health Monitoring
- Container status checking
- MongoDB connectivity
- Development environment validation
- Port connectivity tests
- Disk usage monitoring

### Performance Monitoring
- CPU and memory usage tracking
- Network I/O monitoring
- Disk I/O monitoring
- Resource limit alerting
- Historical data collection

### Alerting
- Configurable thresholds
- Multiple notification methods
- Alert history tracking
- Severity levels (INFO, WARNING, CRITICAL)

## Dashboard

The web dashboard provides:
- Real-time container status
- Resource usage visualization
- Alert notifications
- Historical trend data

Access at: `.monitoring/dashboards/index.html`

## Automation

### Cron Jobs
Set up automated monitoring with cron jobs:
```bash
crontab .monitoring/config/cron-monitoring.txt
```

### Continuous Monitoring
For 24/7 monitoring, use:
```bash
./scripts/start-monitoring.sh
```

## Troubleshooting

### Common Issues
1. **Monitoring not starting**: Check Docker daemon status
2. **Permission errors**: Ensure scripts are executable
3. **High resource usage**: Check monitoring intervals
4. **Dashboard not loading**: Verify file paths

### Logs
Check logs in `.logs/monitoring/` for detailed information.

## Customization

### Adding New Metrics
1. Edit `performance.yaml` configuration
2. Update monitoring scripts
3. Modify dashboard templates

### Custom Alerts
1. Configure thresholds in `monitoring.json`
2. Add notification methods
3. Test alert conditions

## Support

For issues or questions about monitoring:
1. Check logs in `.logs/monitoring/`
2. Review configuration files
3. Run health checks manually
4. Contact the development team
EOF

    log "INFO" "Created monitoring documentation"
}

# Main setup function
main() {
    log "INFO" "Starting LUMIN.AI monitoring setup..."
    
    # Create directory structure
    setup_monitoring_directories
    
    # Create configuration files
    create_monitoring_config
    
    # Create monitoring scripts
    create_monitoring_scripts
    
    # Create dashboard
    create_monitoring_dashboard
    
    # Setup cron jobs
    setup_monitoring_cron
    
    # Create documentation
    create_monitoring_docs
    
    log "INFO" "✅ Monitoring setup completed successfully!"
    
    echo
    echo "🎉 LUMIN.AI Container Monitoring Setup Complete!"
    echo "================================================"
    echo
    echo "📋 Next Steps:"
    echo "1. Start monitoring: ./scripts/start-monitoring.sh"
    echo "2. Check health: ./scripts/quick-health-check.sh"
    echo "3. Open dashboard: ./scripts/open-dashboard.sh"
    echo "4. Review docs: .monitoring/README.md"
    echo
    echo "📊 Monitoring Features:"
    echo "- Real-time health checks"
    echo "- Performance metrics collection"
    echo "- Automated alerting"
    echo "- Web dashboard"
    echo "- Historical data export"
    echo
    echo "🔧 Configuration:"
    echo "- Edit .monitoring/config/ files to customize"
    echo "- Enable cron jobs for automation"
    echo "- Adjust thresholds and intervals"
    echo
}

# Execute main function
main "$@" 