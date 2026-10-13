# Page Patterns

## 窗口根布局

使用稳定的纵向布局，框架语法分别读取 `framework-vue.md` 或 `framework-react.md`。

```css
.view-shell {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--vdl-bg-panel);
}

.view-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--vdl-space-3);
  padding: var(--vdl-space-3) var(--vdl-space-4);
  border-bottom: 1px solid var(--vdl-border-subtle);
}

.view-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: var(--vdl-space-4);
}
```

## 管理页

- 在顶部工具栏放搜索、筛选、刷新和主操作；主体使用表格或 split workspace，不使用营销 hero。
- 组织名称、状态、来源、时间和操作等可扫描列；低频操作放 ActionMenu。
- 默认用 Dialog 查看、创建和编辑；危险确认用 Modal；只有轻量辅助上下文用 Drawer。
- 为加载、空、错误、禁用和权限不足提供明确状态。

## Dashboard

- 使用紧凑指标与图表面板，不堆叠大装饰卡。
- 指标包含标签、值、单位、趋势或更新时间。
- 图表容器设置稳定高度，标题、图例和 tooltip 不遮挡核心数据。

## 日志页

- 将时间范围、级别、来源和关键词放在固定或可折叠筛选区。
- message、target、trace、IP、路径等使用等宽字体或局部等宽。
- 对长文本使用截断、Tooltip、展开行或 Dialog，不直接撑开表格行。
- 沿用项目既有分页或加载更多行为。

## 表单与详情

- 短表单、复杂表单和多分组配置默认使用 Dialog；长流程使用独立页面或清晰分组。
- 将错误放在输入附近，必要时用 Alert 汇总全局错误。
- 二值设置使用 Switch 或 Checkbox，枚举使用 Select，并展示数字、端口、超时的单位和边界。
- 长标识、路径、多列描述和宽表格不得塞入窄 Drawer。

## 可选真实实例

检测到消费项目或 `veydeck`/套件源码后，先搜索当前存在的同类页面、组件导入、i18n 和验证命令，再选择一个最接近的实例。示例文件是项目惯例证据，不是跨仓 API 事实；不要在 skill 中固化可能过期的业务路径。
