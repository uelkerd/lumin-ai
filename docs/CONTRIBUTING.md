# Contributing to LUMIN.AI

## Code of Conduct
We are committed to fostering an inclusive and respectful environment. All contributors must adhere to professional conduct.

## How to Contribute

### 1. Fork and Clone
```bash
git clone https://github.com/uelkerd/lumin-ai.git
cd lumin-ai
git remote add upstream https://github.com/uelkerd/lumin-ai.git

```

## Development Environment Setup

We utilize VS Code Dev Containers for a consistent and isolated development environment.

### Choosing Your Dev Container

You have two options for your development environment:

1.  **Full Stack Dev Container**: Includes all necessary services and tools for full-stack development. (Recommended for most contributors)
2.  **Footprint-Friendly Dev Container**: A lighter version with a smaller footprint, suitable for specific tasks or resource-constrained machines.

To choose your dev container in VS Code:
1.  Open the Command Palette (Cmd+Shift+P or Ctrl+Shift+P).
2.  Search for and select "Dev Containers: Open Folder in Container...".
3.  Choose your workspace folder.
4.  VS Code will prompt you to select a devcontainer configuration. Choose either `Dockerfile` for the full stack or `Dockerfile.lite` for the footprint-friendly variant.

### Initial Setup and Cleanup

Before your initial build or if you encounter any Docker Compose warnings, it is crucial to run the cleanup script:

```bash
./scripts/docker-cleanup.sh --full --force
```

This script ensures a clean Docker environment, removing any stale images, containers, or volumes that might interfere with your development setup.

## Making Changes

```bash
git clone https://github.com/uelkerd/lumin-ai.git
cd lumin-ai
git remote add upstream https://github.com/uelkerd/lumin-ai.git
