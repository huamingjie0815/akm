/**
 * Backup manager for profile data
 * Handles automatic and manual backups with rotation
 */

import * as fs from 'fs';
import * as path from 'path';
import { getBackupsDir } from '../config/paths';
import { loadSettings } from '../config/settings';
import { ProfileStorageData } from '../types/profile';

/**
 * Backup metadata
 */
export interface BackupInfo {
  filename: string;
  path: string;
  createdAt: Date;
  size: number;
  profileCount: number;
}

/**
 * Backup manager class
 */
export class BackupManager {
  private backupsDir: string;

  constructor() {
    this.backupsDir = getBackupsDir();
  }

  /**
   * Ensure backups directory exists
   */
  private ensureBackupsDir(): void {
    if (!fs.existsSync(this.backupsDir)) {
      fs.mkdirSync(this.backupsDir, { recursive: true, mode: 0o700 });
    }
  }

  /**
   * Generate backup filename
   */
  private generateBackupFilename(note?: string): string {
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .slice(0, 19);
    
    if (note) {
      // Sanitize note for filename
      const sanitized = note.replace(/[^a-zA-Z0-9-]/g, '_').slice(0, 30);
      return `profiles-${timestamp}-${sanitized}.json`;
    }
    
    return `profiles-${timestamp}.json`;
  }

  /**
   * Create a backup of the current profiles
   */
  createBackup(data: ProfileStorageData, note?: string): string {
    const settings = loadSettings();
    
    if (!settings.backup.enabled) {
      return '';
    }

    this.ensureBackupsDir();

    const filename = this.generateBackupFilename(note);
    const filepath = path.join(this.backupsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');

    // Rotate backups
    this.rotateBackups(settings.backup.maxBackups);

    return filename;
  }

  /**
   * Rotate backups, keeping only the most recent ones
   */
  private rotateBackups(maxBackups: number): void {
    const files = this.listBackups();
    
    if (files.length <= maxBackups) {
      return;
    }

    // Sort by creation time (oldest first)
    const sorted = files.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    // Delete oldest backups
    const toDelete = sorted.slice(0, sorted.length - maxBackups);
    for (const backup of toDelete) {
      try {
        fs.unlinkSync(backup.path);
      } catch {
        console.warn(`Failed to delete old backup: ${backup.filename}`);
      }
    }
  }

  /**
   * List all available backups
   */
  listBackups(): BackupInfo[] {
    if (!fs.existsSync(this.backupsDir)) {
      return [];
    }

    const files = fs.readdirSync(this.backupsDir)
      .filter(f => f.startsWith('profiles-') && f.endsWith('.json'));

    const backups: BackupInfo[] = [];

    for (const filename of files) {
      const filepath = path.join(this.backupsDir, filename);
      try {
        const stat = fs.statSync(filepath);
        const content = fs.readFileSync(filepath, 'utf-8');
        const data = JSON.parse(content);
        
        backups.push({
          filename,
          path: filepath,
          createdAt: stat.mtime,
          size: stat.size,
          profileCount: data.profiles?.length || 0,
        });
      } catch {
        // Skip invalid backup files
        console.warn(`Skipping invalid backup file: ${filename}`);
      }
    }

    return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Restore from a backup
   */
  restoreBackup(filename: string): ProfileStorageData {
    const filepath = path.join(this.backupsDir, filename);
    
    if (!fs.existsSync(filepath)) {
      throw new Error(`Backup file not found: ${filename}`);
    }

    const content = fs.readFileSync(filepath, 'utf-8');
    const data = JSON.parse(content) as ProfileStorageData;

    return data;
  }

  /**
   * Delete a specific backup
   */
  deleteBackup(filename: string): void {
    const filepath = path.join(this.backupsDir, filename);
    
    if (!fs.existsSync(filepath)) {
      throw new Error(`Backup file not found: ${filename}`);
    }

    fs.unlinkSync(filepath);
  }
}
