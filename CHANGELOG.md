# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-15

### Added

- Initial release of apikey-manage CLI tool
- **Profile Management**:
  - `add` command to create new profiles with interactive prompts
  - `list` command to display all profiles in table format
  - `show` command to view detailed profile information
  - `update` command to modify existing profiles
  - `remove` command to delete profiles
  - `default` command to set and manage default profile
- **Multi-Provider Support**: OpenAI, Anthropic, Azure, Google, Groq, and custom providers
- **Configuration Storage**: Local JSON file storage with atomic write operations
- **Interactive Mode**: User-friendly prompts for easy profile creation
- **Security**: API keys masked in output, optional encryption support
- **Backup System**: Automatic backups before destructive operations
- **Cross-Platform**: Works on Linux, macOS, and Windows

### Technical Details

- Built with TypeScript for type safety
- Uses Commander.js for CLI framework
- Inquirer.js for interactive prompts
- Chalk for terminal styling
- Zod for schema validation
- Vitest for testing framework

## [Unreleased]

### Planned

- Profile encryption at rest
- Import/export functionality
- Shell completion support
- API connectivity testing
- Plugin system for custom providers

---

## Release Notes Format

### Types of changes

- **Added** for new features.
- **Changed** for changes in existing functionality.
- **Deprecated** for soon-to-be removed features.
- **Removed** for now removed features.
- **Fixed** for any bug fixes.
- **Security** in case of vulnerabilities.

### Version Numbering

Given a version number MAJOR.MINOR.PATCH:

1. MAJOR version when making incompatible API changes,
2. MINOR version when adding functionality in a backwards compatible manner, and
3. PATCH version when making backwards compatible bug fixes.

Additional labels for pre-release and build metadata are available as extensions to the MAJOR.MINOR.PATCH format.
