# Veydeck 应用图标视觉语言

## 风格

- 采用轻量立体图标：实体轮廓、少量体积、克制高光和柔和内阴影。
- 视觉接近专业桌面工具和基础设施控制台，不做写实物体、卡通贴纸或游戏物品。
- 轮廓优先于材质；缩小后应先看懂对象，再感知层次。

## 构图

- 使用一个主对象，辅助符号最多一个。
- 在生成前明确视觉层级。管理中心、控制器、主节点必须比被管理对象更大、更靠近中心或拥有唯一强调面。
- 同类对象需要表达主从关系时，禁止使用完全相同的尺寸、亮度和视觉重量。
- 主体视觉中心位于画布中心附近，允许为光学平衡轻微偏移。
- 最终 256px 画布至少保留 16px 透明安全边距。
- 主对象建议占画布宽高的 70% 至 84%，避免过小或贴边。
- 不使用外接圆角方形底板；图标自身轮廓可以包含屏幕、文件、磁盘等矩形对象。
- 不使用文字、字母、数字、微型代码或依赖语言理解的符号。

## 色彩

- 使用中亮蓝灰表达结构，Veydeck 蓝表达主要动作或信号；结构面在深色主题下也必须保留可见层次。
- 可按语义少量使用青绿、琥珀、红色和紫色，但不得让整套图标变成单一蓝色变体。
- 建议基础色：
  - 结构：`#344A72`
  - 品牌蓝：`#1D63ED`
  - 通信青：`#0EA5C6`
  - 成功绿：`#16A37A`
  - 警告琥珀：`#D99016`
  - 风险红：`#D94B5B`
  - 仿真紫：`#7157D9`
- 避免纯黑和接近纯黑的大面积填充、荧光色、强饱和蓝紫渐变和玻璃拟态。

## 光影和材质

- 光源统一来自左上方，亮暗变化只用于说明体积。
- 高光和阴影幅度要小，不使用强镜面反射、发光边缘或长投影。
- 暗槽用于分隔结构，不得连续形成大面积黑区；40px 下相邻结构面必须仍可区分。
- 允许轻微磨砂塑料、阳极氧化金属或柔和橡胶质感。
- 图标不应投影到地面，也不应出现桌面、房间或环境背景。

## 生成提示骨架

```text
Use case: stylized-concept
Asset type: Veydeck desktop application or Compose suite icon
Primary request: <应用或套件名称及核心功能>
Subject: <一个直接主对象> with <最多一个辅助信号>
Style/medium: polished lightweight 3D icon, restrained dimensionality, professional infrastructure software
Composition/framing: isolated centered object, complete silhouette, generous even padding, readable at 40px
Lighting/mood: soft upper-left studio light, calm and trustworthy
Color palette: medium-light blue-slate structure with one semantic accent color, visible detail on both light and dark themes
Constraints: no text, no letters, no watermark, no platform badge, no background tile, no floor, no cast shadow
Avoid: cyberpunk, neon HUD, hacker imagery, cartoon character, photorealism, dense details, vendor logos
```

透明输出必须追加 `$imagegen` 规定的纯色色键背景要求，并确保色键颜色不出现在主体中。

## 候选策略

- 每个图标至少生成两版结构不同的候选。
- 候选 A 优先使用最直接的行业对象；候选 B 优先强化产品行为或层级关系。
- 两版不得只改变颜色、材质、光照、相机角度或细节数量。
- 比较时先看 40px，再看 64px，最后检查 256px 材质和边缘；大图精致不能弥补缩略图语义失败。
- 记录每个废弃候选的一个主要原因，例如“对象同权”“误像便携设备”“连接霓虹化”“40px 细节糊成一片”。

## 直接淘汰

出现以下任一情况时不得进入最终导出：

- 第一眼无法说出应用类别，必须依赖名称解释。
- 主对象和辅助信号同权，或管理中心与受管对象大小一致。
- 使用发光线、霓虹连接、HUD、雷达装饰或其它无必要科技效果。
- 误像其它常见产品，例如购物、游戏、聊天、相册、便携收音机或普通工具箱。
- 为表现功能堆叠多个独立设备、场景或微型 UI。
- 40px 下主对象轮廓消失、多个模块合成黑块或强调色只剩噪点。
- 结构依赖不透明底板、投影、环境背景或文字才能成立。
- 与已确认图标相比，材质过度写实、过暗、过亮、过圆润或视觉重量明显失衡。

## 视觉验收

- 256px：边缘干净，材质不过度，透明背景无残色。
- 64px：主对象与辅助信号仍可区分。
- 40px：轮廓能直接表达应用类别，细节消失后含义不改变。
- 浅色背景：深色结构不发灰，浅色高光不消失。
- 深色背景：外轮廓不融入背景，不能只依赖阴影分离。
- 40px 暗部：结构缝隙可见，但不得把多个模块压成一整块黑色轮廓。
- 40px 层级：无需读取名称也能指出主对象，并区分主次关系。
