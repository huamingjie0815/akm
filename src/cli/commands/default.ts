/**
 * Default command - Manage default profile
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { ProfileStorage } from '../../storage/ProfileStorage';

export const defaultCommand = new Command('default')
  .description('Set or show the default profile')
  .argument('[name]', 'profile name to set as default')
  .option('--clear', 'clear the default profile')
  .action((name, options) => {
    try {
      const storage = new ProfileStorage();

      // Clear default
      if (options.clear) {
        storage.clearDefaultProfile();
        console.log(chalk.green('✓ Default profile cleared'));
        return;
      }

      // Show current default
      if (!name) {
        const defaultProfile = storage.getDefaultProfile();
        
        if (defaultProfile) {
          console.log(chalk.green(`Default profile: ${defaultProfile.name}`));
          console.log(chalk.gray(`  Provider: ${defaultProfile.provider}`));
          console.log(chalk.gray(`  Base URL: ${defaultProfile.baseUrl}`));
        } else {
          console.log(chalk.yellow('No default profile set'));
        }
        return;
      }

      // Set new default
      if (!storage.exists(name)) {
        console.error(chalk.red(`Error: Profile '${name}' not found`));
        process.exit(1);
      }

      storage.setDefaultProfile(name);
      console.log(chalk.green(`✓ '${name}' is now the default profile`));

    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });
