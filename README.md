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
- Docker (optional, for containerized deployment)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/lumin-ai.git
cd lumin-ai
```

2. **Set up Python environment (Deep Learning & Data Science)**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Set up Node environment (Web Development)**
```bash
cd web-development/frontend
npm install
cd ../backend
npm install
```

4. **Download datasets**
```bash
python scripts/download_data.py
```

### Running the Application

**Start the backend API:**
```bash
cd web-development/backend
npm start
```

**Start the frontend dashboard:**
```bash
cd web-development/frontend
npm start
```

**Run Jupyter notebooks:**
```bash
jupyter notebook
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

- `/deep-learning` - Neural network models and training code
- `/data-science` - Statistical analysis and visualizations
- `/web-development` - Dashboard frontend and API backend
- `/ux-design` - Design research, wireframes, and prototypes
- `/data` - Shared datasets and processed data
- `/docs` - Project documentation and reports

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

---

**Made with ❤️ by LUMIN.AI Team | TechLabs Berlin Summer 2025**
