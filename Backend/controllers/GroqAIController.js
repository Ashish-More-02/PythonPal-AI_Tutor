const Groq = require("groq-sdk");
const { systemPrompt_txt } = require("../utils/System_Prompt");

// One client for the whole server. The key is read from Backend/.env and never
// leaves this machine — that is the entire reason this call moved off the browser.
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /ai/chat
// Body: { messages: [{ role: "user" | "assistant", content: "..." }, ...] }
// Responds with a plain-text stream of the AI reply.
const chatWithAI = async (req, res) => {
  const { messages } = req.body;

  // The client controls this array, so never trust it as-is.
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages must be a non-empty array" });
  }

  // Keep only the two fields Groq needs, and only the two roles the client is
  // allowed to send — this stops a caller from injecting their own system prompt
  // and talking Codey out of being a kids' Python tutor.
  const safeMessages = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant"))
    .map((m) => ({ role: m.role, content: String(m.content ?? "") }));

  try {
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      // The system prompt is prepended here, on the server, every single time.
      messages: [{ role: "system", content: systemPrompt_txt }, ...safeMessages],
      temperature: 0.8,
      max_completion_tokens: 4092,
      stream: true,
    });

    // Tell the browser this is a long, chunk-by-chunk text response rather than
    // one JSON blob it should wait for.
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");

    // Each chunk holds a tiny slice of the answer. Push it out immediately
    // instead of collecting the whole reply first.
    for await (const chunk of stream) {
      res.write(chunk.choices[0]?.delta?.content || "");
    }

    res.end();
  } catch (err) {
    // Once the first chunk is out the status code is already sent, so the only
    // honest thing left to do is close the stream.
    if (res.headersSent) return res.end();
    res.status(500).json({ error: "AI request failed", details: err.message });
  }
};

module.exports = { chatWithAI };
