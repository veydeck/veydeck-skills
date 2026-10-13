---
name: veydeck-icon-system
description: 为 Veydeck Vue 或 React 界面的按钮、工具栏、菜单、状态与紧凑应用语义场景创建、验证、发布和消费可主题化的 24px SVG UI 图标。用于新增或修复 @veydeck/icons 资产、图标命名空间、fallback 行为及 VeyIcon 调用；应用库、桌面、任务栏和套件入口 PNG 使用 veydeck-app-icon。
---

# Veydeck Icon System

按照“分析 → 解析事实 → 执行 → 验收”维护 Veydeck 24px SVG。不要把已安装包当作可写源码，也不要把应用 PNG 混入公共 SVG 包。

## 1. 分析

1. 判断任务是消费已有图标、新增公共图标、修复 SVG，还是调整图标组件/发布包。
2. 判断目标是通用操作语义还是紧凑应用语义；桌面、应用库、任务栏和套件入口改用 `$veydeck-app-icon`。
3. 阅读 `references/veydeck-brand.md` 和 `references/icon-style.md`。

## 2. 解析事实

- 消费任务优先读取目标项目当前安装版本的 `@veydeck/icons` 与 `@veydeck/vue`/`react` 公开类型和导出。
- 安装包与 `node_modules` 只读。新增或修改 SVG 必须定位用户提供、显式软链接或环境中可发现的可写 `veydeck-ui` 源码仓。
- 源码仓不存在时可完成名称选择与消费代码修改，但不得假装已写入或发布公共图标。
- 官方仓库地址只作定位兜底：`https://github.com/veydeck/veydeck-ui.git`；不自动 clone，不用远端 HEAD 覆盖安装版本。

## 3. 执行

1. 在源码仓中搜索现有名称和相近语义，优先复用。
2. 将通用 UI 图标写入 `packages/icons/src/svgs/common/`，将窗口标题、通知来源、菜单和空状态使用的应用语义图标写入 `packages/icons/src/svgs/apps/`。
3. 使用独立 `common` 与 `apps` 命名空间；`fallback.svg` 只属于 `common`。
4. 使用 `24x24`、`viewBox="0 0 24 24"`、`currentColor` 结构描边；只用 `var(--vdl-primary)` 做小面积受控强调。
5. 通过当前框架的 `VeyIcon` 消费名称：Vue 从 `@veydeck/vue` 导入并使用模板 Props，React 从 `@veydeck/react` 导入并使用 JSX Props。语义图标提供 label，装饰图标使用公开的 decorative 能力。
6. 不直接展示图标名字字符串，不在业务组件临时嵌入重复 SVG。

## 4. 硬性规则

- 禁止 emoji、文本字形、外部 icon font、光栅图片、`<image>`、`<text>` 和 base64。
- 不复制第三方商标，除非用户明确要求且仓库确认拥有使用权。
- 禁止 cyberpunk、黑客、霓虹和游戏装饰风格。
- 保持 16px、24px、28px、40px 清晰；默认 2px 描边、圆角端点和连接。
- 文件名只用小写字母、数字和短横线；SVG 保持可手工编辑、确定性和小体积。
- 缺失或非法名称使用 `common/fallback.svg`，不得回退为 emoji。

## 5. 验收

1. 从可写 UI 源码仓根目录运行：

```bash
node <skill-dir>/scripts/validate-icons.mjs \
  packages/icons/src/svgs/common \
  packages/icons/src/svgs/apps
```

2. 运行 `veydeck-ui` 当前 `package.json` 定义的 format/check/test/build 流程。
3. 在浅色和深色主题下检查 16px、24px、40px；确认对齐、描边、命名空间和 fallback。
4. 消费代码分别按目标框架运行 type-check、lint、test 和 build。
