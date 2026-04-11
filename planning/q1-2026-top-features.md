# Top 3 Features — Q1 2026

**Planning period:** January — March 2026
**Theme:** "Make context actually work"

---

## 1. Sidebar Navigation (Idea #17)

**Status:** In progress
**Owner:** Engineering (agent team)
**Target:** End of February 2026

### Problem
Users can't navigate between studios, products, and features without going through breadcrumbs or typing URLs. The app feels like a collection of disconnected pages rather than a unified workspace.

### Solution
Collapsible sidebar with a tree view: Studio → Product → Ideas/Context/Tasks. Auto-expands to current location. Persists open/closed state in localStorage.

### Success Metric
- Reduce average clicks-to-navigate from 4.2 to 1.5
- Increase pages-per-session from 3.1 to 5+

### Dependencies
- Org-level layout data loader
- Sidebar state management with Svelte 5 runes

---

## 2. Validation Funnel as Hero Feature (Idea #16)

**Status:** In progress
**Owner:** Product (Tim)
**Target:** End of March 2026

### Problem
The validation funnel exists but is hidden — users don't understand the stages, can't see conversion rates, and have no motivation to move ideas through the process.

### Solution
Make the funnel the primary view on the ideas page. Visual columns (like a Kanban board but for validation stages), with:
- Drag-and-drop between stages
- Stage gate criteria (what evidence is needed to progress)
- Conversion metrics between stages
- Evidence count on each idea card

### Success Metric
- 60% of active ideas have at least one piece of evidence attached
- Average time-in-stage decreases by 30%
- Users can articulate the difference between stages (survey)

### Dependencies
- Evidence modal for attaching context documents
- Configurable stages per product (v2)

---

## 3. Knowledge Base + GitHub Context Layer (Idea #11)

**Status:** In progress
**Owner:** Engineering (agent team)
**Target:** End of March 2026

### Problem
The #1 support theme in Q1 is "Where did my context go?" Users connect GitHub repos and create documents but can't find them when writing specs. The context layer is technically functional but the UX is broken.

### Solution
Fix the context architecture and UX:
- Move repo management to studio level (repos are studio-scoped, not product-scoped)
- File explorer view for repo files (not a flat list)
- Ensure all synced files have content indexed (not just metadata)
- Make @mention search work reliably in the idea editor
- Auto-sync on push via GitHub webhooks (already built, needs reliability work)

### Success Metric
- Support tickets for "where did my context go" drop by 80%
- 70% of specs written with at least one context document attached
- @mention search returns results within 500ms

### Dependencies
- GitHub webhook reliability (#144)
- Schema changes for studio-level repo connections
- FileExplorer reusable component

---

## What We're NOT Doing in Q1

- Figma integration (requested but too complex, defer to Q2)
- Public spec sharing/export (quick win but not strategic, defer)
- Multi-agent parallel execution (cool but premature, need single-agent reliability first)
- Enterprise SSO (no enterprise customers yet)
