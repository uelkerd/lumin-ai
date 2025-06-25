# LUMIN.AI Development Environment - Minimalist Version
# Simplified Dockerfile for stable development environment

# Start with official Python image
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

# Install essential system dependencies only
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    wget \
    git \
    vim \
    nano \
    zsh \
    sqlite3 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install MongoDB tools separately to avoid key issues
RUN wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor > /etc/apt/trusted.gpg.d/mongodb.gpg \
    && echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list \
    && apt-get update \
    && apt-get install -y mongodb-mongosh \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (minimal version)
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create development user with appropriate permissions
RUN groupadd --gid ${USER_GID} ${USERNAME} \
    && useradd --uid ${USER_UID} --gid ${USER_GID} -m ${USERNAME} \
    && usermod -aG sudo ${USERNAME} \
    && echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Set up user directories with proper permissions
RUN mkdir -p /home/${USERNAME}/.cache/pip \
    && mkdir -p /home/${USERNAME}/.jupyter \
    && mkdir -p /workspace \
    && chown -R ${USERNAME}:${USERNAME} /home/${USERNAME} \
    && chown -R ${USERNAME}:${USERNAME} /workspace

# Switch to development user for package installations
USER ${USERNAME}
WORKDIR /home/${USERNAME}

# Install Python packages
RUN pip install --user --upgrade pip setuptools wheel

# Install Python dependencies from separate requirement files
COPY requirements-ml.txt /tmp/requirements-ml.txt
COPY requirements-ds.txt /tmp/requirements-ds.txt
COPY requirements-dev.txt /tmp/requirements-dev.txt

# Install each requirement file separately with error handling
RUN pip install --user -r /tmp/requirements-dev.txt || echo "Some development packages could not be installed"
RUN pip install --user -r /tmp/requirements-ds.txt || echo "Some data science packages could not be installed"
RUN pip install --user -r /tmp/requirements-ml.txt || echo "Some machine learning packages could not be installed"

# Configure minimal Jupyter settings
RUN jupyter notebook --generate-config \
    && echo "c.NotebookApp.token = ''" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py \
    && echo "c.NotebookApp.password = ''" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py \
    && echo "c.NotebookApp.open_browser = False" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py \
    && echo "c.NotebookApp.ip = '0.0.0.0'" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py

# Configure zsh with minimal settings
RUN sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended \
    && echo 'export PATH=$HOME/.local/bin:$PATH' >> /home/${USERNAME}/.zshrc \
    && echo 'export PYTHONPATH=/workspace:$PYTHONPATH' >> /home/${USERNAME}/.zshrc

# Set up basic workspace directory structure
USER root
RUN mkdir -p /workspace/data \
    && mkdir -p /workspace/src \
    && chown -R ${USERNAME}:${USERNAME} /workspace

# Set default working directory
WORKDIR /workspace

# Switch back to development user
USER ${USERNAME}

# Default command
CMD ["zsh"]
