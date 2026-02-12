# Specification: Configuration Storage

## Overview

This specification defines how the `apikey-manage` CLI tool stores and manages configuration data on the local filesystem. The storage layer provides a simple, reliable, and cross-platform mechanism for persisting profile data and application settings.

## ADDED Requirements

### Requirement: Configuration Directory Management
The system SHALL manage a dedicated configuration directory following XDG Base Directory Specification.

#### Scenario: Default configuration directory
- **WHEN** the system needs to access configuration
- **THEN** it SHALL use the directory at `~/.config/apikey-manage/` on Unix-like systems
- **AND** use `%APPDATA%\apikey-manage\` on Windows
- **AND** create the directory if it does not exist

#### Scenario: Custom configuration directory via environment variable
- **WHEN** environment variable `AKM_CONFIG_DIR` is set
- **THEN** system SHALL use the specified directory as the configuration root
- **AND** create the directory if it does not exist

#### Scenario: Configuration directory creation
- **WHEN** system initializes and configuration directory does not exist
- **THEN** system SHALL create the directory with permissions 0700 (rwx------)
- **AND** create necessary subdirectories

### Requirement: Profile Data Storage
The system SHALL store profile data in a structured JSON file with atomic write operations.

#### Scenario: Profile file structure
- **WHEN** system reads or writes profiles
- **THEN** it SHALL use the file at `{config-dir}/profiles.json`
- **AND** the file SHALL contain a JSON object with:
  - `version`: String, storage format version (e.g., "1.0")
  - `profiles`: Array of profile objects
  - `metadata`: Object with `lastUpdated` timestamp and `defaultProfile` name

#### Scenario: Profile object schema
- **GIVEN** a profile object in storage
- **THEN** it SHALL contain the following fields:
  - `name`: String (required, unique identifier, kebab-case recommended)
  - `provider`: String (required, e.g., "openai", "anthropic", "azure", "custom")
  - `baseUrl`: String (required, valid URL format)
  - `modelName`: String (optional, default model for this provider)
  - `apiKey`: String (optional but recommended, encrypted if encryption is enabled)
  - `isDefault`: Boolean (optional, marks this as the default profile)
  - `createdAt`: String (ISO 8601 timestamp)
  - `updatedAt`: String (ISO 8601 timestamp)

#### Scenario: Atomic write operations
- **WHEN** system writes profile data
- **THEN** it SHALL write to a temporary file first (e.g., `profiles.json.tmp`)
- **AND** only rename to `profiles.json` after successful write
- **AND** use `fsync` to ensure data is written to disk before renaming

#### Scenario: File corruption recovery
- **GIVEN** the profiles.json file is corrupted or unreadable
- **WHEN** system attempts to read profiles
- **THEN** it SHALL detect the corruption
- **AND** attempt to restore from the most recent backup (if available)
- **AND** if no backup exists, create a new empty profile store
- **AND** log the incident to stderr

### Requirement: Settings and Metadata Storage
The system SHALL maintain a separate configuration file for application settings.

#### Scenario: Settings file structure
- **WHEN** system reads or writes settings
- **THEN** it SHALL use the file at `{config-dir}/settings.json`
- **AND** the file SHALL contain a JSON object with:
  - `version`: String, settings format version
  - `encryption`: Object with `enabled` (boolean) and `salt` (string, if encryption is enabled)
  - `ui`: Object with `colors` (boolean) and `interactive` (boolean, default true)
  - `backup`: Object with `enabled` (boolean) and `maxBackups` (number, default 10)

#### Scenario: Default settings initialization
- **WHEN** system initializes for the first time
- **THEN** it SHALL create `settings.json` with default values:
  - `encryption.enabled`: false
  - `ui.colors`: true (if terminal supports it)
  - `backup.enabled`: true
  - `backup.maxBackups`: 10

### Requirement: Backup Management
The system SHALL automatically create backups before destructive operations.

#### Scenario: Automatic backup creation
- **WHEN** system performs a write operation that modifies profiles
- **AND** backup is enabled in settings
- **THEN** system SHALL create a backup before modification
- **AND** store it at `{config-dir}/backups/profiles-{timestamp}.json`

#### Scenario: Backup rotation
- **GIVEN** the number of backup files exceeds `settings.backup.maxBackups`
- **WHEN** a new backup is created
- **THEN** system SHALL remove the oldest backup files to maintain the limit
- **AND** always keep at least one backup even if maxBackups is 0

#### Scenario: Manual backup creation
- **WHEN** user runs `akm backup create [--note <description>]`
- **THEN** system SHALL immediately create a backup
- **AND** if note is provided, include it in the backup filename

#### Scenario: List backups
- **WHEN** user runs `akm backup list`
- **THEN** system SHALL display all available backups with:
  - Filename
  - Creation timestamp
  - Size
  - Number of profiles contained

#### Scenario: Restore from backup
- **WHEN** user runs `akm backup restore <backup-file>`
- **THEN** system SHALL:
  1. Create a backup of current state first
  2. Validate the backup file format
  3. Replace current profiles with backup content
  4. Confirm success to user
- **AND** if backup file is corrupted or invalid, display error without modifying current state
