# 🚀 LUMIN.AI Team Onboarding Guide

Welcome to the LUMIN.AI development team! This guide will get you up and running with our development container in minutes.

## 📋 Prerequisites

### Required Software
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (4.0+ recommended)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- [Git](https://git-scm.com/) (2.30+ recommended)

### System Requirements
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 20GB free space minimum
- **CPU**: 4 cores recommended
- **OS**: Windows 10/11, macOS 10.15+, or Linux

## 🎯 Quick Start (5 Minutes)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/lumin-ai.git
cd lumin-ai
```

### 2. Open in VS Code
```bash
code .
```

### 3. Launch Dev Container
- VS Code will prompt: "Reopen in Container" → Click **Yes**
- Or manually: `Ctrl+Shift+P` → "Dev Containers: Reopen in Container"

### 4. Wait for Setup (First time: 5-10 minutes)
The container will automatically:
- Build the development environment
- Install Python 3.11 & Node.js 20
- Set up MongoDB
- Install VS Code extensions
- Configure development tools

### 5. Verify Setup
```bash
# Run the environment check
./scripts/dev_env_check.sh

# Test MongoDB connection
python scripts/test_mongodb_connection.py
```

🎉 **You're ready to develop!**

## 🔧 Manual Environment Setup

If you are not using the provided Dev Container, you can set up your local environment manually. This project uses a modular dependency structure to keep the core installation lightweight.

### 1. Create a Virtual Environment
It's highly recommended to use a virtual environment to manage project dependencies.
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows, use `.venv\\Scripts\\activate`
```

### 2. Install Dependencies
You can now install the required packages.

**Core Installation:**
For a minimal setup, which is ideal for frontend or web backend development, install the core packages:
```bash
pip install .
```

**Optional Dependency Groups:**
Based on your role, you can install additional packages:

- **Data Science (`data`):** For data analysis and visualization.
  ```bash
  pip install .[data]
  ```
- **NLP (`nlp`):** For natural language processing tasks.
  ```bash
  pip install .[nlp]
  ```
- **Jupyter (`jupyter`):** For working with Jupyter notebooks.
  ```bash
  pip install .[jupyter]
  ```
- **Machine Learning (`ml`):** For training and using ML models (includes `torch` and `transformers`).
  ```bash
  pip install .[ml]
  ```

**Full Development Setup:**
To install all dependencies required for development, including testing tools, use the `dev` extra:
```bash
pip install .[dev]
```

## 🏗️ Development Environment Overview

### What's Included
- **Python 3.11**: ML/DS libraries, Jupyter, FastAPI
- **Node.js 20**: React, TypeScript, web development
- **MongoDB**: Local database for testing
- **VS Code Extensions**: 18/20 pre-configured extensions
- **Development Tools**: Git, Docker, formatters, linters

### Container Architecture
```
┌─────────────────────────────────────┐
│           LUMIN.AI Container        │
├─────────────────────────────────────┤
│  Python 3.11 + ML Libraries        │
│  Node.js 20 + Web Tools            │
│  MongoDB (governance-db)            │
│  VS Code Extensions (18/20)         │
│  Development Scripts & Tools        │
└─────────────────────────────────────┘
```

### Port Mappings
- **3000**: Web Dashboard (React)
- **8000**: ML API Services (FastAPI)
- **9000**: Jupyter Notebooks
- **27017**: MongoDB (internal)

## 🎨 Development Workflows

### Python/ML Development
```bash
# Activate development environment (automatic in container)
# Install additional packages
pip install package-name

# Run Jupyter notebooks
jupyter lab --ip=0.0.0.0 --port=9000 --allow-root

# Run Python scripts
python src/your_script.py

# Run tests
pytest tests/
```

### Web Development
```bash
# Install npm packages
npm install package-name

# Start React development server
cd web && npm start

# Run TypeScript compilation
npm run build
```

### Database Operations
```bash
# Connect to MongoDB
mongosh mongodb://lumin:devpassword@governance-db:27017/governance_analysis # pragma: allowlist secret

# Test database connection
python scripts/test_mongodb_connection.py

# View database logs
docker logs lumin-governance-db
```

### Script Execution Context

A quick note on how to run the scripts in the `/scripts` directory:

*   **Inside the Container**: Most scripts are designed to be run from *within* the dev container shell. This includes `container-env-check.sh`, `welcome-new-team-member.sh`, and the individual monitoring scripts.
*   **From the Host Machine**: Some scripts, particularly those that interact with the Docker daemon itself (like `quick-health-check.sh` which runs `docker exec`), can be run from your host machine's terminal, but are primarily intended for use within the container to maintain a consistent environment.

When in doubt, run the script from the container's terminal prompt.

## ⚠️ Known Issues & Workarounds

### 🔧 NPM Permission Issues (Non-blocking)
**Issue**: NPM may show permission errors due to root-owned directories.

**Impact**: Affects web development workflows, but container is 95% functional.

**Workaround**:
```bash
# Fix ownership temporarily
sudo chown -R lumin-dev:lumin-dev node_modules/
sudo chown -R lumin-dev:lumin-dev .logs/

# Or run npm with --unsafe-perm (development only)
npm install --unsafe-perm
```

**Planned Fix**: Container rebuild with proper user ownership.

### 🔧 Git LFS Issues (Resolved)
**Issue**: Git LFS hooks cause errors due to missing binary.

**Status**: ✅ **RESOLVED** - Hooks have been disabled temporarily.

**Details**: Git operations work normally. LFS support will be added in future container rebuild.

### 🔧 Missing VS Code Extensions (Minor)
**Issue**: 2 extensions failed installation:
- `ms-toolsai.jupyter-cell-tags`
- `ms-vscode.vscode-json`

**Impact**: Minimal - core functionality unaffected.

**Workaround**: Install manually if needed:
```bash
code --install-extension ms-toolsai.jupyter-cell-tags
```

### 🔧 Pre-commit Hook Python Version
**Issue**: Python version mismatch (3.10 vs 3.11) in pre-commit config.

**Impact**: Pre-commit hooks may show warnings.

**Workaround**: Ignore version warnings - hooks still function.

## 🛠️ Troubleshooting Guide

### Container Won't Start
```bash
# Check Docker status
docker ps -a

# View container logs
docker logs lumin-ai-dev

# Rebuild container
docker-compose -f .devcontainer/docker-compose.yml build --no-cache
```

### VS Code Extensions Not Loading
```bash
# Reload VS Code window
Ctrl+Shift+P → "Developer: Reload Window"

# Check extension status
Ctrl+Shift+P → "Extensions: Show Installed Extensions"
```

### MongoDB Connection Issues
```bash
# Check MongoDB status
docker logs lumin-governance-db

# Test connection
python scripts/test_mongodb_connection.py

# Restart MongoDB
docker restart lumin-governance-db
```

### Performance Issues
```bash
# Check Docker resource allocation
docker stats

# Adjust Docker Desktop settings:
# - Increase memory to 6-8GB
# - Increase CPU cores to 4+
```

## 📊 Container Health Monitoring

### Automated Health Checks
The container includes built-in health monitoring:
- **Container Health**: Checked every 30 seconds
- **MongoDB Health**: Checked every 10 seconds
- **Service Status**: Monitored continuously

### Manual Health Checks
```bash
# Run comprehensive environment check
./scripts/dev_env_check.sh

# Check container health
docker inspect --format='{{.State.Health.Status}}' lumin-ai-dev

# Monitor resource usage
docker stats lumin-ai-dev

# View health logs
docker logs lumin-ai-dev | grep -i health
```

## 🚀 Next Steps

### First Day Tasks
1. ✅ Complete environment setup
2. 📚 Read project documentation in `docs/`
3. 🧪 Run existing tests: `pytest tests/`
4. 📊 Explore sample data in `data/`
5. 📝 Review coding standards in `CONTRIBUTING.md`

### Development Best Practices
- 🔄 **Commit often** - Small, focused changes
- 🧪 **Test everything** - Unit and integration tests
- 📚 **Document changes** - Clear commit messages
- 🔍 **Review code** - Participate in code reviews
- 🛡️ **Security first** - Never commit secrets

### Getting Help
- 💬 **Team Chat**: Ask questions in development channel
- 📖 **Documentation**: Check `docs/` directory
- 🐛 **Issues**: Report bugs in project tracker
- 🤝 **Pair Programming**: Schedule with team members

## 📈 Success Metrics

### You'll Know You're Ready When:
- ✅ Container starts in under 2 minutes
- ✅ All health checks pass
- ✅ You can run Python and Node.js code
- ✅ MongoDB connects successfully
- ✅ VS Code extensions work properly
- ✅ Git operations complete without errors

### Development Velocity Indicators:
- **Setup Time**: < 10 minutes for new developers
- **Container Rebuild**: < 5 minutes with cache
- **Test Execution**: < 30 seconds for unit tests
- **Code Changes**: Instant hot-reload in development

## 🔮 Roadmap & Future Improvements

### Immediate (Next Sprint)
- 🔧 Fix NPM permission issues
- 📦 Add Git LFS support
- 🔌 Install missing VS Code extensions
- 🐍 Resolve pre-commit Python version conflicts

### Future Enhancements
- 🚀 Container startup optimization
- 📊 Advanced monitoring dashboard
- 🔒 Enhanced security scanning
- 🌐 Multi-architecture support
- 📱 Mobile development tools

---

## 🎯 Quick Reference

### Essential Commands
```bash
# Environment check
./scripts/dev_env_check.sh

# Test database
python scripts/test_mongodb_connection.py

# Run tests
pytest tests/

# Format code
black . && ruff --fix .

# Container logs
docker logs lumin-ai-dev
```

### Important Files
- `.devcontainer/`: Container configuration
- `scripts/`: Development utilities
- `docs/`: Project documentation
- `tests/`: Test suites
- `.env.example`: Environment template

### Support Resources
- 📚 [Project Documentation](./docs/)
- 🐛 [Issue Tracker](https://github.com/your-org/lumin-ai/issues)
- 💬 [Team Discord/Slack](#)
- 📖 [Contributing Guide](./CONTRIBUTING.md)

---

*Welcome to the team! Let's build something amazing together! 🚀*
