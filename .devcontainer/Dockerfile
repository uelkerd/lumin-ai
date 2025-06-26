# LUMIN.AI Optimized Development Environment
# Size optimization strategies while maintaining full functionality
# Target: Reduce from 7.5GB to ~4-5GB

# Use multi-stage build to reduce final image size
FROM python:3.11-slim as python-base

# Build arguments for customization
ARG NODE_VERSION=18
ARG USERNAME=lumin-dev
ARG USER_UID=1000
ARG USER_GID=1000

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# ===== SYSTEM DEPENDENCIES STAGE =====
# Install system dependencies in one layer to minimize size
RUN apt-get update && apt-get install -y \
    # Essential build tools (will be removed later for runtime)
    build-essential \
    curl \
    wget \
    git \
    # Minimal editor set (remove heavy editors)
    nano \
    # Essential utilities only
    htop \
    tree \
    jq \
    # Database tools - only MongoDB
    gnupg \
    # Graphics libraries (minimal set)
    libgraphviz-dev \
    graphviz \
    # Image processing (only essential)
    libjpeg-dev \
    libpng-dev \
    libfreetype6-dev \
    # Network tools (minimal)
    netcat-traditional \
    # File processing (essential only)
    pandoc \
    # Clean up in same layer to reduce size
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp/* \
    && rm -rf /var/tmp/*

# ===== NODEJS INSTALLATION =====
# Use NodeSource for specific version, then clean up
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g \
    yarn \
    pnpm \
    typescript \
    ts-node \
    # Don't install heavy CLI tools globally
    && npm cache clean --force \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ===== MONGODB TOOLS =====
# Install MongoDB tools efficiently
RUN wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor | tee /usr/share/keyrings/mongodb.gpg > /dev/null \
    && echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list \
    && apt-get update \
    && apt-get install -y mongodb-mongosh \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ===== USER SETUP =====
RUN groupadd --gid ${USER_GID} ${USERNAME} \
    && useradd --uid ${USER_UID} --gid ${USER_GID} -m ${USERNAME} \
    && usermod -aG sudo ${USERNAME} \
    && echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Set up user directories
RUN mkdir -p /home/${USERNAME}/.cache/pip \
    && mkdir -p /home/${USERNAME}/.jupyter \
    && mkdir -p /home/${USERNAME}/.local/bin \
    && mkdir -p /workspace \
    && chown -R ${USERNAME}:${USERNAME} /home/${USERNAME} \
    && chown -R ${USERNAME}:${USERNAME} /workspace

# ===== PYTHON PACKAGES STAGE =====
USER ${USERNAME}
WORKDIR /home/${USERNAME}

# Upgrade pip efficiently
RUN pip install --user --upgrade pip setuptools wheel

# Copy requirements files
COPY --chown=${USERNAME}:${USERNAME} .devcontainer/requirements-ml.txt /tmp/
COPY --chown=${USERNAME}:${USERNAME} .devcontainer/requirements-datascience.txt /tmp/
COPY --chown=${USERNAME}:${USERNAME} .devcontainer/requirements-dev.txt /tmp/

# Install Python packages efficiently
# Install in order of likelihood to change (most stable first)
RUN pip install --user -r /tmp/requirements-ml.txt \
    && pip install --user -r /tmp/requirements-datascience.txt \
    && pip install --user -r /tmp/requirements-dev.txt \
    # Clean up pip cache even though we disabled it
    && rm -rf /home/${USERNAME}/.cache/pip/* \
    && rm /tmp/requirements-*.txt

# ===== JUPYTER CONFIGURATION =====
# Set PATH to include user's local bin directory for jupyter commands
ENV PATH="/home/${USERNAME}/.local/bin:${PATH}"
RUN /home/${USERNAME}/.local/bin/jupyter notebook --generate-config \
    && echo "c.NotebookApp.token = ''" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py \
    && echo "c.NotebookApp.password = ''" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py \
    && echo "c.NotebookApp.open_browser = False" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py \
    && echo "c.NotebookApp.ip = '0.0.0.0'" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py \
    && echo "c.NotebookApp.port = 8888" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py \
    && echo "c.NotebookApp.allow_root = True" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py

# Install JupyterLab efficiently (minimal extensions)
RUN pip install --user jupyterlab \
    && /home/${USERNAME}/.local/bin/jupyter labextension install @jupyter-widgets/jupyterlab-manager --no-build \
    && /home/${USERNAME}/.local/bin/jupyter lab build \
    # Clean up after build
    && /home/${USERNAME}/.local/bin/jupyter lab clean \
    && rm -rf /home/${USERNAME}/.cache/yarn

# ===== SHELL CONFIGURATION =====
# Use bash with optimized settings instead of oh-my-zsh to reduce size
RUN echo 'export PATH=$HOME/.local/bin:$PATH' >> /home/${USERNAME}/.bashrc \
    && echo 'export PYTHONPATH=/workspace:$PYTHONPATH' >> /home/${USERNAME}/.bashrc \
    && echo 'alias ll="ls -la"' >> /home/${USERNAME}/.bashrc \
    && echo 'alias notebook="jupyter notebook --allow-root"' >> /home/${USERNAME}/.bashrc \
    && echo 'alias lab="jupyter lab --allow-root"' >> /home/${USERNAME}/.bashrc

# ===== WORKSPACE SETUP =====
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

# ===== FINAL CLEANUP STAGE =====
# Remove development dependencies that aren't needed at runtime
RUN apt-get update && apt-get remove -y \
    build-essential \
    # Keep git and curl as they're needed for development workflow
    && apt-get autoremove -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp/* \
    && rm -rf /var/tmp/* \
    # Remove apt caches
    && rm -rf /var/cache/apt/archives/* \
    # Remove man pages to save space
    && rm -rf /usr/share/man/* \
    # Remove documentation to save space
    && rm -rf /usr/share/doc/*

# Set default working directory
WORKDIR /workspace

# Switch back to development user
USER ${USERNAME}

# Optimize Python bytecode compilation
ENV PYTHONOPTIMIZE=1

# Default command
CMD ["bash"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import pandas, numpy, sklearn; print('Development environment ready')" || exit 1

# Add labels for container management
LABEL org.lumin-ai.version="1.0" \
    org.lumin-ai.description="Optimized LUMIN.AI development environment" \
    org.lumin-ai.size-target="4-5GB"
