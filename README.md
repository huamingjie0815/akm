# API Key Manage (akm)

[![npm version](https://img.shields.io/npm/v/apikey-manage.svg)](https://www.npmjs.com/package/apikey-manage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**[English](README.md) | [中文](README.zh-CN.md)**

A lightweight CLI tool for managing LLM API configuration profiles. Supports multiple providers including OpenAI, Anthropic, Azure, Google, Groq, and custom providers.

---

## 🚀 Quick Start

```bash
# Install globally
npm install -g apikey-manage

# Or use with npx (no installation required)
npx apikey-manage <command>
```

### Basic Usage

```bash
# Add a new profile (interactive mode)
akm add

# List all profiles
akm list

# Show profile details
akm show my-openai

# Update profile
akm update my-openai --model gpt-4-turbo

# Set default profile
akm default my-openai

# Remove profile
akm remove my-openai
```

---

## ✨ Features

- **🎯 Interactive & Non-interactive Modes** - Support both guided prompts and CLI arguments
- **🔐 Secure Local Storage** - JSON-based storage with atomic write operations and automatic backups
- **🎨 Multi-Provider Support** - Built-in support for OpenAI, Anthropic, Azure, Google, Groq, Ollama, LM Studio, and custom providers
- **⚙️ Protocol Support** - Support both OpenAI and Anthropic API protocols
- **📋 Full CRUD Operations** - Complete Create, Read, Update, Delete functionality for profiles
- **⚡ Default Profile Management** - Quickly switch between different configurations
- **🛡️ Data Safety** - Automatic backups before destructive operations with backup rotation

---

## 📖 Command Reference

### Global Options

All commands support these global options:

```bash
--config-dir <path>    # Custom configuration directory
--no-color            # Disable colored output
--version, -v         # Show version
--help, -h            # Show help
```

### `add` | `create` - Add Profile

Create a new profile with specified configuration.

```bash
akm add [options]
```

**Options:**
- `-n, --name <name>` - Profile identifier name (required)
- `-p, --provider <provider>` - Provider (openai, anthropic, azure, google, groq, ollama, lmstudio, custom)
- `-u, --base-url <url>` - API base URL
- `-m, --model <model>` - AI Model name (e.g., gpt-4, claude-3-opus)
- `-k, --api-key <key>` - API authentication key
- `--protocol <protocol>` - API protocol (openai | anthropic)
- `-d, --default` - Set as default profile
- `-f, --force` - Overwrite if exists
- `-i, --interactive` - Force interactive mode

**Examples:**
```bash
# Interactive mode
akm add

# Non-interactive mode
akm add -n my-openai -p openai -u https://api.openai.com -m gpt-4 -k sk-xxx --protocol openai

# Using Anthropic
akm add -n my-claude -p anthropic -u https://api.anthropic.com -m claude-3-opus-20240229 -k sk-ant-xxx --protocol anthropic
```

### `list` | `ls` - List Profiles

Display all configured profiles.

```bash
akm list [options]
```

**Options:**
- `-v, --verbose` - Show detailed information including protocol
- `-p, --provider <provider>` - Filter by provider

**Examples:**
```bash
# Simple list
akm list

# Detailed list with protocol information
akm list --verbose

# Filter by provider
akm list --provider openai
```

### `show` - Show Profile Details

Display detailed information about a specific profile.

```bash
akm show <name> [options]
```

**Options:**
- `-j, --json` - Output as JSON

**Examples:**
```bash
# Show profile details
akm show my-openai

# Output as JSON
akm show my-openai --json
```

### `update` | `edit` - Update Profile

Modify an existing profile's configuration.

```bash
akm update <name> [options]
```

**Options:** Same as `add` command

**Examples:**
```bash
# Interactive update
akm update my-openai

# Update specific fields
akm update my-openai --model gpt-4-turbo

# Update protocol
akm update my-openai --protocol anthropic
```

### `remove` | `delete` | `rm` - Remove Profile

Delete a profile from the configuration.

```bash
akm remove <name> [options]
```

**Options:**
- `-f, --force` - Skip confirmation

**Examples:**
```bash
# Remove with confirmation
akm remove my-openai

# Force remove without confirmation
akm remove my-openai --force
```

### `default` - Manage Default Profile

Set, show, or clear the default profile.

```bash
akm default [name] [options]
```

**Options:**
- `--clear` - Clear default setting

**Examples:**
```bash
# Show current default
akm default

# Set default profile
akm default my-openai

# Clear default
akm default --clear
```

---

## 🔧 Configuration

### Configuration Directory

Configuration files are stored in:

- **Linux/macOS**: `~/.config/apikey-manage/`
- **Windows**: `%APPDATA%\apikey-manage\`

Customize using the `AKM_CONFIG_DIR` environment variable.

### File Structure

```
~/.config/apikey-manage/
├── profiles.json     # Profile storage
├── settings.json     # Application settings
└── backups/          # Automatic backups
```

### Environment Variables

- `AKM_CONFIG_DIR` - Custom configuration directory
- `NO_COLOR` - Disable colored output

---

## 🛠️ Development

```bash
# Clone repository
git clone https://github.com/yourusername/apikey-manage.git
cd apikey-manage

# Install dependencies
npm install

# Run tests
npm test

# Build project
npm run build

# Run locally
npm start
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Commander.js](https://github.com/tj/commander.js/) for CLI framework
- Interactive prompts powered by [Inquirer](https://github.com/SBoudrias/Inquirer.js/)
- Terminal styling with [Chalk](https://github.com/chalk/chalk)
- Schema validation using [Zod](https://github.com/colinhacks/zod)

---

<p align="center">
  Made with ❤️ by the apikey-manage team
</p>
