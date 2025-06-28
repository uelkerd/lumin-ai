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

extras = {
    "ml": [
        "torch>=1.12.0",
        "tensorflow>=2.9.0",
        "transformers>=4.20.0",
    ],
    "data": [
        "pandas>=1.3.0",
        "numpy>=1.21.0",
        "scipy>=1.7.0",
        "scikit-learn>=0.24.0",
        "matplotlib>=3.4.0",
        "seaborn>=0.11.0",
        "networkx>=2.6.0",
    ],
    "nlp": [
        "nltk>=3.6.0",
        "spacy>=3.1.0",
        "textblob>=0.15.3",
    ],
    "jupyter": [
        "jupyter>=1.0.0",
        "jupyterlab>=3.0.0",
        "ipywidgets>=7.6.0",
    ],
    "test": [
        "pytest==7.4.0",
        "pytest-cov==4.1.0",
    ],
    "dev": [
        "ruff==0.4.4",
    ],
}

extras["all"] = extras["ml"] + extras["data"] + extras["nlp"] + extras["jupyter"]
extras["dev"] = extras["all"] + extras["test"] + extras["dev"]

setup(
    name="lumin-ai",
    version=version,
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    description="Neural Networks for Democratic Transparency - AI-powered governance analysis",
    author="LUMIN.AI Team",
    author_email="team@lumin-ai.org",
    install_requires=[
        "fastapi>=0.68.0",
        "uvicorn>=0.15.0",
        "requests>=2.26.0",
        "pymongo>=4.5.0",
        "python-dotenv>=0.19.0",
        "tqdm>=4.62.0",
    ],
    extras_require=extras,
    python_requires=">=3.8",
)
