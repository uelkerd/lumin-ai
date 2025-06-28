# 📊 LUMIN.AI Container Monitoring Guide

Complete monitoring solution for LUMIN.AI development containers with health checks, performance monitoring, and alerting.

## 🎯 Overview

The LUMIN.AI monitoring system provides comprehensive oversight of your development environment with:

- **Real-time Health Monitoring**: Container status, service availability, and environment validation
- **Performance Tracking**: CPU, memory, disk, and network usage metrics
- **Automated Alerting**: Configurable thresholds with multiple notification methods
- **Historical Data**: Trends analysis and performance reporting
- **Web Dashboard**: Visual monitoring interface with real-time updates

## 🚀 Quick Setup (2 Minutes)

### 1. Install Monitoring System

```bash
# Setup monitoring infrastructure
./scripts/setup-monitoring.sh

# Start monitoring services
./scripts/start-monitoring.sh
```

### 2. Verify Installation

```bash
# Quick health check
./scripts/quick-health-check.sh

# Open web dashboard
./scripts/open-dashboard.sh
```

### 3. Check Status

```bash
# View monitoring logs
tail -f .logs/monitoring/health-monitor.log

# Check running services
ps aux | grep monitor
```

## 🏗️ Monitoring Architecture

```
┌─────────────────────────────────────────┐
│           Monitoring System             │
├─────────────────────────────────────────┤
│  Health Monitor (30s intervals)         │
│  Performance Monitor (5s intervals)     │
│  Alert Manager (Real-time)              │
│  Data Collector (Continuous)            │
│  Web Dashboard (Auto-refresh)           │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│         Container Targets               │
├─────────────────────────────────────────┤
│  lumin-ai-dev (Main Dev Container)      │
│  lumin-governance-db (MongoDB)          │
│  Docker Daemon                          │
│  Host System Resources                  │
└─────────────────────────────────────────┘
```

## 📋 Monitoring Features

### Health Checks ✅

| Check Type           | Frequency | Timeout | Status    |
| -------------------- | --------- | ------- | --------- |
| Container Status     | 30s       | 10s     | ✅ Active |
| MongoDB Connectivity | 60s       | 15s     | ✅ Active |
| Python Environment   | 5m        | 30s     | ✅ Active |
| Node.js Environment  | 5m        | 30s     | ✅ Active |
| Port Connectivity    | 2m        | 5s      | ✅ Active |
| Disk Usage           | 5m        | 10s     | ✅ Active |

### Performance Metrics 📈

| Metric           | Collection Rate | Alert Thresholds                    | Retention |
| ---------------- | --------------- | ----------------------------------- | --------- |
| CPU Usage        | 5s              | Warning: 70%, Critical: 90%         | 7 days    |
| Memory Usage     | 5s              | Warning: 80%, Critical: 95%         | 7 days    |
| Network I/O      | 5s              | Warning: 50MB/s, Critical: 100MB/s  | 7 days    |
| Disk I/O         | 5s              | Warning: 100MB/s, Critical: 200MB/s | 7 days    |
| Container Uptime | 30s             | N/A                                 | 30 days   |

### Alert Types 🚨

- **🟢 INFO**: Normal operations, status updates
- **🟡 WARNING**: High resource usage, minor issues
- **🔴 CRITICAL**: Service failures, resource exhaustion
- **📊 REPORT**: Daily/weekly summaries

## 🛠️ Configuration

### Main Configuration (`monitoring.json`)

```json
{
  "monitoring": {
    "enabled": true,
    "interval_seconds": 30,
    "retention_days": 7
  },
  "containers": {
    "lumin-ai-dev": {
      "resource_limits": {
        "cpu_warning": 70,
        "cpu_critical": 90,
        "memory_warning": 80,
        "memory_critical": 95
      }
    }
  }
}
```

### Health Checks (`health-checks.yaml`)

```yaml
health_checks:
  - name: "container_status"
    interval: 30
    timeout: 10
    containers: ["lumin-ai-dev", "lumin-governance-db"]

  - name: "mongodb_connectivity"
    interval: 60
    timeout: 15
    connection_string: "mongodb://lumin:devpassword@governance-db:27017"
```

### Performance Monitoring (`performance.yaml`)

```yaml
performance_monitoring:
  collection_interval: 5
  retention_period: "7d"

  metrics:
    - name: "cpu_usage"
      warning_threshold: 70
      critical_threshold: 90
```

## 📊 Using the Web Dashboard

### Access Dashboard

```bash
# Open in browser
./scripts/open-dashboard.sh

# Or manually open
open .monitoring/dashboards/index.html
```

### Dashboard Features

- **Real-time Metrics**: Live CPU, memory, and network usage
- **Container Status**: Health indicators for all containers
- **Alert Notifications**: Recent alerts and warnings
- **Historical Charts**: Trend analysis over time
- **Quick Actions**: Restart containers, view logs

### Dashboard Layout

```
╔════════════════════════════════════════╗
║          LUMIN.AI Monitoring           ║
╠════════════════════════════════════════╣
║  Container Status  │  Resource Usage   ║
║  ✅ lumin-ai-dev   │  CPU: 45% 📊      ║
║  ✅ mongodb        │  RAM: 2.1GB 📊    ║
╠════════════════════════════════════════╣
║           Recent Alerts                ║
║  🟡 High CPU usage detected (75%)      ║
║  🟢 MongoDB connection restored        ║
╠════════════════════════════════════════╣
║        Performance Charts              ║
║  [CPU Usage Over Time Graph]           ║
║  [Memory Usage Over Time Graph]        ║
╚════════════════════════════════════════╝
```

## 🔧 Command Reference

### Essential Monitoring Commands

```bash
# Setup and Management
./scripts/setup-monitoring.sh          # Initial setup
./scripts/start-monitoring.sh          # Start all monitoring
./scripts/stop-monitoring.sh           # Stop all monitoring

# Health Checks
./scripts/quick-health-check.sh        # Fast health check
./scripts/container-health-monitor.sh  # Comprehensive monitoring
./scripts/container-health-monitor.sh --continuous  # Continuous mode

# Performance Monitoring
python scripts/container-performance-monitor.py     # Default 5min monitoring
python scripts/container-performance-monitor.py --duration 3600  # 1 hour
python scripts/container-performance-monitor.py --export-csv     # Export data

# Dashboard and Reports
./scripts/open-dashboard.sh            # Open web dashboard
./scripts/generate-report.sh           # Generate performance report
```

### Advanced Usage

```bash
# Custom monitoring duration
python scripts/container-performance-monitor.py --duration 1800 --interval 10

# JSON output for automation
./scripts/container-health-monitor.sh --json

# Verbose logging
./scripts/container-health-monitor.sh --verbose

# Monitor specific containers
python scripts/container-performance-monitor.py --containers lumin-ai-dev

# Export data to different formats
python scripts/container-performance-monitor.py --export-csv --duration 600
```

## 📈 Understanding Metrics

### CPU Usage Patterns

```bash
# Normal: 0-50% - Development work, background processes
# High: 50-80% - Heavy compilation, data processing
# Critical: 80%+ - Resource contention, possible issues
```

### Memory Usage Guidelines

```bash
# Normal: 0-60% - Regular development activities
# High: 60-85% - Large datasets, multiple applications
# Critical: 85%+ - Memory pressure, swap usage
```

### Alert Interpretation

| Alert Type     | Typical Cause      | Action Required                        |
| -------------- | ------------------ | -------------------------------------- |
| High CPU       | Heavy computation  | Monitor, consider optimization         |
| High Memory    | Large datasets     | Review memory usage, restart if needed |
| Container Down | Service failure    | Check logs, restart container          |
| MongoDB Error  | Database issue     | Verify connection, check DB logs       |
| Disk Full      | Insufficient space | Clean up files, expand storage         |

## 🚨 Troubleshooting

### Common Issues

#### Monitoring Not Starting

```bash
# Check Docker daemon
docker info

# Verify container status
docker ps -a

# Check script permissions
ls -la scripts/

# Review logs
tail -f .logs/monitoring/health-monitor.log
```

#### High Resource Usage

```bash
# Identify resource-heavy processes
docker stats

# Check container logs
docker logs lumin-ai-dev

# Analyze performance data
python scripts/container-performance-monitor.py --duration 300
```

#### MongoDB Connection Issues

```bash
# Test MongoDB directly
docker exec lumin-governance-db mongosh --eval "db.adminCommand('ping')"

# Check MongoDB logs
docker logs lumin-governance-db

# Verify network connectivity
docker exec lumin-ai-dev ping governance-db
```

#### Dashboard Not Loading

```bash
# Check file existence
ls -la .monitoring/dashboards/

# Verify web server (if using)
python3 -m http.server 8080 --directory .monitoring/dashboards

# Check browser console for errors
```

### Log Analysis

```bash
# Monitor logs in real-time
tail -f .logs/monitoring/*.log

# Search for specific errors
grep -i error .logs/monitoring/*.log

# Analyze performance trends
grep "CPU usage" .logs/monitoring/performance-monitor.log | tail -20

# Check alert history
cat .logs/monitoring/alerts.json | jq '.[] | select(.severity=="CRITICAL")'
```

## 🔄 Automation

### Cron Jobs Setup

```bash
# Add to crontab
crontab .monitoring/config/cron-monitoring.txt

# Verify cron jobs
crontab -l

# Manual cron execution
*/5 * * * * /workspace/scripts/quick-health-check.sh
```

### Automated Reporting

```bash
# Daily performance report
0 9 * * * python /workspace/scripts/container-performance-monitor.py --duration 300 --export-csv

# Weekly summary
0 9 * * 1 /workspace/scripts/generate-weekly-report.sh

# Monthly cleanup
0 2 1 * * find /workspace/.logs -name "*.log" -mtime +30 -delete
```

### Integration with CI/CD

```yaml
# GitHub Actions example
- name: Container Health Check
  run: |
    ./scripts/quick-health-check.sh
    if [ $? -ne 0 ]; then
      echo "Health check failed"
      exit 1
    fi
```

## 📊 Performance Optimization

### Monitoring Overhead

- **CPU Impact**: < 2% during normal operation
- **Memory Usage**: ~50MB for monitoring processes
- **Disk Space**: ~100MB/day for logs and metrics
- **Network**: Minimal (internal Docker network only)

### Optimization Tips

```bash
# Reduce monitoring frequency for better performance
# Edit .monitoring/config/monitoring.json
{
    "monitoring": {
        "interval_seconds": 60  # Increase from 30
    }
}

# Limit metric retention
{
    "monitoring": {
        "retention_days": 3  # Decrease from 7
    }
}

# Disable non-critical checks
# Comment out in health-checks.yaml
# - name: "port_connectivity"  # Disable if not needed
```

## 🔮 Advanced Features

### Custom Metrics

```python
# Add custom metrics to performance monitor
def check_custom_metric():
    # Your custom metric logic
    return metric_value

# Register in monitoring configuration
```

### Integration with External Systems

```bash
# Webhook notifications
curl -X POST https://hooks.slack.com/... -d '{"text":"Alert: High CPU usage"}'

# Email alerts
echo "Alert details" | mail -s "LUMIN.AI Alert" admin@company.com

# Database logging
python scripts/log-to-database.py --metric cpu_usage --value 85
```

### API Endpoints

```bash
# Health check API
curl http://localhost:8080/api/health

# Metrics API
curl http://localhost:8080/api/metrics

# Alerts API
curl http://localhost:8080/api/alerts
```

## 📚 Best Practices

### Monitoring Strategy

1. **Start Simple**: Use default configurations initially
2. **Monitor Trends**: Focus on patterns, not individual spikes
3. **Set Realistic Thresholds**: Avoid alert fatigue
4. **Regular Review**: Weekly analysis of performance data
5. **Document Changes**: Track configuration modifications

### Alert Management

- **Prioritize Critical Alerts**: Focus on service-affecting issues
- **Group Related Alerts**: Avoid duplicate notifications
- **Include Context**: Provide actionable information in alerts
- **Test Alert Channels**: Verify notifications work correctly

### Data Management

- **Regular Cleanup**: Archive old logs and metrics
- **Backup Important Data**: Preserve historical performance data
- **Monitor Storage Usage**: Prevent disk space issues
- **Optimize Retention**: Balance history needs with storage costs

## 🆘 Support and Resources

### Documentation

- 📖 [Team Onboarding Guide](./TEAM_ONBOARDING.md)
- 🐛 [Troubleshooting Guide](./TROUBLESHOOTING.md)
- 🔧 [Container Configuration](../.devcontainer/README.md)

### Monitoring Files

```
.monitoring/
├── config/
│   ├── monitoring.json
│   ├── health-checks.yaml
│   └── performance.yaml
├── dashboards/
│   └── index.html
└── reports/
    └── performance-YYYYMMDD.json

.logs/
├── monitoring/
│   ├── health-monitor.log
│   ├── performance-monitor.log
│   └── alerts.json
└── performance/
    └── metrics-YYYYMMDD.csv
```

### Getting Help

1. **Check Logs**: Review `.logs/monitoring/` for detailed information
2. **Run Diagnostics**: Use `./scripts/quick-health-check.sh`
3. **Review Configuration**: Verify `.monitoring/config/` files
4. **Test Components**: Run individual monitoring scripts
5. **Contact Team**: Reach out via team channels

---

_Keep your containers healthy and your development environment optimized! 🚀_
