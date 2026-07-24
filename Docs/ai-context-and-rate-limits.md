# AI Chat: Context, Memory, and Rate Limits

How the tutor "remembers" a conversation, why that makes token usage grow, and what we do about it.
Covers the model choice, the TPM limit, and the sliding-window + summarization + 429 handling in
[`GroqAIController.js`](../Backend/controllers/GroqAIController.js).

**The one thing to internalise:** the model has **no memory**. Every API call is a blank slate. The
"conversation" only exists because we resend the whole history each time — and *that* is what grows
your token bill until you hit a limit.

## 1. LLM APIs are stateless

When you call Groq (or Claude's API, or OpenAI's), the model does not remember your previous message.
Each request spins up the model, feeds it text, returns output, and discards everything.

The memory you *feel* in ChatGPT is an illusion built by **resending the entire history every turn:**

```
Turn 1:  [system + msg1]                                   -> reply1
Turn 2:  [system + msg1 + reply1 + msg2]                    -> reply2
Turn 3:  [system + msg1 + reply1 + msg2 + reply2 + msg3]    -> reply3
         └──────────────── resent every single time ──────┘
```

Our backend is stateless too: the frontend sends the full `messages` array on every request, and
[`GroqAIController.js`](../Backend/controllers/GroqAIController.js) prepends the system prompt server-side.
Claude and ChatGPT work the **same way** — there is no secret server-side memory. They just layer the
techniques in section 4 on top of the resending.

## 2. Two different limits (don't confuse them)

| | What overflows | What you see | Fix |
| --- | --- | --- | --- |
| **Context window** (131,072 tok) | One request's total tokens (input + output) | API error, request rejected | Trim / summarize history |
| **TPM rate limit** (~12K tok/min) | Too many tokens *per minute* across requests | `429 Too Many Requests` | Trim history, retry, or upgrade tier |

- **Context window** = how much the model can *read* in one call. Input **and** output share it.
- **max_completion_tokens** (ours: `4092`) = a cap on how much the model may *write*. It's carved
  *out of* the context window, not added on top.
- A **token** ≈ ¾ of a word (~4 characters).

For our kids' tutor, we hit **TPM (the 429) long before** the 131K context window — because TPM is a
per-minute budget and a single deep conversation resends thousands of tokens per turn.

## 3. Why token usage grows — and when it breaks

Because we resend everything, each turn is bigger than the last:

- System prompt: ~1,000 tokens (fixed, every call)
- Each turn (question + answer): ~500–1,500 tokens, accumulating

A student 20 turns deep can send ~8,000 tokens in **one** request. Against a ~12K TPM limit, only a
couple of active students per minute will trip a `429`. Left unbounded, a long conversation eventually
fails and can't proceed — exactly the problem this doc's implementation prevents.

## 4. ✨ How the big apps handle it (the four levers)

All of these sit *on top of* resending. We use the first two.

1. **Sliding window** — only send the last N messages; older ones drop off the front. Cheap and
   predictable. Cost: the model forgets the oldest turns.
2. **Summarization / compaction** — when history gets long, make a *separate* call to summarize the old
   turns, then replace them with that short recap. This is what "compaction" in Claude Code and
   ChatGPT's memory lean on. Keeps the gist at a fraction of the tokens.
3. **Retrieval (RAG)** — store all history in a database, fetch only the *relevant* few messages each
   turn. For huge knowledge bases; overkill for a tutoring chat.
4. **Prompt caching** — the provider caches the unchanging front (the system prompt) so you're not
   billed full price to reprocess it each call. Cuts cost and latency; does **not** shrink token count.

## 5. What we implemented

All in [`GroqAIController.js`](../Backend/controllers/GroqAIController.js).

### Model switch
`llama-3.3-70b-versatile` is retired by Groq on **2026-08-16**. We switched to **`openai/gpt-oss-120b`**
(Groq's recommended replacement): stronger at coding, 131K context, up to 65K output, built-in reasoning.
A smaller **`openai/gpt-oss-20b`** is used only for summaries — no need to pay the big model to compress text.

### Sliding window + summarization
`buildContext()` decides what to send:

```
conversation ≤ 20 messages   ->  send everything (cheap, no summary)
conversation > 20 messages   ->  [system prompt]
                                 [summary of the older turns]   (via the cheap model)
                                 [last 10 messages verbatim]
```

Tunable constants: `KEEP_RECENT_MESSAGES = 10`, `SUMMARIZE_THRESHOLD = 20`. This **bounds
tokens-per-request** so it can't grow forever, while keeping the gist of the whole lesson. The system
prompt is always sent in full, so Codey never forgets it's a kids' tutor.

If the summary call itself fails, we **fall back to a plain sliding window** (drop the old messages)
rather than failing the student's request.

### 429 handling
The `catch` block checks `err.status === 429` and returns a friendly
`"Codey is a bit busy right now. Please wait a few seconds and try again."` instead of a scary generic
error. The frontend already surfaces `data.error`, so this message reaches the user as-is.

## 6. Known tradeoffs / future work

- **Re-summarizing each turn.** Because the backend is stateless, once past the threshold we re-summarize
  the old turns on *every* request — an extra cheap-model call per turn. Fine at this scale. To optimise
  later: store the running summary (client-side or in a DB) so it's computed once, or add **prompt
  caching** for the system prompt.
- **Message-count threshold, not token-count.** We trim on number of messages, which is simple and clear
  but approximate. A token-based threshold would be tighter but needs a tokenizer.
- **Scaling past the free tier.** The real ceiling is TPM/RPM, not intelligence or context. For
  classroom-scale concurrent use, upgrade to Groq's paid Developer tier for much higher limits.

## Sources

- [Groq Supported Models](https://console.groq.com/docs/models)
- [Groq Model Deprecations](https://console.groq.com/docs/deprecations)
- [Groq Rate Limits](https://console.groq.com/docs/rate-limits)
