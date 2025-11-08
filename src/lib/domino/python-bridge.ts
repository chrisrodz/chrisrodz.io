/**
 * Python-Terminal bridge - Connects Python I/O to xterm.js terminal
 */

import type { Terminal } from '@xterm/xterm';
import type { PyodideInterface } from './pyodide-loader';

export class PythonTerminalBridge {
  private inputBuffer: string[] = [];
  private inputResolver: ((value: string) => void) | null = null;
  private terminal: Terminal;
  private pyodide: PyodideInterface;

  constructor(terminal: Terminal, pyodide: PyodideInterface) {
    this.terminal = terminal;
    this.pyodide = pyodide;
    this.setupIO();
  }

  /**
   * Setup I/O redirection between Python and terminal
   */
  private setupIO(): void {
    // Redirect Python stdout to terminal
    this.pyodide.setStdout({
      batched: (output: string) => {
        this.terminal.write(output);
      },
    });

    // Redirect Python stderr to terminal (in red)
    this.pyodide.setStderr({
      batched: (output: string) => {
        this.terminal.write(`\x1b[31m${output}\x1b[0m`);
      },
    });

    // Setup stdin handler
    this.pyodide.setStdin({
      stdin: () => {
        return this.readInput();
      },
    });

    // Handle terminal input
    this.terminal.onData((data) => {
      this.handleTerminalInput(data);
    });
  }

  /**
   * Handle input from the terminal
   */
  private handleTerminalInput(data: string): void {
    // Handle special keys
    if (data === '\r') {
      // Enter key
      this.terminal.write('\r\n');
      const input = this.inputBuffer.join('');
      this.inputBuffer = [];

      // Resolve pending input promise
      if (this.inputResolver) {
        this.inputResolver(input);
        this.inputResolver = null;
      }
    } else if (data === '\x7F' || data === '\x08') {
      // Backspace
      if (this.inputBuffer.length > 0) {
        this.inputBuffer.pop();
        this.terminal.write('\b \b');
      }
    } else if (data === '\x03') {
      // Ctrl+C
      this.terminal.write('^C\r\n');
      if (this.inputResolver) {
        this.inputResolver('');
        this.inputResolver = null;
      }
      // Note: We could raise KeyboardInterrupt in Python here if needed
    } else {
      // Regular character
      this.inputBuffer.push(data);
      this.terminal.write(data);
    }
  }

  /**
   * Read input from the terminal (blocking for Python)
   */
  private readInput(): string {
    // This is called synchronously by Python, but we need async input
    // We'll return a blocking implementation using a synchronous approach
    // Note: This is a simplified version. For full async support,
    // we'd need to modify the Python code to use async/await

    // For now, return empty string and handle input via the input buffer
    // The actual game will need to be adapted for browser compatibility
    return '';
  }

  /**
   * Wait for user input (async version for when we can modify Python code)
   */
  async waitForInput(): Promise<string> {
    return new Promise((resolve) => {
      this.inputResolver = resolve;
    });
  }

  /**
   * Write output to terminal
   */
  write(data: string): void {
    this.terminal.write(data);
  }

  /**
   * Clear the terminal
   */
  clear(): void {
    this.terminal.clear();
  }
}

/**
 * Create a Python stdin wrapper that can be used with async/await
 * This allows the Python code to work in a browser environment
 */
export function createAsyncStdinWrapper(): string {
  return `
import asyncio
import sys
from typing import Optional

class BrowserStdin:
    """Stdin wrapper for browser environment"""

    def __init__(self):
        self.buffer = []

    def readline(self) -> str:
        """Read a line from stdin (blocks)"""
        # In browser, we'll use the input buffer
        # This is a placeholder for synchronous input
        return ""

    def read(self, n: int = -1) -> str:
        """Read n characters from stdin"""
        return ""

# Replace sys.stdin with browser-compatible version
# sys.stdin = BrowserStdin()
`;
}
