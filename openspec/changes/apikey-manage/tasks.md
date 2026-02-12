# Implementation Tasks: apikey-manage CLI

## 1. Project Initialization

- [x] 1.1 Initialize Node.js project with TypeScript
  - Run `npm init -y`
  - Install TypeScript: `npm install -D typescript @types/node`
  - Create `tsconfig.json` with ES2020 target
  - Set up `src/` directory structure

- [x] 1.2 Install core dependencies
  - `commander` - CLI framework
  - `inquirer` - Interactive prompts
  - `chalk` - Terminal styling
  - `zod` - Schema validation
  - `ora` - Loading spinners

- [x] 1.3 Configure build and dev scripts
  - Add `build` script to compile TypeScript
  - Add `dev` script with watch mode
  - Add `start` script to run compiled code

- [x] 1.4 Set up npm package configuration
  - Configure `bin` entry for global CLI command
  - Set package name to `apikey-manage`
  - Add CLI bin entry: `akm`
  - Configure `files` to include only necessary files

## 2. Core Infrastructure

- [x] 2.1 Implement configuration directory management
  - Create `src/config/paths.ts` module
  - Implement `getConfigDir()` function (XDG spec)
  - Support `AKM_CONFIG_DIR` environment variable
  - Create directory if not exists with proper permissions

- [x] 2.2 Implement storage layer
  - Create `src/storage/` directory
  - Implement `ProfileStorage` class in `storage.ts`
  - Define profile data types and interfaces
  - Implement atomic file write operations
  - Add JSON serialization/deserialization

- [x] 2.3 Implement settings management
  - Create `src/config/settings.ts`
  - Define settings schema with Zod
  - Implement settings read/write functions
  - Set up default settings

- [x] 2.4 Implement backup system
  - Create `src/backup/` directory
  - Implement `BackupManager` class
  - Add automatic backup before modifications
  - Implement backup rotation based on settings
  - Add manual backup creation function

## 3. CLI Commands Implementation

- [x] 3.1 Set up CLI framework
  - Create `src/cli/index.ts`
  - Initialize Commander with program configuration
  - Set up global options (--config-dir, --no-color, etc.)
  - Configure version and help text

- [x] 3.2 Implement `add` command
  - Create `src/cli/commands/add.ts`
  - Support interactive mode (prompt for fields)
  - Support command-line arguments (--name, --provider, etc.)
  - Validate inputs (name uniqueness, URL format, etc.)
  - Save profile to storage

- [x] 3.3 Implement `list` command
  - Create `src/cli/commands/list.ts`
  - Display profiles in table format
  - Support verbose mode with additional columns
  - Support filtering by provider
  - Handle empty profile list gracefully

- [x] 3.4 Implement `show` command
  - Create `src/cli/commands/show.ts`
  - Display detailed profile information
  - Mask API key for security
  - Support JSON output format
  - Handle non-existent profile error

- [x] 3.5 Implement `update` command
  - Create `src/cli/commands/update.ts`
  - Support interactive mode with current values as defaults
  - Support command-line arguments for specific fields
  - Validate and save changes
  - Handle rename functionality

- [x] 3.6 Implement `remove` command
  - Create `src/cli/commands/remove.ts`
  - Support single profile deletion with confirmation
  - Support force flag to skip confirmation
  - Handle bulk deletion with special confirmation
  - Update default profile if deleted profile was default

- [x] 3.7 Implement `default` command
  - Create `src/cli/commands/default.ts`
  - Set a profile as default
  - Show current default profile
  - Clear default profile setting

## 4. User Experience

- [x] 4.1 Implement help system
  - Create comprehensive help text for all commands
  - Add examples to help output
  - Implement command-specific help
  - Add usage examples

- [x] 4.2 Implement error handling and messages
  - Create `src/utils/errors.ts`
  - Define custom error classes
  - Implement user-friendly error messages
  - Add error codes for programmatic handling

- [x] 4.3 Implement output formatting
  - Create `src/utils/formatters.ts`
  - Implement table formatting utilities
  - Add color/styling support (respect --no-color)
  - Implement JSON output formatting

- [x] 4.4 Implement input validation
  - Create `src/utils/validators.ts`
  - Implement profile name validation
  - Add URL validation
  - Add provider name validation
  - Implement uniqueness checks

## 5. Testing and Quality

- [ ] 5.1 Set up testing framework
  - Install Vitest or Jest
  - Configure test scripts
  - Set up test utilities and helpers

- [ ] 5.2 Write unit tests
  - Test storage layer functions
  - Test validation utilities
  - Test CLI command handlers
  - Mock file system and user inputs

- [ ] 5.3 Write integration tests
  - Test complete command workflows
  - Test CLI output and exit codes
  - Test configuration file operations

- [ ] 5.4 Add code quality tools
  - Set up ESLint with TypeScript support
  - Configure Prettier for code formatting
  - Add pre-commit hooks with Husky

## 6. Documentation and Release

- [ ] 6.1 Write README.md
  - Project description and features
  - Installation instructions
  - Usage examples
  - Configuration options
  - CLI command reference

- [ ] 6.2 Write CHANGELOG.md
  - Initialize with version 1.0.0
  - Document all features
  - Follow semantic versioning

- [ ] 6.3 Prepare for npm publish
  - Verify package.json configuration
  - Add LICENSE file (MIT recommended)
  - Create .npmignore file
  - Test local npm pack

- [ ] 6.4 Create GitHub repository (optional)
  - Initialize git repository
  - Add .gitignore
  - Create initial commit
  - Push to GitHub
  - Set up GitHub Actions for CI/CD (optional)

## 7. Post-Release (Optional)

- [ ] 7.1 Gather user feedback
  - Monitor GitHub issues
  - Collect feature requests
  - Identify bugs and usability issues

- [ ] 7.2 Plan future enhancements
  - Profile encryption at rest
  - Shell completion support
  - Import/export functionality
  - Plugin system for custom providers
  - API connectivity testing

- [ ] 7.3 Maintain and update
  - Keep dependencies updated
  - Fix reported bugs
  - Release patch versions
  - Update documentation
