# Veydeck Components

## 事实与边界

- 先以消费项目当前安装的 `@veydeck/vue` 或 `@veydeck/react` 类型声明确认 Props、事件和公开类型。
- 本地 `veydeck-ui/docs/components/` 可补充共享用途、交互和无障碍契约，但不能覆盖已安装版本。
- 两端保持相同业务语义；受控值、事件、内容扩展和 DOM 属性按框架映射。
- 只读安装包，不直接修改 `node_modules`。需要改组件实现时切换到可写的 `veydeck-ui` 源码仓。

## 公共组件范围

- 操作：`VeyButton`、`VeyActionMenu`
- 输入：`VeyInput`、`VeySelect`、`VeySwitch`、`VeyCheckbox`、`VeyDateTimeRangePicker`、`VeyFormItem`
- 数据：`VeyTable`、`VeyPagination`、`VeyDescriptions`、`VeyTag`、`VeySelectionBar`
- 容器：`VeyCard`、`VeyDrawer`、`VeyDialog`、`VeyModal`
- 反馈：`VeyAlert`、`VeyToast`、`VeyLoading`、`VeyEmpty`、`VeyTooltip`、`VeyIcon`
- 导航：`VeyMenu`、`VeyTabs`、`VeyBreadcrumb`、`VeyBreadcrumbItem`

组件清单会随版本变化。探测输出与当前 `.d.ts` 高于本清单。

## 选择规则

玻璃生效区域与状态要求见 [liquid-glass.md](liquid-glass.md)。组件清单不等于材质支持清单；逐个确认当前版本的 `glass` 声明。不要为未支持的组件盲目透传属性，也不要依据旧规范阻止用户明确要求的库级接入。

- 默认使用 `VeyDialog` 承载详情、查看、创建和编辑。
- 内容包含宽表格、多列描述、长路径、长标识、多分组或大量数据时使用 Dialog。
- 仅当内容可在窄幅单列完整表达、流程短、保持主页面上下文有明确价值时使用 Drawer。
- 简短确认或破坏性警告使用 `VeyModal`，复杂自定义内容不用 Modal。
- 状态使用 `VeyTag`，不要只靠裸色文本表达在线、失败或告警。
- 表单标签、提示和错误使用 `VeyFormItem`；详情键值优先使用 `VeyDescriptions`。
- 多个次要操作收敛到 `VeyActionMenu`，单一主操作使用 `VeyButton`。
- 图标使用 `VeyIcon` 和已发布图标名，避免临时 SVG、emoji 或文本字形。

## 验证重点

- 受控组件的值与变化回调完整，不能只更新视觉状态。
- 表格 `rowKey` 稳定；加载态由组件公开能力或外围 `VeyLoading` 处理，不猜测 `loading` Prop。
- 浮层支持 Escape、焦点陷阱、关闭后焦点恢复、滚动锁和视口边缘定位。
- 表单控件有 label、hint/error 关联；图标按钮和关闭按钮具有可本地化名称。
- 组件覆盖正常、禁用、错误、加载、空态和 320px 窄容器。

## 标记约定

- 页面根：`data-page="node-manager"`
- 工具栏：`data-ui="toolbar"`
- 表格：`data-ui="table"`
- 详情区域：`data-slot="detail"`
- 浮层关键区域：`data-slot="header|body|footer"`
