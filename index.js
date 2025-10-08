const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static('public'));

// Basic route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chris Rodriguez - Personal Website</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem;
                line-height: 1.6;
                color: #333;
            }
            .header {
                text-align: center;
                margin-bottom: 2rem;
            }
            .badge {
                background: #f0f0f0;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                display: inline-block;
                margin: 0.25rem;
                font-size: 0.9rem;
            }
            .claude-ready {
                background: #e8f5e8;
                color: #2d5a2d;
            }
            .devcontainer-ready {
                background: #e8f0ff;
                color: #1a472a;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🚀 Chris Rodriguez</h1>
            <h2>Personal Website</h2>
            <p>Welcome to my development environment!</p>
        </div>
        
        <div>
            <h3>🛠️ Development Environment Status</h3>
            <div class="badge devcontainer-ready">✅ GitHub Codespaces Ready</div>
            <div class="badge claude-ready">✅ Claude Code Support</div>
            <div class="badge">✅ Node.js ${process.version}</div>
            <div class="badge">✅ Express Server</div>
        </div>
        
        <div>
            <h3>📚 Quick Start</h3>
            <p>This environment is configured with:</p>
            <ul>
                <li><strong>Claude Code</strong> - AI-powered development assistant</li>
                <li><strong>Node.js 20</strong> - Modern JavaScript runtime</li>
                <li><strong>VS Code Extensions</strong> - Enhanced development experience</li>
                <li><strong>Zsh with Oh My Zsh</strong> - Improved terminal experience</li>
                <li><strong>Development Tools</strong> - Git, Docker, TypeScript, and more</li>
            </ul>
        </div>
        
        <div>
            <h3>🎯 Next Steps</h3>
            <ol>
                <li>Set your <code>CLAUDE_API_KEY</code> environment variable</li>
                <li>Run <code>claude-code</code> in the terminal to start AI development</li>
                <li>Use <code>npm run dev</code> for live development</li>
                <li>Start building your awesome project! 🎉</li>
            </ol>
        </div>
        
        <footer style="margin-top: 2rem; text-align: center; color: #666;">
            <p>Powered by GitHub Codespaces + Claude Code</p>
        </footer>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: 'codespaces',
    claudeCodeSupport: true,
    nodeVersion: process.version
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🛠️  Claude Code development environment ready!`);
});