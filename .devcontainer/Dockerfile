# LUMIN.AI Multi-Track Development Environment
# This Dockerfile creates a comprehensive development environment supporting:
# - Deep Learning: PyTorch, transformers, CUDA support for governance sentiment analysis
# - Data Science: pandas, scipy, sklearn for Austria Democracy Radar analysis
# - Web Development: Node.js, React for democratic transparency dashboard
# - Cross-track: Jupyter, API tools, data visualization libraries

# Start with official Python image that includes development tools
# Python 3.11 provides optimal compatibility with latest ML libraries
ARG PYTHON_VERSION=3.11
FROM python:${PYTHON_VERSION}-bullseye

# Build arguments for customization
ARG NODE_VERSION=18
ARG USERNAME=lumin-dev
ARG USER_UID=1000
ARG USER_GID=1000

# Set environment variables for development
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies required for all tracks
# These support everything from ML libraries to web development tools
RUN apt-get update && apt-get install -y \
    # Essential build tools for compiling Python packages
    build-essential \
    curl \
    wget \
    git \
    vim \
    nano \
    htop \
    tree \
    jq \
    # Development utilities
    zsh \
    fish \
    tmux \
    # Database tools for multimodal governance data management
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add - \
    && echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list \
    && apt-get update \
    && apt-get install -y mongodb-mongosh \
    sqlite3 \
    # Graphics and visualization dependencies (needed for matplotlib, seaborn)
    libgraphviz-dev \
    graphviz \
    # Image processing libraries (useful for report generation and data visualization)
    libjpeg-dev \
    libpng-dev \
    libfreetype6-dev \
    # Audio processing (in case governance analysis includes audio data)
    libsndfile1-dev \
    # Network tools for API development and testing
    netcat \
    tcpdump \
    # File processing utilities for handling various governance data formats
    pandoc \
    texlive-xetex \
    # Cleanup to reduce image size
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js for Web Development track
# Using NodeSource repository for latest stable version
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g \
        yarn \
        pnpm \
        @angular/cli \
        create-react-app \
        typescript \
        ts-node

# Create development user with appropriate permissions
# This ensures proper file ownership and security practices
RUN groupadd --gid ${USER_GID} ${USERNAME} \
    && useradd --uid ${USER_UID} --gid ${USER_GID} -m ${USERNAME} \
    && usermod -aG sudo ${USERNAME} \
    && echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Set up user directories with proper permissions
RUN mkdir -p /home/${USERNAME}/.cache/pip \
    && mkdir -p /home/${USERNAME}/.jupyter \
    && mkdir -p /home/${USERNAME}/.local/bin \
    && mkdir -p /workspace \
    && chown -R ${USERNAME}:${USERNAME} /home/${USERNAME} \
    && chown -R ${USERNAME}:${USERNAME} /workspace

# Switch to development user for package installations
USER ${USERNAME}
WORKDIR /home/${USERNAME}

# Install Python packages for Deep Learning track
# These support transformer models for governance sentiment analysis
RUN pip install --user --upgrade pip setuptools wheel

# Core ML libraries with specific versions for reproducibility
COPY requirements-ml.txt /tmp/requirements-ml.txt
RUN pip install --user -r /tmp/requirements-ml.txt

# Install additional Python packages for Data Science track
# These support Austria Democracy Radar analysis and statistical modeling
COPY requirements-datascience.txt /tmp/requirements-datascience.txt
RUN pip install --user -r /tmp/requirements-datascience.txt

# Install development and productivity tools
COPY requirements-dev.txt /tmp/requirements-dev.txt
RUN pip install --user -r /tmp/requirements-dev.txt

# Configure Jupyter for optimal data science workflow
# These settings enhance notebook usability for governance analysis
RUN jupyter notebook --generate-config \
    && echo "c.NotebookApp.token = ''" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py \
    && echo "c.NotebookApp.password = ''" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py \
    && echo "c.NotebookApp.open_browser = False" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py \
    && echo "c.NotebookApp.ip = '0.0.0.0'" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py \
    && echo "c.NotebookApp.port = 8888" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py \
    && echo "c.NotebookApp.allow_root = True" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py

# Install JupyterLab extensions for enhanced data science experience
RUN pip install --user jupyterlab \
    && jupyter labextension install @jupyter-widgets/jupyterlab-manager --no-build \
    && jupyter labextension install jupyterlab-plotly --no-build \
    && jupyter lab build

# Configure shell for better development experience
# Install oh-my-zsh for enhanced terminal productivity
RUN sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended \
    && echo 'export PATH=$HOME/.local/bin:$PATH' >> /home/${USERNAME}/.zshrc \
    && echo 'export PYTHONPATH=/workspace:$PYTHONPATH' >> /home/${USERNAME}/.zshrc

# Create helpful aliases for development workflow
RUN echo 'alias ll="ls -la"' >> /home/${USERNAME}/.zshrc \
    && echo 'alias notebook="jupyter notebook --allow-root"' >> /home/${USERNAME}/.zshrc \
    && echo 'alias lab="jupyter lab --allow-root"' >> /home/${USERNAME}/.zshrc \
    && echo 'alias serve-api="cd /workspace && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"' >> /home/${USERNAME}/.zshrc \
    && echo 'alias serve-web="cd /workspace/web && npm start"' >> /home/${USERNAME}/.zshrc

# Set up workspace directory structure
# This creates a standardized project layout for all team members
USER root
RUN mkdir -p /workspace/data/raw \
    && mkdir -p /workspace/data/processed \
    && mkdir -p /workspace/data/external \
    && mkdir -p /workspace/models \
    && mkdir -p /workspace/notebooks \
    && mkdir -p /workspace/src/deep_learning \
    && mkdir -p /workspace/src/data_science \
    && mkdir -p /workspace/src/api \
    && mkdir -p /workspace/web \
    && mkdir -p /workspace/docs \
    && mkdir -p /workspace/tests \
    && chown -R ${USERNAME}:${USERNAME} /workspace

# Copy project configuration files
# These ensure consistent development settings across team members
COPY --chown=${USERNAME}:${USERNAME} .gitignore /workspace/.gitignore
COPY --chown=${USERNAME}:${USERNAME} README.md /workspace/README.md

# Set default working directory
WORKDIR /workspace

# Switch back to development user
USER ${USERNAME}

# Default command (overridden by docker-compose)
CMD ["zsh"]

# Health check to ensure development environment is ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import torch, transformers, pandas, numpy; print('Development environment ready')" || exit 1
