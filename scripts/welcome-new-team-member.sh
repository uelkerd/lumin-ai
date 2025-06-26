#!/bin/bash

# LUMIN.AI New Team Member Welcome Script
# Runs all necessary checks and provides onboarding guidance
# Usage: ./scripts/welcome-new-team-member.sh

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Welcome banner
show_welcome_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║                  🚀 Welcome to LUMIN.AI! 🚀                  ║"
    echo "║                                                              ║"
    echo "║            Democratic Governance Analysis Platform            ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo
    echo -e "${BLUE}🎉 Congratulations! You're now part of the LUMIN.AI team!${NC}"
    echo
    echo "This script will help you get started with our development environment."
    echo "We'll run some checks and provide guidance for your first steps."
    echo
}

# Show what we'll check
show_checklist() {
    echo -e "${PURPLE}📋 What we'll check:${NC}"
    echo "   ✅ Development environment setup"
    echo "   ✅ Container health and connectivity"
    echo "   ✅ Python and Node.js environments"
    echo "   ✅ MongoDB database connection"
    echo "   ✅ VS Code integration"
    echo "   ✅ File permissions and access"
    echo "   ✅ Performance benchmarks"
    echo
    echo -e "${YELLOW}⏱️  This will take about 2-3 minutes...${NC}"
    echo
    read -p "Press Enter to continue..."
    echo
}

# Run environment check
run_environment_check() {
    echo -e "${BLUE}🔍 Running comprehensive environment check...${NC}"
    echo "═══════════════════════════════════════════════════"
    
    if ./scripts/container-env-check.sh; then
        echo -e "${GREEN}✅ Environment check completed successfully!${NC}"
        return 0
    else
        echo -e "${RED}❌ Environment check found some issues${NC}"
        return 1
    fi
}

# Check documentation availability
check_documentation() {
    echo
    echo -e "${BLUE}📚 Checking documentation availability...${NC}"
    
    docs=(
        "docs/TEAM_ONBOARDING.md"
        "docs/CONTAINER_MONITORING.md"
        "docs/MONITORING_SETUP_COMPLETE.md"
        ".devcontainer/README.md"
    )
    
    for doc in "${docs[@]}"; do
        if [ -f "$doc" ]; then
            echo -e "   ✅ ${doc}"
        else
            echo -e "   ❌ ${doc} (missing)"
        fi
    done
}

# Show next steps
show_next_steps() {
    echo
    echo -e "${GREEN}🎯 You're all set! Here are your next steps:${NC}"
    echo "════════════════════════════════════════════════"
    echo
    echo -e "${YELLOW}📚 1. Read the Documentation${NC}"
    echo "   📖 Team Onboarding: docs/TEAM_ONBOARDING.md"
    echo "   📊 Container Monitoring: docs/CONTAINER_MONITORING.md"
    echo "   🔧 Setup Complete Guide: docs/MONITORING_SETUP_COMPLETE.md"
    echo
    echo -e "${YELLOW}🧪 2. Explore the Development Environment${NC}"
    echo "   🐍 Python: python3 --version"
    echo "   🟢 Node.js: node --version"
    echo "   🗄️  MongoDB: mongosh mongodb://governance-db:27017"
    echo "   📓 Jupyter: jupyter lab --ip=0.0.0.0 --port=9000"
    echo
    echo -e "${YELLOW}🛠️ 3. Try Development Commands${NC}"
    echo "   🧪 Run tests: pytest tests/"
    echo "   🔧 Install packages: pip install <package-name>"
    echo "   📦 Node packages: npm install <package-name>"
    echo "   🔍 Code quality: black . && ruff --fix ."
    echo
    echo -e "${YELLOW}📊 4. Monitor Your Environment${NC}"
    echo "   🔍 Quick health check: ./scripts/container-env-check.sh"
    echo "   📈 Setup monitoring: ./scripts/setup-monitoring.sh"
    echo "   ⚡ Performance check: ./scripts/container-performance-monitor.py"
    echo
    echo -e "${YELLOW}🎨 5. Start Developing${NC}"
    echo "   📁 Explore project structure: ls -la"
    echo "   📝 Create new features in: src/"
    echo "   🧪 Add tests in: tests/"
    echo "   📚 Update docs in: docs/"
    echo
    echo -e "${YELLOW}🆘 6. Get Help When Needed${NC}"
    echo "   💬 Ask questions in team chat"
    echo "   📖 Check documentation in docs/"
    echo "   🐛 Report issues in project tracker"
    echo "   🤝 Schedule pair programming sessions"
    echo
}

# Show development workflow
show_development_workflow() {
    echo -e "${CYAN}🚀 LUMIN.AI Development Workflow${NC}"
    echo "═══════════════════════════════════════"
    echo
    echo -e "${BLUE}📋 Daily Development Routine:${NC}"
    echo "1. 🔍 Check environment: ./scripts/container-env-check.sh"
    echo "2. 📥 Pull latest changes: git pull origin main"
    echo "3. 🌿 Create feature branch: git checkout -b feature/your-feature"
    echo "4. 💻 Write code and tests"
    echo "5. 🧪 Run tests: pytest tests/"
    echo "6. 🔧 Check code quality: black . && ruff --fix ."
    echo "7. 📤 Commit and push: git commit -m 'feat: your feature'"
    echo "8. 🔄 Create pull request"
    echo
    echo -e "${BLUE}🎯 Project Focus Areas:${NC}"
    echo "   🔬 Data Science & ML: data-science/, models/"
    echo "   🌐 Web Development: web/, components/"
    echo "   🎨 UX Research: ux-design/"
    echo "   📊 Deep Learning: deep-learning/"
    echo "   🗄️  Data Management: data/"
    echo
}

# Show project structure
show_project_structure() {
    echo -e "${CYAN}📁 LUMIN.AI Project Structure${NC}"
    echo "═══════════════════════════════════════"
    echo
    echo "📂 Key Directories:"
    echo "   📁 src/                 # Main source code"
    echo "   📁 tests/               # Test suites"
    echo "   📁 docs/                # Documentation"
    echo "   📁 data/                # Data files"
    echo "   📁 models/              # ML models"
    echo "   📁 web/                 # Web frontend"
    echo "   📁 scripts/             # Utility scripts"
    echo "   📁 .devcontainer/       # Container config"
    echo "   📁 .monitoring/         # Monitoring setup"
    echo
    echo "🔧 Configuration Files:"
    echo "   📄 pyproject.toml       # Python dependencies"
    echo "   📄 package.json         # Node.js dependencies"
    echo "   📄 .pre-commit-config.yaml  # Code quality hooks"
    echo "   📄 .devcontainer/devcontainer.json  # Container setup"
    echo
}

# Show team information
show_team_info() {
    echo -e "${PURPLE}👥 LUMIN.AI Team Information${NC}"
    echo "════════════════════════════════════"
    echo
    echo -e "${BLUE}🎯 Our Mission:${NC}"
    echo "   Analyzing democratic governance through AI and data science"
    echo "   Building transparent tools for civic engagement"
    echo "   Promoting open-source collaboration"
    echo
    echo -e "${BLUE}💡 Core Values:${NC}"
    echo "   🔬 Data-driven insights"
    echo "   🤝 Collaborative development"
    echo "   🔓 Open source principles"
    echo "   📊 Transparent analysis"
    echo "   🚀 Innovation in civic tech"
    echo
    echo -e "${BLUE}📚 Learning Resources:${NC}"
    echo "   📖 Team documentation in docs/"
    echo "   💬 Team communication channels"
    echo "   🎓 Technical learning materials"
    echo "   🤝 Mentorship opportunities"
    echo
}

# Final welcome message
show_final_message() {
    echo
    echo -e "${GREEN}🎉 Welcome to the team!${NC}"
    echo "═══════════════════════════════"
    echo
    echo -e "${CYAN}🚀 You're now ready to contribute to LUMIN.AI!${NC}"
    echo
    echo "Remember:"
    echo "   💡 Don't hesitate to ask questions"
    echo "   🤝 Collaboration is key to our success"
    echo "   📚 Documentation is your friend"
    echo "   🧪 Test your code thoroughly"
    echo "   🔄 Commit small, focused changes"
    echo
    echo -e "${YELLOW}🎯 First task suggestions:${NC}"
    echo "1. Explore the codebase structure"
    echo "2. Read through existing documentation"
    echo "3. Run the test suite to understand coverage"
    echo "4. Set up monitoring for your development workflow"
    echo "5. Join your first team meeting or code review"
    echo
    echo -e "${GREEN}Happy coding! 🚀${NC}"
    echo
}

# Main execution
main() {
    clear
    show_welcome_banner
    show_checklist
    
    # Run environment check
    if run_environment_check; then
        echo
        check_documentation
        echo
        show_next_steps
        echo
        show_development_workflow
        echo
        show_project_structure
        echo
        show_team_info
        show_final_message
        
        # Log successful onboarding
        echo "$(date): New team member onboarding completed successfully" >> logs/onboarding.log 2>/dev/null || true
        
        exit 0
    else
        echo
        echo -e "${RED}⚠️  Some issues were found during environment check.${NC}"
        echo
        echo -e "${YELLOW}🔧 Troubleshooting steps:${NC}"
        echo "1. Check docs/TEAM_ONBOARDING.md for known issues"
        echo "2. Run setup scripts if needed"
        echo "3. Contact the team for assistance"
        echo
        echo -e "${BLUE}📖 Helpful resources:${NC}"
        echo "   docs/TEAM_ONBOARDING.md - Complete setup guide"
        echo "   docs/CONTAINER_MONITORING.md - Monitoring help"
        echo "   .devcontainer/README.md - Container configuration"
        echo
        exit 1
    fi
}

# Execute main function
main "$@" 