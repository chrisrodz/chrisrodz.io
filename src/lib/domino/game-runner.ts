/**
 * Game runner - Orchestrates loading and running the domino game
 */

import type { Terminal } from '@xterm/xterm';
import { loadPyodide, installPackages, type PyodideInterface } from './pyodide-loader';
import { fetchGameFiles } from './github-fetcher';
import { PythonTerminalBridge } from './python-bridge';

export interface GameRunnerOptions {
  terminal: Terminal;
  onProgress?: (message: string) => void;
  onError?: (error: Error) => void;
}

export class GameRunner {
  private terminal: Terminal;
  private onProgress?: (message: string) => void;
  private onError?: (error: Error) => void;
  private pyodide: PyodideInterface | null = null;
  private bridge: PythonTerminalBridge | null = null;

  constructor(options: GameRunnerOptions) {
    this.terminal = options.terminal;
    this.onProgress = options.onProgress;
    this.onError = options.onError;
  }

  /**
   * Initialize and run the game
   */
  async run(): Promise<void> {
    try {
      // Step 1: Load Pyodide
      this.onProgress?.('Loading Python runtime...');
      this.pyodide = await loadPyodide(this.onProgress);

      // Step 2: Fetch game files from GitHub
      this.onProgress?.('Fetching game from GitHub...');
      const gameFiles = await fetchGameFiles(this.onProgress);

      // Step 3: Install Python dependencies
      this.onProgress?.('Installing dependencies...');
      await this.installDependencies();

      // Step 4: Setup I/O bridge
      this.bridge = new PythonTerminalBridge(this.terminal, this.pyodide);

      // Step 5: Load game files into Pyodide filesystem
      this.onProgress?.('Loading game files...');
      this.loadGameFiles(gameFiles);

      // Step 6: Run the game
      this.onProgress?.('Starting game...');
      await this.runGame();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.onError?.(err);
      this.terminal.write(`\r\n\x1b[31mError: ${err.message}\x1b[0m\r\n`);
    }
  }

  /**
   * Install required Python packages
   */
  private async installDependencies(): Promise<void> {
    if (!this.pyodide) {
      throw new Error('Pyodide not loaded');
    }

    // Try to install packages, but continue if they fail
    // Some packages may not be available in Pyodide
    const packages = ['typer', 'rich'];

    for (const pkg of packages) {
      try {
        this.onProgress?.(`Installing ${pkg}...`);
        await installPackages(this.pyodide, [pkg], this.onProgress);
      } catch (error) {
        console.warn(`Failed to install ${pkg}, will try to run without it:`, error);
        this.terminal.write(`\x1b[33mWarning: Could not install ${pkg}\x1b[0m\r\n`);
      }
    }
  }

  /**
   * Load game files into Pyodide filesystem
   */
  private loadGameFiles(files: { path: string; content: string }[]): void {
    if (!this.pyodide) {
      throw new Error('Pyodide not loaded');
    }

    // Create working directory
    try {
      this.pyodide.FS.mkdir('/home/pyodide/game');
    } catch {
      // Directory might already exist
    }

    // Write each file
    for (const file of files) {
      const fullPath = `/home/pyodide/game/${file.path}`;
      this.pyodide.FS.writeFile(fullPath, file.content);
    }
  }

  /**
   * Run the game
   */
  private async runGame(): Promise<void> {
    if (!this.pyodide) {
      throw new Error('Pyodide not loaded');
    }

    try {
      // Change to game directory
      await this.pyodide.runPythonAsync(`
import os
import sys

# Add game directory to Python path
sys.path.insert(0, '/home/pyodide/game')
os.chdir('/home/pyodide/game')
`);

      // Try to import and run the game
      // First, let's check what's in the mvp.py file and run it
      await this.pyodide.runPythonAsync(`
# Read and execute the game file
with open('/home/pyodide/game/mvp.py', 'r') as f:
    code = f.read()

# Try to execute it
try:
    exec(code)
except Exception as e:
    print(f"Error running game: {e}")
    import traceback
    traceback.print_exc()
`);
    } catch (error) {
      throw new Error(`Failed to run game: ${error}`);
    }
  }

  /**
   * Stop the game
   */
  stop(): void {
    this.bridge?.clear();
    this.terminal.write('\r\n\x1b[33mGame stopped\x1b[0m\r\n');
  }
}
