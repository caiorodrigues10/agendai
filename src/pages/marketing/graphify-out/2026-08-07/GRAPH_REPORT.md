# Graph Report - agendai\src\pages\marketing (2026-08-07)

## Corpus Check

- 6 files · ~13,458 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 33 nodes · 28 edges · 6 communities (5 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)

- DashboardPage.tsx
- ContactPage.tsx
- SchedulingPage.tsx
- AboutPage.tsx

## God Nodes (most connected - your core abstractions)

1. `fieldClass()` - 2 edges
2. `ContactPage()` - 2 edges
3. `values` - 1 edges
4. `topics` - 1 edges
5. `ContactSchema` - 1 edges
6. `ContactFormData` - 1 edges
7. `weekBars` - 1 edges
8. `staffRows` - 1 edges
9. `hourHeat` - 1 edges
10. `comparison` - 1 edges

## Surprising Connections (you probably didn't know these)

- None detected - all connections are within the same source files.

## Import Cycles

- None detected.

## Communities (6 total, 1 thin omitted)

### Community 1 - "DashboardPage.tsx"

Cohesion: 0.33
Nodes (4): comparison, hourHeat, staffRows, weekBars

### Community 3 - "ContactPage.tsx"

Cohesion: 0.40
Nodes (5): ContactFormData, ContactPage(), ContactSchema, fieldClass(), topics

### Community 4 - "SchedulingPage.tsx"

Cohesion: 0.40
Nodes (3): daySlots, flowSteps, pros

## Knowledge Gaps

- **11 isolated node(s):** `values`, `topics`, `ContactSchema`, `ContactFormData`, `weekBars` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **What connects `values`, `topics`, `ContactSchema` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
