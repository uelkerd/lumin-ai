"""Setup file for the LUMIN.AI project."""

import os
import re

from setuptools import find_packages, setup


# Read version from __init__.py
with open(os.path.join("src", "lumin_ai", "__init__.py"), encoding="utf-8") as f:
    content = f.read()
    version_match = re.search(r"__version__ = ['\"]([^'\"]*)['\"]", content)
    if version_match is None:
        raise RuntimeError("Unable to find version string in src/lumin_ai/__init__.py")
    version = version_match.group(1)

setup(
    name="lumin-ai",
    version=version,
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    description="Neural Networks for Democratic Transparency - AI-powered governance analysis",
    author="LUMIN.AI Team",
    author_email="team@lumin-ai.org",
    install_requires=[
        "transformers>=4.20.0",
        "pandas>=1.5.0",
        "numpy>=1.21.0",
    ],
    extras_require={
        "torch": ["torch>=1.12.0"],
        "tensorflow": ["tensorflow>=2.9.0"],
        "test": [
            "pytest==7.4.0",
            "pytest-cov==4.1.0",
        ],
        "dev": [
            "ruff==0.4.4",
        ],
        "all": [
            "torch>=1.12.0",
            "tensorflow>=2.9.0",
        ],
    },
    python_requires=">=3.8",
)
