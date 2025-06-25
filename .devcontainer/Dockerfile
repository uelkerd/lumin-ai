# LUMIN.AI Development Environment - Minimalist Version
# Simplified Dockerfile for stable development environment

# Start with official Python image
ARG PYTHON_VERSION=3.11
FROM python:${PYTHON_VERSION}-slim-bullseye

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
    gnupg \
    lsb-release \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install MongoDB client tools for the development environment
RUN curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg] http://repo.mongodb.org/apt/debian bullseye/mongodb-org/6.0 main" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list \
    && apt-get update \
    && apt-get install -y mongodb-mongosh \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js for frontend development
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g npm@latest

# Create the user with specified UID/GID
RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && mkdir -p /home/$USERNAME/.vscode-server /workspace \
    && chown -R $USERNAME:$USERNAME /home/$USERNAME/.vscode-server /workspace

# Set up Python environment and install baseline dependencies
WORKDIR /workspace
COPY requirements-dev.txt requirements-ds.txt ./

# Install base Python packages (note: install jupyter first for setup)
RUN pip install --upgrade pip wheel setuptools \
    && pip install jupyter \
    && pip install -r requirements-dev.txt \
    && pip install -r requirements-ds.txt \
    && rm requirements-*.txt

# Configure Jupyter for remote access (only after we've installed it)
RUN mkdir -p /home/${USERNAME}/.jupyter \
    && jupyter notebook --generate-config \
    && echo "c.NotebookApp.token = ''" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py \
    && echo "c.NotebookApp.password = ''" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py \
    && echo "c.NotebookApp.open_browser = False" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py \
    && echo "c.NotebookApp.ip = '0.0.0.0'" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py \
    && echo "c.NotebookApp.port = 9000" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py \
    && chown -R ${USERNAME}:${USERNAME} /home/${USERNAME}/.jupyter

# Set up project directory permissions
RUN chown -R ${USERNAME}:${USERNAME} /workspace

# Switch to non-root user for better security
USER $USERNAME

# Set up working directory
WORKDIR /workspace

# Default command
CMD ["zsh"]
