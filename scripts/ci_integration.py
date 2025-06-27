#!/usr/bin/env python3
"""
LUMIN.AI CI Integration Script
This script integrates the project automation into CI/CD pipelines,
running validation checks and timeline setup with comprehensive reporting.
"""

import argparse
import json
import logging
import os
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Add the parent directory to the sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))


@dataclass
class CICheck:
    """Represents a CI check result"""

    name: str
    status: bool
    message: str
    duration: float
    critical: bool = True


class CIIntegration:
    def __init__(self, token: str, owner: str, repo: str, project_name: str):
        self.token = token
        self.owner = owner
        self.repo = repo
        self.project_name = project_name
        self.checks: List[CICheck] = []
        self.start_time = datetime.now()

    def run_validation_check(self) -> CICheck:
        """Run project setup validation"""
        start_time = datetime.now()

        try:
            cmd = [
                sys.executable,
                "-m",
                "scripts.project_setup_validator",
                "--token",
                self.token,
                "--owner",
                self.owner,
                "--repo",
                self.repo,
                "--project",
                self.project_name,
                "--log-level",
                "WARNING",  # Reduce noise in CI
            ]

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            duration = (datetime.now() - start_time).total_seconds()

            if result.returncode == 0:
                return CICheck(
                    name="Project Setup Validation",
                    status=True,
                    message="✅ All validation checks passed",
                    duration=duration,
                )
            else:
                return CICheck(
                    name="Project Setup Validation",
                    status=False,
                    message=f"❌ Validation failed: {result.stderr}",
                    duration=duration,
                )

        except subprocess.TimeoutExpired:
            duration = (datetime.now() - start_time).total_seconds()
            return CICheck(
                name="Project Setup Validation",
                status=False,
                message="❌ Validation timed out after 5 minutes",
                duration=duration,
            )
        except Exception as e:
            duration = (datetime.now() - start_time).total_seconds()
            return CICheck(
                name="Project Setup Validation",
                status=False,
                message=f"❌ Validation error: {e}",
                duration=duration,
            )

    def run_label_validation(self) -> CICheck:
        """Run label validation check"""
        start_time = datetime.now()

        try:
            cmd = [
                sys.executable,
                "-m",
                "scripts.validate_labels",
                "--token",
                self.token,
                "--owner",
                self.owner,
                "--repo",
                self.repo,
                "--log-level",
                "WARNING",
            ]

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            duration = (datetime.now() - start_time).total_seconds()

            if result.returncode == 0:
                return CICheck(
                    name="Label Validation",
                    status=True,
                    message="✅ Label validation passed",
                    duration=duration,
                )
            else:
                return CICheck(
                    name="Label Validation",
                    status=False,
                    message=f"❌ Label validation failed: {result.stderr}",
                    duration=duration,
                )

        except subprocess.TimeoutExpired:
            duration = (datetime.now() - start_time).total_seconds()
            return CICheck(
                name="Label Validation",
                status=False,
                message="❌ Label validation timed out",
                duration=duration,
            )
        except Exception as e:
            duration = (datetime.now() - start_time).total_seconds()
            return CICheck(
                name="Label Validation",
                status=False,
                message=f"❌ Label validation error: {e}",
                duration=duration,
            )

    def run_timeline_dry_run(self) -> CICheck:
        """Run timeline setup in dry-run mode"""
        start_time = datetime.now()

        try:
            cmd = [
                sys.executable,
                "-m",
                "scripts.enhanced_timeline_setup",
                "--token",
                self.token,
                "--owner",
                self.owner,
                "--repo",
                self.repo,
                "--project",
                self.project_name,
                "--dry-run",
                "--log-level",
                "WARNING",
            ]

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            duration = (datetime.now() - start_time).total_seconds()

            if result.returncode == 0:
                return CICheck(
                    name="Timeline Dry Run",
                    status=True,
                    message="✅ Timeline dry run completed successfully",
                    duration=duration,
                )
            else:
                return CICheck(
                    name="Timeline Dry Run",
                    status=False,
                    message=f"❌ Timeline dry run failed: {result.stderr}",
                    duration=duration,
                )

        except subprocess.TimeoutExpired:
            duration = (datetime.now() - start_time).total_seconds()
            return CICheck(
                name="Timeline Dry Run",
                status=False,
                message="❌ Timeline dry run timed out",
                duration=duration,
            )
        except Exception as e:
            duration = (datetime.now() - start_time).total_seconds()
            return CICheck(
                name="Timeline Dry Run",
                status=False,
                message=f"❌ Timeline dry run error: {e}",
                duration=duration,
            )

    def run_issue_sync_check(self) -> CICheck:
        """Check if issues are properly synced to the project"""
        start_time = datetime.now()

        try:
            # Import here to avoid circular imports
            from scripts.github_client import GitHubClient

            client = GitHubClient(self.token, self.owner, self.repo)

            # Find project
            query = f"""
            {{
              repository(owner: "{self.owner}", name: "{self.repo}") {{
                projectsV2(first: 100) {{
                  nodes {{
                    id
                    title
                    items(first: 100) {{
                      totalCount
                    }}
                  }}
                }}
              }}
            }}
            """

            result = client.post_graphql(query)

            if "data" not in result:
                duration = (datetime.now() - start_time).total_seconds()
                return CICheck(
                    name="Issue Sync Check",
                    status=False,
                    message="❌ Failed to fetch project data",
                    duration=duration,
                )

            projects = result["data"]["repository"]["projectsV2"]["nodes"]
            target_project = None

            for project in projects:
                if project and project["title"] == self.project_name:
                    target_project = project
                    break

            if not target_project:
                duration = (datetime.now() - start_time).total_seconds()
                return CICheck(
                    name="Issue Sync Check",
                    status=False,
                    message=f"❌ Project '{self.project_name}' not found",
                    duration=duration,
                )

            item_count = target_project["items"]["totalCount"]
            duration = (datetime.now() - start_time).total_seconds()

            if item_count > 0:
                return CICheck(
                    name="Issue Sync Check",
                    status=True,
                    message=f"✅ Project has {item_count} items synced",
                    duration=duration,
                )
            else:
                return CICheck(
                    name="Issue Sync Check",
                    status=False,
                    message="❌ No items synced to project",
                    duration=duration,
                )

        except Exception as e:
            duration = (datetime.now() - start_time).total_seconds()
            return CICheck(
                name="Issue Sync Check",
                status=False,
                message=f"❌ Issue sync check error: {e}",
                duration=duration,
            )

    def run_all_checks(self) -> bool:
        """Run all CI checks"""
        logger.info("🚀 Starting CI integration checks...")

        # Run all checks
        checks = [
            self.run_validation_check(),
            self.run_label_validation(),
            self.run_timeline_dry_run(),
            self.run_issue_sync_check(),
        ]

        self.checks = checks

        # Print results
        logger.info("\n" + "=" * 60)
        logger.info("CI INTEGRATION RESULTS")
        logger.info("=" * 60)

        all_passed = True
        critical_failures = []

        for check in checks:
            status_icon = "✅" if check.status else "❌"
            logger.info(f"{status_icon} {check.name} ({check.duration:.2f}s): {check.message}")

            if not check.status:
                all_passed = False
                if check.critical:
                    critical_failures.append(check)

        total_duration = (datetime.now() - self.start_time).total_seconds()
        logger.info(f"\n⏱️  Total duration: {total_duration:.2f}s")

        if all_passed:
            logger.info("🎉 ALL CI CHECKS PASSED!")
        else:
            logger.info(f"⚠️  {len(critical_failures)} CRITICAL FAILURES")

        return all_passed

    def generate_report(self, output_file: Optional[str] = None) -> str:
        """Generate a comprehensive CI report"""
        report = {
            "timestamp": datetime.now().isoformat(),
            "repository": f"{self.owner}/{self.repo}",
            "project": self.project_name,
            "total_duration": (datetime.now() - self.start_time).total_seconds(),
            "checks": [
                {
                    "name": check.name,
                    "status": check.status,
                    "message": check.message,
                    "duration": check.duration,
                    "critical": check.critical,
                }
                for check in self.checks
            ],
            "summary": {
                "total_checks": len(self.checks),
                "passed_checks": len([c for c in self.checks if c.status]),
                "failed_checks": len([c for c in self.checks if not c.status]),
                "critical_failures": len([c for c in self.checks if not c.status and c.critical]),
                "overall_status": all(c.status for c in self.checks if c.critical),
            },
        }

        report_str = json.dumps(report, indent=2)

        if output_file:
            try:
                with open(output_file, "w") as f:
                    f.write(report_str)
                logger.info(f"📄 Report saved to: {output_file}")
            except IOError as e:
                logger.error(f"❌ Failed to write report to {output_file}: {e}")

        return report_str

    def create_github_status(self, sha: str, context: str = "ci/lumin-automation") -> bool:
        """Create a commit status on GitHub"""
        try:
            # Determine status
            overall_status = all(c.status for c in self.checks if c.critical)
            state = "success" if overall_status else "failure"
            description = (
                "All CI checks passed" if overall_status else "Some critical CI checks failed"
            )

            # NOTE: We are NOT using GitHubClient here to avoid circular deps
            # and to keep this script focused. Using `gh` CLI is more robust
            # in a CI environment where `gh` is expected to be installed.
            cmd = [
                "gh",
                "api",
                "--method",
                "POST",
                f"/repos/{self.owner}/{self.repo}/statuses/{sha}",
                "-f",
                f"state={state}",
                "-f",
                f"description={description}",
                "-f",
                f"context={context}",
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

            if result.returncode == 0:
                logger.info(f"✅ Successfully created status check for SHA {sha}")
                return True
            else:
                logger.error(f"❌ Failed to create status check: {result.stderr}")
                return False
        except Exception as e:
            logger.error(f"❌ Error creating GitHub status: {e}")
            return False


def main():
    parser = argparse.ArgumentParser(description="CI integration for LUMIN.AI project automation")
    parser.add_argument("--token", required=True, help="GitHub personal access token")
    parser.add_argument(
        "--owner", default="uelkerd", help="GitHub repository owner (default: uelkerd)"
    )
    parser.add_argument(
        "--repo", default="lumin-ai", help="GitHub repository name (default: lumin-ai)"
    )
    parser.add_argument(
        "--project",
        default="LUMIN Project Tracker",
        help="Project board name (default: LUMIN Project Tracker)",
    )
    parser.add_argument("--report-file", help="Save detailed report to file")
    parser.add_argument("--github-status", help="Create GitHub status check for commit SHA")
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
        help="Set the logging level (default: INFO)",
    )

    args = parser.parse_args()

    # Configure logging
    logging.basicConfig(
        level=getattr(logging, args.log_level),
        format="%(asctime)s - %(levelname)s - %(message)s",
    )

    # Create CI integration
    ci = CIIntegration(args.token, args.owner, args.repo, args.project)

    # Run checks
    success = ci.run_all_checks()

    # Generate report
    if args.report_file:
        ci.generate_report(args.report_file)
    else:
        ci.generate_report()

    # Create GitHub status if requested
    if args.github_status:
        ci.create_github_status(args.github_status)

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
