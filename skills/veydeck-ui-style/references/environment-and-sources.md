# Environment And Sources

## 探测

从当前 skill 目录运行：

```bash
node scripts/inspect-veydeck-context.mjs --root <consumer-project>
node scripts/inspect-veydeck-context.mjs --root <consumer-project> --format json
```

需要指定本地源码仓时追加 `--veydeck-ui <path>`。脚本只读取文件，不联网、不克隆、不写入项目。
JSON 输出以 `schemaVersion` 标识结构版本，并稳定提供目标根、框架证据、包版本与入口、本地源码仓、官方仓库、权威顺序和警告。

## 事实优先级

1. 消费项目代码、`package.json`、锁文件与既有约定。
2. 当前安装版本的 `@veydeck/*` 包公开入口、README、CSS 和 `.d.ts`。
3. 可发现或显式提供的本地 `veydeck-ui` 源码及共享组件契约。
4. 包 `repository` 元数据指向的官方仓库；最终定位兜底为 `https://github.com/veydeck/veydeck-ui.git`。

不要用本地源码或 GitHub HEAD 的新 API 覆盖消费项目安装的旧版本。需要新能力时先升级依赖或在 UI 库中实现并发布。

## 结果解释

- `framework: vue|react`：只加载对应框架 reference。
- `framework: mixed`：根据目标文件扩展名、所在 workspace 和现有导入选定一端；不要在同一组件混用两套包。
- `framework: unknown`：检查目标根是否正确；无法确认时请用户提供消费项目或技术栈。
- `declaredVersion` 有值而 `installedVersion` 为空：依赖尚未安装或目标根错误；可先依据声明确认包选择，不能猜 Props。
- `sourceRepositories` 为空：这是正常情况；安装包足以支持常规消费任务。
- 同一仓库存在多个版本：以目标 workspace 实际解析到的安装包为准。

## 写入边界

- 业务页面任务只修改消费仓。
- Token、组件或公共 SVG 本体任务必须定位可写的 `veydeck-ui` 源码仓；安装包只读。
- GitHub 地址只用于定位、浏览或经用户授权后的获取，不自动 clone。
