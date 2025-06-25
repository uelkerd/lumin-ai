# LUMIN.AI Development Container

This directory contains configuration for a Docker-based development environment that ensures all team members have a consistent setup for LUMIN.AI development.

## Setup Instructions

1. Ensure you have [Docker](https://www.docker.com/get-started) and [VS Code](https://code.visualstudio.com/) with the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension installed.

2. Copy the example environment file:
   ```bash
   cp .devcontainer/.env.example .devcontainer/.env
   ```

3. Modify `.devcontainer/.env` with your preferred configuration.

4. Open the project in VS Code and click "Reopen in Container" when prompted, or run the "Remote-Containers: Reopen in Container" command.

## Features

- Python 3.11 development environment
- MongoDB database for governance analysis
- Jupyter Notebooks accessible on port 9000
- Node.js for frontend development
- Pre-installed Python packages for ML/data science
- Pre-commit hook integration
- Git and GitHub CLI tools

## Environment Variables

All configuration is managed through environment variables in the `.env` file. This includes:

- MongoDB credentials
- Port configurations
- Debug settings

## Common Tasks

### Running Jupyter Notebooks

Jupyter Notebook server runs on port 9000. Access it at http://localhost:9000 when the container is running.

### Accessing MongoDB

MongoDB is accessible from within the container. Use the MongoDB shell:

```bash
mongosh "mongodb://localhost:27017/governance_analysis" -u lumin -p devpassword
```

### Installing Additional Python Packages

```bash
pip install package_name
```

### Running Tests

```bash
pytest
```

## Troubleshooting

- **Container fails to build**: Check Docker logs for detailed error messages.
- **MongoDB connection issues**: Verify environment variables in `.env` file.
- **Port conflicts**: Change port mappings in `.env` if ports are already in use.
