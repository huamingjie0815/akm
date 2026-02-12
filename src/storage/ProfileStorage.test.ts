import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProfileStorage } from './ProfileStorage';
import { ProfileCreateInput } from '../types/profile';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('ProfileStorage', () => {
  let tempDir: string;
  let storage: ProfileStorage;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'akm-test-'));
    process.env.AKM_CONFIG_DIR = tempDir;
    storage = new ProfileStorage();
  });

  afterEach(() => {
    delete process.env.AKM_CONFIG_DIR;
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('create', () => {
    it('should create a new profile', () => {
      const input: ProfileCreateInput = {
        name: 'test-profile',
        provider: 'openai',
        baseUrl: 'https://api.openai.com',
        apiKey: 'sk-test123',
        isDefault: false,
      };

      const profile = storage.create(input);

      expect(profile.name).toBe('test-profile');
      expect(profile.provider).toBe('openai');
      expect(profile.baseUrl).toBe('https://api.openai.com');
      expect(profile.apiKey).toBe('sk-test123');
      expect(typeof profile.isDefault).toBe('boolean');
      expect(profile.createdAt).toBeDefined();
      expect(profile.updatedAt).toBeDefined();
    });

    it('should throw error when creating profile with duplicate name', () => {
      const input: ProfileCreateInput = {
        name: 'test-profile',
        provider: 'openai',
        baseUrl: 'https://api.openai.com',
      };

      storage.create(input);

      expect(() => storage.create(input)).toThrow(/already exists/);
    });
  });

  describe('getByName', () => {
    it('should return profile by name', () => {
      const input: ProfileCreateInput = {
        name: 'test-profile',
        provider: 'openai',
        baseUrl: 'https://api.openai.com',
      };

      storage.create(input);
      const profile = storage.getByName('test-profile');

      expect(profile).toBeDefined();
      expect(profile?.name).toBe('test-profile');
    });

    it('should return undefined for non-existent profile', () => {
      const profile = storage.getByName('non-existent');
      expect(profile).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update profile fields', () => {
      const input: ProfileCreateInput = {
        name: 'test-profile',
        provider: 'openai',
        baseUrl: 'https://api.openai.com',
      };

      storage.create(input);
      const updated = storage.update('test-profile', {
        baseUrl: 'https://api.anthropic.com',
        provider: 'anthropic',
      });

      expect(updated.baseUrl).toBe('https://api.anthropic.com');
      expect(updated.provider).toBe('anthropic');
    });

    it('should throw error when updating non-existent profile', () => {
      expect(() =>
        storage.update('non-existent', { baseUrl: 'https://test.com' })
      ).toThrow(/not found/);
    });
  });

  describe('delete', () => {
    it('should delete profile', () => {
      const input: ProfileCreateInput = {
        name: 'test-profile',
        provider: 'openai',
        baseUrl: 'https://api.openai.com',
      };

      storage.create(input);
      expect(storage.getByName('test-profile')).toBeDefined();

      storage.delete('test-profile');
      expect(storage.getByName('test-profile')).toBeUndefined();
    });

    it('should throw error when deleting non-existent profile', () => {
      expect(() => storage.delete('non-existent')).toThrow(/not found/);
    });
  });

  describe('getAll', () => {
    it('should return all profiles', () => {
      storage.create({
        name: 'profile-1',
        provider: 'openai',
        baseUrl: 'https://api.openai.com',
      });
      storage.create({
        name: 'profile-2',
        provider: 'anthropic',
        baseUrl: 'https://api.anthropic.com',
      });

      const all = storage.getAll();

      expect(all).toHaveLength(2);
      expect(all.map((p) => p.name)).toContain('profile-1');
      expect(all.map((p) => p.name)).toContain('profile-2');
    });

    it('should return empty array when no profiles', () => {
      const all = storage.getAll();
      expect(all).toEqual([]);
    });
  });

  describe('exists', () => {
    it('should return true for existing profile', () => {
      storage.create({
        name: 'test-profile',
        provider: 'openai',
        baseUrl: 'https://api.openai.com',
      });

      expect(storage.exists('test-profile')).toBe(true);
    });

    it('should return false for non-existent profile', () => {
      expect(storage.exists('non-existent')).toBe(false);
    });
  });
});
