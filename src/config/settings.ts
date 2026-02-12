/**
 * Application settings management
 */

import * as fs from 'fs';
import { z } from 'zod';
import { getSettingsPath, ensureConfigDir } from './paths';

/**
 * Settings schema using Zod
 */
export const SettingsSchema = z.object({
  version: z.string().default('1.0'),
  encryption: z.object({
    enabled: z.boolean().default(false),
    salt: z.string().optional(),
  }),
  ui: z.object({
    colors: z.boolean().default(true),
    interactive: z.boolean().default(true),
    tableStyle: z.enum(['compact', 'full']).default('compact'),
  }),
  backup: z.object({
    enabled: z.boolean().default(true),
    maxBackups: z.number().int().min(1).max(100).default(10),
  }),
});

export type Settings = z.infer<typeof SettingsSchema>;

/**
 * Default settings
 */
export const DEFAULT_SETTINGS: Settings = {
  version: '1.0',
  encryption: {
    enabled: false,
  },
  ui: {
    colors: true,
    interactive: true,
    tableStyle: 'compact',
  },
  backup: {
    enabled: true,
    maxBackups: 10,
  },
};

/**
 * Load settings from file or create with defaults
 */
export function loadSettings(): Settings {
  const settingsPath = getSettingsPath();
  
  if (fs.existsSync(settingsPath)) {
    try {
      const content = fs.readFileSync(settingsPath, 'utf-8');
      const parsed = JSON.parse(content);
      
      // Validate and merge with defaults
      const result = SettingsSchema.safeParse({ ...DEFAULT_SETTINGS, ...parsed });
      if (result.success) {
        return result.data;
      } else {
        console.warn('Invalid settings file, using defaults');
        return DEFAULT_SETTINGS;
      }
    } catch (error) {
      console.warn('Error loading settings, using defaults:', error);
      return DEFAULT_SETTINGS;
    }
  }
  
  // Create default settings file
  saveSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

/**
 * Save settings to file
 */
export function saveSettings(settings: Settings): void {
  ensureConfigDir();
  const settingsPath = getSettingsPath();
  const content = JSON.stringify(settings, null, 2);
  fs.writeFileSync(settingsPath, content, 'utf-8');
}

/**
 * Update specific settings
 */
export function updateSettings(updates: Partial<Settings>): Settings {
  const current = loadSettings();
  const updated = { ...current, ...updates };
  saveSettings(updated);
  return updated;
}
