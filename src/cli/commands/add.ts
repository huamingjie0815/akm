/**
 * Add command - Create a new profile
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { input, select, password, confirm } from '@inquirer/prompts';
import { ProfileStorage } from '../../storage/ProfileStorage';
import { ProfileCreateInput, ApiProtocol } from '../../types/profile';

// Common providers with their default base URLs
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

// Common models per provider
const PROVIDER_MODELS: Record<string, string[]> = {
  openai: ['gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  azure: ['gpt-4', 'gpt-4-turbo', 'gpt-35-turbo'],
  google: ['gemini-pro', 'gemini-ultra'],
  groq: ['llama3-70b', 'llama3-8b', 'mixtral-8x7b', 'gemma-7b'],
  ollama: ['llama3', 'mistral', 'codellama', 'phi3'],
  lmstudio: ['local-model'],
  custom: [],
};

export const addCommand = new Command('add')
  .description('Add a new profile')
  .alias('create')
  .option('-n, --name <name>', 'profile name (identifier)')
  .option('-p, --provider <provider>', 'provider (openai, anthropic, etc.)')
  .option('-u, --base-url <url>', 'base URL')
  .option('-m, --model <model>', 'AI model name (e.g., gpt-4, claude-3-opus)')
  .option('-k, --api-key <key>', 'API key')
  .option('--protocol <protocol>', 'API protocol (openai or anthropic)')
  .option('-d, --default', 'set as default profile')
  .option('-f, --force', 'overwrite if exists')
  .option('-i, --interactive', 'force interactive mode')
  .action(async (options) => {
    try {
      const storage = new ProfileStorage();

      // Determine if we should use interactive mode
      const hasAllRequired = options.name && options.provider && options.baseUrl && options.apiKey;
      const interactive = options.interactive || !hasAllRequired;

      let profileData: ProfileCreateInput;

      if (interactive) {
        // Interactive mode
        console.log(chalk.cyan('\n📝 Create a new profile\n'));
        
        // Get profile name
        const name = options.name || await input({
          message: 'Profile name:',
          validate: (value) => {
            if (!value.trim()) return 'Profile name is required';
            if (storage.exists(value.trim())) return `Profile '${value.trim()}' already exists`;
            return true;
          },
        });

        // Get provider
        const providerChoices = Object.keys(PROVIDER_DEFAULTS).map(p => ({
          name: p === 'custom' ? 'Custom (other provider)' : p.charAt(0).toUpperCase() + p.slice(1),
          value: p,
        }));

        let provider = options.provider || await select({
          message: 'Provider:',
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

        // Get base URL (with default based on provider)
        const defaultBaseUrl = PROVIDER_DEFAULTS[provider] || '';
        const baseUrl = options.baseUrl || await input({
          message: 'Base URL:',
          default: defaultBaseUrl,
          validate: (value) => {
            if (!value.trim()) return 'Base URL is required';
            if (!value.startsWith('http://') && !value.startsWith('https://')) {
              return 'Base URL must start with http:// or https://';
            }
            return true;
          },
        });

        // Get API key
        const apiKey = options.apiKey || await password({
          message: 'API Key:',
          mask: '*',
          validate: (value) => {
            if (!value.trim()) return 'API Key is required';
            return true;
          },
        });

        // Get protocol (optional, default based on provider)
        const protocolChoices = [
          { name: 'OpenAI', value: 'openai' },
          { name: 'Anthropic', value: 'anthropic' },
        ];
        
        let protocol: ApiProtocol | undefined = options.protocol;
        
        if (!protocol) {
          const useProtocol = await confirm({
            message: 'Would you like to specify an API protocol?',
            default: false,
          });
          
          if (useProtocol) {
            protocol = await select({
              message: 'API Protocol:',
              choices: protocolChoices,
            }) as ApiProtocol;
          } else {
            // Auto-detect based on provider
            protocol = provider === 'anthropic' ? 'anthropic' : 'openai';
          }
        }

        // Get model name (optional)
        const modelChoices = PROVIDER_MODELS[provider] || [];
        let modelName = options.model;
        
        if (!modelName && modelChoices.length > 0) {
          const useModel = await confirm({
            message: 'Would you like to set a default model?',
            default: false,
          });
          
          if (useModel) {
            modelName = await select({
              message: 'Model:',
              choices: modelChoices.map(m => ({ name: m, value: m })),
            });
          }
        }

        // Confirm creation
        console.log(chalk.cyan('\n📋 Profile Summary:\n'));
        console.log(`  Name:     ${chalk.white(name)}`);
        console.log(`  Provider: ${chalk.white(provider)}`);
        console.log(`  Base URL: ${chalk.white(baseUrl)}`);
        console.log(`  API Key:  ${chalk.white(apiKey.slice(0, 3) + '...' + apiKey.slice(-4))}`);
        if (modelName) {
          console.log(`  Model:    ${chalk.white(modelName)}`);
        }
        console.log(`  Protocol: ${chalk.white(protocol || 'auto-detected')}`);
        console.log('');

        const confirmed = await confirm({
          message: 'Create this profile?',
          default: true,
        });

        if (!confirmed) {
          console.log(chalk.yellow('Profile creation cancelled'));
          process.exit(0);
        }

        profileData = {
          name: name.trim(),
          provider: provider.trim(),
          baseUrl: baseUrl.trim(),
          modelName: modelName?.trim() || undefined,
          apiKey: apiKey.trim(),
          protocol: protocol,
          isDefault: options.default,
        };
      } else {
        // Non-interactive mode
        profileData = {
          name: options.name,
          provider: options.provider,
          baseUrl: options.baseUrl,
          modelName: options.model,
          apiKey: options.apiKey,
          protocol: options.protocol || (options.provider === 'anthropic' ? 'anthropic' : 'openai'),
          isDefault: options.default,
        };
      }

      // Check if profile already exists
      if (storage.exists(profileData.name)) {
        if (!options.force) {
          console.error(chalk.red(`Error: Profile '${profileData.name}' already exists.`));
          console.log(chalk.gray('Use --force to overwrite or choose a different name.'));
          process.exit(1);
        }
        
        // Delete existing profile
        storage.delete(profileData.name);
      }

      // Create profile
      const profile = storage.create(profileData);

      console.log(chalk.green(`✓ Profile '${profile.name}' created successfully`));
      
      if (profile.isDefault) {
        console.log(chalk.gray('  (set as default profile)'));
      }

    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });
