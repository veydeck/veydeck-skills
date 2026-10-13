---
name: veydeck-ui-style
description: 使用 Veydeck Design Language (VDL)、公开 Token 与 Veydeck 自研组件设计、实现、审查或重构 Vue 3 和 React 19 的安全运维界面。用于窗口应用、Dashboard、表格、表单、日志、响应式布局、主题、Liquid Glass 材质与可访问性任务；材质能力按目标框架和安装版本确认。
---

# Veydeck UI Style

按照“分析 → 解析事实 → 实现 → 验收”完成 Veydeck 前端任务。保持专业、安全运维控制台的高密度工程风格，不把任一框架或本地仓库布局当作默认前提。

## 1. 分析任务

开始前确认目标页面、用户操作、信息密度、目标文件和消费项目。根据目标文件、项目依赖和现有导入识别 Vue、React 或混合仓；混合仓必须按当前目标包或文件选择框架，不同时加载两套实现细节。

## 2. 解析事实

1. 阅读 `references/veydeck-brand.md`。
2. 在当前 skill 目录运行只读探测器：

```bash
node scripts/inspect-veydeck-context.mjs --root <consumer-project>
```

3. 阅读 `references/environment-and-sources.md`，按输出解析事实来源。
4. 优先使用消费项目当前安装版本的公开入口与 `.d.ts`；本地 `veydeck-ui` 源码和官方 GitHub 只作补充，禁止用远端最新接口覆盖已安装版本。
5. 无法确认公开 Props 时停止猜测，报告缺少的包、声明或源码。

## 3. 按任务加载参考

只读取与当前任务相关的 reference；跨类型任务按表中顺序组合。

| 任务 | 必读参考 |
| --- | --- |
| Token、主题、颜色、字体、间距、圆角、密度 | `references/tokens-and-style.md` |
| Liquid Glass、玻璃质感、折射、透明表面对比度 | `references/liquid-glass.md` + 目标框架参考 |
| 组件、表格、表单、按钮、Dialog、Drawer | `references/components.md` + 对应框架参考 |
| 窗口应用、Dashboard、管理页、日志页、详情页 | `references/page-patterns.md` + 对应框架参考 |
| ECharts、Monaco、xterm、视觉或交付 QA | `references/visual-qa.md` |
| Vue 3 实现 | `references/framework-vue.md` |
| React 19 实现 | `references/framework-react.md` |

## 4. 实现约束

- 优先使用当前项目已安装的 `Vey*` 组件，不引入 Element Plus、Ant Design、Naive UI 等替代框架。
- 使用 `@veydeck/tokens` 的 VDL 语义变量；不要在业务代码中重建主题或散落硬编码颜色。
- 品牌色和状态语义不限定材质表现；液态玻璃按合成后的背景、前景与边缘分别评估，不直接套用实色表面的配色。用户已认可的效果作为本次调整基线。
- 沿用消费项目现有国际化、路由、状态管理、测试和代码风格；不要假设存在 `frontend/src/locales`、Pinia 或特定目录。
- 为页面和关键区域提供稳定、可搜索的 `data-page`、`data-ui`、`data-slot`。
- 使用项目既有结构标签约定。Veydeck 窗口和高密度管理界面默认用稳定容器层组织，不为装饰增加多余语义层级。
- 详情、查看、创建和编辑默认使用 `VeyDialog`；只有窄、轻、线性内容必须持续保留主页面上下文时才用 `VeyDrawer`。
- 禁止黑客卡通、骷髅、绿色字符雨、大面积霓虹、科幻 HUD、强饱和蓝紫渐变和装饰性 orb/blob。
- 不把页面分区全部做成漂浮卡片，不嵌套卡片；卡片只用于重复实体、Modal/Dialog/Drawer 或明确工具面板。

## 5. 验收

1. 检查正常、加载、空、错误、禁用和权限不足状态。
2. 检查键盘路径、焦点、ARIA 名称、浅色/深色主题、窄窗口与长文本。
3. 从目标项目 `package.json` 读取并运行现有 format、lint、type-check、test、build 命令；不要硬编码主控命令到其它仓库。
4. 修改 `veydeck-ui` 源码时运行目标范围对应的类型、构建和回归检查；Vue 专项优先使用仓库已有 Vue 专用入口，避免混合入口越界验证 React。只消费发布包时不得改写 `node_modules`。
5. 涉及图表、编辑器、终端或复杂响应式布局时，用浏览器或截图检查常用桌面尺寸和窄窗口尺寸。

## 产品气质

- Engineering：结构清晰、状态明确、操作可预测、高可扫描性。
- Observability：突出遥测、日志、指标、拓扑、事件流和可追溯操作。
- Information Density：优先紧凑、稳定、可复用的业务界面，而非营销式展示。
- Domain Fit：面向安全测试和分布式基础设施控制，保持冷静、克制、可信。
