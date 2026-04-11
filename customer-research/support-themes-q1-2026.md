# Support Themes — Q1 2026

**Period:** January 1 — March 31, 2026
**Total tickets:** 847
**Source:** Intercom + email support

---

## Top 5 Themes by Volume

### 1. "Where did my context go?" (187 tickets, 22%)

Users connect a GitHub repo, sync it, then can't find the files when writing specs. Root causes:
- Context is scoped to studio but users expect it at the product level
- No search across context documents
- Sync status is unclear — users don't know if files are actually indexed

**Representative ticket:**
> "I connected our design-system repo last week and synced it. When I go to write a spec and type @, nothing from that repo shows up. Where is it?"

### 2. Agent tasks stuck in "in progress" (143 tickets, 17%)

Agents start work but users can't tell if they're actually making progress or stuck. No way to see what the agent is doing.

### 3. Idea status confusion (128 tickets, 15%)

Users don't understand the validation funnel stages. "What's the difference between First Level and Second Level?" is asked weekly.

### 4. Can't share specs externally (97 tickets, 11%)

PMs want to share specs with stakeholders who don't have Studio AI accounts. No public link or export-to-PDF.

### 5. GitHub webhook not firing (89 tickets, 10%)

After initial setup, webhooks stop working. Usually because:
- GitHub App permissions were changed
- Webhook URL is pointing to wrong environment
- Installation was deleted and recreated without updating the DB record

---

## Emerging Themes (low volume but growing)

- **"Can the AI read my Figma files?"** (23 tickets) — designers want to attach mockups as context
- **"How do I set standards for my team?"** (19 tickets) — team leads want to define spec templates/guidelines
- **"Can agents work on multiple tasks?"** (15 tickets) — power users want parallel agent execution

---

## Recommendations

1. Fix the context discoverability problem (#1) — this is our highest-volume issue and directly undermines the core value prop
2. Add agent progress visibility (#2) — even a simple activity log would help
3. Create an onboarding flow for the validation funnel (#3) — in-app education
4. Spec export/sharing is a quick win (#4) — PDF or public link
5. Webhook reliability needs automated monitoring (#5) — we should alert before users notice
