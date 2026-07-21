# PythonPal — Product Documentation

This folder is the source of truth for **what we are building and why**. It turns the
project (an AI Python chatbot) into a product (a guided, learn-by-doing platform that
takes an absolute beginner from zero to writing Python on their own).

## The one-sentence pitch

> **PythonPal takes anyone — even someone who has never written a line of code — from
> zero to independently writing Python, by having them *build* real things while an AI
> mentor reviews their code, gives feedback, and guides them to the next step.**

## Read in this order

1. **[01-vision.md](01-vision.md)** — Who it's for, the problem, positioning, the moat,
   and the competitive landscape. *Start here.*
2. **[02-product-spec.md](02-product-spec.md)** — The actual features: dashboard, the
   syllabus, the code editor + AI review loop, the free practice area, learner progress.
3. **[03-architecture.md](03-architecture.md)** — How it's built: auth, data model, code
   execution (Piston → Docker), the AI layer, and the urgent security fixes.
4. **[04-roadmap.md](04-roadmap.md)** — Phased plan scoped for ~5 hrs/week, with a clear
   "do this first" list.

## Core beliefs (the product's foundation)

- **People learn by doing, not by watching.** Every lesson ends with the learner writing
  and running real code, not reading a wall of text.
- **The AI is a mentor, not an answer machine.** It reviews *your* code and nudges you
  forward. It does not hand over solutions.
- **The platform remembers you.** Your files, your chats, and your progress persist. When
  you land, you see exactly where you are and what to do today.
- **Zero to independent is the promise.** The syllabus has an end state: finish it and you
  can write Python without us.

## Status

- **Audience:** pivoted from "kids 8–12" (original README) to **absolute-beginner adults**.
  The system prompt and copy still say "children 8–12" and must be updated — see roadmap.
- **Current build:** React/Vite frontend, Groq (Llama-3.3-70b) chat, Monaco editor, Piston
  execution, basic Express + MongoDB auth. See architecture doc for what needs to change.
