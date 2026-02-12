# Design: apikey-manage CLI Tool

## Context

本项目将构建一个轻量级的 Node.js CLI 工具 `apikey-manage`（命令简写 `akm`），用于帮助开发者管理多个大模型 API 的配置信息（profile）。

**技术栈**:
- Node.js 18+ (TypeScript)
- CLI 框架: `commander` (命令解析) + `inquirer` (交互式输入)
- 存储: 本地 JSON 文件 (~/.config/apikey-manage/profiles.json)
- 美化输出: `chalk` + `table` (格式化表格)
- 类型安全: `zod` (运行时类型校验)

## Goals / Non-Goals

**Goals:**
- 简单易用的 CLI 界面，支持命令式和交互式两种操作模式
- 安全的本地存储（JSON 文件），API Key 可选择加密存储
- 支持多 profile 管理（添加、查看、切换、删除）
- 完善的帮助文档和错误提示
- 发布到 npm，全局安装后可直接使用 `akm` 命令

**Non-Goals:**
- 不支持 TUI (Text User Interface)，保持纯命令行交互
- 不实现远程同步或云端存储
- 不支持复杂的权限管理或多用户协作
- 不提供自动补全 shell 集成（未来可考虑）
- 不实现 profile 的版本控制
- **明确不包含导入/导出功能** (在 MVP 阶段)

## Decisions

### 1. TypeScript vs JavaScript
**选择**: TypeScript
**理由**: 提供更好的类型安全，减少运行时错误，IDE 支持更好，维护性更高。
**替代方案**: JavaScript (更快启动，但放弃了类型安全)

### 2. Commander vs Yargs vs OCLIF
**选择**: Commander
**理由**: 社区最广泛使用的 CLI 框架，文档完善，轻量级，足够满足需求。
**替代方案**: 
- Yargs (功能更丰富但更重)
- OCLIF (更适合大型 CLI 项目，我们的需求较简单)

### 3. 存储格式: JSON vs SQLite vs YAML
**选择**: 纯 JSON 文件
**理由**: 无需额外依赖，易于人工编辑和备份，满足简单 CRUD 需求。
**替代方案**:
- SQLite (更强大但增加复杂性和依赖)
- YAML (更易读但解析较慢)

### 4. 加密方案
**选择**: Node.js 内置 `crypto` 模块，使用 AES-256-GCM
**理由**: 无需额外依赖，安全性足够好，密钥派生使用用户主密码 + salt。
**注意**: 加密是可选功能，默认不加密存储。

### 5. 配置目录
**选择**: `~/.config/apikey-manage/`
**理由**: 遵循 XDG 规范，跨平台兼容 (Linux/macOS/Windows)。
**文件结构**:
```
~/.config/apikey-manage/
├── profiles.json      # 主配置文件
├── settings.json      # 工具设置（如是否加密）
└── backups/           # 自动备份目录
```

## Risks / Trade-offs

**[风险] API Key 明文存储** → **缓解**: 提供可选加密功能，文档中强调安全风险，建议文件系统权限设置为 600

**[风险] 配置文件损坏** → **缓解**: 实现自动备份机制，操作前创建备份，提供修复/恢复命令

**[风险] Node.js 版本兼容性** → **缓解**: package.json 中明确指定 engines 字段，CI 测试覆盖 18/20/22

**[风险] 跨平台路径问题** → **缓解**: 使用 Node.js path 模块，避免硬编码路径分隔符

**[风险] 性能瓶颈（大量 profile）** → **缓解**: 预计 profile 数量不会很大（<100），如有需要未来可迁移到 SQLite

**[权衡] 简洁性 vs 功能丰富性** → 选择简洁性，明确非目标，避免功能蔓延 (例如不包含导入导出功能)

**[权衡] 交互式 vs 命令式** → 两者都支持，默认交互式，方便脚本化使用命令式

## Migration Plan

**安装**: `npm install -g apikey-manage`
**首次使用**: 自动创建配置目录和空配置文件
**升级**: 保留现有配置，自动迁移数据格式（如有必要）
**回滚**: 卸载 npm 包即可，配置文件保留在用户目录

## Open Questions

1. 是否需要支持多语言（i18n）？（建议：初期只支持英文和中文）
2. 是否需要支持插件机制？（建议：V2 考虑）
3. 是否需要支持 profile 的加密存储？（建议：V1 考虑实现）
4. 是否提供一键测试 API 连通性？（建议：V1 实现）

