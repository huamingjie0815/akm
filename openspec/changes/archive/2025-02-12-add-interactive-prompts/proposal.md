# Proposal: Add Interactive Prompts for akm add

## Why

当前 `akm add` 命令要求用户通过命令行参数提供所有必需信息（name、provider、base-url、api-key），这在交互式使用时不够友好。用户需要记住所有参数的名称和格式，且容易出错。通过添加交互式提示功能，可以引导用户逐步输入必要信息，提供更友好的使用体验。

## What Changes

- **新增交互式提示模式**: 当 `akm add` 命令执行时，如果缺少必需参数（name、provider、base-url、api-key），自动进入交互式提示模式
- **分步骤输入**: 依次提示用户输入 name、provider、base-url、api-key，每个步骤都有清晰的说明
- **输入验证**: 对每个输入进行实时验证，确保数据格式正确
- **可选参数提示**: 提示用户输入可选参数（model），但允许跳过
- **确认步骤**: 所有信息输入完成后，显示摘要供用户确认
- **保留非交互式模式**: 原有通过命令行参数直接添加的方式仍然可用

## Capabilities

### New Capabilities

- `interactive-prompts`: 为 `akm add` 命令提供交互式提示功能，支持分步骤输入 profile 信息

### Modified Capabilities

- `cli-interface`: 修改 `akm add` 命令的行为，当缺少必需参数时自动进入交互式模式，而非直接报错退出。原有通过命令行参数的工作方式保持不变。

## Impact

- **代码变更**: 需要新增交互式提示模块，修改 `akm add` 命令的实现
- **依赖变更**: 需要添加 `inquirer` 或 `@inquirer/prompts` 依赖用于交互式提示
- **向后兼容**: 完全向后兼容，原有通过命令行参数的方式仍然可用
- **用户体验**: 显著提升交互式使用体验，降低学习成本
