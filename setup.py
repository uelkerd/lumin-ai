"""Setup file for the LUMIN.AI project."""

from setuptools import setup, find_packages

setup(
    name="lumin-ai",
    version="0.1.0",
    packages=find_packages(),
    description="Neural Networks for Democratic Transparency - AI-powered governance analysis",
    author="LUMIN.AI Team",
    author_email="team@lumin-ai.org",
    install_requires=[
        "torch>=1.12.0",
        "transformers>=4.20.0",
        "tensorflow>=2.9.0",
        "pandas>=1.5.0",
        "numpy>=1.21.0",
    ],
    python_requires=">=3.9",
) 