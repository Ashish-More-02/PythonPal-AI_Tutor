# 03 — Architecture

## ⚠️ URGENT — fix before anything else

Two issues that are both product-blockers and interview-killers:

1. **Leaked database credential.** `Backend/index.js` has a full MongoDB connection string
   *with password* committed to the repo. **Rotate that password immediately**, move it to
   an environment variable (`process.env.MONGO_URI`), and ensure `.env` is gitignored.
   Anyone with the repo currently owns the database.
2. **Groq API key in the browser.** `PythonTutor.jsx` calls Groq with
   `dangerouslyAllowBrowser: true`, exposing the key to anyone with devtools. **All AI
   calls must move behind the Express backend.** The frontend calls *our* API; our server
   holds the Groq key.

Also currently: **passwords are stored in plaintext** and compared directly in `/signin`.
Hash them (bcrypt/argon2) before this touches a real user.

---

## Target architecture (MVP)

```
  Browser (React/Vite)
      │  (JWT in httpOnly cookie)
      ▼
  Express API  ───────────────►  Groq (Llama-3.3-70b)   [key lives here, never in browser]
      │                          - chat / mentor
      │                          - code review
      ├──────────────►  Code execution service
      │                   MVP:  Piston (emkc.org) — stateless, single-file run
      │                   Later: self-hosted Piston or Docker sandbox
      ▼
  MongoDB (users, progress, files, chats, lessons)
```

- **Frontend** never holds secrets and never calls Groq/Piston directly for authed flows.
- **Backend** owns all secrets, all AI calls, auth, and persistence.

## Auth

- Signup: hash password (bcrypt), store user.
- Signin: verify hash, issue **JWT** (prefer httpOnly cookie over localStorage).
- Protect all data routes (files, progress, chat, review) with auth middleware.
- This replaces the current plaintext + direct-compare logic.

## Data model (MongoDB collections)

```
User
  _id, name, email, passwordHash, createdAt

Progress            // one per user — the journey state + learner model
  userId,
  currentModule, currentLesson,
  completedLessons: [lessonId],
  learnerModel: {
    level: "beginner",
    masteredConcepts: [ "variables", "for-loops" ],
    strugglingConcepts: [ "functions/return" ],
  },
  streak: { count, lastActiveDate },
  updatedAt

File                // persisted code — both lesson work and practice-area scratch
  _id, userId,
  name, language: "python", content,
  context: "lesson:<lessonId>" | "practice",
  updatedAt

ChatSession         // mentor conversations
  _id, userId,
  scope: "lesson:<lessonId>" | "global",
  messages: [ { role, content, ts } ],
  updatedAt

Lesson / Curriculum // the syllabus content (can start as a static JSON/seed file)
  _id, moduleId, order,
  title, conceptExplanation,
  task: { prompt, goal, starterCode },
  reviewRubric   // what "passing" means — fed to the AI reviewer
```

Start `Lesson`/`Curriculum` as a **static seed file** (JSON in the repo) before making it a
DB collection or building an authoring UI. Don't build a CMS you don't need yet.

## Code execution — the Piston → Docker decision

The vision includes a **file manager + terminal like Replit, via Docker containers, so user
data persists**. That's the right *long-term* shape, but it's a big lift. Stage it:

| Stage | Execution | Persistence | Effort | When |
|---|---|---|---|---|
| **MVP** | Piston API (current) — stateless, single-file run | Files stored in **MongoDB**, loaded into the editor | Low | Now |
| **Phase 2** | Self-hosted Piston (own limits, no rate cap) | Same (DB) | Medium | When Piston limits bite |
| **Phase 3** | **Docker sandbox** — per-run container, multiple files, real terminal, `pip` | Files still in DB (source of truth); container gets an ephemeral workspace hydrated from DB at session start | High | When "real terminal" is a proven need |

**Important reframe:** you do *not* need a persistent long-lived Docker container per user to
persist their data. **The database is the source of truth for files.** A container is just a
*disposable execution environment* you spin up, hydrate with the user's files from the DB,
run, and tear down. This is far cheaper and safer than keeping a container alive per user.

**Security is non-negotiable for any code execution** (you're running untrusted code):
- Never run learner code on the host. Sandbox it (Piston already does; Docker must be
  locked down: no network, CPU/memory/time limits, read-only base, non-root user, dropped
  capabilities, auto-kill on timeout).
- Treat the real-terminal feature as the *most* security-sensitive part of the whole build.

## The AI layer

- **Two prompt roles**, both server-side:
  1. **Mentor** — teaches, answers, encourages. Socratic; hints before answers.
  2. **Reviewer** — given (learner's code + lesson goal + rubric + learner model), returns
     structured feedback: pass/not-yet, strengths, hints, next step.
- **Feed the learner model into every call** so the AI never references un-taught concepts
  and adapts to the individual. This is the moat — don't skip it.
- **Update the system prompt** — it currently targets "children 8–12." Rewrite for
  absolute-beginner adults, keep the "hints not full answers" rule, drop the kid framing.
- Consider structured output (JSON) from the reviewer so the UI can render pass/fail state
  and progress updates reliably.

## Deployment (later, keep it boring)

- Frontend: Vercel (already there).
- Backend: Render/Railway/Fly.
- DB: MongoDB Atlas (already there — after rotating the credential).
- Docker execution (Phase 3): a small isolated worker service, not the main API box.
