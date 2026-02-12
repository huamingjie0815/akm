/**
 * Remove command - Delete a profile
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { confirm } from '@inquirer/prompts';
import { ProfileStorage } from '../../storage/ProfileStorage';

export const removeCommand = new Command('remove')
  .description('Remove a profile')
  .alias('delete')
  .alias('rm')
  .argument('<name>', 'profile name to remove')
  .option('-f, --force', 'skip confirmation')
  .action(async (name, options) => {
    try {
      const storage = new ProfileStorage();

      // Check if profile exists
      if (!storage.exists(name)) {
        console.error(chalk.red(`Error: Profile '${name}' not found`));
        process.exit(1);
      }

      // Confirm deletion unless --force is used
      if (!options.force) {
        const confirmed = await confirm({
          message: `Are you sure you want to delete profile '${name}'?`,
          default: false,
        });

        if (!confirmed) {
          console.log(chalk.yellow('Deletion cancelled'));
          process.exit(0);
        }
      }

      // Delete the profile
      storage.delete(name);

      console.log(chalk.green(`✓ Profile '${name}' deleted successfully`));

    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });
