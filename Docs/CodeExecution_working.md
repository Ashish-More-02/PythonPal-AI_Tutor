# How code execution works

Everything below describes `Backend/controllers/RunCodeController.js` — the file that
takes a learner's Python, runs it somewhere else, and sends back the output.

## The short version

The file does four things:

1. Checks the code the browser sent is actually usable.
2. Wraps that code in a small Python "safety jacket" (this is the tricky part).
3. Sends it to the OnlineCompiler API and waits for the result.
4. Splits the result into *output* (green) and *errors* (red), and returns it.

Step 2 is the only surprising one, and it exists to work around a flaw in the API.
The rest of this doc explains why.

---

## The problem this file works around

When any program finishes, it hands the operating system a number called the **exit
code**. `0` means "I finished normally." Anything else means "I crashed."

The OnlineCompiler API looks at that number and behaves very differently:

| Exit code | What the API gives back |
| --- | --- |
| `0` | Everything — what you printed, and any warnings |
| anything else | Nothing. Just the fixed text `Internal error: code execution failed` |

That second row is the problem. If a learner writes this:

```python
print("hello world")
print(x)              # x was never created
```

Python prints `hello world`, then crashes with a `NameError`, then exits non-zero.
The API sees the non-zero exit and throws away **both** things — the error message
*and* the `hello world` that printed perfectly fine a moment earlier. The learner
sees an empty terminal and one meaningless sentence.

Every possible mistake — a typo, a missing colon, forgetting to type an input —
looked exactly the same. That is useless for someone learning to code, because the
error message *is* the lesson.

## The fix: never let the program crash

We can't change their API. But we control what code we send it.

So instead of sending the learner's program directly, we send their program **tucked
inside a wrapper** that catches the crash:

```python
try:
    <the learner's code>
except:
    print(the error)
```

Now when `print(x)` fails, the crash doesn't escape — the wrapper catches it and
*prints* the error instead. Printing is a completely normal thing for a program to
do, so the program ends with exit code `0`.

As far as the API can tell, nothing went wrong. So it hands everything back:
`hello world`, and the error text right underneath it.

That is the entire trick. Everything else in the file is detail.

---

## Walking through the file

### The settings at the top (lines 5–8)

```js
const RUN_URL = "https://api.onlinecompiler.io/api/run-code-sync/";
const PYTHON_COMPILER = "python-3.14";
const MAX_BYTES = 100_000;
const UPSTREAM_TIMEOUT_MS = 35_000;
```

Four values kept at the top so they're easy to find and change:
the address we send code to, which Python version to use, the biggest program the
API accepts (100,000 characters), and how long we're willing to wait (35 seconds)
before we give up.

> `100_000` is just `100000`. JavaScript lets you put underscores in long numbers so
> they're easier to read, the same way you'd write 100,000 with a comma.

### The marker (line 14)

```js
const ERR_MARKER = "\n__PYTHONPAL_ERR__\n";
```

Here's a problem created by our own fix. The wrapper *prints* the error — but the
learner's own `print()` output is also printed. Both arrive back as one single blob
of text. How do we tell where the real output stops and the error begins?

We print a weird, unmistakable line between them first:

```
hello world              ← the learner's output
__PYTHONPAL_ERR__        ← our marker
NameError: name 'x'...   ← the error
```

Later we search for that marker and cut the text in two at that point. Everything
above it is output, everything below it is the error.

### Building the wrapper (lines 19–39)

This is the function that puts the learner's code inside the safety jacket. Two
details are worth understanding.

**Detail 1 — base64, and why it's needed**

*Encoding* just means rewriting text in a different alphabet so it can travel safely.
**Base64** is one such alphabet: it rewrites any text using only plain letters,
numbers, `+`, and `/`. So `print("hi")` becomes `cHJpbnQoImhpIik=`. It's not secret
or encrypted — anyone can convert it back — it's just *plain*.

Why bother? Because we're putting the learner's code **inside** another piece of
Python code, and their text can break ours. Imagine a learner writes:

```python
print("hello")
```

If we pasted that straight into our wrapper, the wrapper would contain quote marks
inside quote marks, and Python would get confused about where the string ends. A
learner writing a `"` or a `\` or even just pressing Enter could break the whole
thing.

Base64 removes every one of those dangerous characters. We send the harmless version
and the wrapper's first line converts it back to real code before running it:

```python
_src = base64.b64decode("cHJpbnQoImhlbGxvIik=").decode("utf-8")
```

`b64decode` turns it back; `.decode("utf-8")` turns the raw bytes back into readable
text. It's the same code the learner wrote — it just travelled in disguise.

**Detail 2 — `compile(_src, "main.py", "exec")`**

`compile()` checks the code and prepares it to run, and the `"main.py"` part gives it
a filename. That filename is what shows up in the error message:

```
File "main.py", line 5, in <module>
NameError: name 'x' is not defined
```

Without it, the error would report a confusing line number from inside our wrapper
instead of line 5 of what the learner actually typed. This is what makes the line
number match their editor.

Separating `compile()` from running has a second benefit: a **syntax error** (a
missing bracket, a typo in `pirnt`) is caught by `compile()` before anything runs,
which is why the file handles that case separately on lines 25–27.

There's also a line that drops our own `exec()` step out of the error report
(lines 34–36), so the error starts at the learner's code and never mentions our
wrapper. The learner should never know the wrapper exists.

### Splitting the result back apart (lines 43–47)

```js
const at = raw.lastIndexOf(ERR_MARKER);
```

Finds the marker and cuts the text in two. It uses `lastIndexOf` (the **last**
marker, not the first) for a reason: a curious kid could `print("__PYTHONPAL_ERR__")`
themselves. Ours is always written last, so taking the last one is always correct.

If there's no marker at all, the program didn't crash — it's all output.

---

## The main function, step by step

`runCode` runs on every click of the Run button.

**1. Check the code (lines 57–59)**

```js
if (typeof code !== "string" || !code.trim()) { ... 400 ... }
```

Anyone can send anything to our backend, so never trust it. Empty or missing code is
rejected immediately, before we spend one of our API requests on it.

**2. Check the size (lines 65–67)**

We measure the **wrapped** code, not the original. Base64 makes text about a third
longer, so this is what the API actually receives — that's the number that has to fit
under the limit.

**3. Check the key exists (lines 71–74)**

If `ONLINE_COMPILER_API_KEY` is missing when deployed to Render, the request would go
out saying `Authorization: undefined` and come back with a vague permission error
that would take an hour to diagnose. Checking here turns that into an obvious log
line instead.

**4. Send it (lines 77–85)**

The API key is attached here, on the server, which is the whole reason this file
exists. If the browser called the API directly, the key would sit in the page source
where any user could read it and spend our quota.

`AbortSignal.timeout` hangs up after 35 seconds so one infinite loop can't tie up the
server forever.

**5. Read the answer carefully (lines 89–95)**

```js
const raw = await upstream.text();
try { result = JSON.parse(raw); } catch { result = {}; }
```

We read the reply as plain text first, *then* try to interpret it as JSON. When their
server has a bad day it replies with an HTML error page instead of JSON, and asking
JavaScript to read HTML as JSON would crash our backend. This way a bad reply becomes
an empty result we can handle calmly.

**6. Handle their failures (lines 97–108)**

If the API itself refused the request: `429` means we're sending too fast, so the
learner is told to wait a moment. Anything else gets a generic message.

The real reason goes to `console.error` for us and **never** to the browser, because
their error text can mention our API key or account quota.

**7. Build the reply (lines 110–128)**

Split the output at the marker, then decide what counts as an error:

```js
result.exit_code === 0 ? result.error || "" : "Your program stopped unexpectedly..."
```

Because the wrapper catches everything the learner's program could throw, a non-zero
exit code now means something bigger went wrong — their sandbox ran out of time or
memory. So that case gets a message a kid can act on.

The response is shaped as `{ run: { output, stderr } }` — deliberately the same shape
the old Piston API used, so the terminal panel in `Output.jsx` kept working without
any changes.

**8. Handle our own failures (lines 129–137)**

If the 35-second timeout fired, that's almost always a loop that never ends, so the
message says exactly that.

---

## What the learner ends up seeing

For this program, with `Ashish` typed into the Input tab:

```python
print("hello world");
name = input("enter your name: ");
print(x);
```

Output tab, green:

```
hello world
enter your name:
```

And in red underneath:

```
Traceback (most recent call last):
  File "main.py", line 5, in <module>
NameError: name 'x' is not defined
```

Line 5, matching their editor exactly — and the `hello world` that would otherwise
have been thrown away.

---

## Related files

- `Backend/routes/RunRoutes.js` — makes this reachable at `POST /api/run`, behind the
  login check so only signed-in users can spend our quota.
- `Backend/index.js` — mounts those routes at `/api/run`.
- `Frontend/src/API/runAPI.js` — the browser side; attaches the login token and calls
  our backend.
- `Frontend/src/components/Output.jsx` — the Input/Output tabs. Output in green,
  errors in red, and the Input tab is where text for `input()` is typed *before*
  running, since the program can't stop and ask midway.
