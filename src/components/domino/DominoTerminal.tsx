/**
 * DominoTerminal - Main component for the domino game terminal
 */

import { useEffect, useRef, useState } from 'react';
import { isWebAssemblySupported } from '@/lib/domino/pyodide-loader';
import { GameRunner } from '@/lib/domino/game-runner';

// Type-only imports (safe for SSR)
import type { Terminal } from '@xterm/xterm';
import type { FitAddon } from '@xterm/addon-fit';

interface DominoTerminalProps {
  locale: 'en' | 'es';
  translations: {
    loading: string;
    loadingGame: string;
    installingDeps: string;
    ready: string;
    error: string;
    browserNotSupported: string;
    errorMessages: {
      networkError: string;
      pyodideError: string;
      gameError: string;
    };
  };
}

export function DominoTerminal({ locale, translations }: DominoTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const gameRunner = useRef<GameRunner | null>(null);

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [statusMessage, setStatusMessage] = useState<string>(translations.loading);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Initialize terminal with dynamic imports
    async function initTerminal() {
      // Check WebAssembly support
      if (!isWebAssemblySupported()) {
        setStatus('error');
        setError(translations.browserNotSupported);
        return;
      }

      // Don't initialize if already initialized or ref not ready
      if (!terminalRef.current || terminal.current) {
        return;
      }

      try {
        // Dynamically import xterm.js modules (client-side only)
        const [{ Terminal }, { FitAddon }] = await Promise.all([
          import('@xterm/xterm'),
          import('@xterm/addon-fit'),
          import('@xterm/xterm/css/xterm.css'), // Import CSS
        ]);

        if (!mounted) return; // Component unmounted during import

        // Create terminal instance
        const term = new Terminal({
          cursorBlink: true,
          fontSize: 14,
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          theme: {
            background:
              getComputedStyle(document.documentElement)
                .getPropertyValue('--pico-background-color')
                .trim() || '#000000',
            foreground:
              getComputedStyle(document.documentElement)
                .getPropertyValue('--pico-color')
                .trim() || '#ffffff',
            cursor:
              getComputedStyle(document.documentElement)
                .getPropertyValue('--pico-primary')
                .trim() || '#00ff00',
          },
          rows: 30,
          cols: 100,
        });

        // Add fit addon
        const fit = new FitAddon();
        term.loadAddon(fit);

        // Open terminal
        if (terminalRef.current) {
          term.open(terminalRef.current);
          fit.fit();
        }

        terminal.current = term;
        fitAddon.current = fit;

        // Handle window resize
        const handleResize = () => {
          fit.fit();
        };
        window.addEventListener('resize', handleResize);

        // Welcome message
        term.writeln('\x1b[1;32m╔═══════════════════════════════════════════╗\x1b[0m');
        term.writeln('\x1b[1;32m║     Caribbean Dominoes - Browser CLI     ║\x1b[0m');
        term.writeln('\x1b[1;32m╚═══════════════════════════════════════════╝\x1b[0m');
        term.writeln('');

        // Start game
        await startGame(term);

        // Cleanup function for resize listener
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      } catch (err) {
        console.error('Failed to initialize terminal:', err);
        if (mounted) {
          setStatus('error');
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load terminal. Please refresh the page.',
          );
        }
      }
    }

    const cleanupPromise = initTerminal();

    // Cleanup
    return () => {
      mounted = false;
      cleanupPromise.then((cleanup) => cleanup?.());
      gameRunner.current?.stop();
      terminal.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start the game
  const startGame = async (term: Terminal) => {
    try {
      const runner = new GameRunner({
        terminal: term,
        onProgress: (message) => {
          setStatusMessage(message);
          term.writeln(`\x1b[36m${message}\x1b[0m`);
        },
        onError: (err) => {
          setStatus('error');
          setError(err.message);
        },
      });

      gameRunner.current = runner;

      await runner.run();

      setStatus('ready');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : translations.errorMessages.gameError;
      setStatus('error');
      setError(errorMessage);
    }
  };

  return (
    <div className="domino-terminal-container">
      {status === 'loading' && (
        <div className="domino-status">
          <p aria-live="polite">{statusMessage}</p>
        </div>
      )}

      {status === 'error' && error && (
        <div className="domino-error" role="alert">
          <p>
            <strong>{translations.error}:</strong> {error}
          </p>
        </div>
      )}

      <div ref={terminalRef} className="domino-terminal" />
    </div>
  );
}
