/**
 * Profile storage manager
 * Handles atomic file operations and profile CRUD
 */

import * as fs from 'fs';
import * as path from 'path';
import { getProfilesPath, getBackupsDir, ensureConfigDir } from '../config/paths';
import { Profile, ProfileStorageData, ProfileCreateInput, ProfileUpdateInput } from '../types/profile';

const STORAGE_VERSION = '1.0';

/**
 * ProfileStorage class
 * Manages profile data persistence with atomic writes and backup support
 */
export class ProfileStorage {
  private data: ProfileStorageData;
  private profilesPath: string;

  constructor() {
    this.profilesPath = getProfilesPath();
    this.data = this.loadOrCreate();
  }

  /**
   * Load existing data or create new storage
   */
  private loadOrCreate(): ProfileStorageData {
    if (fs.existsSync(this.profilesPath)) {
      try {
        const content = fs.readFileSync(this.profilesPath, 'utf-8');
        const data = JSON.parse(content) as ProfileStorageData;
        
        // Validate version
        if (data.version !== STORAGE_VERSION) {
          console.warn(`Warning: Storage version mismatch. Expected ${STORAGE_VERSION}, got ${data.version}`);
        }
        
        return data;
      } catch (error) {
        console.error('Error loading profiles:', error);
        // Try to restore from backup if available
        const backupRestored = this.tryRestoreFromBackup();
        if (backupRestored) {
          return backupRestored;
        }
        // Create new empty storage
        return this.createEmptyStorage();
      }
    }
    
    return this.createEmptyStorage();
  }

  /**
   * Create empty storage structure
   */
  private createEmptyStorage(): ProfileStorageData {
    return {
      version: STORAGE_VERSION,
      profiles: [],
      metadata: {
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  /**
   * Try to restore from most recent backup
   */
  private tryRestoreFromBackup(): ProfileStorageData | null {
    const backupsDir = getBackupsDir();
    if (!fs.existsSync(backupsDir)) {
      return null;
    }

    try {
      const files = fs.readdirSync(backupsDir)
        .filter(f => f.startsWith('profiles-') && f.endsWith('.json'))
        .map(f => ({
          name: f,
          path: path.join(backupsDir, f),
          time: fs.statSync(path.join(backupsDir, f)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time);

      if (files.length > 0) {
        const content = fs.readFileSync(files[0].path, 'utf-8');
        return JSON.parse(content) as ProfileStorageData;
      }
    } catch (error) {
      console.error('Error restoring from backup:', error);
    }

    return null;
  }

  /**
   * Save data to disk atomically
   */
  private save(): void {
    // Ensure directory exists
    ensureConfigDir();
    
    // Update metadata
    this.data.metadata.lastUpdated = new Date().toISOString();
    
    // Write to temp file first
    const tempPath = `${this.profilesPath}.tmp`;
    const content = JSON.stringify(this.data, null, 2);
    
    fs.writeFileSync(tempPath, content, 'utf-8');
    
    // Atomic rename
    fs.renameSync(tempPath, this.profilesPath);
  }

  /**
   * Get all profiles
   */
  getAll(): Profile[] {
    return [...this.data.profiles];
  }

  /**
   * Get a profile by name
   */
  getByName(name: string): Profile | undefined {
    return this.data.profiles.find(p => p.name === name);
  }

  /**
   * Check if profile exists
   */
  exists(name: string): boolean {
    return this.data.profiles.some(p => p.name === name);
  }

  /**
   * Create a new profile
   */
  create(input: ProfileCreateInput): Profile {
    if (this.exists(input.name)) {
      throw new Error(`Profile '${input.name}' already exists`);
    }

    const now = new Date().toISOString();
    const profile: Profile = {
      ...input,
      createdAt: now,
      updatedAt: now,
    };

    this.data.profiles.push(profile);
    
    // If this is the first profile, mark it as default
    if (this.data.profiles.length === 1) {
      profile.isDefault = true;
      this.data.metadata.defaultProfile = profile.name;
    }

    this.save();
    return profile;
  }

  /**
   * Update an existing profile
   */
  update(name: string, input: ProfileUpdateInput): Profile {
    const index = this.data.profiles.findIndex(p => p.name === name);
    if (index === -1) {
      throw new Error(`Profile '${name}' not found`);
    }

    const profile = this.data.profiles[index];
    
    // Update fields
    Object.assign(profile, input);
    profile.updatedAt = new Date().toISOString();

    this.save();
    return profile;
  }

  /**
   * Rename a profile
   */
  rename(oldName: string, newName: string): Profile {
    if (this.exists(newName)) {
      throw new Error(`Profile '${newName}' already exists`);
    }

    const profile = this.getByName(oldName);
    if (!profile) {
      throw new Error(`Profile '${oldName}' not found`);
    }

    profile.name = newName;
    profile.updatedAt = new Date().toISOString();

    // Update default profile reference if needed
    if (this.data.metadata.defaultProfile === oldName) {
      this.data.metadata.defaultProfile = newName;
    }

    this.save();
    return profile;
  }

  /**
   * Delete a profile
   */
  delete(name: string): void {
    const index = this.data.profiles.findIndex(p => p.name === name);
    if (index === -1) {
      throw new Error(`Profile '${name}' not found`);
    }

    this.data.profiles.splice(index, 1);

    // If deleted profile was default, clear default
    if (this.data.metadata.defaultProfile === name) {
      delete this.data.metadata.defaultProfile;
    }

    this.save();
  }

  /**
   * Get the default profile name
   */
  getDefaultProfileName(): string | undefined {
    return this.data.metadata.defaultProfile;
  }

  /**
   * Get the default profile
   */
  getDefaultProfile(): Profile | undefined {
    const name = this.data.metadata.defaultProfile;
    if (name) {
      return this.getByName(name);
    }
    return undefined;
  }

  /**
   * Set the default profile
   */
  setDefaultProfile(name: string): void {
    if (!this.exists(name)) {
      throw new Error(`Profile '${name}' not found`);
    }

    // Clear previous default
    this.data.profiles.forEach(p => {
      p.isDefault = false;
    });

    // Set new default
    const profile = this.getByName(name)!;
    profile.isDefault = true;
    this.data.metadata.defaultProfile = name;

    this.save();
  }

  /**
   * Clear the default profile
   */
  clearDefaultProfile(): void {
    this.data.profiles.forEach(p => {
      p.isDefault = false;
    });
    delete this.data.metadata.defaultProfile;
    this.save();
  }
}
