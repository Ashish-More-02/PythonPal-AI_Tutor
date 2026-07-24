const Groq = require("groq-sdk");
const { systemPrompt_txt } = require("../utils/System_Prompt");
const {
  summarizeOldMessages,
  buildContext,
} = require("../utils/AI-chat-utils");

// initialised new Groq instance
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Main tutor model: strong at coding, 131K context, up to 65K output tokens.
const CHAT_MODEL = "openai/gpt-oss-120b";

// POST /ai/chat
// Body: { messages: [{ role: "user" | "assistant", content: "..." }, ...] }
// Responds with a plain-text stream of the AI reply.
const chatWithAI = async (req, res) => {
  const { messages } = req.body;

  // The client controls this array, so never trust it as-is.
  if (!Array.isArray(messages) || messages.length === 0) {
    return res
      .status(400)
      .json({ error: "messages must be a non-empty array" });
  }

  // Keep only the two fields Groq needs, and only the two roles the client is
  // allowed to send — this stops a caller from injecting their own system prompt
  // and talking Codey out of being a kids' Python tutor.
  const safeMessages = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant"))
    .map((m) => ({ role: m.role, content: String(m.content ?? "") }));

  console.log(safeMessages);

  try {
    // Trim/summarize BEFORE the streaming call. Any rate-limit error from the
    // summary step also lands in the catch below, while headers are still unsent.
    const outgoingMessages = await buildContext(safeMessages);

    const stream = await groq.chat.completions.create({
      model: CHAT_MODEL,
      messages: outgoingMessages,
      temperature: 0.8,
      max_completion_tokens: 4092,
      stream: true,
    });

    // Tell the browser this is a long, chunk-by-chunk text response rather than
    // one JSON blob it should wait for.
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");

    // Each chunk holds a tiny slice of the answer. Push it out immediately instead of collecting the whole reply first.
    // res.write() does not close the connection when sending response to frontend , but it only supports plain text, 
    for await (const chunk of stream) {
      res.write(chunk.choices[0]?.delta?.content || "");
    }

    // with res.write() we need to explicitly use res.end() to tell frontend that streaming have stopped.
    res.end();
  } catch (err) {
    // Once the first chunk is out the status code is already sent, so the only
    // honest thing left to do is close the stream.
    if (res.headersSent) return res.end();

    // 429 = we've hit Groq's per-minute token/request limit. Tell the client to
    // slow down instead of showing a scary generic error.
    if (err?.status === 429) {
      return res.status(429).json({
        error:
          "Codey is a bit busy right now. Please wait a few seconds and try again.",
      });
    }

    res.status(500).json({ error: "AI request failed", details: err.message });
  }
};

module.exports = { chatWithAI };
