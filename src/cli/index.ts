#!/usr/bin/env node

/**
 * CLI entry point
 * Sets up Commander and registers all commands
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { loadSettings } from '../config/settings';
import { ensureConfigDir } from '../config/paths';

// Import command handlers
import { addCommand } from './commands/add';
import { listCommand } from './commands/list';
import { showCommand } from './commands/show';
import { updateCommand } from './commands/update';
import { removeCommand } from './commands/remove';
import { defaultCommand } from './commands/default';

// Read package.json for version
const packageJson = require('../../package.json');

export function run(): void {
  // Ensure config directory exists
  ensureConfigDir();
  
  // Load settings
  const settings = loadSettings();
  
  // Disable colors if requested
  if (!settings.ui.colors) {
    chalk.level = 0;
  }

  // Create program
  const program = new Command();

  program
    .name('apikey-manage')
    .description('CLI tool to manage LLM API profiles')
    .version(packageJson.version)
    .configureOutput({
      writeErr: (str) => process.stdout.write(str),
      outputError: (str, write) => write(chalk.red(str)),
    });

  // Register global options
  program
    .option('--config-dir <path>', 'use custom configuration directory')
    .option('--no-color', 'disable colored output')
    .option('-v, --verbose', 'enable verbose output')
    .option('-q, --quiet', 'suppress non-essential output');

  // Register commands
  program.addCommand(addCommand);
  program.addCommand(listCommand);
  program.addCommand(showCommand);
  program.addCommand(updateCommand);
  program.addCommand(removeCommand);
  program.addCommand(defaultCommand);

  // Parse arguments
  program.parse();
}
