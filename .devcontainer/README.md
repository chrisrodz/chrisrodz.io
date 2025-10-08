# Claude Code Development Container

This directory contains the configuration for a GitHub Codespaces development environment optimized for Claude Code development.

## What's Included

### Development Tools
- **Node.js 20**: Latest LTS version for modern JavaScript development
- **Claude Code VSCode Extension**: Anthropic's Claude Code extension for VS Code
- **Git with Delta**: Enhanced git diff experience
- **Zsh with Oh My Zsh**: Improved shell experience
- **Essential CLI tools**: fzf, ripgrep, jq, tree, htop, and more

### VS Code Extensions
- **Claude Code Extension**: Official Claude Code VSCode extension for AI-assisted development
- **GitHub Copilot**: AI-powered code suggestions
- **TypeScript**: Enhanced TypeScript support
- **Prettier & ESLint**: Code formatting and linting
- **Docker**: Container management
- **Tailwind CSS**: Utility-first CSS framework support
- **Path IntelliSense**: Auto-completion for file paths

### Pre-configured Ports
- **3000**: Development Server (React, Next.js, etc.)
- **8000**: Alternative Development Server
- **8080**: Preview Server
- **5173**: Vite Development Server
- **4000**: Jekyll Server

## Setup Instructions

### 1. Start Codespace
1. Open the repository in GitHub
2. Click the green "Code" button
3. Select "Codespaces" tab
4. Click "Create codespace on main" (or your current branch)

### 2. Wait for Setup
The container will automatically:
- Install all development tools
- Install Claude Code VSCode extension
- Configure the shell environment
- Set up VS Code extensions

### 3. Authenticate with Claude Code
Once the container is ready:
1. Open the Command Palette (`Cmd/Ctrl+Shift+P`)
2. Search for "Claude" and select a Claude Code command
3. When prompted, click the login link that appears
4. Sign in with your Claude subscription account
5. Return to VS Code and start using Claude Code!

### 4. Verify Installation
Once the container is ready, you can verify the setup:

```bash
# Check Node.js
node --version

# Check npm
npm --version

# Check that Claude Code extension is installed
code --list-extensions | grep anthropic.claude-code
```

## Usage

### Using Claude Code
To start working with Claude Code:

1. **Open Command Palette**: Press `Cmd/Ctrl+Shift+P`
2. **Search for Claude**: Type "Claude" to see available commands
3. **Start a conversation**: Select "Claude Code: New Chat" or similar command
4. **Begin coding**: Ask Claude to help with your development tasks

No API key setup required - just sign in with your Claude subscription when prompted!

### Development Workflow
1. **Create or open your project files**
2. **Start your development server** (the ports are automatically forwarded)
3. **Use Claude Code** for AI-assisted development
4. **Commit and push** your changes using git

### Common Commands
```bash
# Install project dependencies
npm install

# Start development server
npm start
# or
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Access Claude Code
# Use Cmd/Ctrl+Shift+P then search for "Claude"
```

## Security Features

- **Network isolation**: Container has restricted network access
- **Subscription-based authentication**: Uses Claude subscription login (no API keys needed)
- **Persistent volumes**: Command history and data persist across container restarts

## Customization

### Adding VS Code Extensions
Edit `.devcontainer/devcontainer.json` and add extensions to the `customizations.vscode.extensions` array:

```json
{
  "customizations": {
    "vscode": {
      "extensions": [
        "existing.extension",
        "your.new.extension"
      ]
    }
  }
}
```

### Adding Development Tools
Edit `.devcontainer/Dockerfile` to add additional tools:

```dockerfile
RUN apt-get update && apt-get install -y \
    your-tool-here \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
```

### Modifying Port Forwarding
Edit the `forwardPorts` array in `devcontainer.json`:

```json
{
  "forwardPorts": [3000, 8000, 8080, 5173, 4000, "your-port-here"]
}
```

## Troubleshooting

### Claude Code Authentication Issues
If Claude Code extension isn't working:
1. Open Command Palette (`Cmd/Ctrl+Shift+P`)
2. Search for "Claude Code: Sign In" or similar command
3. Click the login link when prompted
4. Complete authentication in your browser
5. Return to VS Code and try again

### Extension Not Appearing
If you don't see Claude Code commands:
1. Check that the extension is installed: `Extensions` view → search for "Claude Code"
2. Reload VS Code window: `Cmd/Ctrl+Shift+P` → "Developer: Reload Window"
3. Check the extension is enabled and not disabled

### Port Access Issues
If you can't access forwarded ports:
1. Check that your application is binding to `0.0.0.0` not `127.0.0.1`
2. Verify the port is listed in `forwardPorts`
3. Check the "Ports" tab in VS Code

### Performance Issues
If the container is slow:
1. Ensure you have sufficient Codespace resources
2. Consider upgrading your Codespace machine type
3. Check if background processes are consuming resources

## Support

For issues with:
- **Claude Code**: Check [Claude Code documentation](https://docs.anthropic.com/claude/docs)
- **GitHub Codespaces**: Check [GitHub Codespaces documentation](https://docs.github.com/en/codespaces)
- **VS Code**: Check [VS Code documentation](https://code.visualstudio.com/docs)