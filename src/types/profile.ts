/**
 * Profile data types and interfaces
 */

/**
 * API Protocol types
 */
export type ApiProtocol = 'openai' | 'anthropic';

/**
 * Profile data structure
 */
export interface Profile {
  /** Unique profile name (identifier) */
  name: string;
  /** Provider name (e.g., "openai", "anthropic", "azure", "custom") */
  provider: string;
  /** API endpoint URL */
  baseUrl: string;
  /** AI Model name (actual model identifier used in API calls) */
  modelName?: string;
  /** API authentication key (optional) */
  apiKey?: string;
  /** API Protocol type (openai or anthropic) */
  protocol?: ApiProtocol;
  /** Whether this is the default profile */
  isDefault?: boolean;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Profile storage data structure
 */
export interface ProfileStorageData {
  /** Storage format version */
  version: string;
  /** Array of profiles */
  profiles: Profile[];
  /** Metadata */
  metadata: {
    /** Last update timestamp */
    lastUpdated: string;
    /** Name of the default profile */
    defaultProfile?: string;
  };
}

/**
 * Profile creation input (omits auto-generated fields)
 */
export type ProfileCreateInput = Omit<Profile, 'createdAt' | 'updatedAt'>;

/**
 * Profile update input (all fields optional, except name and timestamps)
 */
export type ProfileUpdateInput = Partial<Omit<Profile, 'name' | 'createdAt' | 'updatedAt'>>;
