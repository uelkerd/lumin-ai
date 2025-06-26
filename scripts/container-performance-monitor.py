#!/usr/bin/env python3
"""
LUMIN.AI Container Performance Monitor

Advanced performance monitoring for Docker containers with metrics collection,
alerting, and historical tracking.

Usage:
    python scripts/container-performance-monitor.py [--duration 300] [--interval 5] [--export-csv]
"""

import argparse
import csv
import json
import logging
import os
import subprocess
import sys
import time
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import psutil


@dataclass
class ContainerMetrics:
    """Container performance metrics data structure."""

    timestamp: str
    container_name: str
    cpu_percent: float
    memory_usage_mb: float
    memory_percent: float
    memory_limit_mb: float
    network_rx_mb: float
    network_tx_mb: float
    block_read_mb: float
    block_write_mb: float
    pids: int
    status: str
    uptime_seconds: int


@dataclass
class PerformanceAlert:
    """Performance alert data structure."""

    timestamp: str
    container_name: str
    alert_type: str
    metric: str
    current_value: float
    threshold: float
    severity: str
    message: str


class ContainerPerformanceMonitor:
    """Advanced container performance monitoring system."""

    def __init__(self, containers: List[str], log_dir: str = ".logs"):
        self.containers = containers
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(exist_ok=True)

        # Performance thresholds
        self.thresholds = {
            "cpu_critical": 90.0,
            "cpu_warning": 70.0,
            "memory_critical": 95.0,
            "memory_warning": 85.0,
            "disk_io_warning": 100.0,  # MB/s
            "network_io_warning": 50.0,  # MB/s
        }

        # Historical data storage
        self.metrics_history: List[ContainerMetrics] = []
        self.alerts_history: List[PerformanceAlert] = []

        # Setup logging
        self.setup_logging()

    def setup_logging(self) -> None:
        """Configure logging for the performance monitor."""
        log_file = self.log_dir / "performance-monitor.log"

        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            handlers=[logging.FileHandler(log_file), logging.StreamHandler(sys.stdout)],
        )

        self.logger = logging.getLogger(__name__)

    def run_docker_command(self, cmd: List[str]) -> Optional[str]:
        """Execute Docker command and return output."""
        try:
            result = subprocess.run(
                cmd, capture_output=True, text=True, check=True, timeout=30
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            self.logger.error(f"Docker command failed: {' '.join(cmd)}, Error: {e}")
            return None
        except subprocess.TimeoutExpired:
            self.logger.error(f"Docker command timed out: {' '.join(cmd)}")
            return None

    def get_container_stats(self, container_name: str) -> Optional[ContainerMetrics]:
        """Get comprehensive container performance metrics."""
        try:
            # Get basic stats
            stats_output = self.run_docker_command(
                [
                    "docker",
                    "stats",
                    "--no-stream",
                    "--format",
                    "{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}\t{{.PIDs}}",
                    container_name,
                ]
            )

            if not stats_output:
                return None

            stats_parts = stats_output.split("\t")
            if len(stats_parts) != 6:
                self.logger.warning(f"Unexpected stats format for {container_name}")
                return None

            # Parse basic metrics
            cpu_percent = float(stats_parts[0].rstrip("%"))
            memory_usage = stats_parts[1]  # e.g., "1.5GiB / 4GiB"
            memory_percent = float(stats_parts[2].rstrip("%"))
            network_io = stats_parts[3]  # e.g., "1.2MB / 3.4MB"
            block_io = stats_parts[4]  # e.g., "5.6MB / 7.8MB"
            pids = int(stats_parts[5])

            # Parse memory usage
            memory_parts = memory_usage.split(" / ")
            memory_usage_mb = self._parse_size_to_mb(memory_parts[0])
            memory_limit_mb = self._parse_size_to_mb(memory_parts[1])

            # Parse network I/O
            network_parts = network_io.split(" / ")
            network_rx_mb = self._parse_size_to_mb(network_parts[0])
            network_tx_mb = self._parse_size_to_mb(network_parts[1])

            # Parse block I/O
            block_parts = block_io.split(" / ")
            block_read_mb = self._parse_size_to_mb(block_parts[0])
            block_write_mb = self._parse_size_to_mb(block_parts[1])

            # Get container status and uptime
            inspect_output = self.run_docker_command(
                [
                    "docker",
                    "inspect",
                    "--format",
                    "{{.State.Status}}\t{{.State.StartedAt}}",
                    container_name,
                ]
            )

            if inspect_output:
                inspect_parts = inspect_output.split("\t")
                status = inspect_parts[0]
                started_at = inspect_parts[1]
                uptime_seconds = self._calculate_uptime(started_at)
            else:
                status = "unknown"
                uptime_seconds = 0

            return ContainerMetrics(
                timestamp=datetime.now().isoformat(),
                container_name=container_name,
                cpu_percent=cpu_percent,
                memory_usage_mb=memory_usage_mb,
                memory_percent=memory_percent,
                memory_limit_mb=memory_limit_mb,
                network_rx_mb=network_rx_mb,
                network_tx_mb=network_tx_mb,
                block_read_mb=block_read_mb,
                block_write_mb=block_write_mb,
                pids=pids,
                status=status,
                uptime_seconds=uptime_seconds,
            )

        except Exception as e:
            self.logger.error(f"Failed to get stats for {container_name}: {e}")
            return None

    def _parse_size_to_mb(self, size_str: str) -> float:
        """Parse Docker size string to MB."""
        size_str = size_str.strip()

        if size_str in ["0B", "0", ""]:
            return 0.0

        # Extract number and unit
        import re

        match = re.match(r"([0-9.]+)([A-Za-z]+)", size_str)
        if not match:
            return 0.0

        value = float(match.group(1))
        unit = match.group(2).upper()

        # Convert to MB
        conversions = {
            "B": 1 / (1024 * 1024),
            "KB": 1 / 1024,
            "KIB": 1 / 1024,
            "MB": 1,
            "MIB": 1,
            "GB": 1024,
            "GIB": 1024,
            "TB": 1024 * 1024,
            "TIB": 1024 * 1024,
        }

        return value * conversions.get(unit, 1)

    def _calculate_uptime(self, started_at: str) -> int:
        """Calculate container uptime in seconds."""
        try:
            # Parse Docker timestamp format
            start_time = datetime.fromisoformat(started_at.replace("Z", "+00:00"))
            now = datetime.now(start_time.tzinfo)
            return int((now - start_time).total_seconds())
        except Exception:
            return 0

    def check_performance_thresholds(
        self, metrics: ContainerMetrics
    ) -> List[PerformanceAlert]:
        """Check metrics against performance thresholds and generate alerts."""
        alerts = []

        # CPU usage alerts
        if metrics.cpu_percent >= self.thresholds["cpu_critical"]:
            alerts.append(
                PerformanceAlert(
                    timestamp=metrics.timestamp,
                    container_name=metrics.container_name,
                    alert_type="HIGH_CPU_USAGE",
                    metric="cpu_percent",
                    current_value=metrics.cpu_percent,
                    threshold=self.thresholds["cpu_critical"],
                    severity="CRITICAL",
                    message=f"CPU usage is critically high: {metrics.cpu_percent:.1f}%",
                )
            )
        elif metrics.cpu_percent >= self.thresholds["cpu_warning"]:
            alerts.append(
                PerformanceAlert(
                    timestamp=metrics.timestamp,
                    container_name=metrics.container_name,
                    alert_type="HIGH_CPU_USAGE",
                    metric="cpu_percent",
                    current_value=metrics.cpu_percent,
                    threshold=self.thresholds["cpu_warning"],
                    severity="WARNING",
                    message=f"CPU usage is high: {metrics.cpu_percent:.1f}%",
                )
            )

        # Memory usage alerts
        if metrics.memory_percent >= self.thresholds["memory_critical"]:
            alerts.append(
                PerformanceAlert(
                    timestamp=metrics.timestamp,
                    container_name=metrics.container_name,
                    alert_type="HIGH_MEMORY_USAGE",
                    metric="memory_percent",
                    current_value=metrics.memory_percent,
                    threshold=self.thresholds["memory_critical"],
                    severity="CRITICAL",
                    message=f"Memory usage is critically high: {metrics.memory_percent:.1f}% ({metrics.memory_usage_mb:.1f}MB)",
                )
            )
        elif metrics.memory_percent >= self.thresholds["memory_warning"]:
            alerts.append(
                PerformanceAlert(
                    timestamp=metrics.timestamp,
                    container_name=metrics.container_name,
                    alert_type="HIGH_MEMORY_USAGE",
                    metric="memory_percent",
                    current_value=metrics.memory_percent,
                    threshold=self.thresholds["memory_warning"],
                    severity="WARNING",
                    message=f"Memory usage is high: {metrics.memory_percent:.1f}% ({metrics.memory_usage_mb:.1f}MB)",
                )
            )

        return alerts

    def display_real_time_metrics(self, metrics: List[ContainerMetrics]) -> None:
        """Display real-time metrics in a formatted table."""
        os.system("clear" if os.name == "posix" else "cls")

        print("╔" + "═" * 98 + "╗")
        print(
            "║" + " " * 30 + "LUMIN.AI Container Performance Monitor" + " " * 30 + "║"
        )
        print("╠" + "═" * 98 + "╣")

        if not metrics:
            print("║" + " " * 40 + "No container data available" + " " * 40 + "║")
            print("╚" + "═" * 98 + "╝")
            return

        # Header
        print(
            f"║ {'Container':<20} {'Status':<10} {'CPU%':<8} {'Memory':<15} {'Network I/O':<15} {'Uptime':<12} ║"
        )
        print("╠" + "═" * 98 + "╣")

        for metric in metrics:
            uptime_str = self._format_uptime(metric.uptime_seconds)
            memory_str = (
                f"{metric.memory_usage_mb:.0f}MB ({metric.memory_percent:.1f}%)"
            )
            network_str = f"↓{metric.network_rx_mb:.1f}MB ↑{metric.network_tx_mb:.1f}MB"

            # Color code CPU based on usage
            cpu_color = ""
            if metric.cpu_percent >= self.thresholds["cpu_critical"]:
                cpu_color = "🔴"
            elif metric.cpu_percent >= self.thresholds["cpu_warning"]:
                cpu_color = "🟡"
            else:
                cpu_color = "🟢"

            print(
                f"║ {metric.container_name:<20} {metric.status:<10} {cpu_color}{metric.cpu_percent:<7.1f} {memory_str:<15} {network_str:<15} {uptime_str:<12} ║"
            )

        print("╚" + "═" * 98 + "╝")
        print(f"Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    def _format_uptime(self, uptime_seconds: int) -> str:
        """Format uptime seconds into human-readable string."""
        if uptime_seconds < 60:
            return f"{uptime_seconds}s"
        elif uptime_seconds < 3600:
            return f"{uptime_seconds // 60}m {uptime_seconds % 60}s"
        elif uptime_seconds < 86400:
            hours = uptime_seconds // 3600
            minutes = (uptime_seconds % 3600) // 60
            return f"{hours}h {minutes}m"
        else:
            days = uptime_seconds // 86400
            hours = (uptime_seconds % 86400) // 3600
            return f"{days}d {hours}h"

    def export_metrics_to_csv(self, filename: str) -> None:
        """Export metrics history to CSV file."""
        if not self.metrics_history:
            self.logger.warning("No metrics data to export")
            return

        csv_file = self.log_dir / filename

        with open(csv_file, "w", newline="") as csvfile:
            writer = csv.DictWriter(
                csvfile, fieldnames=asdict(self.metrics_history[0]).keys()
            )
            writer.writeheader()

            for metrics in self.metrics_history:
                writer.writerow(asdict(metrics))

        self.logger.info(f"Metrics exported to {csv_file}")

    def export_alerts_to_json(self, filename: str) -> None:
        """Export alerts history to JSON file."""
        if not self.alerts_history:
            self.logger.warning("No alerts data to export")
            return

        json_file = self.log_dir / filename

        with open(json_file, "w") as jsonfile:
            json.dump(
                [asdict(alert) for alert in self.alerts_history], jsonfile, indent=2
            )

        self.logger.info(f"Alerts exported to {json_file}")

    def generate_performance_report(self) -> Dict:
        """Generate comprehensive performance report."""
        if not self.metrics_history:
            return {"error": "No metrics data available"}

        # Calculate statistics for each container
        container_stats = {}

        for container in self.containers:
            container_metrics = [
                m for m in self.metrics_history if m.container_name == container
            ]

            if not container_metrics:
                continue

            cpu_values = [m.cpu_percent for m in container_metrics]
            memory_values = [m.memory_percent for m in container_metrics]

            container_stats[container] = {
                "cpu": {
                    "average": sum(cpu_values) / len(cpu_values),
                    "max": max(cpu_values),
                    "min": min(cpu_values),
                },
                "memory": {
                    "average": sum(memory_values) / len(memory_values),
                    "max": max(memory_values),
                    "min": min(memory_values),
                },
                "alerts_count": len(
                    [a for a in self.alerts_history if a.container_name == container]
                ),
                "uptime_average": sum([m.uptime_seconds for m in container_metrics])
                / len(container_metrics),
            }

        return {
            "report_timestamp": datetime.now().isoformat(),
            "monitoring_duration_minutes": (
                len(self.metrics_history) * 5 / 60 if self.metrics_history else 0
            ),
            "total_metrics_collected": len(self.metrics_history),
            "total_alerts_generated": len(self.alerts_history),
            "container_statistics": container_stats,
        }

    def monitor(
        self, duration: int = 300, interval: int = 5, export_csv: bool = False
    ) -> None:
        """Run performance monitoring for specified duration."""
        self.logger.info(
            f"Starting performance monitoring for {duration} seconds (interval: {interval}s)"
        )

        start_time = time.time()
        end_time = start_time + duration

        try:
            while time.time() < end_time:
                current_metrics = []

                for container in self.containers:
                    metrics = self.get_container_stats(container)
                    if metrics:
                        current_metrics.append(metrics)
                        self.metrics_history.append(metrics)

                        # Check for alerts
                        alerts = self.check_performance_thresholds(metrics)
                        for alert in alerts:
                            self.alerts_history.append(alert)
                            self.logger.warning(
                                f"ALERT: {alert.container_name} - {alert.message}"
                            )

                # Display real-time metrics
                self.display_real_time_metrics(current_metrics)

                time.sleep(interval)

        except KeyboardInterrupt:
            self.logger.info("Performance monitoring stopped by user")

        # Generate final report
        report = self.generate_performance_report()
        report_file = (
            self.log_dir
            / f"performance-report-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
        )

        with open(report_file, "w") as f:
            json.dump(report, f, indent=2)

        self.logger.info(f"Performance report saved to {report_file}")

        # Export data if requested
        if export_csv:
            timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
            self.export_metrics_to_csv(f"performance-metrics-{timestamp}.csv")
            self.export_alerts_to_json(f"performance-alerts-{timestamp}.json")

        # Display summary
        print(f"\n📊 Performance Monitoring Summary:")
        print(f"Duration: {duration // 60}m {duration % 60}s")
        print(f"Metrics collected: {len(self.metrics_history)}")
        print(f"Alerts generated: {len(self.alerts_history)}")
        print(f"Report saved to: {report_file}")


def main():
    """Main entry point for the performance monitor."""
    parser = argparse.ArgumentParser(
        description="LUMIN.AI Container Performance Monitor"
    )
    parser.add_argument(
        "--duration",
        type=int,
        default=300,
        help="Monitoring duration in seconds (default: 300)",
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=5,
        help="Monitoring interval in seconds (default: 5)",
    )
    parser.add_argument(
        "--export-csv", action="store_true", help="Export metrics to CSV files"
    )
    parser.add_argument(
        "--containers",
        nargs="+",
        default=["lumin-ai-dev", "lumin-governance-db"],
        help="Container names to monitor",
    )

    args = parser.parse_args()

    monitor = ContainerPerformanceMonitor(args.containers)
    monitor.monitor(args.duration, args.interval, args.export_csv)


if __name__ == "__main__":
    main()
