/**
 * List command - Display all profiles
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { ProfileStorage } from '../../storage/ProfileStorage';

export const listCommand = new Command('list')
  .description('List all profiles')
  .alias('ls')
  .option('-v, --verbose', 'show detailed information')
  .option('-p, --provider <provider>', 'filter by provider')
  .action((options) => {
    try {
      const storage = new ProfileStorage();
      const profiles = storage.getAll();

      if (profiles.length === 0) {
        console.log(chalk.yellow('No profiles found. Run "akm add" to create one.'));
        return;
      }

      // Filter by provider if specified
      let displayProfiles = profiles;
      if (options.provider) {
        displayProfiles = profiles.filter(p => 
          p.provider.toLowerCase().includes(options.provider.toLowerCase())
        );
        
        if (displayProfiles.length === 0) {
          console.log(chalk.yellow(`No profiles found for provider: ${options.provider}`));
          return;
        }
      }

      // Simple table format
      console.log('');
      console.log(chalk.bold('Profiles:'));
      console.log('');

      displayProfiles.forEach(profile => {
        const isDefault = profile.isDefault;
        const defaultMarker = isDefault ? chalk.green(' *') : '';
        
        if (options.verbose) {
          console.log(`${chalk.cyan(profile.name)}${defaultMarker}`);
          console.log(`  Provider: ${profile.provider}`);
          console.log(`  Base URL: ${profile.baseUrl}`);
          if (profile.modelName) {
            console.log(`  Model: ${profile.modelName}`);
          }
          if (profile.protocol) {
            console.log(`  Protocol: ${profile.protocol}`);
          }
          if (profile.apiKey) {
            const masked = profile.apiKey.slice(0, 3) + '...' + profile.apiKey.slice(-4);
            console.log(`  API Key: ${masked}`);
          }
          console.log('');
        } else {
          const model = profile.modelName || '-';
          const protocol = profile.protocol || '-';
          console.log(`  ${chalk.cyan(profile.name.padEnd(20))}${defaultMarker} ${profile.provider.padEnd(15)} ${model.padEnd(20)} ${protocol}`);
        }
      });

      if (!options.verbose) {
        console.log('');
      }
      
      console.log(chalk.gray(`Total: ${displayProfiles.length} profile(s)`));
      console.log('');

    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });
