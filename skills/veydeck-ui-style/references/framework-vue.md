# Vue 3 Mapping

仅在目标是 Vue 3 时读取。

## 包与样式

```vue
<script setup lang="ts">
import { VeyButton, VeyInput } from "@veydeck/vue";
</script>
```

在项目全局样式入口导入当前版本公开的 Token 和 Vue 组件样式。以包 `exports`/README 为准。

## 映射

- 受控值使用必填 `modelValue` 与 `update:modelValue`；模板优先使用 `v-model`。
- Checkbox 同样使用 `modelValue`；不要套用 React 的 `checked` 契约。
- 自定义内容使用默认、具名或 scoped slots。
- 事件使用组件公开的 kebab-case 模板名称；读取 `.d.ts` 或源码确认事件负载。
- 模板属性沿用 Vue/HTML 名称，如 `class`、`readonly`、`maxlength`、`autocomplete`、`for`。
- 业务参数和传入配置对象字段保持共享契约的 camelCase，不为模板风格改写对象键。

## 页面骨架

```vue
<template>
  <div class="view-shell" data-page="example">
    <div class="view-toolbar" data-ui="toolbar">...</div>
    <div class="view-content" data-slot="content">...</div>
  </div>
</template>
```

## Liquid Glass 接入

先确认 `@veydeck/vue` 当前导出 `VeyGlassProvider`、`VeyGlassValue` 及目标组件的 `glass` 属性，再使用以下契约；旧版本不要猜测兼容性。

- `glass` 可为布尔值或响应式配置；配置项为 `intensity`、`refraction`、`blur`、`opacity`、`highlight`，数值范围 0–1。默认值读取当前 tokens，不在消费端复制。
- 组件局部配置优先于 Provider，Provider 优先于默认材质；明确当前实现的对象覆盖语义，不自行假设逐字段合并。
- `intensity` 在实色与默认效果之间插值，独立参数覆盖插值结果；`false` 关闭材质。不要通过绑定 `key` 强制重建组件更新效果。
- 组件自身配置覆盖内部浮层，不隐式覆盖插槽中的独立组件；子树控制使用 Provider。Teleport 的主题和 Token 需要显式传递，不能只依赖 DOM 继承。
- 适用组件默认玻璃化；省略 `glass` 时继承 Provider 或库默认配置，不需要传 `true` 才启用。
- Vue 专项只构建、验证 Vue 与必要共享依赖；双端任务分别验证，视觉与参数语义遵循同一份 Liquid Glass 规范。

## 项目适配

- 沿用项目现有 composables、状态管理、路由和 i18n；不要默认要求 Pinia 或固定 locale 文件。
- 在本地 `veydeck` 主控源码可用时，可参考现存的 `RuntimeLogView.vue`、`NodeManagerView.vue`、`FileEditorView.vue`、`TerminalView.vue` 或实际同类页面；先搜索确认路径，不把示例路径当契约。
- 运行目标项目声明的 Vue type-check、lint、test 和 build 命令。
