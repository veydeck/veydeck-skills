# Visual QA, Charts, Editors, Terminals

## ECharts

- 从当前 VDL Token 或主题适配生成图表颜色，不假设 CSS 变量能被 canvas 自动解析。
- 保持底盘透明，容器使用 VDL 背景；弱化网格线和非关键轴线。
- 为容器设置稳定高度，在窗口或面板尺寸变化后调用 resize。
- 为数据提供文本、表格或可访问摘要，不让颜色成为唯一信息来源。

## Monaco

- 优先搜索并复用消费项目已有 Monaco wrapper、主题和语言配置；不要假设固定 Vue 文件路径。
- 使用 VDL 等宽字体，确保容器 `min-height: 0`，并让工具栏使用当前框架的 Veydeck 组件。
- 检查只读、加载、错误、空内容和窗口 resize。

## xterm

- 复用项目当前安装的 xterm 包、fit addon 和连接生命周期。
- 使用 VDL 深色 surface 与主色语义，避免荧光绿和装饰性终端效果。
- 在容器 resize 后 fit，清理监听器和会话资源，避免 header/footer 遮挡终端。

## 交付检查

玻璃任务追加 [liquid-glass.md](liquid-glass.md) 的实际消费页面验收。截图应覆盖用户反馈的组件和状态；计算样式用来解释原因，不能代替视觉检查。保留已认可的材质基线，分别说明文字、边界与光学效果的变化。

- 检查 Dialog、Drawer、表格、浮层和工具栏在窄宽下不溢出。
- 检查正常、加载、空、错误、禁用、超长文本和大量数据状态。
- 检查固定列、滚动容器和弹出层不会跳动或逃出视口。
- 分别检查浅色、深色、键盘操作、焦点可见性和 reduced-motion。
- 从目标项目清单读取并运行实际 format、lint、type-check、test、build 命令。
- 对复杂响应式页面至少实际检查一个常用桌面尺寸和一个窄窗口尺寸。
