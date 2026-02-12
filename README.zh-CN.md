# API Key Manage (akm)

> 轻量级 CLI 工具，用于管理大语言模型 API 配置信息

[![npm version](https://img.shields.io/npm/v/apikey-manage.svg)](https://www.npmjs.com/package/apikey-manage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**[English](README.md) | [中文](README.zh-CN.md)**

---

## 🚀 快速开始

```bash
# 全局安装
npm install -g apikey-manage

# 或使用 npx（无需安装）
npx apikey-manage <命令>
```

### 基础用法

```bash
# 添加新配置（交互式）
akm add

# 列出所有配置
akm list

# 查看配置详情
akm show my-profile

# 更新配置
akm update my-profile --model gpt-4-turbo

# 设置默认配置
akm default my-profile

# 删除配置
akm remove my-profile
```

---

## ✨ 功能特性

- **🎯 交互式配置** - 友好的交互提示，快速创建配置
- **🔐 安全存储** - 本地 JSON 文件存储，支持 API Key 加密
- **🎨 多提供商支持** - OpenAI、Anthropic、Azure、Google、Groq 及自定义提供商
- **📋 完整 CRUD** - 创建、读取、更新、删除配置
- **⚡ 快速切换** - 设置默认配置，快速切换不同环境
- **🛡️ 自动备份** - 修改前自动创建备份，防止数据丢失

---

## 📖 命令详解

### 全局选项

所有命令都支持以下全局选项：

```bash
--config-dir <path>    # 自定义配置目录
--no-color            # 禁用颜色输出
--version, -v         # 显示版本
--help, -h            # 显示帮助
```

### `add` | `create` - 添加配置

创建新的 API 配置。

```bash
akm add [选项]
```

**选项：**
- `-n, --name <name>` - 配置标识名称（必需）
- `-p, --provider <provider>` - 提供商（openai、anthropic、azure、google、groq、ollama、lmstudio、custom）
- `-u, --base-url <url>` - API 基础 URL
- `-m, --model <model>` - AI 模型名称（如 gpt-4、claude-3-opus）
- `-k, --api-key <key>` - API 认证密钥
- `--protocol <protocol>` - API 协议（openai | anthropic）
- `-d, --default` - 设为默认配置
- `-f, --force` - 如果存在则覆盖
- `-i, --interactive` - 强制交互式模式

**示例：**
```bash
# 交互式模式
akm add

# 非交互式模式
akm add -n my-openai -p openai -u https://api.openai.com -m gpt-4 -k sk-xxx --protocol openai

# 使用 Anthropic
akm add -n my-claude -p anthropic -u https://api.anthropic.com -m claude-3-opus-20240229 -k sk-ant-xxx --protocol anthropic
```

### `list` | `ls` - 列出配置

显示所有已配置的配置项。

```bash
akm list [选项]
```

**选项：**
- `-v, --verbose` - 显示详细信息，包括协议类型
- `-p, --provider <provider>` - 按提供商过滤

**示例：**
```bash
# 简单列表
akm list

# 显示协议信息的详细列表
akm list --verbose

# 按提供商过滤
akm list --provider openai
```

### `show` - 显示配置详情

查看特定配置的详细信息。

```bash
akm show <name> [选项]
```

**选项：**
- `-j, --json` - 以 JSON 格式输出

**示例：**
```bash
# 显示配置详情
akm show my-openai

# 以 JSON 格式输出
akm show my-openai --json
```

### `update` | `edit` - 更新配置

修改现有配置的配置项。

```bash
akm update <name> [选项]
```

**选项：** 与 `add` 命令相同

**示例：**
```bash
# 交互式更新
akm update my-openai

# 更新特定字段
akm update my-openai --model gpt-4-turbo

# 更新协议类型
akm update my-openai --protocol anthropic
```

### `remove` | `delete` | `rm` - 删除配置

从配置中删除配置项。

```bash
akm remove <name> [选项]
```

**选项：**
- `-f, --force` - 跳过确认

**示例：**
```bash
# 确认后删除
akm remove my-openai

# 强制删除（不确认）
akm remove my-openai --force
```

### `default` - 管理默认配置

设置、显示或清除默认配置。

```bash
akm default [name] [选项]
```

**选项：**
- `--clear` - 清除默认设置

**示例：**
```bash
# 显示当前默认配置
akm default

# 设置默认配置
akm default my-openai

# 清除默认配置
akm default --clear
```

---

## 🔧 配置说明

### 配置目录

配置文件存储在：

- **Linux/macOS**: `~/.config/apikey-manage/`
- **Windows**: `%APPDATA%\apikey-manage\`

可以通过 `AKM_CONFIG_DIR` 环境变量自定义配置目录。

### 文件结构

```
~/.config/apikey-manage/
├── profiles.json     # 配置存储
├── settings.json     # 应用设置
└── backups/          # 自动备份
```

### 环境变量

- `AKM_CONFIG_DIR` - 自定义配置目录
- `NO_COLOR` - 禁用颜色输出

---

## 🛠️ 开发指南

```bash
# 克隆仓库
git clone https://github.com/yourusername/apikey-manage.git
cd apikey-manage

# 安装依赖
npm install

# 运行测试
npm test

# 构建项目
npm run build

# 本地运行
npm start
```

---

## 🤝 贡献指南

欢迎提交贡献！请随时提交 Pull Request。

1. Fork 仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

---

## 🙏 致谢

- 使用 [Commander.js](https://github.com/tj/commander.js/) 构建 CLI 框架
- 交互式提示由 [Inquirer](https://github.com/SBoudrias/Inquirer.js/) 提供支持
- 终端样式使用 [Chalk](https://github.com/chalk/chalk)
- 模式验证使用 [Zod](https://github.com/colinhacks/zod)

---

<p align="center">
  用 ❤️ 由 apikey-manage 团队制作
</p>
