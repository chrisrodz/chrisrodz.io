/**
 * Pyodide loader - Loads and initializes the Python runtime in the browser
 */

declare global {
  interface Window {
    loadPyodide: (config?: { indexURL?: string }) => Promise<PyodideInterface>;
  }
}

export interface PyodideInterface {
  loadPackage: (packages: string | string[]) => Promise<void>;
  runPythonAsync: (code: string) => Promise<unknown>;
  runPython: (code: string) => unknown;
  FS: {
    writeFile: (path: string, data: string | Uint8Array) => void;
    readFile: (path: string, options?: { encoding: string }) => string | Uint8Array;
    mkdir: (path: string) => void;
  };
  setStdout: (options: { batched: (output: string) => void }) => void;
  setStderr: (options: { batched: (output: string) => void }) => void;
  setStdin: (options: { stdin: () => string }) => void;
  globals: {
    get: (name: string) => unknown;
    set: (name: string, value: unknown) => void;
  };
}

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

let pyodideInstance: PyodideInterface | null = null;
let pyodideLoadPromise: Promise<PyodideInterface> | null = null;

/**
 * Load Pyodide from CDN (cached after first load)
 */
export async function loadPyodide(
  onProgress?: (message: string) => void
): Promise<PyodideInterface> {
  // Return cached instance if available
  if (pyodideInstance) {
    return pyodideInstance;
  }

  // If already loading, return the existing promise
  if (pyodideLoadPromise) {
    return pyodideLoadPromise;
  }

  pyodideLoadPromise = (async () => {
    try {
      onProgress?.('Loading Python runtime...');

      // Load Pyodide script from CDN
      if (!window.loadPyodide) {
        await loadPyodideScript();
      }

      // Initialize Pyodide
      const pyodide = await window.loadPyodide({
        indexURL: PYODIDE_CDN,
      });

      onProgress?.('Python runtime loaded');

      // Cache the instance
      pyodideInstance = pyodide;
      return pyodide;
    } catch (error) {
      pyodideLoadPromise = null; // Reset on error to allow retry
      throw new Error(`Failed to load Pyodide: ${error}`);
    }
  })();

  return pyodideLoadPromise;
}

/**
 * Load the Pyodide script dynamically
 */
async function loadPyodideScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${PYODIDE_CDN}pyodide.js`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Pyodide script'));
    document.head.appendChild(script);
  });
}

/**
 * Install Python packages using micropip
 */
export async function installPackages(
  pyodide: PyodideInterface,
  packages: string[],
  onProgress?: (message: string) => void
): Promise<void> {
  try {
    onProgress?.('Installing Python packages...');

    // Load micropip
    await pyodide.loadPackage(['micropip']);

    // Install packages
    for (const pkg of packages) {
      onProgress?.(`Installing ${pkg}...`);
      await pyodide.runPythonAsync(`
        import micropip
        await micropip.install('${pkg}')
      `);
    }

    onProgress?.('Packages installed');
  } catch (error) {
    throw new Error(`Failed to install packages: ${error}`);
  }
}

/**
 * Check if WebAssembly is supported
 * Note: This is a basic check. Pyodide will perform more thorough validation.
 */
export function isWebAssemblySupported(): boolean {
  // Simple check - just verify WebAssembly object exists and has key methods
  // Pyodide will handle more detailed capability testing and give better error messages
  return typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function';
}
