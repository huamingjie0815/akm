# Proposal: apikey-manage CLI Tool

## Why

开发者在使用多个大模型 API（如 OpenAI、Anthropic、本地部署的模型等）时，需要频繁切换不同的 API key、base URL、模型名称等配置。目前缺少一个简单轻量的 CLI 工具来集中管理这些 profile 配置，开发者往往需要手动编辑配置文件或环境变量，效率低下且容易出错。

## What Changes

构建一个名为 `apikey-manage`（CLI 简写 `akm`）的 Node.js CLI 工具，支持：

- **添加 profile**：交互式或命令行参数方式创建新的模型配置
- **查看 profile**：列出所有保存的 profile 或查看单个详情
- **删除 profile**：移除不再使用的配置
- **设置默认**：标记某个 profile 为默认配置
- **导出/导入**：支持将配置导出为 JSON 或从 JSON 导入

工具使用 JSON 文件作为本地存储，无需外部数据库。

## Capabilities

### New Capabilities

- `profile-management`: 核心的 profile CRUD 操作，包括添加、查看、更新、删除 profile
- `configuration-storage`: 本地 JSON 文件存储和读取，支持自定义配置目录
- `cli-interface`: 命令行参数解析和交互式提示，支持命令简写 `akm`

### Modified Capabilities

- 无（这是一个全新的工具项目）

## Impact

- **目标平台**: Node.js 18+
- **包管理器**: npm 发布
- **依赖**: 计划使用 `commander` 处理 CLI 参数，`inquirer` 处理交互式输入，`chalk` 美化输出
- **配置文件位置**: `~/.config/apikey-manage/profiles.json`（遵循 XDG 规范）
- **对外接口**: 纯 CLI 工具，不提供 HTTP API 或编程接口
- **向后兼容**: 作为新工具，无需考虑向后兼容

## Notes

- 设计哲学：保持简单，拒绝过度工程化
- 明确不使用 TUI（文本用户界面），保持纯命令行交互
- 考虑未来可能支持：profile 加密存储、团队协作（共享配置）、环境变量覆盖等
