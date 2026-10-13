---
name: veydeck-app-icon
description: 为 Veydeck 内置应用、应用库、桌面、任务栏和 Compose 套件入口生成、重构、导出及验证统一品牌语言的透明 PNG 图标。用于制作应用图标、套件 logo、将入口 SVG 迁移为 PNG 或生成更具表现力的产品入口资产；按钮、工具栏和状态等 24px UI SVG 使用 veydeck-icon-system。
---

# Veydeck App Icon

按照“分析 → 解析事实 → 生成 → 验收”制作轻量立体 PNG 图标。生成或编辑图像时必须同时使用 `$imagegen`；本 skill 负责 Veydeck 视觉约束、资产落点、后处理和验收。

## 1. 分析与路由

1. 阅读 `references/veydeck-brand.md`、`references/visual-language.md` 和 `references/approved-family.md`。
2. 判断资产是否属于应用库、桌面、任务栏、内置应用或 Compose 套件入口；若是按钮、工具栏、状态或紧凑菜单图标，切换到 `$veydeck-icon-system`。
3. 内置应用按需读取 `references/app-icon-map.md`；套件读取当前消费仓的 manifest、README、功能和既有资产。
4. 检查目标仓现有图标、名称、清单与构建命令。不要假设目标一定是 `veydeck` 主控或固定目录结构。

## 2. 设计简报

生成前记录：

- 主对象：第一眼必须识别的对象。
- 辅助信号：表达动作或状态，最多一个。
- 层级关系：最大、最亮或视觉中心对象。
- 禁止隐喻：容易误解为其它产品、设备或通用符号的造型。

## 3. 生成与选择

1. 使用 `$imagegen` 生成至少两版 `1024x1024` 候选。两版必须改变对象结构或层级关系，不能只换颜色、材质或角度。
2. 使用轻量立体风格，主体居中、轮廓完整、留足空间；不生成文字、徽章底板、地面投影、场景背景或水印。
3. 需要透明背景时遵循 `$imagegen` 的生成与去背景流程。
4. 按 `references/visual-language.md` 淘汰不合格候选，并记录具体原因；第一版不自动胜出。
5. 对合格候选同时检查 256px、64px、40px，选择语义最直接、层级最清晰、缩略图最稳定且最接近已批准家族的一版。

## 4. 导出与落点

从 skill 目录运行：

```bash
uv run scripts/prepare_icon.py \
  <source.png> \
  <destination/icon.png> \
  --preview-dir <temporary-preview-directory>
```

- 根据消费仓当前 manifest、清单或既有约定确定最终路径；`app-icon-map.md` 中的路径只在对应主控结构存在时使用。
- Compose 套件优先沿用其 `suite.yaml`/package 资产约定。
- 不把最终业务图标保存到 `veydeck-skills`，不把应用 PNG 加入 `@veydeck/icons`。
- 更新消费方清单或稳定 URL，运行目标仓当前定义的 format、lint、test 和 build。
- 删除临时候选和预览；除非用户明确要求，消费仓只保留最终 `256x256 RGBA PNG`。

## 5. 硬性规则

- 最终文件必须是 `256x256`、RGBA、带透明通道的 PNG，安全边距至少 16px，四角完全透明。
- 使用一个主对象和最多一个辅助信号；禁止小文字、复杂场景、密集零件和多对象叙事。
- 管理、控制、中心或主从含义必须通过尺寸、位置和强调色形成层级。
- 禁止骷髅、黑客人物、字符雨、武器、霓虹 HUD、游戏道具感和夸张拟物。
- 不复制第三方商标、产品 logo 或受保护角色，除非用户明确要求且仓库确认拥有使用权。
- 不自动 clone 业务仓或 `veydeck-ui`；无法定位消费仓时先交付候选与明确落点要求，不猜造路径或清单。

## 6. 验收清单

- [ ] 语义与应用或套件核心功能一致，主对象、辅助信号和层级符合简报。
- [ ] 至少比较两版结构不同的候选，并记录废弃原因。
- [ ] 浅色、深色背景下轮廓清晰，64px 和 40px 仍可辨识。
- [ ] 无色键残边、脏边、文字、水印、不透明底板或边缘接触。
- [ ] 与已批准图标家族的材质、光源、明度和视觉重量一致。
- [ ] `prepare_icon.py` 校验通过，消费清单指向最终稳定资产。
