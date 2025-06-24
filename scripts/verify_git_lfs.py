#!/usr/bin/env python3
"""
Verify Git LFS setup for LUMIN.AI project.

This script checks if Git LFS is properly configured and working by:
1. Checking if .gitattributes exists and contains LFS tracking patterns
2. Checking if any LFS-tracked files exist in the repository
3. Verifying that these files are properly tracked by Git LFS
"""

import os
import subprocess
import sys
from pathlib import Path


def run_command(cmd):
    """Run a shell command and return its output."""
    try:
        result = subprocess.run(
            cmd,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            shell=False
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running command '{cmd}': {e}")
        print(f"stderr: {e.stderr}")
        return None


def check_gitattributes():
    """Check if .gitattributes exists and contains LFS patterns."""
    gitattributes_path = Path('.gitattributes')

    if not gitattributes_path.exists():
        print("❌ .gitattributes file not found!")
        return False

    with open(gitattributes_path, 'r') as f:
        content = f.read()

    if 'filter=lfs' not in content:
        print("❌ No LFS tracking patterns found in .gitattributes!")
        return False

    print("✅ .gitattributes file exists and contains LFS tracking patterns")

    # Count tracked extensions
    tracked_extensions = [line.split()[0] for line in content.splitlines()
                          if 'filter=lfs' in line]
    print(f"   Found {len(tracked_extensions)} tracked file patterns")
    return True


def check_git_lfs_installed():
    """Check if Git LFS is installed."""
    result = run_command("git lfs version")
    if result is None:
        print("❌ Git LFS is not installed!")
        return False

    print(f"✅ Git LFS is installed: {result}")
    return True


def check_lfs_files():
    """Check if any LFS-tracked files exist in the repository."""
    result = run_command("git lfs ls-files")
    if result is None or result == "":
        print("ℹ️ No LFS-tracked files found in the repository yet")
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


def check_sample_file():
    """Check if our sample CSV file is properly tracked by Git LFS."""
    sample_file = Path('data/examples/sample_data.csv')
    if not sample_file.exists():
        print("ℹ️ Sample CSV file not found, skipping check")
        return True

    # Check if the file is tracked by Git
    result = run_command(f"git ls-files {sample_file}")
    if result is None or result == "":
        print("ℹ️ Sample CSV file is not yet tracked by Git, skipping check")
        return True

    # Check if the file is tracked by Git LFS
    lfs_files_output = run_command("git lfs ls-files")
    if not lfs_files_output or str(sample_file) not in lfs_files_output:
        print(f"❌ Sample file {sample_file} is not tracked by Git LFS!")
        print("   Run 'git lfs track \"*.csv\"' and re-add the file")
        return False

    print(f"✅ Sample file {sample_file} is properly tracked by Git LFS")
    return True


def main():
    """Run all checks and report status."""
    print("🔍 Verifying Git LFS setup for LUMIN.AI project...\n")

    checks = [
        check_git_lfs_installed,
        check_gitattributes,
        check_lfs_files,
        check_sample_file
    ]

    all_passed = all(check() for check in checks)

    print("\n" + "="*50)
    if all_passed:
        print("✅ Git LFS is properly set up and working!")
    else:
        print("❌ Some Git LFS checks failed. Please fix the issues above.")
    print("="*50)

    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
