/**
 * Configuration paths and directory management
 * Follows XDG Base Directory Specification
 */

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

/**
 * Get the configuration directory
 * Follows XDG spec: ~/.config/apikey-manage/ on Unix, %APPDATA%\apikey-manage\ on Windows
 */
export function getConfigDir(): string {
  // Check for custom config directory via environment variable
  const customDir = process.env.AKM_CONFIG_DIR;
  if (customDir) {
    return path.resolve(customDir);
  }

  // Use XDG Base Directory Specification
  const xdgConfigHome = process.env.XDG_CONFIG_HOME;
  if (xdgConfigHome) {
    return path.join(xdgConfigHome, 'apikey-manage');
  }

  // Default: ~/.config/apikey-manage/ on Unix, %APPDATA%\apikey-manage\ on Windows
  return path.join(os.homedir(), '.config', 'apikey-manage');
}

/**
 * Ensure the configuration directory exists
 * Creates the directory with appropriate permissions if it doesn't exist
 */
export function ensureConfigDir(): string {
  const configDir = getConfigDir();
  
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true, mode: 0o700 });
  }

  return configDir;
}

/**
 * Get the path to the profiles file
 */
export function getProfilesPath(): string {
  return path.join(getConfigDir(), 'profiles.json');
}

/**
 * Get the path to the settings file
 */
export function getSettingsPath(): string {
  return path.join(getConfigDir(), 'settings.json');
}

/**
 * Get the path to the backups directory
 */
export function getBackupsDir(): string {
  return path.join(getConfigDir(), 'backups');
}
