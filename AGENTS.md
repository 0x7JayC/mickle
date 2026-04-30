<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Working with Jay

Single source of truth for how to collaborate on this project. Read this before every session.

## Persona

- Faith-driven entrepreneur. Background: UX designer, **not a programmer**.
- Uses Claude Code for product development and knowledge management.
- Rule: any task done three times must be AI-driven or automated.
- Speak in terms of **the why** and **the impact on the user**. Implementation details are secondary.

## First principles

- Decisions originate from the essence of the problem. Industry standard is not a reason on its own.
- The filter: *what problem are we solving · what is the most direct path · how would we design this from scratch.*
- **Candor over courtesy.** No flattery. Don't open with "Of course." Don't call ideas "good" by default. If a proposal is flawed, say so. If there's a better way, propose it without waiting for permission.

## Constraint-first

- Rules are established before execution.
- New project → create a `CLAUDE.md` first.
- New directory → define structural conventions: what goes where, naming, cleanup schedule.
- Existing `CLAUDE.md`/`AGENTS.md` → follow strictly.
- **Documentation first.** To change a spec, update the doc first, then the code. Never the other way.

## Interaction design (this is the supreme criterion)

User experience overrides technical preference, code cleanliness, and architectural elegance. The backend may be complex; every layer the user touches must be seamless. Applies to GUIs, CLIs, conversations, and system feedback.

- **Design for goals, not features.** Ask what the user is trying to achieve before deciding how to build it. Don't add features just because they're feasible.
- **Don't make the user think.** Self-explanatory. If it needs a manual, the design failed.
- **System absorbs complexity.** Automate what can be automated. Infer what can be inferred. Don't split a one-step task into three.
- **Progressive disclosure.** Core first. Detail on demand. Don't dump every option at once.
- **Feedback guides action.** Don't just say "Connection failed." Say "Retrying — recovery expected in 5s."

## Working style

- **Language:** English for code, commands, variables.
- **Conclusion first.** State the result/solution, then the reasoning. Skip background preambles.
- **Ambiguity:** when requirements are vague, propose the most rational solution and ask if adjustments are needed. Don't stall.
- **Direct action.** Don't ask "are you sure?" unless there's genuine high-stakes risk.

## Development & git habits

- **Validation:** run tests, linters, or builds after every change. Never submit unverified code.
- **Root-cause analysis:** don't comment out errors to make code run. Find and fix the underlying issue.
- **Security:** keys, tokens, passwords never enter the codebase. Use `.env.local` (gitignored) and Vercel env.
- **Git messages:** English, intent-focused (the why), not implementation logs.
- **Deployment:** use project-specific commands (see below). `git push` is for cross-device sync — it is not deployment. Do **not** push automatically. Push only when Jay explicitly asks.

## Project-specific (Mickle)

- **Stack:** Next.js 16 (App Router, Turbopack) · Tailwind v4 · Supabase · Privy · Jupiter · Capacitor (iOS).
- **Live URL:** `mickle-gamma.vercel.app` (production deploy of `main`).
- **Vercel auto-deploys** every push to `main` — for that reason, only push when explicitly asked.
- **Local dev:** `npm run dev` → `localhost:3000`.
- **iOS shell:** `npm run ios:add && npm run ios:open` (see `MOBILE.md`).
- **Money architecture:** documented in `MONEY.md`. Don't change the fee story without updating that file first (Documentation First rule).
- **Brand discipline:** `DESIGN.md` (Apple) is the reference. Single coral accent, no decorative gradients, body 17px / 1.47 / -0.012em, weight ladder 300/400/600/700. Glass + shadows reserved for nav/sticky chrome. See commit `c631f01`.
- **Pitch deck:** `pitch-deck-*.html` (Colosseum Consumer track, PAS framework, 8 slides).

## Files to update before changing behaviour

| If you're changing… | Update this first |
|---|---|
| The fee structure or money flow | `MONEY.md` |
| The build sequence (Day 1–5) | `BUILD_PROPOSAL.md` |
| The iOS / mobile shell | `MOBILE.md` |
| The brand language (palette, type, radius) | `DESIGN.md` |
| The collaboration norms above | this file |
