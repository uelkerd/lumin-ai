#!/usr/bin/env python3
"""
LUMIN.AI Project Setup Validator
This script validates all prerequisites for the timeline automation to work correctly.
It checks GitHub authentication, Projects V2 board existence, field configuration,
and provides actionable feedback for fixing any issues.
"""

import argparse
import logging
import os
import subprocess
import sys
from dataclasses import dataclass
from typing import List, Optional


# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Add the parent directory to the sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from github_client import GitHubClient
except ImportError:
    logger.error(
        "Failed to import GitHubClient. Ensure github_client.py is in the 'scripts' directory."
    )
    sys.exit(1)


@dataclass
class ValidationResult:
    """Result of a validation check"""

    name: str
    status: bool
    message: str
    fix_instructions: Optional[str] = None
    critical: bool = True


class ProjectSetupValidator:
    def __init__(self, token: str, owner: str, repo: str):
        self.client = GitHubClient(token, owner, repo)
        self.owner = owner
        self.repo = repo
        self.project_id = None
        self.validation_results = []

    def validate_github_cli_auth(self) -> ValidationResult:
        """Validate GitHub CLI authentication"""
        try:
            result = subprocess.run(
                ["gh", "auth", "status"], capture_output=True, text=True, timeout=10
            )

            if result.returncode == 0:
                return ValidationResult(
                    name="GitHub CLI Authentication",
                    status=True,
                    message="✅ GitHub CLI is authenticated",
                )
            else:
                return ValidationResult(
                    name="GitHub CLI Authentication",
                    status=False,
                    message="❌ GitHub CLI is not authenticated",
                    fix_instructions=(
                        "Run: gh auth login --with-token < <(echo $GITHUB_TOKEN)"
                    ),
                )
        except FileNotFoundError:
            return ValidationResult(
                name="GitHub CLI Installation",
                status=False,
                message="❌ GitHub CLI is not installed",
                fix_instructions="Install GitHub CLI: https://cli.github.com/",
            )
        except Exception as e:
            return ValidationResult(
                name="GitHub CLI Authentication",
                status=False,
                message=f"❌ Error checking GitHub CLI auth: {e}",
                fix_instructions="Check GitHub CLI installation and run: gh auth login",
            )

    def validate_token_permissions(self) -> ValidationResult:
        """Validate GitHub token has required permissions"""
        try:
            # Test basic API access
            query = """
            query {
              viewer {
                login
                repositories(first: 1) {
                  nodes {
                    name
                  }
                }
              }
            }
            """

            result = self.client.post_graphql(query)

            if "data" in result and "viewer" in result["data"]:
                return ValidationResult(
                    name="GitHub Token Permissions",
                    status=True,
                    message="✅ GitHub token has valid permissions",
                )
            else:
                return ValidationResult(
                    name="GitHub Token Permissions",
                    status=False,
                    message="❌ GitHub token lacks required permissions",
                    fix_instructions="Token needs: repo, project, write:packages scopes",
                )
        except Exception as e:
            return ValidationResult(
                name="GitHub Token Permissions",
                status=False,
                message=f"❌ Error validating token: {e}",
                fix_instructions="Check token validity and permissions",
            )

    def find_project(self, project_name: str) -> Optional[str]:
        """Find project by name and get its ID"""
        query = f"""
        {{
          repository(owner: "{self.owner}", name: "{self.repo}") {{
            projectsV2(first: 100) {{
              nodes {{
                id
                title
                number
              }}
            }}
          }}
        }}
        """

        try:
            result = self.client.post_graphql(query)

            if "data" not in result:
                return None

            projects = result["data"]["repository"]["projectsV2"]["nodes"]

            for project in projects:
                if project and project["title"] == project_name:
                    self.project_id = project["id"]
                    return project["id"]

            return None
        except Exception as e:
            logger.error(f"Error finding project: {e}")
            return None

    def validate_project_exists(self, project_name: str) -> ValidationResult:
        """Validate that the Projects V2 board exists"""
        project_id = self.find_project(project_name)

        if project_id:
            return ValidationResult(
                name="Projects V2 Board Existence",
                status=True,
                message=f"✅ Project '{project_name}' found (ID: {project_id})",
            )
        else:
            return ValidationResult(
                name="Projects V2 Board Existence",
                status=False,
                message=f"❌ Project '{project_name}' not found",
                fix_instructions=(
                    f"Create project: gh project create --title '{project_name}' "
                    f"--owner {self.owner} --repo {self.repo}"
                ),
            )

    def validate_project_fields(self, project_name: str) -> List[ValidationResult]:
        """Validate that required project fields exist and are configured correctly"""
        if not self.project_id:
            return [
                ValidationResult(
                    name="Project Fields Validation",
                    status=False,
                    message="❌ Cannot validate fields - project not found",
                    critical=True,
                )
            ]

        query = f"""
        {{
          node(id: "{self.project_id}") {{
            ... on ProjectV2 {{
              fields(first: 50) {{
                nodes {{
                  __typename
                  ... on ProjectV2Field {{
                    id
                    name
                    dataType
                  }}
                  ... on ProjectV2SingleSelectField {{
                    id
                    name
                    options {{
                      id
                      name
                    }}
                  }}
                }}
              }}
            }}
          }}
        }}
        """

        try:
            result = self.client.post_graphql(query)

            if "data" not in result:
                return [
                    ValidationResult(
                        name="Project Fields Validation",
                        status=False,
                        message="❌ Failed to fetch project fields",
                        critical=True,
                    )
                ]

            fields = result["data"]["node"]["fields"]["nodes"]
            existing_fields = {field["name"]: field for field in fields}

            validation_results = []

            required_fields = {
                "Week": {"type": "NUMBER"},
                "Priority": {
                    "type": "SINGLE_SELECT",
                    "options": ["high", "medium", "low"],
                },
                "Track": {
                    "type": "SINGLE_SELECT",
                    "options": [
                        "project",
                        "ux-design",
                        "data-science",
                        "deep-learning",
                        "web-development",
                        "other",
                    ],
                },
                "Status": {
                    "type": "SINGLE_SELECT",
                    "options": ["todo", "in progress", "done", "blocked"],
                },
            }

            for name, config in required_fields.items():
                if name not in existing_fields:
                    validation_results.append(
                        ValidationResult(
                            name=f"Field '{name}' Existence",
                            status=False,
                            message=f"❌ Required field '{name}' is missing.",
                            critical=True,
                        )
                    )
                    continue  # Skip further checks for this missing field

                # Special handling for the 'Status' field
                if name == "Status":
                    validation_results.append(
                        ValidationResult(
                            name=f"Field '{name}' Existence",
                            status=True,
                            message=f"✅ Field '{name}' exists (options not checked).",
                            critical=False,
                        )
                    )
                    continue

                field = existing_fields[name]
                data_type = field.get("dataType")
                type_name = field.get("__typename")
                expected_type = config["type"]
                is_type_match = False

                if expected_type == "NUMBER" and data_type == "NUMBER":
                    is_type_match = True
                elif (
                    expected_type == "SINGLE_SELECT"
                    and type_name == "ProjectV2SingleSelectField"
                ):
                    is_type_match = True

                if not is_type_match:
                    validation_results.append(
                        ValidationResult(
                            name=f"Field '{name}' Type",
                            status=False,
                            message=f"❌ Field '{name}' has wrong type. Expected {expected_type}.",
                            critical=True,
                        )
                    )
                    continue

                # Validate options for SINGLE_SELECT fields
                if expected_type == "SINGLE_SELECT":
                    options_set = {opt["name"] for opt in field.get("options", [])}
                    expected_options = set(config["options"])

                    if not expected_options.issubset(options_set):
                        validation_results.append(
                            ValidationResult(
                                name=f"Field '{name}' Options",
                                status=False,
                                message=(
                                    f"❌ Field '{name}' is missing options. "
                                    f"Expected: {expected_options}"
                                ),
                                critical=True,
                            )
                        )
                    else:
                        validation_results.append(
                            ValidationResult(
                                name=f"Field '{name}'",
                                status=True,
                                message=f"✅ Field '{name}' is configured correctly.",
                                critical=False,
                            )
                        )

            return validation_results

        except Exception as e:
            logger.error(f"❌ Error validating project fields: {e}")
            return [
                ValidationResult(
                    name="Project Fields Validation",
                    status=False,
                    message=f"❌ An exception occurred: {e}",
                    critical=True,
                )
            ]

    def validate_issues_exist(self) -> ValidationResult:
        """Validate that issues exist in the repository"""
        query = f"""
        {{
          repository(owner: "{self.owner}", name: "{self.repo}") {{
            issues(first: 1, states: OPEN) {{
              totalCount
              nodes {{
                number
                title
              }}
            }}
          }}
        }}
        """

        try:
            result = self.client.post_graphql(query)

            if "data" not in result:
                return ValidationResult(
                    name="Repository Issues",
                    status=False,
                    message="❌ Failed to fetch issues",
                    critical=True,
                )

            issues_data = result["data"]["repository"]["issues"]
            total_count = issues_data["totalCount"]

            if total_count > 0:
                return ValidationResult(
                    name="Repository Issues",
                    status=True,
                    message=f"✅ Found {total_count} open issues",
                )
            else:
                return ValidationResult(
                    name="Repository Issues",
                    status=False,
                    message="❌ No open issues found",
                    fix_instructions="Run issue creation scripts to populate the repository",
                )

        except Exception as e:
            return ValidationResult(
                name="Repository Issues",
                status=False,
                message=f"❌ Error checking issues: {e}",
                critical=True,
            )

    def validate_track_labels(self) -> ValidationResult:
        """Validate that track labels exist"""
        query = f"""
        {{
          repository(owner: "{self.owner}", name: "{self.repo}") {{
            labels(first: 100) {{
              nodes {{
                name
              }}
            }}
          }}
        }}
        """

        try:
            result = self.client.post_graphql(query)

            if "data" not in result:
                return ValidationResult(
                    name="Track Labels",
                    status=False,
                    message="❌ Failed to fetch labels",
                    critical=True,
                )

            labels = [
                node["name"].lower()
                for node in result["data"]["repository"]["labels"]["nodes"]
            ]
            required_labels = [
                "project",
                "ux-design",
                "data-science",
                "deep-learning",
                "web-development",
                "roadmap",
            ]

            missing_labels = [label for label in required_labels if label not in labels]

            if not missing_labels:
                return ValidationResult(
                    name="Track Labels",
                    status=True,
                    message=f"✅ All required track labels found: {required_labels}",
                )
            else:
                return ValidationResult(
                    name="Track Labels",
                    status=False,
                    message=f"❌ Missing track labels: {missing_labels}",
                    fix_instructions=f"Create missing labels: gh label create {' '.join(missing_labels)} --repo {self.owner}/{self.repo}",
                )

        except Exception as e:
            return ValidationResult(
                name="Track Labels",
                status=False,
                message=f"❌ Error checking labels: {e}",
                critical=True,
            )

    def run_full_validation(self, project_name: str) -> bool:
        """Run all validation checks"""
        logger.info("🔍 Starting comprehensive project setup validation...")

        # Run all validations
        validations = [
            self.validate_github_cli_auth(),
            self.validate_token_permissions(),
            self.validate_project_exists(project_name),
            self.validate_issues_exist(),
            self.validate_track_labels(),
        ]

        # Add field validations
        field_validations = self.validate_project_fields(project_name)
        validations.extend(field_validations)

        # Store results
        self.validation_results = validations

        # Print results
        logger.info("\n" + "=" * 60)
        logger.info("VALIDATION RESULTS")
        logger.info("=" * 60)

        all_passed = True
        critical_failures = []

        for validation in validations:
            status_icon = "✅" if validation.status else "❌"
            logger.info(f"{status_icon} {validation.name}: {validation.message}")

            if not validation.status:
                all_passed = False
                if validation.critical:
                    critical_failures.append(validation)

                if validation.fix_instructions:
                    logger.info(f"   💡 Fix: {validation.fix_instructions}")

        logger.info("\n" + "=" * 60)

        if all_passed:
            logger.info(
                "🎉 ALL VALIDATIONS PASSED! Project is ready for timeline automation."
            )
            return True
        else:
            logger.info(f"⚠️  {len(critical_failures)} CRITICAL ISSUES FOUND")
            logger.info(
                "Please fix the issues above before running timeline automation."
            )
            return False

    def generate_setup_script(self, project_name: str) -> str:
        """Generate a setup script to fix validation issues"""
        script_lines = [
            "#!/bin/bash",
            "# Auto-generated setup script for LUMIN.AI project",
            "# Run this script to fix validation issues",
            "",
            "set -e",
            "",
            "echo '🔧 Setting up LUMIN.AI project...'",
            "",
        ]

        for validation in self.validation_results:
            if not validation.status and validation.fix_instructions:
                script_lines.append(f"# Fix: {validation.name}")
                script_lines.append(f"echo 'Fixing {validation.name}...'")
                script_lines.append(f"{validation.fix_instructions}")
                script_lines.append("")

        script_lines.extend(
            ["echo '✅ Setup complete! Run validation again to verify.'", ""]
        )

        return "\n".join(script_lines)


def main():
    parser = argparse.ArgumentParser(
        description="Validate LUMIN.AI project setup for timeline automation"
    )
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
    parser.add_argument(
        "--generate-setup-script",
        action="store_true",
        help="Generate a setup script to fix validation issues",
    )
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

    # Create validator
    validator = ProjectSetupValidator(args.token, args.owner, args.repo)

    # Run validation
    success = validator.run_full_validation(args.project)

    # Generate setup script if requested
    if args.generate_setup_script and not success:
        setup_script = validator.generate_setup_script(args.project)
        script_path = "scripts/fix_project_setup.sh"

        with open(script_path, "w") as f:
            f.write(setup_script)

        os.chmod(script_path, 0o755)
        logger.info(f"📝 Generated setup script: {script_path}")
        logger.info("Run: ./scripts/fix_project_setup.sh to fix validation issues")

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
