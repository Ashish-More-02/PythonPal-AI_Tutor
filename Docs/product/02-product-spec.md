# 02 — Product Spec

The product is five surfaces built around one loop.

## The core loop (this is the whole product)

```
        ┌──────────────────────────────────────────────┐
        │  1. Dashboard shows "what to do today"        │
        │  2. Learner opens a lesson                     │
        │  3. Lesson explains a concept (short)          │
        │  4. Learner WRITES code in the editor          │
        │  5. Learner RUNS it, sees output               │
        │  6. Learner SAVES / submits it                 │
        │  7. AI REVIEWS their code → feedback + hints   │
        │  8. Learner improves, passes, moves ahead      │
        │  9. Progress updates; dashboard refreshes      │
        └──────────────────────────────────────────────┘
```

Everything below serves this loop.

---

## 1. The Dashboard (the home screen after login)

What the learner sees the moment they land:

- **"Today" panel** — a short, finite list of what to do today (1–3 items). Removes the
  "what now?" paralysis. This is the retention driver.
- **"Your journey" / syllabus progress** — a visual map of the full curriculum with a
  clear *you-are-here* marker and % complete. Motivation + orientation.
- **Continue button** — one click back into the exact lesson they left.
- **Streak / momentum indicator** — days in a row, concepts mastered. Habit reinforcement.
- **Recent files / projects** — quick access to what they've built.

## 2. The Syllabus (zero → independent)

A single, ordered, *finite* path. Finishing it = "I can write Python on my own." Draft
outline (refine later):

1. **Foundations** — running code, print, variables, data types, input.
2. **Logic** — booleans, comparisons, `if/elif/else`.
3. **Collections** — lists, dictionaries, loops (`for`, `while`).
4. **Reusable code** — functions, arguments, return values, scope.
5. **Working with data** — strings, files, basic error handling.
6. **Thinking like a programmer** — breaking problems down, debugging.
7. **Capstone projects** — build 2–3 real small programs from a blank file (e.g. a
   to-do CLI, a number game, a simple data cruncher).

Each **lesson** = short concept explanation → a "you try it" coding task → AI review →
a mini-challenge. Never a wall of text; always end at the editor.

Each **module** ends with a **project** the learner builds and keeps. Tangible output =
pride + something to show + proof of ability.

## 3. The Code Editor + AI Review loop (the heart)

The current Monaco editor + Piston execution already exists. What's added:

- **Save** — files persist per user (see architecture: files data model).
- **Run** — execute and show stdout/stderr (already works via Piston).
- **Submit for review** — sends the learner's code + the lesson's goal to the AI, which
  returns:
  - Does it meet the goal? (pass / not yet)
  - **Socratic feedback** — what's good, what to reconsider, *hints not answers*. Only
    reveals a full solution as a last resort after the learner has genuinely tried.
  - A suggested next step.
- The AI review is grounded in the **learner model** (what they've been taught, what they
  struggle with) so feedback is personalized and never references un-taught concepts.

**Key rule (carried from the existing system prompt):** the mentor gives hints and
examples first; it only gives the complete solution if the learner is truly stuck. This is
the anti-ChatGPT behavior and must be enforced in the review prompt.

## 4. The Free Practice Area (the "Replit-like" sandbox)

A no-curriculum playground: **just the code editor + a terminal/output**. For when the
learner wants to experiment or build their own thing.

- Blank file, run button, output/terminal.
- Files here also persist per user (their personal scratch projects).
- Optional: "ask the mentor" is available but not required — pure freedom.

This matters because self-directed building is where confidence forms. It's also the
lowest-effort surface to ship and a great top-of-funnel ("try it free, no lesson needed").

> **Note:** a true multi-command *terminal* (pip install, multiple files, persistent shell)
> is a bigger lift than single-file "run" — see architecture for the Piston→Docker path.
> MVP = single-file run + output pane. "Real terminal" is a later phase.

## 5. Learner Progress & Memory (what makes it *yours*)

Per user, persisted:

- **Files / projects** — everything they write and save.
- **Chat history** — their conversations with the mentor, per lesson and global.
- **Learning progress** — which lessons/modules are done, in-progress, locked.
- **Learner model** — concepts mastered, concepts they repeatedly get wrong, current level.
  This feeds every AI interaction so the mentor genuinely "knows" them.
- **Journey summary** — a human-readable "here's where you are and what's next," shown on
  the dashboard and usable as a progress recap.

## Feature priority (what earns its place)

| Feature | Priority | Why |
|---|---|---|
| Auth + persistence (files, chat, progress) | **P0** | Nothing is a product without it |
| Dashboard with "today" + journey | **P0** | The retention surface |
| Editor + Run + Save + AI review loop | **P0** | The core learning loop |
| Structured syllabus (even a short one) | **P0** | The "path" that beats ChatGPT |
| Learner model feeding the AI | **P1** | The moat; makes feedback personal |
| Free practice area | **P1** | Funnel + confidence building; low effort |
| Streaks / gamification | **P2** | Retention polish |
| Real multi-command terminal (Docker) | **P2** | High effort; only when justified |
