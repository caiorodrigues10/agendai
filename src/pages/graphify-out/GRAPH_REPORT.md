# Graph Report - agendai\src\pages  (2026-08-07)

## Corpus Check
- 15 files · ~39,252 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 122 nodes · 126 edges · 17 communities (16 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- MasterAdminDashboard.tsx
- BillingTab.tsx
- LoginPage.tsx
- CheckoutPage.tsx
- LandingPage.tsx
- DashboardPage.tsx
- errorMessage
- AccessBlockedPage.tsx
- ContactPage.tsx
- SchedulingPage.tsx
- formatDateTime
- PlansPage.tsx
- AboutPage.tsx

## God Nodes (most connected - your core abstractions)
1. `errorMessage()` - 7 edges
2. `formatDateTime()` - 4 edges
3. `PaymentsSection()` - 4 edges
4. `AccessBlockedPage()` - 3 edges
5. `CheckoutPage()` - 3 edges
6. `SubscriptionsSection()` - 3 edges
7. `BlockedSection()` - 3 edges
8. `formatPrice()` - 2 edges
9. `formatDate()` - 2 edges
10. `formatPrice()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `BlockedSection()` --calls--> `errorMessage()`  [EXTRACTED]
  agendai/src/pages/MasterAdmin/BillingTab.tsx → agendai/src/pages/MasterAdmin/BillingTab.tsx  _Bridges community 8 → community 12_

## Import Cycles
- None detected.

## Communities (17 total, 1 thin omitted)

### Community 0 - "MasterAdminDashboard.tsx"
Cohesion: 0.08
Nodes (13): BillingTab(), AuditLogDrawerProps, COLOR_MAP, EditUserModalProps, KPICardProps, ManageBarbershopModalProps, METRIC_CHART_CONFIG, MetricBarChartProps (+5 more)

### Community 1 - "BillingTab.tsx"
Cohesion: 0.10
Nodes (12): BillingSection, brl, EMPTY_META, EXPENSE_TYPE_LABELS, NOTIFICATION_TYPE_LABELS, PaginationBarProps, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_CONFIG (+4 more)

### Community 4 - "CheckoutPage.tsx"
Cohesion: 0.47
Nodes (5): CheckoutPage(), formatPrice(), PayMethod, REJECTION_MESSAGES, rejectionMessage()

### Community 5 - "LandingPage.tsx"
Cohesion: 0.33
Nodes (4): marqueeItems, planFeatures, processSteps, queueCustomers

### Community 6 - "DashboardPage.tsx"
Cohesion: 0.33
Nodes (4): comparison, hourHeat, staffRows, weekBars

### Community 8 - "errorMessage"
Cohesion: 0.33
Nodes (6): errorMessage(), formatDate(), PlanFormModal(), PlansSection(), RevenueSection(), SubscriptionsSection()

### Community 9 - "AccessBlockedPage.tsx"
Cohesion: 0.60
Nodes (4): AccessBlockedPage(), BlockInfo, formatDate(), formatPrice()

### Community 10 - "ContactPage.tsx"
Cohesion: 0.40
Nodes (5): ContactFormData, ContactPage(), ContactSchema, fieldClass(), topics

### Community 11 - "SchedulingPage.tsx"
Cohesion: 0.40
Nodes (3): daySlots, flowSteps, pros

### Community 12 - "formatDateTime"
Cohesion: 0.40
Nodes (5): BlockedSection(), formatDateTime(), NotificationsSection(), paymentRefLabel(), PaymentsSection()

### Community 13 - "PlansPage.tsx"
Cohesion: 0.50
Nodes (4): formatPrice(), matrix, objections, PlansPage()

### Community 14 - "AboutPage.tsx"
Cohesion: 0.40
Nodes (3): beats, beliefs, friendships

## Knowledge Gaps
- **47 isolated node(s):** `BlockInfo`, `PayMethod`, `REJECTION_MESSAGES`, `marqueeItems`, `queueCustomers` (+42 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `errorMessage()` connect `errorMessage` to `BillingTab.tsx`, `formatDateTime`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `formatDateTime()` connect `formatDateTime` to `BillingTab.tsx`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `PaymentsSection()` connect `formatDateTime` to `errorMessage`, `BillingTab.tsx`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `BlockInfo`, `PayMethod`, `REJECTION_MESSAGES` to the rest of the system?**
  _47 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `MasterAdminDashboard.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Should `BillingTab.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._