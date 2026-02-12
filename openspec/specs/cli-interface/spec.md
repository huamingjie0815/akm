# Specification: Configuration Storage

## Overview

This specification defines the storage layer for the `apikey-manage` CLI tool. The storage system is responsible for persisting profile data, application settings, and backup management on the local filesystem.

## ADDED Requirements

### Requirement: Configuration Directory Management
The system SHALL manage a dedicated configuration directory following XDG Base Directory Specification.

#### Scenario: Default configuration directory on Unix
- **WHEN** the system needs to access configuration on Unix-like systems (Linux, macOS)
- **THEN** it SHALL use the directory at `~/.config/apikey-manage/`
- **AND** create the directory if it does not exist
- **AND** set directory permissions to 0700 (rwx------)

#### Scenario: Default configuration directory on Windows
- **WHEN** the system needs to access configuration on Windows
- **THEN** it SHALL use the directory at `%APPDATA%\apikey-manage\`
- **AND** create the directory if it does not exist
- **AND** handle Windows-specific path conventions

#### Scenario: Custom configuration directory via environment variable
- **WHEN** environment variable `AKM_CONFIG_DIR` is set to a valid path
- **THEN** system SHALL use the specified directory as the configuration root
- **AND** expand environment variables in the path if present
- **AND** create the directory (and all parent directories) if they do not exist
- **AND** validate that the directory is writable

#### Scenario: Invalid custom configuration directory
- **WHEN** environment variable `AKM_CONFIG_DIR` is set to an invalid or non-writable path
- **THEN** system SHALL display error: "Invalid configuration directory '<path>': <reason>"
- **AND** fall back to the default configuration directory
- **AND** log the fallback to stderr (in verbose mode)

### Requirement: Profile Data File
The system SHALL store profile data in a structured JSON file with atomic write operations.

#### Scenario: Profiles file structure
- **WHEN** system reads or writes profiles
- **THEN** it SHALL use the file at `{config-dir}/profiles.json`
- **AND** the file SHALL contain a JSON object with the following structure:
```json
{
  "version": "1.0",
  "profiles": [...],
  "metadata": {
    "lastUpdated": "2024-01-15T10:30:00Z",
    "defaultProfile": "my-profile",
    "count": 5
  }
}
```

#### Scenario: Profile object schema
- **GIVEN** a profile object in storage
- **THEN** it SHALL contain the following fields:
  - `name`: String (required, unique identifier within the file)
  - `provider`: String (required, lowercase recommended)
  - `baseUrl`: String (required, valid URL)
  - `modelName`: String (optional, nullable)
  - `apiKey`: String (optional, may be encrypted)
  - `isDefault`: Boolean (optional, defaults to false)
  - `createdAt`: String (ISO 8601 format, e.g., "2024-01-15T10:30:00Z")
  - `updatedAt`: String (ISO 8601 format)

#### Scenario: Atomic write operations
- **WHEN** system writes profile data
- **THEN** it SHALL follow this procedure:
  1. Write data to a temporary file: `{config-dir}/profiles.json.tmp.{random-suffix}`
  2. Call `fsync()` on the file descriptor to ensure data is written to disk
  3. Close the file descriptor
  4. Rename the temporary file to the target: `{config-dir}/profiles.json`
  5. If atomic rename is not supported, use best-effort approach with error handling
- **AND** if any step fails, clean up the temporary file
- **AND** ensure the original file remains intact if the operation fails

#### Scenario: File locking for concurrent access
- **GIVEN** multiple instances of the tool might access the file simultaneously
- **WHEN** system reads or writes the profiles file
- **THEN** it SHOULD implement advisory file locking where supported:
  - On Unix: Use `flock()` or lockf()
  - On Windows: Use LockFile/UnlockFile APIs
- **AND** wait for lock with a timeout (e.g., 5 seconds)
- **AND** if lock cannot be acquired, display error: "Another instance is accessing the configuration. Please try again."

### Requirement: Settings File
The system SHALL maintain a separate configuration file for application settings.

#### Scenario: Settings file structure
- **WHEN** system reads or writes settings
- **THEN** it SHALL use the file at `{config-dir}/settings.json`
- **AND** the file SHALL contain a JSON object with:
```json
{
  "version": "1.0",
  "encryption": {
    "enabled": false,
    "salt": null
  },
  "ui": {
    "colors": true,
    "interactive": true,
    "tableStyle": "compact"
  },
  "backup": {
    "enabled": true,
    "maxBackups": 10,
    "retentionDays": 30
  }
}
```

#### Scenario: Default settings initialization
- **WHEN** system initializes for the first time
- **THEN** it SHALL create `settings.json` with default values:
  - `encryption.enabled`: false
  - `encryption.salt`: null (generated when encryption is first enabled)
  - `ui.colors`: true (auto-detected based on terminal support)
  - `ui.interactive`: true
  - `ui.tableStyle`: "compact"
  - `backup.enabled`: true
  - `backup.maxBackups`: 10
  - `backup.retentionDays`: 30

#### Scenario: Settings schema validation
- **WHEN** system reads settings.json
- **THEN** it SHALL validate the structure against the expected schema
- **AND** if validation fails:
  - Display warning: "Settings file is corrupted or incompatible. Using defaults."
  - Log details to stderr (in verbose mode)
  - Use default settings for the session
  - Offer to reset settings file on next run

### Requirement: Backup Management
The system SHALL automatically create backups before destructive operations and manage backup lifecycle.

#### Scenario: Automatic backup creation
- **WHEN** system performs any of the following operations:
  - Adding a new profile
  - Updating an existing profile
  - Deleting a profile
  - Renaming a profile
  - Importing profiles
- **AND** backup is enabled in settings (settings.backup.enabled is true)
- **THEN** system SHALL create a backup before performing the operation
- **AND** store it at `{config-dir}/backups/profiles-{timestamp}.json`

#### Scenario: Backup file naming convention
- **WHEN** system creates a backup file
- **THEN** the filename SHALL follow the format: `profiles-{timestamp}-{optional-note}.json`
- **AND** timestamp SHALL be in ISO 8601 basic format: YYYYMMDDTHHMMSS (e.g., 20240115T103045)
- **AND** if the operation has an associated note (e.g., manual backup with note), include it in the filename (sanitized)

#### Scenario: Backup directory structure
- **WHEN** system creates a backup
- **THEN** it SHALL store the file in `{config-dir}/backups/`
- **AND** create the directory if it does not exist
- **AND** not create backups if the backup directory cannot be created (log warning)

#### Scenario: Backup rotation
- **GIVEN** the number of backup files in the backup directory exceeds `settings.backup.maxBackups`
- **WHEN** a new backup is created
- **THEN** system SHALL remove the oldest backup files to maintain the limit
- **AND** determine age by file modification time or timestamp in filename
- **AND** always keep at least one backup even if maxBackups is set to 0

#### Scenario: Backup retention by age
- **GIVEN** settings.backup.retentionDays is set (e.g., 30 days)
- **WHEN** system performs backup cleanup (periodically or on startup)
- **THEN** system SHALL remove backup files older than retentionDays
- **AND** this cleanup is independent of maxBackups limit

#### Scenario: Manual backup creation
- **WHEN** user runs `akm backup create [--note <description>]`
- **THEN** system SHALL immediately create a backup of the current profiles
- **AND** if note is provided, include it in the backup filename (sanitized)
- **AND** display confirmation with the backup filename
- **AND** bypass the normal backup rotation (manual backups are kept separately or marked)

#### Scenario: List backups
- **WHEN** user runs `akm backup list`
- **THEN** system SHALL display all available backups in a table with columns:
  - FILENAME: The backup filename
  - CREATED: Human-readable timestamp (e.g., "2024-01-15 10:30:45")
  - SIZE: File size (human-readable, e.g., "2.5 KB")
  - PROFILES: Number of profiles contained in the backup
- **AND** sort by creation time (newest first)
- **AND** indicate if a backup is corrupted or unreadable

#### Scenario: Backup list filtering
- **WHEN** user runs `akm backup list --since <date>`
- **THEN** system SHALL only display backups created on or after the specified date
- **AND** support ISO 8601 date format (YYYY-MM-DD)

#### Scenario: Backup details
- **WHEN** user runs `akm backup show <backup-file>`
- **THEN** system SHALL display detailed information about the backup:
  - Full file path
  - Creation timestamp
  - File size
  - Number of profiles
  - List of profile names contained
  - Format version
  - Whether the file is encrypted
- **AND** if the file is corrupted, indicate this and show any recoverable information

#### Scenario: Restore from backup
- **WHEN** user runs `akm backup restore <backup-file>`
- **THEN** system SHALL:
  1. Validate that the backup file exists and is readable
  2. Validate the backup file format and integrity
  3. Create a backup of the current state first (unless --no-backup flag)
  4. Prompt for confirmation: "This will replace all current profiles with the backup. Continue? (yes/no)"
  5. If confirmed, replace current profiles with backup content
  6. Display summary: "Restored X profiles from backup"
- **AND** if backup file is encrypted, prompt for password to decrypt

#### Scenario: Restore with force
- **WHEN** user runs `akm backup restore <backup-file> --force` or `-f`
- **THEN** system SHALL skip the confirmation prompt
- **AND** proceed directly with the restore operation

#### Scenario: Restore to new location
- **WHEN** user runs `akm backup restore <backup-file> --to <config-dir>`
- **THEN** system SHALL restore the backup to the specified configuration directory
- **AND** create the directory if it does not exist
- **AND** not affect the current active configuration

#### Scenario: Restore corrupted backup
- **WHEN** user attempts to restore a corrupted or invalid backup file
- **THEN** system SHALL:
  - Detect the corruption during validation
  - Display error: "Backup file is corrupted or invalid: <reason>"
  - If possible, attempt to recover partial data and inform user
  - Exit with non-zero status code without modifying current profiles

#### Scenario: Delete backup
- **WHEN** user runs `akm backup delete <backup-file>` or `akm backup rm <backup-file>`
- **THEN** system SHALL:
  - Validate that the file exists and is a valid backup
  - Prompt for confirmation: "Are you sure you want to delete backup '<filename>'? (yes/no)"
  - If confirmed, delete the file
  - Confirm: "Backup '<filename>' deleted"
- **AND** if --force flag is provided, skip confirmation

#### Scenario: Delete all backups
- **WHEN** user runs `akm backup clear` or `akm backup delete --all`
- **THEN** system SHALL:
  - Count the number of backups to be deleted
  - Prompt for confirmation: "This will delete all X backups. This action cannot be undone. Type 'delete-all' to confirm:"
  - Require user to type the exact phrase "delete-all" for confirmation
  - If confirmed, delete all backup files
  - Display summary: "Deleted X backups"

### Requirement: Error Handling and User Feedback
The system SHALL provide clear, helpful error messages and user feedback.

#### Scenario: Input validation errors
- **WHEN** user provides invalid input
- **THEN** system SHALL:
  - Display a clear, specific error message explaining what is wrong
  - Show the invalid value (if safe to display)
  - Provide guidance on how to fix the issue
  - Exit with appropriate non-zero status code

#### Scenario: File operation errors
- **WHEN** a file operation fails (read, write, delete)
- **THEN** system SHALL:
  - Display error: "<Operation> failed: <filepath> - <system error message>"
  - Provide context about what operation was being performed
  - Suggest possible solutions (check permissions, disk space, etc.)

#### Scenario: Missing dependencies or environment issues
- **WHEN** system detects missing Node.js version or other environment issues
- **THEN** system SHALL:
  - Display clear error message explaining the issue
  - Specify the required version or configuration
  - Provide instructions on how to resolve the issue

#### Scenario: Operation progress indication
- **WHEN** performing an operation that may take time (e.g., loading many profiles)
- **THEN** system SHALL:
  - Display a progress indicator (spinner or progress bar)
  - Show what operation is being performed
  - Update the user on progress (e.g., "Loading profile 5 of 20...")
- **NOTE**: For MVP, simple spinner or periodic updates may be sufficient

#### Scenario: Successful operation confirmation
- **WHEN** an operation completes successfully
- **THEN** system SHALL:
  - Display a clear success message
  - Include relevant details (e.g., profile name, number of items affected)
  - Use appropriate formatting (green color if supported)
  - For destructive operations, reassure the user (e.g., "Profile deleted successfully")

### Requirement: Environment and Context Awareness
The system SHALL be aware of its execution environment and adapt accordingly.

#### Scenario: Terminal capability detection
- **WHEN** system starts
- **THEN** it SHALL detect terminal capabilities:
  - Color support (number of colors: none, 16, 256, truecolor)
  - Terminal width (number of columns)
  - Interactive vs non-interactive mode (is stdin a TTY?)
- **AND** adjust output formatting accordingly

#### Scenario: Non-interactive mode detection
- **WHEN** system detects it is running in non-interactive mode (no TTY)
- **THEN** it SHALL:
  - Not prompt for interactive input
  - Fail with error if required information is not provided via arguments
  - Use default values for optional settings
  - Suppress progress indicators that require terminal control

#### Scenario: CI/CD environment detection
- **WHEN** system detects it is running in a CI/CD environment (via common environment variables like CI, GITHUB_ACTIONS, etc.)
- **THEN** it SHALL:
  - Automatically enable non-interactive mode
  - Suppress color output (unless explicitly requested)
  - Optimize output for log files (no progress bars, clear error messages)

#### Scenario: Respect user preferences
- **WHEN** user sets environment variables like `NO_COLOR` or `FORCE_COLOR`
- **THEN** system SHALL respect these preferences over auto-detection
- **AND** provide consistent behavior across different terminal emulators

## NOTES

- This specification focuses on CLI interaction patterns and user experience
- Implementation of storage operations is covered in the configuration-storage specification
- Business logic for profile CRUD is covered in the profile-management specification
- These specifications work together to provide the complete CLI tool functionality
- Future enhancements may include: shell completion plugins, plugin system for custom providers
