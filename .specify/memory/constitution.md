# DriveROI Ops - Constitution

## Project Principles

These governing principles guide all decisions for this project.

### 1. Internal-First, Simple Always

This is an internal tool for a small team. Optimize for speed of use, not edge cases. Skip complexity that doesn't serve daily workflows.

### 2. Markdown as Source of Truth

Content (SOPs, playbooks, client notes) lives in markdown files in this repo. The app renders and organizes them - it doesn't replace them.

### 3. API Integrations Over Rebuilding

We don't recreate what Clay, Instantly, or HeyReach already do well. We pull data from them, store what's useful, and present unified views.

### 4. AI-Augmented, Human-Verified

AI extracts insights from transcripts and suggests positioning/messaging. Humans always review and refine before it becomes the source of truth.

### 5. Light Before Heavy

No auth until we need it. No complex permissions until we need them. No database tables until we have data for them. Build the minimum that works.

### 6. Design with Intention

Light DriveROI aesthetic: clean white backgrounds, purple accents, Figtree typography, subtle motion. Professional and efficient, not playful.

---

## Technical Constraints

| Constraint | Decision |
|------------|----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (Postgres) |
| AI | Claude API (Anthropic) |
| Hosting | Vercel |
| Auth | None for V1 |

---

## Out of Scope (V1)

- User authentication / login
- Client-facing views
- Pushing leads to Instantly/HeyReach (handled in Clay)
- Real-time collaboration
- Mobile app
