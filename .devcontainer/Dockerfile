# 🚀 LUMIN.AI Optimized Dev Container with ZSH & Sudo
FROM ubuntu:22.04

# 🔧 PREVENT INTERACTIVE PROMPTS
ENV DEBIAN_FRONTEND=noninteractive

# 📦 INSTALL SYSTEM DEPENDENCIES (WITH SUDO!)
RUN apt-get update && apt-get install -y \
    # Core system tools
    sudo \
    curl \
    wget \
    git \
    ca-certificates \
    gnupg \
    lsb-release \
    software-properties-common \
    # Build essentials (needed for Python packages)
    build-essential \
    gcc \
    g++ \
    make \
    # Python ecosystem
    python3 \
    python3-pip \
    python3-dev \
    python3-venv \
    # Node.js ecosystem
    nodejs \
    npm \
    # Shell & editors
    zsh \
    vim \
    nano \
    # Utilities
    htop \
    tree \
    unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp/* \
    && rm -rf /var/tmp/*

# 🔐 CREATE USER WITH PROPER SUDO ACCESS
RUN useradd -m -s /bin/zsh lumin-dev && \
    echo "lumin-dev:lumin-dev" | chpasswd && \
    usermod -aG sudo lumin-dev && \
    echo "lumin-dev ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers && \
    # Ensure user owns home directory
    chown -R lumin-dev:lumin-dev /home/lumin-dev

# 📁 INSTALL GIT LFS SYSTEM-WIDE
RUN curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash && \
    apt-get update && \
    apt-get install -y git-lfs && \
    git lfs install --system && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 🔧 ENSURE GIT IS IN PATH FOR ALL USERS
# 👤 SWITCH TO USER & SETUP ZSH
USER lumin-dev
WORKDIR /home/lumin-dev

# 🐚 INSTALL OH-MY-ZSH FOR USER
RUN sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# 🎨 CONFIGURE ZSH WITH USEFUL SETTINGS
RUN echo 'export ZSH="$HOME/.oh-my-zsh"' > ~/.zshrc && \
    echo 'ZSH_THEME="robbyrussell"' >> ~/.zshrc && \
    echo 'plugins=(git python npm docker vscode pip)' >> ~/.zshrc && \
    echo 'source $ZSH/oh-my-zsh.sh' >> ~/.zshrc && \
    # Add useful aliases
    echo 'alias ll="ls -la"' >> ~/.zshrc && \
    echo 'alias la="ls -la"' >> ~/.zshrc && \
    echo 'alias gs="git status"' >> ~/.zshrc && \
    echo 'alias gc="git commit"' >> ~/.zshrc && \
    echo 'alias gp="git push"' >> ~/.zshrc && \
    echo 'alias gd="git diff"' >> ~/.zshrc && \
    echo 'alias gb="git branch"' >> ~/.zshrc && \
    echo 'alias gco="git checkout"' >> ~/.zshrc && \
    echo 'alias gl="git log --oneline"' >> ~/.zshrc && \
    # Python shortcuts
    echo 'alias py="python3"' >> ~/.zshrc && \
    echo 'alias pip="pip3"' >> ~/.zshrc && \
    echo 'alias jlab="jupyter lab --ip=0.0.0.0 --port=8888 --no-browser --allow-root"' >> ~/.zshrc && \
    # Development shortcuts
    echo 'alias lumin="cd /workspace && ll"' >> ~/.zshrc && \
    echo 'alias rebuild="sudo docker-compose build --no-cache"' >> ~/.zshrc

# 🐍 SETUP PYTHON USER ENVIRONMENT
RUN python3 -m pip install --user --upgrade pip==24.0 setuptools==69.5.3 wheel==0.43.0

# 📂 CREATE & SETUP WORKSPACE
USER root
RUN mkdir -p /workspace && chown -R lumin-dev:lumin-dev /workspace
USER lumin-dev
WORKDIR /workspace

# 🔧 ENVIRONMENT VARIABLES
ENV SHELL=/bin/zsh
ENV PYTHONPATH=/workspace/src
ENV PATH="/usr/bin:/home/lumin-dev/.local/bin:$PATH"

# 🚪 EXPOSE DEVELOPMENT PORTS
EXPOSE 3000 5000 8000 8080 8888 27017

# 🎯 DEFAULT COMMAND
CMD ["/bin/zsh"]

# 🏷️ METADATA
LABEL maintainer="LUMIN.AI Team"
LABEL description="Optimized LUMIN.AI development container with zsh, sudo, and Git LFS"
LABEL version="2.0-optimized"