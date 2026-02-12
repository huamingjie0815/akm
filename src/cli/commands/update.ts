/**
 * Update command - Update an existing profile
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { input, select, password, confirm } from '@inquirer/prompts';
import { ProfileStorage } from '../../storage/ProfileStorage';
import { ApiProtocol } from '../../types/profile';

// Provider defaults (same as in add.ts)
const PROVIDER_DEFAULTS: Record<string, string> = {
  openai: 'https://api.openai.com',
  anthropic: 'https://api.anthropic.com',
  azure: 'https://{resource-name}.openai.azure.com',
  google: 'https://generativelanguage.googleapis.com',
  groq: 'https://api.groq.com/openai/v1',
  ollama: 'http://localhost:11434',
  lmstudio: 'http://localhost:1234/v1',
  custom: '',
};

export const updateCommand = new Command('update')
  .description('Update an existing profile')
  .alias('edit')
  .argument('<name>', 'profile name to update')
  .option('-p, --provider <provider>', 'update provider')
  .option('-u, --base-url <url>', 'update base URL')
  .option('-m, --model <model>', 'update AI model name')
  .option('-k, --api-key <key>', 'update API key')
  .option('--protocol <protocol>', 'update API protocol (openai or anthropic)')
  .option('-d, --default', 'set as default profile')
  .option('-i, --interactive', 'use interactive mode')
  .action(async (name, options) => {
    try {
      const storage = new ProfileStorage();
      const profile = storage.getByName(name);

      if (!profile) {
        console.error(chalk.red(`Error: Profile '${name}' not found`));
        process.exit(1);
      }

      // Check if any update options were provided
      const hasUpdates = options.provider || options.baseUrl || 
                         options.model !== undefined || options.apiKey !== undefined || 
                         options.protocol !== undefined || options.default !== undefined;

      let updates: Record<string, unknown> = {};

      if (options.interactive || !hasUpdates) {
        // Interactive mode
        console.log(chalk.cyan(`\n✏️  Update profile: ${name}\n`));
        
        // Update provider
        const updateProvider = await confirm({
          message: 'Update provider?',
          default: false,
        });
        
        if (updateProvider) {
          const providerChoices = Object.keys(PROVIDER_DEFAULTS).map(p => ({
            name: p === 'custom' ? 'Custom (other provider)' : p.charAt(0).toUpperCase() + p.slice(1),
            value: p,
          }));
          
          let provider = await select({
            message: 'New provider:',
            choices: providerChoices,
          });

          // If custom provider selected, ask for the custom name
          if (provider === 'custom') {
            provider = await input({
              message: 'Enter custom provider name:',
              validate: (value) => {
                if (!value.trim()) return 'Provider name is required';
                return true;
              },
            });
          }
          
          updates.provider = provider;
        }

        // Update base URL
        const updateBaseUrl = await confirm({
          message: 'Update base URL?',
          default: false,
        });
        
        if (updateBaseUrl) {
          updates.baseUrl = await input({
            message: 'New base URL:',
            default: profile.baseUrl,
            validate: (value) => {
              if (!value.trim()) return 'Base URL is required';
              if (!value.startsWith('http://') && !value.startsWith('https://')) {
                return 'Base URL must start with http:// or https://';
              }
              return true;
            },
          });
        }

        // Update API key
        const updateApiKey = await confirm({
          message: 'Update API key?',
          default: false,
        });
        
        if (updateApiKey) {
          updates.apiKey = await password({
            message: 'New API key:',
            mask: '*',
            validate: (value) => {
              if (!value.trim()) return 'API key is required';
              return true;
            },
          });
        }

        // Update model
        const updateModel = await confirm({
          message: 'Update model name?',
          default: false,
        });
        
        if (updateModel) {
          updates.modelName = await input({
            message: 'New model name:',
            default: profile.modelName || '',
          }) || undefined;
        }

        // Update protocol
        const updateProtocol = await confirm({
          message: 'Update API protocol?',
          default: false,
        });
        
        if (updateProtocol) {
          const protocolChoices = [
            { name: 'OpenAI', value: 'openai' },
            { name: 'Anthropic', value: 'anthropic' },
          ];
          
          updates.protocol = await select({
            message: 'API Protocol:',
            choices: protocolChoices,
          }) as ApiProtocol;
        }

        // Check if any updates were made
        if (Object.keys(updates).length === 0) {
          console.log(chalk.yellow('\nNo changes made to profile'));
          process.exit(0);
        }

        // Confirm updates
        console.log(chalk.cyan('\n📋 Changes to be made:\n'));
        Object.entries(updates).forEach(([key, value]) => {
          if (key === 'apiKey' && typeof value === 'string') {
            const masked = value.slice(0, 3) + '...' + value.slice(-4);
            console.log(`  ${key}: ${chalk.white(masked)}`);
          } else {
            console.log(`  ${key}: ${chalk.white(String(value))}`);
          }
        });
        console.log('');

        const confirmed = await confirm({
          message: 'Apply these changes?',
          default: true,
        });

        if (!confirmed) {
          console.log(chalk.yellow('Update cancelled'));
          process.exit(0);
        }

      } else {
        // Non-interactive mode - use command line options
        if (options.provider) updates.provider = options.provider;
        if (options.baseUrl) updates.baseUrl = options.baseUrl;
        if (options.model !== undefined) updates.modelName = options.model || undefined;
        if (options.apiKey !== undefined) updates.apiKey = options.apiKey || undefined;
        if (options.protocol !== undefined) updates.protocol = options.protocol as ApiProtocol;
        if (options.default !== undefined) updates.isDefault = options.default;
      }

      // Apply updates
      const updatedProfile = storage.update(name, updates);

      console.log(chalk.green(`\n✓ Profile '${updatedProfile.name}' updated successfully`));
      
      if (updatedProfile.isDefault) {
        console.log(chalk.gray('  (set as default profile)'));
      }

    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });
