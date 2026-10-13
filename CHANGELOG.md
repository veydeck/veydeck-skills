# Changelog

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [0.1.0-alpha.1] - 2026-10-13

### Added

- 首次发布 Veydeck Skills，提供可独立安装的自包含技能包。
- 提供 `veydeck-app-icon`，用于生成、规范化和验证应用、桌面与套件入口的透明 PNG 图标。
- 提供 `veydeck-icon-system`，用于创建、验证和接入 Vue 与 React 共用的 24px SVG UI 图标。
- 提供 `veydeck-ui-style`，用于基于 VDL Token 和 `Vey*` 组件设计、实现及审查 Vue 3 与 React 19 界面。
- 提供共享 Veydeck 品牌规范，以及主题、组件、页面布局和视觉验收参考。
- 提供 Liquid Glass 材质规范，涵盖合成对比度、浅色与深色主题、小控件、浮层和按框架验收。
- 提供只读环境探测器 `inspect-veydeck-context.mjs`，识别 Vue/React 技术栈、`@veydeck/*` 包版本与公开入口，并支持通过 `--veydeck-ui` 指定本地源码仓。
