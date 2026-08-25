# Graph Report - agendai\src\pages\marketing (2026-08-07)

## Corpus Check

- 6 files · ~14,661 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 35 nodes · 30 edges · 6 communities
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
3. `friendships` - 1 edges
4. `beats` - 1 edges
5. `beliefs` - 1 edges
6. `topics` - 1 edges
7. `ContactSchema` - 1 edges
8. `ContactFormData` - 1 edges
9. `weekBars` - 1 edges
10. `staffRows` - 1 edges

## Surprising Connections (you probably didn't know these)

- None detected - all connections are within the same source files.

## Import Cycles

- None detected.

## Communities (6 total, 0 thin omitted)

### Community 1 - "DashboardPage.tsx"

Cohesion: 0.33
Nodes (4): comparison, hourHeat, staffRows, weekBars

### Community 3 - "ContactPage.tsx"

Cohesion: 0.40
Nodes (5): ContactFormData, ContactPage(), ContactSchema, fieldClass(), topics

### Community 4 - "SchedulingPage.tsx"

Cohesion: 0.40
Nodes (3): daySlots, flowSteps, pros

### Community 5 - "AboutPage.tsx"

Cohesion: 0.40
Nodes (3): beats, beliefs, friendships

## Knowledge Gaps

- **13 isolated node(s):** `friendships`, `beats`, `beliefs`, `topics`, `ContactSchema` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **What connects `friendships`, `beats`, `beliefs` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
