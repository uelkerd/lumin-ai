<p align="center">
  <img src="assets/logos/LuminLogo-animated-2.svg" alt="LUMIN.AI Logo" width="400">
</p>

# LUMIN.AI - Neural Networks for Democratic Transparency

[![CircleCI](https://dl.circleci.com/status-badge/img/circleci/FSXowV52GpBGpAqYmKsFET/AUdamX6UCsfkvUbXDfgsq1/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/circleci/FSXowV52GpBGpAqYmKsFET/AUdamX6UCsfkvUbXDfgsq1/tree/main)
[![TechLabs Berlin](https://img.shields.io/badge/TechLabs-Berlin-blue)](https://www.techlabs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.9+-blue)](https://www.python.org/)
[![React](https://img.shields.io/badge/react-18.0+-61DAFB)](https://reactjs.org/)
[![codecov](https://codecov.io/gh/uelkerd/lumin-ai/graph/badge.svg?token=8Qth2KEXra)](https://codecov.io/gh/uelkerd/lumin-ai)

> Entry-level friendly AI project analyzing democratic governance through neural networks, combining cutting-edge technology with real-world social impact.

## 🌱 Project Overview

LUMIN.AI leverages machine learning to enhance democratic transparency by analyzing governance data from Austria's Democracy Radar surveys and blockchain governance systems.

Our MVP-first approach ensures meaningful deliverables while building towards advanced AI-powered policy insights.

### 🎯 Mission

Transform complex governance data into actionable insights that strengthen democratic participation and transparency.

### 🗝️ Key Features

- **Sentiment Analysis**: Neural networks analyzing public perception of governance
- **Trust Correlation**: Statistical analysis linking transparency to public trust
- **Interactive Dashboard**: Real-time visualization of democracy metrics
- **User-Centered Design**: Intuitive interfaces for citizens, researchers, and policymakers

## 📊 Track Contributions

### 🧠 Deep Learning

- Sentiment analysis on governance texts (85%+ accuracy target)
- Participation prediction models
- Text classification for governance themes
- Advanced transformer models (enhanced phase)

### 📈 Data Science

- Statistical analysis of 10,000+ survey responses
- Transparency-trust correlation studies
- Network analysis of governance relationships
- Cross-protocol governance comparisons

### 💻 Web Development

- React-based interactive dashboard
- API integration with governance data sources
- Real-time data visualization
- Mobile-responsive design

### 🎨 UX Design

- User research with citizens and policymakers
- Intuitive data visualization interfaces
- Accessibility-first design approach
- Usability testing with 90%+ satisfaction target

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 16+
- Git
- Git LFS (for handling large files)
- Docker (optional, for containerized deployment)

### Environment Configuration

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/lumin-ai.git
cd lumin-ai
git lfs install  # Initialize Git LFS
git lfs pull     # Pull any LFS objects
```

For security reasons, sensitive configuration should be managed through environment variables:

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your specific configuration:

   ```bash
   # MongoDB Configuration
   MONGODB_USERNAME=your_username
   MONGODB_PASSWORD=your_secure_password  # pragma: allowlist secret
   MONGODB_DATABASE=your_database_name

   # API Keys
   OPENAI_API_KEY=your_api_key
   ANTHROPIC_API_KEY=your_api_key
   ```

### Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/uelkerd/lumin-ai.git
   cd lumin-ai
   ```

2. Open in VS Code:

   ```bash
   code .
   ```

3. When prompted, reopen in container or use Command Palette:

   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
   - Type "Dev Containers: Reopen in Container"
   - Select the option and wait for the container to build

4. The development environment will automatically:
   - Install all dependencies
   - Set up MongoDB with proper indexes
   - Configure pre-commit hooks
   - Start all necessary services

## 📦 Installation

This project uses a modular dependency structure to allow for a lightweight installation. You can install the core dependencies and then add optional extras as needed.

### Core Installation

For a minimal installation, which includes the core application logic without data science or machine learning libraries, run:

```bash
pip install .
```

### Optional Dependencies

You can install optional dependency groups based on your needs.

- **Data Science**: For data manipulation, analysis, and visualization.

  ```bash
  pip install .[data]
  ```

- **Natural Language Processing**: For NLP tasks.

  ```bash
  pip install .[nlp]
  ```

- **Jupyter Environment**: For running Jupyter notebooks.

  ```bash
  pip install .[jupyter]
  ```

- **Machine Learning**: For machine learning tasks. This project uses PyTorch.
  ```bash
  pip install .[ml]
  ```
  The `ml` extra includes `torch` and `transformers`.

### All-in-One Installation

To install all optional dependencies at once, use the `all` extra:

```bash
pip install .[all]
```

### Development Setup

For developers who need to run tests and use linting tools, the `dev` extra installs everything from `all` plus development-specific packages:

```bash
pip install .[dev]
```

## 📁 Project Structure

- `/deep-learning` - Neural network models and training code
- `/data-science` - Statistical analysis and visualizations
- `/web-development` - Dashboard frontend and API backend
- `/ux-design` - Design research, wireframes, and prototypes
- `/data` - Shared datasets and processed data
- `/docs` - Project documentation and reports

## 📦 Large File Storage with Git LFS

This project uses Git Large File Storage (LFS) to manage large files like datasets, models, and media assets. Git LFS replaces large files with text pointers in Git, while storing the file contents on a remote server.

### Tracked File Types

- Data files (_.csv, _.json, \*.parquet, etc.)
- Model files (_.pkl, _.h5, \*.pt, etc.)
- Media files (images, audio, video)
- Documents (_.pdf, _.pptx, etc.)

### Working with Git LFS

**Adding new large files:**

```bash
# Files with tracked extensions are automatically handled by Git LFS
git add path/to/large/file.h5
git commit -m "Add trained model"
git push
```

**Checking LFS status:**

```bash
git lfs status
```

**Pulling LFS objects:**

```bash
git lfs pull
```

See the [.gitattributes](.gitattributes) file for a complete list of file types tracked by Git LFS.

## 🗓️ Development Timeline

### MVP Phase (Weeks 1-6)

- ✅ Basic sentiment analysis implementation
- ✅ Core statistical analysis
- ✅ Functional dashboard prototype
- ✅ Initial user research

### Enhanced Phase (Weeks 7-10)

- 🚧 Advanced transformer models
- 🚧 Real-time blockchain integration
- 🚧 Policy recommendation engine
- 🚧 Comprehensive usability testing

## 📊 Data Sources

- **Austria Democracy Radar Waves 1-10**: Survey data on democratic perceptions
- **Governance Proposal Texts**: Textual data for NLP analysis
- **Voting Discussion Corpora**: Community discussions on governance
- **Governance Token APIs**: Real-time blockchain governance data

## 🧪 Testing

Run all tests:

```bash
# Python tests
pytest

# JavaScript tests
npm test
```

## 🚢 Deployment

### Using Docker:

```bash
docker-compose up -d
```

### Manual deployment:

See [deployment guide](deployment/README.md) for detailed instructions.

## 📈 Performance Metrics

- **Model Accuracy**: 85%+ for sentiment analysis
- **Dashboard Load Time**: <2 seconds
- **User Satisfaction**: 90%+ in usability testing
- **API Response Time**: <500ms for standard queries

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Commit Message Convention

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build process or auxiliary tool changes

## 📚 Resources

### External Links

- [Austria Democracy Radar Data](https://data.aussda.at/dataset.xhtml?persistentId=doi:10.11587/GCSLIN)
- [Project Presentation](docs/project-pitch.pdf)
- [Figma Prototypes](ux-design/prototypes/figma-links.md)

### Research Foundation

- Master's thesis: "Towards Inclusive Governance: Blockchain in Citizen Representation"
- Austria case study showing +15% trust increase with transparency initiatives

## 👥 Team

- **Deep Learning Track**: [Member names]
- **Data Science Track**: [Member names]
- **Web Development Track**: [Member names]
- **UX Design Track**: [Member names]

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- TechLabs Berlin for program support
- Austria Democracy Radar for providing survey data
- Humboldt University Berlin for research foundation
- All project mentors and advisors

## 🛠️ Development Environment

### Dev Container Setup

LUMIN.AI uses a Docker-based development environment to ensure consistent development experiences across different machines.

#### Key Features

- **Python 3.11** with all dependencies pre-installed
- **Node.js 20** for web development
- **MongoDB** database for data storage
- **Pre-commit hooks** for code quality
- **Docker-in-Docker** support for container development
- **Persistent volumes** for development data
- **Health monitoring** for all services

#### Testing the MongoDB Connection

To verify that MongoDB is correctly set up in your development environment:

```bash
python3 scripts/test_mongodb_connection.py  # pragma: allowlist secret
```

#### Persistent Data

The development container is configured with the following persistent volumes:

- `governance-data`: MongoDB data storage
- `governance-logs`: MongoDB logs
- `lumin-python-packages`: Python package cache
- `lumin-node-modules`: Node.js modules
- `lumin-jupyter-data`: Jupyter notebook data
- `lumin-logs`: Application logs

#### Best Practices

1. **Avoid Nested Virtual Environments**:
   The container already provides a Python environment. To prevent accidentally nesting virtual environments, source the protection script:

   ```bash
   source prevent_nested_venv.sh
   ```

   This will prevent any attempt to activate a second virtual environment while one is already active.

2. **BuildKit Optimization**:
   Ensure Docker BuildKit is enabled for optimal build performance:

   ```bash
   export DOCKER_BUILDKIT=1
   export COMPOSE_DOCKER_CLI_BUILD=1
   ```

3. **Non-Interactive Builds**:
   Use the provided build script for consistent builds:

   ```bash
   .devcontainer/build.sh
   ```

4. **Allowlisting Development Secrets**:
   Development credentials are allowlisted in `.allowlist` to prevent pre-commit hooks from blocking commits.

#### Troubleshooting

**MongoDB Connection Issues**:

- Check if the MongoDB container is running: `docker ps | grep governance-db`
- Verify the environment variables in `.devcontainer/docker-compose.yml`
- Try connecting manually: `mongosh mongodb://lumin:<your_password>@governance-db:27017/governance_analysis`

**Container Build Failures**:

- Check Docker logs: `docker logs lumin-ai-dev`
- Ensure BuildKit is enabled: `echo $DOCKER_BUILDKIT`
- Try rebuilding with `--no-cache`: `.devcontainer/build.sh --no-cache`

---

**Made with ❤️ by LUMIN.AI Team | TechLabs Berlin Summer 2025**

# LFS hooks disabled temporarily
