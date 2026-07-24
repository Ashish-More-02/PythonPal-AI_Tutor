const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const { systemPrompt_txt } = require("../utils/System_Prompt");

// summary model : used cheaper model to generate summary of the older converstaions
const SUMMARY_MODEL = "openai/gpt-oss-20b";

// The most recent messages are always sent to the model word-for-word.
const KEEP_RECENT_MESSAGES = 10;
// Once the conversation grows past this many messages, everything OLDER than the
// recent window gets squeezed into a single summary instead of sent in full.
// This is what keeps tokens-per-request (and therefore TPM) from growing forever.
const SUMMARIZE_THRESHOLD = 20;

// Ask the cheap model to compress the older turns into a few sentences, so the
// tutor keeps the gist of the lesson without resending the entire transcript
// on every request. This is the "compaction" pattern big chat apps use.
async function summarizeOldMessages(oldMessages) {
  const transcript = oldMessages.map((m) => `${m.role}: ${m.content}`).join("\n");

  const completion = await groq.chat.completions.create({
    model: SUMMARY_MODEL,
    messages: [
      {
        role: "system",
        content:
          "Summarize this Python tutoring conversation in a few sentences. " +
          "Capture what the student already knows, what has been taught, and any " +
          "exercise in progress. Be concise — this is memory for the tutor, not a reply to the student.",
      },
      { role: "user", content: transcript },
    ],
    temperature: 0.3,
    max_completion_tokens: 800,
  });

  // we get this info from the groq response.
  return completion.choices[0]?.message?.content || "";
}

// Decide exactly which messages get sent to the model this turn:
//   short chat  -> send everything
//   long chat   -> [system prompt] + [summary of old turns] + [recent turns]
async function buildContext(safeMessages) {
  // Short conversation — cheap enough to send in full, no summary needed.
  if (safeMessages.length <= SUMMARIZE_THRESHOLD) {
    return [{ role: "system", content: systemPrompt_txt }, ...safeMessages];
  }

  const recent = safeMessages.slice(-KEEP_RECENT_MESSAGES);
  const older = safeMessages.slice(0, -KEEP_RECENT_MESSAGES);

  try {
    const summary = await summarizeOldMessages(older);
    return [
      { role: "system", content: systemPrompt_txt },
      { role: "system", content: `Summary of the earlier conversation so far: ${summary}` },
      ...recent,
    ];
  } catch (err) {
    // If summarizing fails (rate limit, network, etc.), fall back to a plain
    // sliding window — drop the old messages rather than failing the whole reply.
    return [{ role: "system", content: systemPrompt_txt }, ...recent];
  }
}


module.exports = {
    summarizeOldMessages,
    buildContext
}