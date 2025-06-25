#!/usr/bin/env python3
"""Verify Git LFS setup for LUMIN.AI project.

This script checks if Git LFS is properly configured and working by:
1. Checking if .gitattributes exists and contains LFS tracking patterns
2. Checking if any LFS-tracked files exist in the repository
3. Verifying that these files are properly tracked by Git LFS
"""

import subprocess
import sys
from collections.abc import Sequence
from pathlib import Path
from typing import Optional


def run_git_command(args: Sequence[str]) -> Optional[str]:
    """Run a git command and return its output.

    Args:
        args: Git command arguments (without 'git' prefix)

    Returns:
        Command output as string or None if error
    """
    try:
        # We only allow git commands with specific arguments for security
        cmd = ["git", *args]

        # Extra validation to prevent command injection
        for arg in args:
            if ";" in arg or "&" in arg or "|" in arg:
                raise ValueError(f"Invalid character in command argument: {arg}")

        result = subprocess.run(
            cmd,
            check=True,
            capture_output=True,
            text=True,
            shell=False  # Avoid shell=True for security
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running git command: {e}")
        print(f"stderr: {e.stderr}")
        return None


def check_gitattributes() -> bool:
    """Check if .gitattributes exists and contains LFS patterns."""
    gitattributes_path = Path(".gitattributes")

    if not gitattributes_path.exists():
        print("❌ .gitattributes file not found!")
        return False

    with open(gitattributes_path) as f:
        content = f.read()

    if "filter=lfs" not in content:
        print("❌ No LFS tracking patterns found in .gitattributes!")
        return False

    print("✅ .gitattributes file exists and contains LFS tracking patterns")

    # Count tracked extensions
    tracked_extensions = [line.split()[0]
                          for line in content.splitlines() if "filter=lfs" in line]
    print(f"   Found {len(tracked_extensions)} tracked file patterns")
    return True


def check_git_lfs_installed() -> bool:
    """Check if Git LFS is installed."""
    result = run_git_command(["lfs", "version"])
    if result is None:
        print("❌ Git LFS is not installed!")
        return False

    print(f"✅ Git LFS is installed: {result}")
    return True


def check_lfs_files() -> bool:
    """Check if any LFS-tracked files exist in the repository."""
    result = run_git_command(["lfs", "ls-files"])
    if result is None or result == "":
        print("i No LFS-tracked files found in the repository yet")
        return True

    file_count = len(result.splitlines())
    print(f"✅ Found {file_count} files tracked by Git LFS")

    # Print a sample of tracked files
    if file_count > 0:
        print("\nSample of LFS-tracked files:")
        for line in result.splitlines()[:5]:
            print(f"   {line}")
        if file_count > 5:
            print(f"   ... and {file_count - 5} more")

    return True


def check_sample_file() -> bool:
    """Check if our sample CSV file is properly tracked by Git LFS."""
    sample_file = Path("data/examples/sample_data.csv")
    if not sample_file.exists():
        print("i Sample CSV file not found, skipping check")
        return True

    # Check if the file is tracked by Git
    result = run_git_command(["ls-files", str(sample_file)])
    if result is None or result == "":
        print("i Sample CSV file is not yet tracked by Git, skipping check")
        return True

    # Check if the file is tracked by Git LFS - safer approach without grep
    lfs_files_output = run_git_command(["lfs", "ls-files"])
    if not lfs_files_output or str(sample_file) not in lfs_files_output:
        print(f"❌ Sample file {sample_file} is not tracked by Git LFS!")
        print('   Run \'git lfs track "*.csv"\' and re-add the file')
        return False

    print(f"✅ Sample file {sample_file} is properly tracked by Git LFS")
    return True


def main() -> int:
    """Run all checks and report status."""
    print("🔍 Verifying Git LFS setup for LUMIN.AI project...\n")

    checks = [check_git_lfs_installed, check_gitattributes,
              check_lfs_files, check_sample_file]

    all_passed = all(check() for check in checks)

    print("\n" + "=" * 50)
    if all_passed:
        print("✅ Git LFS is properly set up and working!")
    else:
        print("❌ Some Git LFS checks failed. Please fix the issues above.")
    print("=" * 50)

    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
