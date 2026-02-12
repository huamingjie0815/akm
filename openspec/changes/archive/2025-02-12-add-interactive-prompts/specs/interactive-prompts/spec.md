# Specification: Interactive Prompts

## Overview

This specification defines the interactive prompts capability for the `akm add` command. When the user runs `akm add` without providing all required parameters, the system SHALL enter an interactive mode that guides the user through entering the required information step by step.

## ADDED Requirements

### Requirement: Interactive Mode Trigger
The system SHALL enter interactive mode when `akm add` is invoked without all required parameters, or when the `--interactive` flag is explicitly provided.

#### Scenario: Automatic interactive mode when missing parameters
- **WHEN** user runs `akm add` without providing all required parameters (name, provider, base-url, api-key)
- **THEN** the system SHALL enter interactive mode and display a welcome message
- **AND** the system SHALL prompt the user for the missing required parameters one by one

#### Scenario: Force interactive mode with flag
- **WHEN** user runs `akm add --interactive` or `akm add -i`
- **THEN** the system SHALL enter interactive mode regardless of whether parameters were provided
- **AND** the system SHALL prompt for all fields, using provided values as defaults

#### Scenario: Non-interactive mode with all parameters
- **WHEN** user runs `akm add` with all required parameters provided via command line
- **AND** the `--interactive` flag is not present
- **THEN** the system SHALL NOT enter interactive mode
- **AND** the system SHALL proceed with the existing non-interactive behavior

### Requirement: Step-by-Step Input Prompts
The system SHALL prompt the user for each required field in a logical order, providing clear instructions and validation for each input.

#### Scenario: Profile name prompt
- **WHEN** the system prompts for the profile name
- **THEN** it SHALL display a clear prompt: "Profile name:"
- **AND** it SHALL provide a description: "A unique identifier for this profile (e.g., my-openai)"
- **AND** it SHALL validate that the name is not empty
- **AND** it SHALL validate that the name is unique (no existing profile with the same name)
- **AND** if validation fails, it SHALL display a clear error message and allow the user to retry

#### Scenario: Provider prompt
- **WHEN** the system prompts for the provider
- **THEN** it SHALL display a clear prompt: "Provider:"
- **AND** it SHALL provide a description: "The LLM provider (e.g., openai, anthropic, azure)"
- **AND** it SHALL offer common providers as a selectable list (openai, anthropic, azure, custom)
- **AND** it SHALL allow the user to enter a custom provider
- **AND** it SHALL validate that the provider is not empty

#### Scenario: Base URL prompt
- **WHEN** the system prompts for the base URL
- **THEN** it SHALL display a clear prompt: "Base URL:"
- **AND** it SHALL provide a description: "The API endpoint URL (e.g., https://api.openai.com)"
- **AND** it SHALL suggest a default value based on the selected provider (if applicable)
- **AND** it SHALL validate that the URL is not empty
- **AND** it SHALL validate that the URL format is valid (starts with http:// or https://)
- **AND** if validation fails, it SHALL display a clear error message and allow the user to retry

#### Scenario: API Key prompt
- **WHEN** the system prompts for the API key
- **THEN** it SHALL display a clear prompt: "API Key:"
- **AND** it SHALL provide a description: "Your API authentication key"
- **AND** it SHALL mask the input (not display characters as typed) for security
- **AND** it SHALL validate that the key is not empty (optional: allow empty with warning)
- **AND** it SHALL provide an option to skip this field (if API key is optional for the provider)

#### Scenario: Model name prompt (optional)
- **WHEN** the system prompts for the model name (after all required fields)
- **THEN** it SHALL display a clear prompt: "Model name (optional):"
- **AND** it SHALL provide a description: "The default model to use (e.g., gpt-4, claude-3-opus)"
- **AND** it SHALL suggest common models based on the selected provider (if applicable)
- **AND** it SHALL allow the user to skip this field (press Enter to skip)

### Requirement: Summary and Confirmation
After all fields have been entered, the system SHALL display a summary of the entered information and prompt for confirmation before creating the profile.

#### Scenario: Display summary
- **WHEN** all required fields have been entered
- **THEN** the system SHALL display a summary of the profile to be created
- **AND** the summary SHALL include:
  - Profile name
  - Provider
  - Base URL
  - API Key (masked, e.g., "sk-...xxxx")
  - Model name (if provided)
- **AND** the summary SHALL clearly indicate if this profile will be set as the default (if it's the first profile)

#### Scenario: Confirm creation
- **WHEN** the summary is displayed
- **THEN** the system SHALL prompt: "Create this profile? (yes/no)"
- **AND** if the user confirms with "yes" or "y", the system SHALL create the profile
- **AND** if the user declines with "no" or "n", the system SHALL cancel and display "Profile creation cancelled"
- **AND** if the user provides an invalid response, the system SHALL display "Please enter 'yes' or 'no'" and prompt again

#### Scenario: Edit before confirming
- **GIVEN** the summary is displayed
- **WHEN** the user wants to modify a field before confirming
- **THEN** (Future enhancement) the system SHALL provide an option to go back and edit specific fields
- **AND** this feature is out of scope for the initial implementation

### Requirement: Error Handling and User Experience
The system SHALL provide clear error messages and allow the user to retry when validation fails, without losing previously entered data.

#### Scenario: Validation error with retry
- **GIVEN** the user is in interactive mode
- **WHEN** the user enters an invalid value for a field (e.g., duplicate profile name)
- **THEN** the system SHALL display a clear error message (e.g., "Profile 'test' already exists")
- **AND** the system SHALL prompt the user to re-enter the value
- **AND** the system SHALL NOT lose any previously entered data for other fields

#### Scenario: Cancel interactive mode
- **GIVEN** the user is in interactive mode
- **WHEN** the user presses Ctrl+C or sends an interrupt signal
- **THEN** the system SHALL gracefully exit interactive mode
- **AND** the system SHALL display a message: "Profile creation cancelled"
- **AND** the system SHALL NOT create a profile
- **AND** the system SHALL NOT leave partial or corrupt data in the configuration

#### Scenario: Help during interactive mode
- **GIVEN** the user is at a prompt in interactive mode
- **WHEN** the user enters "?" or "help"
- **THEN** (Future enhancement) the system SHALL display context-sensitive help for the current field
- **AND** this feature is out of scope for the initial implementation

## NOTES

- This specification focuses on the interactive prompts behavior for the `akm add` command
- The actual implementation should use `@inquirer/prompts` for the interactive functionality
- All validation rules should be consistent with the existing non-interactive mode
- The interactive mode should be tested thoroughly to ensure a smooth user experience
