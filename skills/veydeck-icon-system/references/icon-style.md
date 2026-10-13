# Veydeck SVG Icon Style

Veydeck icons are infrastructure-control icons, not decorative illustrations.

## Geometry

- Canvas: `24x24`, `viewBox="0 0 24 24"`.
- Stroke: `stroke="currentColor"`, `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`.
- Fill: default `none`. Use soft fills only when the shape needs a stable anchor.
- Corners: rounded, restrained, aligned to the 24px grid.
- Optical weight: clear at 16px and calm at 40px.

## Color

- Primary structure: `currentColor`.
- Emphasis: `var(--vdl-primary)` for one small signal line, dot, or path.
- Avoid large hard-coded color areas.
- Icons must remain legible in the default light theme and the supported dark theme.

## Composition

- Use direct metaphors: container, file, node, metric, disk, terminal, schedule.
- Avoid emoji-like objects, faces, decorative sparkle, skulls, weapons, or hacker motifs.
- Do not render text inside icons.
- Prefer one semantic object plus one small state/emphasis mark.
