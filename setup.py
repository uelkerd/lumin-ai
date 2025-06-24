"""Setup file for the LUMIN.AI project."""

import re
from setuptools import setup, find_packages

# Read version from __init__.py
with open("lumin_ai/__init__.py", encoding="utf-8") as f:
    version = re.search(
        r"__version__ = ['\"]([^'\"]*)['\"]", f.read()).group(1)

setup(
    name="lumin-ai",
    version=version,
    packages=find_packages(),
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
            "pytest",
            "pytest-cov",
        ],
        "dev": [
            "ruff==0.4.4",
        ],
        "all": [
            "torch>=1.12.0",
            "tensorflow>=2.9.0",
        ]
    },
    python_requires=">=3.9",
)
