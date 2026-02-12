/**
 * Show command - Display profile details
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { ProfileStorage } from '../../storage/ProfileStorage';

export const showCommand = new Command('show')
  .description('Show profile details')
  .argument('<name>', 'profile name')
  .option('-j, --json', 'output as JSON')
  .action((name, options) => {
    try {
      const storage = new ProfileStorage();
      const profile = storage.getByName(name);

      if (!profile) {
        console.error(chalk.red(`Error: Profile '${name}' not found`));
        console.log(chalk.gray("Run 'akm list' to see available profiles."));
        process.exit(1);
      }

      if (options.json) {
        console.log(JSON.stringify(profile, null, 2));
        return;
      }

      // Formatted output
      console.log('');
      console.log(chalk.bold('Profile Details:'));
      console.log('');
      console.log(`  Name:      ${chalk.cyan(profile.name)}${profile.isDefault ? chalk.green(' (default)') : ''}`);
      console.log(`  Provider:  ${profile.provider}`);
      console.log(`  Base URL:  ${profile.baseUrl}`);
      
      if (profile.modelName) {
        console.log(`  Model:     ${profile.modelName}`);
      }
      
      if (profile.apiKey) {
        console.log(`  API Key:   ${profile.apiKey}`);
      }
      
      console.log(`  Created:   ${profile.createdAt}`);
      console.log(`  Updated:   ${profile.updatedAt}`);
      console.log('');

    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });
