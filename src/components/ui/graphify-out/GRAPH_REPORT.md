# Graph Report - agendai\src\components\ui (2026-08-07)

## Corpus Check

- 11 files · ~2,960 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 45 nodes · 44 edges · 10 communities (4 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)

- chart.tsx
- PasswordInput.tsx
- login-03.tsx
- button.tsx
- DynamicIcon.tsx
- Logo.tsx
- floating-paths.tsx
- Header.tsx
- input.tsx
- Toast.tsx

## God Nodes (most connected - your core abstractions)

1. `Logo()` - 3 edges
2. `ThemeToggle()` - 3 edges
3. `ChartTooltipContent()` - 3 edges
4. `useChart()` - 2 edges
5. `getPayloadConfigFromPayload()` - 2 edges
6. `ICON_OPTIONS` - 1 edges
7. `DynamicIconProps` - 1 edges
8. `HeaderProps` - 1 edges
9. `LogoProps` - 1 edges
10. `sizeMap` - 1 edges

## Surprising Connections (you probably didn't know these)

- None detected - all connections are within the same source files.

## Import Cycles

- None detected.

## Communities (10 total, 6 thin omitted)

### Community 0 - "chart.tsx"

Cohesion: 0.24
Nodes (7): ChartConfig, ChartContext, ChartContextProps, ChartTooltipContent(), getPayloadConfigFromPayload(), THEMES, useChart()

### Community 1 - "PasswordInput.tsx"

Cohesion: 0.33
Nodes (5): PasswordInput, PasswordInputProps, STRENGTH_BAR, STRENGTH_BORDER, STRENGTH_TEXT

### Community 3 - "button.tsx"

Cohesion: 0.50
Nodes (3): Button, ButtonProps, buttonVariants

### Community 5 - "Logo.tsx"

Cohesion: 0.50
Nodes (3): Logo(), LogoProps, sizeMap

## Knowledge Gaps

- **22 isolated node(s):** `ICON_OPTIONS`, `DynamicIconProps`, `HeaderProps`, `LogoProps`, `sizeMap` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `Logo()` connect `Logo.tsx` to `login-03.tsx`, `Header.tsx`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `ThemeToggle()` connect `login-03.tsx` to `Header.tsx`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **What connects `ICON_OPTIONS`, `DynamicIconProps`, `HeaderProps` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._
