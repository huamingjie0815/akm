# Specification: Profile Management

## Overview

This specification defines the core profile CRUD operations for the `apikey-manage` CLI tool. Profile management is the primary capability that allows users to create, read, update, and delete LLM API configurations.

## ADDED Requirements

### Requirement: Profile Creation
The system SHALL allow users to create a new profile with the following fields:
- `name` (required, unique): Profile identifier (kebab-case recommended)
- `provider` (required): Provider name (e.g., "openai", "anthropic", "azure", "custom")
- `baseUrl` (required): API endpoint URL
- `modelName` (optional): Default model name
- `apiKey` (optional but recommended): API authentication key
- `isDefault` (optional): Boolean flag to mark as default profile

#### Scenario: Create profile with interactive prompts
- **WHEN** user runs `akm add` or `akm add --interactive`
- **THEN** system prompts for each field interactively
- **AND** system validates required fields are not empty
- **AND** system stores the new profile

#### Scenario: Create profile with command-line arguments
- **WHEN** user runs `akm add --name <name> --provider <provider> --base-url <url> [--model <model>] [--api-key <key>] [--default]`
- **THEN** system creates the profile with provided values
- **AND** system validates that `name` is unique

#### Scenario: Prevent duplicate profile names
- **WHEN** user attempts to create a profile with a name that already exists
- **THEN** system displays error: "Profile '<name>' already exists. Use --force to overwrite or choose a different name."
- **AND** exit with non-zero status code

### Requirement: Profile Listing
The system SHALL allow users to list all stored profiles with summary information.

#### Scenario: List all profiles
- **WHEN** user runs `akm list`
- **THEN** system displays a formatted table with columns: NAME, PROVIDER, MODEL, DEFAULT
- **AND** default profile is marked with asterisk (*) or highlighted

#### Scenario: List with verbose output
- **WHEN** user runs `akm list --verbose` or `akm list -v`
- **THEN** system displays additional columns: BASE_URL, API_KEY_MASKED (showing only last 4 chars)

### Requirement: Profile Details
The system SHALL allow users to view detailed information about a specific profile.

#### Scenario: Show profile details
- **WHEN** user runs `akm show <name>`
- **THEN** system displays all profile fields in a formatted output
- **AND** API key is masked (e.g., "sk-...abcd")
- **AND** indicate if this is the default profile

#### Scenario: Show non-existent profile
- **WHEN** user attempts to show a profile that does not exist
- **THEN** system displays error: "Profile '<name>' not found"
- **AND** suggest: "Run 'akm list' to see available profiles"
- **AND** exit with non-zero status code

### Requirement: Profile Update
The system SHALL allow users to modify existing profile fields.

#### Scenario: Update profile interactively
- **WHEN** user runs `akm update <name>`
- **THEN** system prompts for each field, showing current value as default
- **AND** user can press Enter to keep current value or enter new value
- **AND** system validates and saves changes

#### Scenario: Update profile with command-line arguments
- **WHEN** user runs `akm update <name> [--provider <new>] [--base-url <new>] [--model <new>] [--api-key <new>] [--default]`
- **THEN** system updates only the specified fields
- **AND** validates that at least one field is being updated

#### Scenario: Rename profile
- **WHEN** user runs `akm rename <old-name> <new-name>`
- **THEN** system validates that `<new-name>` does not already exist
- **AND** rename the profile
- **AND** update the default profile reference if old name was default

### Requirement: Profile Deletion
The system SHALL allow users to delete profiles.

#### Scenario: Delete profile with confirmation
- **WHEN** user runs `akm remove <name>` or `akm delete <name>` or `akm rm <name>`
- **THEN** system prompts: "Are you sure you want to delete profile '<name>'? (yes/no)"
- **AND** only deletes if user confirms with "yes" or "y"

#### Scenario: Force delete without confirmation
- **WHEN** user runs `akm remove <name> --force` or `akm rm <name> -f`
- **THEN** system deletes the profile immediately without prompting
- **AND** if deleted profile was default, no profile is marked as default

#### Scenario: Delete non-existent profile
- **WHEN** user attempts to delete a profile that does not exist
- **THEN** system displays error: "Profile '<name>' not found"
- **AND** exit with non-zero status code

### Requirement: Default Profile Management
The system SHALL support marking profiles as default and using it when no profile is explicitly specified.

#### Scenario: Set default profile
- **WHEN** user runs `akm default <name>`
- **THEN** system marks the specified profile as default
- **AND** confirms: "'<name>' is now the default profile"

#### Scenario: Show current default
- **WHEN** user runs `akm default` without arguments
- **THEN** system displays the current default profile name
- **AND** if no default is set, displays: "No default profile set"

#### Scenario: Clear default
- **WHEN** user runs `akm default --clear`
- **THEN** system removes the default designation from all profiles
- **AND** confirms: "Default profile cleared"

#### Scenario: Set non-existent profile as default
- **WHEN** user attempts to set a non-existent profile as default
- **THEN** system displays error: "Profile '<name>' not found"
- **AND** not change the current default (if any)
- **AND** exit with non-zero status code

#### Scenario: Auto-set first profile as default
- **GIVEN** no default profile is currently set
- **WHEN** user creates the first profile (via add command)
- **THEN** system SHALL automatically mark that profile as default
- **AND** inform user: "'<name>' has been set as the default profile (first profile created)"

## NOTES

- This specification focuses on profile CRUD operations and default management
- Implementation details for data storage are covered in the configuration-storage specification
- CLI interface patterns are covered in the cli-interface specification
- These specifications work together to provide the complete CLI tool functionality
