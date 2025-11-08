/**
 * GitHub fetcher - Fetches Python code from the domino-game-cli repository
 */

const REPO_OWNER = 'chrisrodz';
const REPO_NAME = 'domino-game-cli';
const BRANCH = 'main';
const BASE_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/`;

// Cache for fetched files
const fileCache = new Map<string, { content: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface GameFile {
  path: string;
  content: string;
}

/**
 * Fetch a file from the GitHub repository
 */
async function fetchFile(filename: string, useCache = true): Promise<string> {
  const cacheKey = filename;

  // Check cache
  if (useCache) {
    const cached = fileCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.content;
    }
  }

  try {
    const response = await fetch(`${BASE_URL}${filename}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const content = await response.text();

    // Cache the result
    fileCache.set(cacheKey, { content, timestamp: Date.now() });

    return content;
  } catch (error) {
    // Try to return cached version even if expired
    const cached = fileCache.get(cacheKey);
    if (cached) {
      console.warn(`Network error, using cached version of ${filename}`);
      return cached.content;
    }

    throw new Error(`Failed to fetch ${filename}: ${error}`);
  }
}

/**
 * Fetch all game files from the repository
 */
export async function fetchGameFiles(onProgress?: (message: string) => void): Promise<GameFile[]> {
  try {
    onProgress?.('Fetching game code from GitHub...');

    // List of files to fetch
    const filesToFetch = ['mvp.py'];

    const files: GameFile[] = [];

    for (const filename of filesToFetch) {
      onProgress?.(`Fetching ${filename}...`);
      const content = await fetchFile(filename);
      files.push({ path: filename, content });
    }

    onProgress?.('Game files fetched');

    return files;
  } catch (error) {
    throw new Error(`Failed to fetch game files: ${error}`);
  }
}

/**
 * Get the GitHub repository URL
 */
export function getRepositoryUrl(): string {
  return `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
}

/**
 * Clear the file cache (force refresh)
 */
export function clearCache(): void {
  fileCache.clear();
}
