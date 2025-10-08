# Use Node.js 20 as base image for modern JavaScript development
FROM node:20-bullseye

# Set build arguments
ARG TZ=America/Los_Angeles
ARG CLAUDE_CODE_VERSION=latest
ARG GIT_DELTA_VERSION=0.18.2
ARG ZSH_IN_DOCKER_VERSION=1.2.0

# Set timezone
ENV TZ=$TZ
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Update system packages and install essential tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    zsh \
    curl \
    wget \
    unzip \
    vim \
    nano \
    fzf \
    ripgrep \
    jq \
    tree \
    htop \
    build-essential \
    python3 \
    python3-pip \
    openssh-client \
    ca-certificates \
    gnupg \
    lsb-release \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install git-delta for better git diffs
RUN wget -q https://github.com/dandavison/delta/releases/download/${GIT_DELTA_VERSION}/git-delta_${GIT_DELTA_VERSION}_amd64.deb \
    && dpkg -i git-delta_${GIT_DELTA_VERSION}_amd64.deb \
    && rm git-delta_${GIT_DELTA_VERSION}_amd64.deb

# Set up the node user (already exists in the node image)
USER node
WORKDIR /home/node

# Install Oh My Zsh for the node user
RUN sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Configure zsh with useful plugins and settings
RUN echo 'export ZSH="$HOME/.oh-my-zsh"' >> ~/.zshrc && \
    echo 'ZSH_THEME="robbyrussell"' >> ~/.zshrc && \
    echo 'plugins=(git node npm docker)' >> ~/.zshrc && \
    echo 'source $ZSH/oh-my-zsh.sh' >> ~/.zshrc && \
    echo 'export HISTFILE=/commandhistory/.zsh_history' >> ~/.zshrc && \
    echo 'export HISTSIZE=10000' >> ~/.zshrc && \
    echo 'export SAVEHIST=10000' >> ~/.zshrc && \
    echo 'setopt HIST_VERIFY' >> ~/.zshrc && \
    echo 'setopt SHARE_HISTORY' >> ~/.zshrc && \
    echo 'setopt APPEND_HISTORY' >> ~/.zshrc && \
    echo 'setopt INC_APPEND_HISTORY' >> ~/.zshrc && \
    echo 'setopt HIST_IGNORE_DUPS' >> ~/.zshrc && \
    echo 'setopt HIST_IGNORE_ALL_DUPS' >> ~/.zshrc && \
    echo 'setopt HIST_IGNORE_SPACE' >> ~/.zshrc

# Configure git with better defaults and delta
RUN git config --global init.defaultBranch main && \
    git config --global core.pager "delta" && \
    git config --global interactive.diffFilter "delta --color-only" && \
    git config --global delta.navigate true && \
    git config --global delta.light false && \
    git config --global merge.conflictstyle diff3 && \
    git config --global diff.colorMoved default

# Install useful global npm packages
RUN npm install -g \
    typescript \
    @types/node \
    ts-node \
    nodemon \
    serve \
    http-server \
    live-server \
    prettier \
    eslint

# Create command history directory
RUN mkdir -p /commandhistory && chown node:node /commandhistory

# Switch back to root to set permissions
USER root

# Clean npm cache for good measure
RUN npm cache clean --force

# Create a startup script for the container
RUN echo '#!/bin/bash' > /usr/local/bin/container-init && \
    echo 'echo "🚀 Claude Code VSCode Extension Development Environment"' >> /usr/local/bin/container-init && \
    echo 'echo "✅ Node.js $(node --version)"' >> /usr/local/bin/container-init && \
    echo 'echo "✅ npm $(npm --version)"' >> /usr/local/bin/container-init && \
    echo 'echo "✅ Git $(git --version)"' >> /usr/local/bin/container-init && \
    echo 'echo "✅ Claude Code VSCode Extension configured"' >> /usr/local/bin/container-init && \
    echo 'echo ""' >> /usr/local/bin/container-init && \
    echo 'echo "💡 Pro tips:"' >> /usr/local/bin/container-init && \
    echo 'echo "   - Use Cmd/Ctrl+Shift+P and search for Claude to start"' >> /usr/local/bin/container-init && \
    echo 'echo "   - Sign in with your Claude subscription when prompted"' >> /usr/local/bin/container-init && \
    echo 'echo "   - Use \`npm start\` or \`npm run dev\` for development servers"' >> /usr/local/bin/container-init && \
    echo 'echo ""' >> /usr/local/bin/container-init && \
    chmod +x /usr/local/bin/container-init

# Switch back to node user for the final working environment
USER node

# Set the default shell to zsh
ENV SHELL=/bin/zsh

# Set working directory to workspace
WORKDIR /workspaces

# Run the container init script by default
CMD ["/usr/local/bin/container-init"]