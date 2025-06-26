# LUMIN.AI Development Environment - Optimized Build
# syntax=docker/dockerfile:1.4
# ^ Enables BuildKit advanced features

# Build stage for Python dependencies
ARG PYTHON_VERSION=3.11
FROM python:${PYTHON_VERSION}-slim-bullseye AS python-deps

# Skip interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install build dependencies for Python packages
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    wget \
    git

# Set up a virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies in stages to better handle conflicts
COPY .devcontainer/requirements-dev.txt .devcontainer/requirements-ds.txt /tmp/
COPY .devcontainer/install_python_deps.sh /tmp/install_python_deps.sh
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip wheel setuptools && \
    pip install --no-cache-dir jupyter

# Install development dependencies first
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir -r /tmp/requirements-dev.txt

# Install data science dependencies using the smart script
RUN --mount=type=cache,target=/root/.cache/pip \
    chmod +x /tmp/install_python_deps.sh && \
    /tmp/install_python_deps.sh

# Install tensorflow and torch from local wheels to avoid network issues
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install /tmp/wheels/*.whl

# Install the rest of the data science packages, excluding what was in wheels
RUN --mount=type=cache,target=/root/.cache/pip \
    grep -v -E "^(numpy|tensorflow|torch)==" /tmp/requirements-ds.txt | pip install --no-cache-dir --retries 5 --timeout 300 -r /dev/stdin

# Final stage
FROM python:${PYTHON_VERSION}-slim-bullseye

# Build arguments for customization
ARG NODE_VERSION=20
ARG USERNAME=lumin-dev
ARG USER_UID=1000
ARG USER_GID=1000

# Set environment variables for development
ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PATH="/opt/venv/bin:$PATH:/home/lumin-dev/.local/bin"

# Install system dependencies - grouped by purpose for better caching
# Core utilities group
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    curl \
    wget \
    git \
    zsh \
    gnupg \
    lsb-release \
    ca-certificates \
    && apt-get clean

# Install dev tools (separate layer for better caching)
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get install -y --no-install-recommends \
    vim \
    nano \
    && apt-get clean

# Install MongoDB client tools with optimized layer
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | \
    gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg] http://repo.mongodb.org/apt/debian bullseye/mongodb-org/6.0 main" | \
    tee /etc/apt/sources.list.d/mongodb-org-6.0.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends mongodb-mongosh && \
    apt-get clean

# Install Node.js with version pinning for better reproducibility
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    npm install -g npm@latest && \
    apt-get clean

# Create the user with specified UID/GID
RUN groupadd --gid $USER_GID $USERNAME && \
    useradd --uid $USER_UID --gid $USER_GID -m $USERNAME && \
    mkdir -p /home/$USERNAME/.vscode-server /workspace && \
    chown -R $USERNAME:$USERNAME /home/$USERNAME/.vscode-server /workspace

# Set up working directory
WORKDIR /workspace

# Copy Python virtual environment from builder stage
COPY --from=python-deps /opt/venv /opt/venv

# Configure Jupyter for remote access
RUN mkdir -p /home/${USERNAME}/.jupyter && \
    jupyter notebook --generate-config && \
    echo "c.NotebookApp.token = ''" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py && \
    echo "c.NotebookApp.password = ''" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py && \
    echo "c.NotebookApp.open_browser = False" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py && \
    echo "c.NotebookApp.ip = '0.0.0.0'" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py && \
    echo "c.NotebookApp.port = 9000" >> /home/${USERNAME}/.jupyter/jupyter_notebook_config.py && \
    chown -R ${USERNAME}:${USERNAME} /home/${USERNAME}/.jupyter

# Install pre-commit directly
RUN pip install --no-cache-dir pre-commit

# Set proper ownership and permissions
RUN chown -R ${USERNAME}:${USERNAME} /workspace

# Copy pre-commit setup script
COPY --chown=${USERNAME}:${USERNAME} .devcontainer/setup.sh /tmp/setup.sh

# Switch to non-root user for security
USER $USERNAME

# Keep container running
CMD ["zsh"]
