# React 19 Mapping

仅在目标是 React 19 时读取。

## 包与样式

```tsx
import { VeyButton, VeyInput } from "@veydeck/react";
```

在项目全局样式入口导入当前版本公开的 Token 和 React 组件样式。以包 `exports`/README 为准。

## 映射

- 受控值使用必填 `value` 与 `onChange`；Checkbox 使用原生语义 `checked`。
- 自定义内容使用 `children`、render 属性或公开回调，不使用 Vue slot 名称。
- DOM 属性使用 React 名称，如 `className`、`readOnly`、`maxLength`、`autoComplete`、`htmlFor`。
- ARIA 映射以当前组件类型声明为准；不要从 Vue 模板机械转换属性名。
- 配置对象字段与 Vue 共享业务契约，例如表格列可用 `renderCell`，但必须以安装版本类型为准。
- 保持 state 单一来源，回调更新消费方状态；不要在组件外复制一套失同步视觉状态。

## 页面骨架

```tsx
export function ExampleView() {
  return (
    <div className="view-shell" data-page="example">
      <div className="view-toolbar" data-ui="toolbar">...</div>
      <div className="view-content" data-slot="content">...</div>
    </div>
  );
}
```

## Liquid Glass 接入

与 Vue 共用 [liquid-glass.md](liquid-glass.md) 的材质规范。具体组件属性、Provider 导出和类型名称以 `@veydeck/react` 安装版本为准。

- 适用组件默认玻璃化；`glass` 用于配置覆盖或关闭效果，不作为必须显式开启的开关。
- 统一参数语义为 `intensity`、`refraction`、`blur`、`opacity`、`highlight`；默认值来自共享 tokens，组件局部配置优先于 Provider 与库默认配置。
- 使用 React state 更新材质配置，保留业务组件身份、输入和焦点；不要改变 `key` 强制刷新材质。
- Portal 浮层显式携带解析后的主题、Token 和滤镜引用；检查卸载清理和配置更新，不依赖原位置的 DOM 继承。
- React 专项只验证 React 与必要共享依赖；双端任务分别提供验证证据，不将另一端的结果直接视为通过。

## 项目适配

- 沿用项目现有 hooks、状态管理、路由和 i18n；不要擅自引入新的全局状态或路由库。
- 在 React 套件源码可用时，可搜索 `@veydeck/react` 的实际导入并参考同类页面；实例只用于项目约定，不覆盖安装包类型。
- 运行目标项目声明的 React type-check、lint、test 和 build 命令。
