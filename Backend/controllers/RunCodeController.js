// Code execution lives here because the OnlineCompiler key must never reach the
// browser, and their API sends no CORS headers — a direct fetch from React would
// fail preflight anyway.

const RUN_URL = "https://api.onlinecompiler.io/api/run-code-sync/";
const PYTHON_COMPILER = "python-3.14";
const MAX_BYTES = 100_000; // upstream rejects code/input larger than this
const UPSTREAM_TIMEOUT_MS = 35_000; // their sync endpoint blocks for up to 30s

// Upstream throws away stdout AND the traceback whenever the process exits
// non-zero, replacing both with "Internal error: code execution failed". So we
// never let the process fail: the program runs inside a try/except that prints
// the traceback to stdout after this marker, and we split the two apart again.
const ERR_MARKER = "\n__PYTHONPAL_ERR__\n";

// Base64 keeps the learner's quotes, backslashes and newlines out of the
// wrapper's own syntax. Compiling as "main.py" makes the traceback line numbers
// match what they see in the editor.

// the line 23 , 28 and 39 have javascript code inside this python looking string , as javascript code runs right now dropping the text then and there in the string literal 
const buildRunnableSource = (code) => `import base64, sys, traceback

_src = base64.b64decode("${Buffer.from(code, "utf8").toString("base64")}").decode("utf-8")

try:
    _obj = compile(_src, "main.py", "exec")
except SyntaxError as _e:
    sys.stdout.write(${JSON.stringify(ERR_MARKER)})
    sys.stdout.write("".join(traceback.format_exception_only(type(_e), _e)))
else:
    try:
        exec(_obj, {"__name__": "__main__"})
    except SystemExit:
        pass
    except BaseException as _e:
        # Drop our own exec() frame so the trace starts at the learner's code.
        if _e.__traceback__ is not None and _e.__traceback__.tb_next is not None:
            _e.__traceback__ = _e.__traceback__.tb_next
        sys.stdout.write(${JSON.stringify(ERR_MARKER)})
        traceback.print_exception(_e, file=sys.stdout)
`;

// Our marker is written last, so the final one is always ours even if the
// program printed the same string itself.
const splitAtMarker = (raw) => {
  const at = raw.lastIndexOf(ERR_MARKER);
  if (at === -1) return { output: raw, trace: "" };
  return { output: raw.slice(0, at), trace: raw.slice(at + ERR_MARKER.length) };
};

// POST /api/run
// Body: { code: string, input?: string }
// Responds with Piston's old shape — { run: { output, stderr } } — so the
// editor's terminal panel keeps rendering unchanged.
const runCode = async (req, res) => {
  const { code, input } = req.body;

  // The client controls the body, so check it before spending a request.
  if (typeof code !== "string" || !code.trim()) {
    return res.status(400).json({ error: "code must be a non-empty string" });
  }

  const stdin = typeof input === "string" ? input : "";
  const source = buildRunnableSource(code);

  // The wrapper base64s the code, so check the payload upstream actually gets.
  if (Buffer.byteLength(source) > MAX_BYTES || Buffer.byteLength(stdin) > MAX_BYTES) {
    return res.status(413).json({ error: "That program is too long to run." });
  }

  // A missing key on the deploy host would otherwise reach upstream as
  // "Authorization: undefined" and come back as a vague 403.
  if (!process.env.ONLINE_COMPILER_API_KEY) {
    console.error("ONLINE_COMPILER_API_KEY is not set");
    return res.status(500).json({ error: "The code runner is not configured." });
  }

  try {
    const upstream = await fetch(RUN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.ONLINE_COMPILER_API_KEY,
      },
      body: JSON.stringify({ compiler: PYTHON_COMPILER, code: source, input: stdin }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    // A failing upstream can answer with nginx HTML instead of JSON, so parse
    // defensively rather than letting res.json() throw.
    const raw = await upstream.text();
    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      result = {};
    }

    if (!upstream.ok) {
      // Log the real reason for us, return a vague one to the client — the
      // upstream body can mention the key or our quota.
      console.error("OnlineCompiler error:", upstream.status, raw.slice(0, 300));

      if (upstream.status === 429) {
        return res.status(429).json({
          error: "The code runner is busy right now. Wait a few seconds and hit Run again.",
        });
      }
      return res.status(502).json({ error: "The code runner is unavailable right now." });
    }

    const { output, trace } = splitAtMarker(result.output || "");

    // A non-zero exit now means the sandbox itself gave up — our wrapper catches
    // everything the program could raise — so say something a kid can act on.
    const upstreamError =
      result.exit_code === 0
        ? result.error || ""
        : "Your program stopped unexpectedly. It may have run too long or used too much memory.";

    res.json({
      success: true,
      run: {
        output,
        stderr: [trace, upstreamError].filter(Boolean).join(""),
        code: result.exit_code,
        time: result.time,
        memory: result.memory,
      },
    });
  } catch (err) {
    // A kid's infinite loop lands here once the upstream stops answering.
    if (err.name === "TimeoutError") {
      return res.status(504).json({
        error: "Your program took too long to finish. Check for a loop that never ends.",
      });
    }
    res.status(500).json({ error: "Could not run the code", details: err.message });
  }
};

module.exports = { runCode };
