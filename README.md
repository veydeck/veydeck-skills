# Veydeck Skills

`veydeck-skills` 是 Veydeck 组织级 AI Skill 源，用于统一设计语言、图标生成、界面实现和可重复开发流程。Veydeck 是一个可扩展的分布式 Linux 主机运维平台，用于统一管理一台或多台 Linux 主机，并支持通过套件按需扩展平台能力。

业务代码、组件实现和最终视觉资产不存放在本仓库。每个 skill 都是可独立复制、压缩和安装的自包含发布包。

## 目录结构

```text
veydeck-skills/
├── skills/
│   ├── veydeck-app-icon/
│   ├── veydeck-icon-system/
│   └── veydeck-ui-style/
├── shared/
│   └── brand/
├── scripts/
│   └── sync-shared-references.mjs
└── README.md
```

## Skill 清单

| Skill | 职责 |
| --- | --- |
| `veydeck-app-icon` | 生成和验证内置应用、应用库入口与 Compose 套件 PNG 图标。 |
| `veydeck-icon-system` | 维护按钮、工具栏、菜单和状态等 24px SVG 图标。 |
| `veydeck-ui-style` | 使用 VDL Token 和 Veydeck Vue 3/React 19 组件实现、审查前端界面。 |

共享品牌规范的维护源位于 `shared/brand/veydeck-brand.md`，并同步到每个 skill 的 `references/veydeck-brand.md` 随包分发。运行时 Token、组件和 SVG 图标以消费仓当前安装版本的 `@veydeck/*` 公开包为准；本地 `veydeck-ui` 源码仓是可选开发信息源。

## 接入方式

```bash
mkdir -p .agents/skills
cp -r /absolute/path/to/veydeck-skills/skills/* .agents/skills/
```

## UI 环境探测

`veydeck-ui-style` 提供无第三方依赖、只读的环境探测器，用于识别消费仓的 Vue/React 技术栈、Veydeck 包版本、公开声明与可选源码仓：

```bash
node skills/veydeck-ui-style/scripts/inspect-veydeck-context.mjs \
  --root /path/to/consumer-project
```

追加 `--format json` 可获得稳定结构化输出；追加 `--veydeck-ui <path>` 可显式提供本地源码仓。脚本不联网、不 clone、不写文件。

## 维护规则

1. 单个 skill 的运行时文件必须全部位于自身目录，不得引用 `../` 越出包边界。
2. 共享品牌规范只在 `shared/brand/veydeck-brand.md` 编辑，随后运行同步脚本更新各 skill 内置副本。
3. 单个 skill 的专用脚本保留在对应 skill 内。
4. 业务专属规则留在业务仓库。
5. 最终 PNG、SVG、页面和组件资产提交到消费仓库。

## 验证

```bash
node scripts/sync-shared-references.mjs --check

python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  skills/veydeck-app-icon
```

编辑共享品牌规范后运行 `node scripts/sync-shared-references.mjs --write`。修改多个 skill 时逐个验证；带脚本的 skill 需要使用真实输入验证成功和失败场景。
