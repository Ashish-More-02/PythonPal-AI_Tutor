# CLAUDE.md

## How I want answers

**Short coding questions, syntax doubts, "why does this happen" questions**
- 1–3 lines. Direct answer first, then the one reason that matters.
- No preamble, no bullet lists, no restating my question back to me.
- Don't read half the repo for a question about one line — check only what you need.

**Code flow / feature explanations**
- Short but informative: the actual path through the code, in order.
- Name the real files and functions with clickable links (`[file.js:42](path/file.js#L42)`).
- Cover the flow end to end (frontend action → API → route → middleware → controller → DB → response) but keep each step to a line.
- Skip generic framework theory. Tell me what *this* code does.

**When writing code**
- Match the surrounding style; don't reformat or "improve" code I didn't ask about.
- Follow this repo's comment style: short explanatory comments that say *why*, not *what*.
- Don't add tests, error handling, or abstractions I didn't ask for.
- After a change, a 1–2 line summary is enough. No change logs.

**General**
- Talk like a senior engineer to a peer — plain, honest, no hedging or flattery.
- If something in my code is actually wrong, say it in one line. If it's fine, say it's fine.

## Project

**PythonPal** — AI Python tutor for kids (8–12): AI chat ("Codey") + a browser IDE with a
persisted file tree and Python execution. Live: https://python-pal-ai-tutor.vercel.app

## Stack

- **Backend**: Node + Express 4, **CommonJS** (`require`, not ESM), Mongoose 8 / MongoDB Atlas, Groq SDK, JWT + bcryptjs.
- **Frontend**: React 18 + Vite, Tailwind v4 (via `@tailwindcss/vite`, no config file), react-router-dom v7, Monaco + CodeMirror, `streamdown` for rendering AI markdown.
- **Code execution**: Piston API (client-side).
- No test setup in either app. `npm run dev` (nodemon) in Backend (`npm start` = plain node, used by Render), `npm run dev` in Frontend.

## Layout

```
Backend/     index.js → routes/ → controllers/ → models/ ; utils/, middleware/, config/
Frontend/    src/pages/, src/components/, src/API/, src/context/, src/utils/
Docs/        feature write-ups (CodeContext_working.md, FileSystem_working.md, ...) + product/
```

## Conventions that matter

- **Route mounts** (`Backend/index.js`): `/` → auth, `/ai` → AI chat + history, `/api/ide` → file system.
- **Auth**: JWT in `Authorization: Bearer <token>`. `checkJWTtoken` sets `req.user`; read the id as `req.user.userId`. Every route except `/signup` and `/signin` is behind it.
- **Frontend never calls `fetch` from components** — all HTTP lives in `src/API/*.js`, which attach the token via `getAuthHeaders()` (token key in localStorage: `pythonpal-token`) and throw `new Error(data.error)` on non-2xx.
- **API base URL**: `import.meta.env.VITE_API_URL`, fallback `http://localhost:3000`.
- **CORS** allows `http://localhost:5173` + the Vercel URL; add more origins via `CLIENT_ORIGINS` (comma-separated) or `Backend/index.js`.
- **`/ai/chat` streams plain text** (`res.write` chunks + `res.end()`), not JSON. The client reads it as a stream.
- Controllers treat the request body as untrusted: validate/whitelist `messages` before it reaches Groq.
- Per-user limits live as constants in the controller (e.g. `MAX_SAVED_CHATS = 10`, oldest chats pruned on insert).
- Mongoose models are per-user scoped; `IDENode` has a unique `{ userId, path }` index.

## Env

- `Backend/.env`: `JWT_SECRET`, `MONGODB_CLOUD_CONNECTION_STRING`, `GROQ_API_KEY`
- `Frontend/.env`: `VITE_API_URL`
- Never print or commit these values.

## Docs

`Docs/` is where feature explanations go. If I ask you to document a feature's working,
write it there as a new `.md` — don't inline a long explanation in chat.
