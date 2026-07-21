# 04 — Roadmap

Scoped for **~5 focused hours/week**. Depth over breadth. Each phase ends with something
real and usable. Ship, watch real people use it, then continue.

## ⚡ Phase 0 — Do this first (this week, ~2–3 hrs)

Non-negotiable foundation. No new features.

- [ ] **Rotate the leaked MongoDB password** and move the connection string to
      `process.env.MONGO_URI`. Confirm `.env` is gitignored.
- [ ] **Move the Groq API call behind the Express backend.** Frontend calls our API; the
      key lives only on the server. Remove `dangerouslyAllowBrowser`.
- [ ] **Hash passwords** (bcrypt) on signup; verify hash on signin. Issue a JWT.

*Outcome: it's a real, safe-to-deploy app instead of a demo.*

## Phase 1 — The core loop, persisted (~3–4 weeks)

The minimum that makes it a *product*: a beginner can log in, do a lesson, write and run
code, get AI feedback, and come back tomorrow to find their progress waiting.

- [ ] **Persist per user:** files, chat history, progress (see data model).
- [ ] **Rewrite the system prompt** for absolute-beginner adults; keep "hints not answers."
- [ ] **Reviewer role:** submit code → AI returns pass/not-yet + Socratic feedback,
      grounded in the lesson goal.
- [ ] **Short syllabus** as a static seed file — ~6–8 lessons (Foundations → Logic →
      Collections → Functions), each ending at the editor with a task.
- [ ] **Basic dashboard:** "continue where you left off" + % complete + a "today" item.

*Outcome: the full loop works end-to-end for one short track. Ship it.*

**→ Then the most important step: get 10 real beginners to try it** (r/learnpython, Discord,
friends who can't code). Watch someone use it silently for 10 min. Measure day-2 return.

## Phase 2 — Stickiness & the free practice area (~3–4 weeks)

- [ ] **Learner model** feeding every AI call (mastered vs struggling concepts) — makes
      feedback personal; this is the moat.
- [ ] **Free practice area** — editor + run + output, files persisted. Low effort, high
      value; also a no-signup-friction funnel.
- [ ] **Streak + progress polish** on the dashboard.
- [ ] Expand the syllabus toward the full zero→independent path (add strings/files/errors,
      debugging, first capstone project).

## Phase 3 — The "real terminal" & scale (only when justified)

- [ ] Self-hosted Piston (if rate limits bite) or a **locked-down Docker sandbox** for
      multi-file projects + real terminal + `pip`. Treat as the most security-sensitive
      work in the project (see architecture).
- [ ] Capstone projects module.
- [ ] Deploy backend properly; monitoring.

## Phase 4 — Distribution & (maybe) money

- [ ] Build-in-public posts, r/learnpython launch, a landing page with the zero→hero promise.
- [ ] Consider a free tier (practice area + first module) and a paid tier (full syllabus +
      unlimited AI review) *only after retention is proven*.

---

## Guardrails so 5 hrs/week actually compounds

- **One loop before many features.** A single lesson that goes explain → write → run →
  review → progress, working perfectly, beats ten half-lessons.
- **Static before dynamic.** Syllabus as a JSON file before a DB/CMS. Don't build authoring
  tools for content only you write.
- **DB is the source of truth for files.** Don't chase persistent per-user containers to
  "store data" — that's what Mongo is for. Containers are disposable execution only.
- **Retention is the only metric that matters early.** If nobody returns on day 2, no
  feature fixes that — the *content and loop* do. Talk to users.
- **Update the kid-facing copy/prompt early** (Phase 1) so the product's story is coherent.

## The single highest-leverage action right now

Costs zero code: **post in r/learnpython asking "what's the most frustrating part of
learning Python as a complete beginner?"** Thirty answers will tell you which lessons and
feedback to build first — and give you your first testers.
