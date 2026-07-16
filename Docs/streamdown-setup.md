# Integrating Streamdown with Tailwind v4

How the AI chat markdown rendering is wired up, and how to reproduce it in another codebase.

[Streamdown](https://streamdown.ai) is Vercel's drop-in replacement for `react-markdown`, built for
streaming LLM output — it handles half-finished markdown mid-stream (an unclosed ` ``` ` fence, a
dangling `**`) instead of flashing broken syntax at the user.

**The one thing to internalise:** the two ways this integration fails both produce a **clean, green
build** and broken output. A passing build proves nothing here. See [Verify](#5-verify-before-you-trust-it).

## Live example in this repo

| Concern | File |
| --- | --- |
| Source scanning, tokens, dark variant | `Frontend/src/index.css` |
| Stylesheet import | `Frontend/src/main.jsx` |
| Renderer usage | `Frontend/src/components/PythonTutor.jsx` |
| Dark class sync | `Frontend/src/App.jsx` |

---

## 1. Install

```bash
npm i streamdown @streamdown/code
```

`streamdown` is the renderer. Syntax highlighting is a **separate plugin** in v2 —
`@streamdown/code`, which pulls in Shiki. Optional siblings: `@streamdown/math`,
`@streamdown/mermaid`, `@streamdown/cjk`. Install only what you need; each adds bundle weight.

> Shiki code-splits every bundled language, so expect a large number of lazy chunks in the build
> output. They load on demand, so runtime cost is fine.

## 2. Point Tailwind at the package

**Gotcha #1.** Streamdown ships **prebuilt JS containing Tailwind class names**, and Tailwind
deliberately skips `node_modules` when scanning for classes. Miss this and your markdown renders as
unstyled text, with no error.

```css
@source "../node_modules/streamdown/dist/*.js";
@source "../node_modules/@streamdown/code/dist/*.js";
```

Paths are relative to the CSS file. In a monorepo, point at the hoisted root `node_modules`.

## 3. Define the design tokens

**Gotcha #2.** Streamdown styles itself with **shadcn/ui token names** (`bg-background`,
`border-border`, `text-muted-foreground`, `bg-sidebar`). If your project isn't shadcn, those classes
resolve to nothing — missing backgrounds, invisible borders.

Define the tokens, then map them into Tailwind's color namespace:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-sidebar: var(--sidebar);
}

@layer base {
  :root {
    --background: var(--color-gray-50);
    --foreground: var(--color-gray-900);
    /* …etc… */
  }

  .dark {
    --background: var(--color-gray-900);
    --foreground: var(--color-gray-100);
    /* …etc… */
  }
}
```

`inline` is load-bearing. It makes utilities resolve `var(--background)` at use time, so the `.dark`
overrides win. Plain `@theme` adds an indirection that defeats them.

Pick values that suit **where the markdown sits** — in this app the tokens are tuned against the chat
bubble colour, not the page background.

### Dark mode

Tailwind's built-in `dark:` variant follows `prefers-color-scheme`. If your dark mode is a
class/toggle instead, retarget the variant — otherwise Streamdown's code blocks follow the OS while
the rest of the app follows the toggle:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

Then make sure something actually puts the class on the root. This app drives it from React context
(`Frontend/src/App.jsx`):

```jsx
useEffect(() => {
  document.documentElement.classList.toggle("dark", isDarkMode);
}, [isDarkMode]);
```

Before switching a project to class-based dark mode, grep for existing `dark:` usage — those
utilities change meaning.

## 4. Import the stylesheet and render

```jsx
import "streamdown/styles.css";        // animations only — NOT the component styling
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";

// Hoist: Streamdown compares `plugins` by identity. An inline object is a new
// reference every render and defeats its memoisation.
const plugins = { code };

<Streamdown plugins={plugins} animated isAnimating={isStreaming}>
  {text}
</Streamdown>
```

`styles.css` is ~35 lines of `@keyframes`. It is **not** where the styling lives — that comes from
steps 2 and 3.

Set `isAnimating` only for the message currently streaming, not for the whole history:

```jsx
isAnimating={isLoading && msg.role === "assistant" && i === messages.length - 1}
```

## 5. Verify before you trust it

Both gotchas above compile cleanly. So check the **compiled CSS**, not the exit code:

```bash
npm run build

# 0 = step 2 or 3 is wrong (classes never generated)
grep -c "bg-background\|border-border\|bg-sidebar" dist/assets/*.css

# 0 = dark: is class-based (correct for a toggle-driven app)
grep -c "prefers-color-scheme" dist/assets/*.css
```

Then actually look at it in **both themes** — render a sample with a fenced code block, a GFM table,
a blockquote and nested lists.

> Tip: if the renderer is behind auth or an API key, mount it in a throwaway entry point
> (`verify.html` + a small `verify-entry.jsx` importing your real `index.css`), screenshot it, then
> delete the harness. That's how this integration was validated.

## Adapting this to another codebase

**Get the token list from the package, not from this doc.** It changes between versions:

```bash
cat node_modules/streamdown/dist/*.js node_modules/@streamdown/code/dist/*.js \
  | grep -oE "\b(bg|text|border|divide|ring|fill|stroke)-(background|card-foreground|card|muted-foreground|muted|popover-foreground|popover|primary-foreground|primary|secondary-foreground|secondary|accent-foreground|accent|destructive-foreground|destructive|sidebar-foreground|sidebar|foreground|border|input|ring)\b" \
  | sort -u
```

Longer alternatives come first on purpose: with `primary` before `primary-foreground`, the regex
reports `text-primary` for `text-primary-foreground` and you'd miss a token.

Whatever it prints, map each distinct token in `@theme inline`. As of `streamdown@2.5.0` +
`@streamdown/code@1.1.1` that's the eight in step 3 — the `bg-muted/40`-style opacity variants need
no extra work, since Tailwind derives them via `color-mix`.

**On Tailwind v3**, the same four concerns live in `tailwind.config.js`:

| Concern | v4 (CSS) | v3 (config) |
| --- | --- | --- |
| Scan the package | `@source "…/dist/*.js"` | `content: ["./node_modules/streamdown/dist/*.js"]` |
| Class dark mode | `@custom-variant dark (…)` | `darkMode: "class"` |
| Token → utility | `@theme inline { --color-*: … }` | `theme.extend.colors` |
| Read a theme value | `var(--color-gray-50)` | `theme(colors.gray.50)` |

Streamdown's README shows **only** the v4 syntax. Copying it into a v3 project silently produces no
styles.

## Gotchas reference

| Symptom / trap | Cause |
| --- | --- |
| Markdown renders as plain unstyled text | Missing `@source` — Tailwind never saw the classes |
| Missing backgrounds, invisible borders | shadcn tokens undefined |
| `.dark` overrides don't apply | Used `@theme` instead of `@theme inline` |
| Code blocks follow OS, not the app toggle | `dark:` still defaults to `prefers-color-scheme` |
| `shikiTheme` prop appears ignored | The `code` plugin's themes **override** it — use `createCodePlugin({ themes })` |
| Re-renders on every token | `plugins` object inlined instead of hoisted |
| Don't override `--radius` for it | Streamdown never reads `var(--radius)`; it only uses `rounded-md`/`lg`/`xl`. Overriding the scale changes rounding app-wide |

## Migrating off `react-markdown`

Streamdown is a drop-in replacement, so remove the packages it supersedes:

```bash
npm uninstall react-markdown remark-gfm react-syntax-highlighter
```

GFM is built in — no `remarkPlugins={[remarkGfm]}` needed. Highlighting comes from
`@streamdown/code`, so hand-rolled `<SyntaxHighlighter>` blocks and any manual regex markdown
parsing can go.
