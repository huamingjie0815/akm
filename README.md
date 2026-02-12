# apikey-manage

一个轻量级的 CLI 工具，用于管理大模型 API 的配置信息（profile）。支持添加、查看、更新、删除 profile 配置。

## 安装

```bash
npm install -g apikey-manage
```

安装后，可以使用 `apikey-manage` 或简写 `akm` 命令。

## 快速开始

```bash
# 添加一个新的 profile
akm add --name my-openai --provider openai --base-url https://api.openai.com --model gpt-4 --api-key sk-xxx

# 列出所有 profiles
akm list

# 查看特定 profile 详情
akm show my-openai

# 更新 profile
akm update my-openai --model gpt-4-turbo

# 设置默认 profile
akm default my-openai

# 删除 profile
akm remove my-openai
```

## 命令详解

### `add` / `create` - 添加 Profile

```bash
akm add [options]
```

选项：
- `-n, --name <name>` - Profile 名称（必需）
- `-p, --provider <provider>` - 提供商（如 openai, anthropic）
- `-u, --base-url <url>` - API 基础 URL
- `-m, --model <model>` - 默认模型名称
- `-k, --api-key <key>` - API 密钥
- `-d, --default` - 设为默认 profile
- `-f, --force` - 如果存在则覆盖

### `list` / `ls` - 列出 Profiles

```bash
akm list [options]
```

选项：
- `-v, --verbose` - 显示详细信息
- `-p, --provider <provider>` - 按提供商过滤

### `show` / `get` - 显示 Profile 详情

```bash
akm show <name> [options]
```

选项：
- `-j, --json` - 以 JSON 格式输出

### `update` / `edit` - 更新 Profile

```bash
akm update <name> [options]
```

选项：与 `add` 命令相同

### `remove` / `delete` / `rm` - 删除 Profile

```bash
akm remove <name> [options]
```

选项：
- `-f, --force` - 跳过确认

### `default` - 管理默认 Profile

```bash
akm default [name] [options]
```

选项：
- `--clear` - 清除默认设置

## 配置文件

配置文件存储在：
- **Linux/macOS**: `~/.config/apikey-manage/`
- **Windows**: `%APPDATA%\apikey-manage\`

可以通过环境变量 `AKM_CONFIG_DIR` 自定义配置目录。

### 文件结构

```
~/.config/apikey-manage/
├── profiles.json     # 存储所有 profile
├── settings.json     # 应用设置
└── backups/          # 自动备份
```

## 环境变量

- `AKM_CONFIG_DIR` - 自定义配置目录
- `NO_COLOR` - 禁用颜色输出

## License

MIT
