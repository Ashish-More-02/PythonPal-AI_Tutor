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
//   short chat  -> [system prompt] + [attached code context] + [safeMessages]
//   long chat   -> [system prompt] + [attached code context] + [summary of old turns] + [recent turns]
async function buildContext(safeMessages, codeContext = null) {
  const contextMessages = [{ role: "system", content: systemPrompt_txt }];

  if (codeContext) {
    let contextStr = "";
    if (typeof codeContext === "object" && codeContext !== null) {
      const fileName = codeContext.fileName || "Active File";
      const content = codeContext.content || "";
      if (content.trim()) {
        contextStr = `Current Active File Context (${fileName}):\n\`\`\`python\n${content}\n\`\`\``;
      }
    } else if (typeof codeContext === "string" && codeContext.trim()) {
      contextStr = `Current Active Code Context:\n\`\`\`python\n${codeContext.trim()}\n\`\`\``;
    }

    if (contextStr) {
      contextMessages.push({
        role: "system",
        content: `Active Code Context provided by the student from their active codeEditor:\n${contextStr}\n\nUse this code context to directly answer the student's question, help them debug, or explain concepts in relation to their current code.`,
      });
    }
  }

  // Short conversation — cheap enough to send in full, no summary needed.
  if (safeMessages.length <= SUMMARIZE_THRESHOLD) {
    return [...contextMessages, ...safeMessages];
  }

  const recent = safeMessages.slice(-KEEP_RECENT_MESSAGES);
  const older = safeMessages.slice(0, -KEEP_RECENT_MESSAGES);

  try {
    const summary = await summarizeOldMessages(older);
    return [
      ...contextMessages,
      { role: "system", content: `Summary of the earlier conversation so far: ${summary}` },
      ...recent,
    ];
  } catch (err) {
    // If summarizing fails (rate limit, network, etc.), fall back to a plain
    // sliding window — drop the old messages rather than failing the whole reply.
    return [...contextMessages, ...recent];
  }
}

// if it is long conversation, then we are sending 3 system messages each time, 
// 1. default system prompt
// 2. code context
// 3. summarized messages


module.exports = {
    summarizeOldMessages,
    buildContext
}