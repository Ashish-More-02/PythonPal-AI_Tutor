const Groq = require("groq-sdk");
const { systemPrompt_txt } = require("../utils/System_Prompt");
const {
  summarizeOldMessages,
  buildContext,
} = require("../utils/AI-chat-utils");
const { ChatHistory } = require("../models/AI_chats");

// initialised new Groq instance
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Main tutor model: strong at coding, 131K context, up to 65K output tokens.
const CHAT_MODEL = "openai/gpt-oss-120b";

// POST /ai/chat
// Body: { messages: [{ role: "user" | "assistant", content: "..." }, ...], codeContext?: { fileName: string, content: string } | string }
// Responds with a plain-text stream of the AI reply.
const chatWithAI = async (req, res) => {
  const { messages, codeContext } = req.body;

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

  try {
    // Trim/summarize BEFORE the streaming call. Any rate-limit error from the
    // summary step also lands in the catch below, while headers are still unsent.
    const outgoingMessages = await buildContext(safeMessages, codeContext);

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


const MAX_SAVED_CHATS = 10;

// helper function - not api
const generateTitle = (messages, customTitle) => {
  if (customTitle && customTitle.trim() && customTitle.trim() !== "New Chat") {
    return customTitle.trim();
  }
  const firstUserMsg = messages.find((m) => m && m.role === "user");
  if (firstUserMsg && firstUserMsg.content) {
    const text = firstUserMsg.content.trim().replace(/\n/g, " ");
    return text.length > 30 ? text.substring(0, 30) + "..." : text;
  }
  return "New Chat";
};

// supports saving and updating the same chat history.
const saveChathistory = async (req, res) => {
  const { chatId, messages, title } = req.body;
  const userID = req.user.userId;

  let messagesList = messages;
  if (typeof messagesList === "string") {
    try {
      messagesList = JSON.parse(messagesList);
    } catch (e) {
      messagesList = [];
    }
  }

  if (!Array.isArray(messagesList) || messagesList.length === 0) {
    return res.status(400).json({ error: "chat history is empty!" });
  }

  try {
    let existingChat = null;
    // if chatId is present it means , we will update the existing chat
    if (chatId) {
      existingChat = await ChatHistory.findOne({ _id: chatId, userID });
    }

    const calculatedTitle = generateTitle(
      messagesList,
      title || (existingChat && existingChat.title)
    );

    if (existingChat) {
      existingChat.messages = messagesList;
      existingChat.title = calculatedTitle;
      await existingChat.save();

      return res.status(200).json({
        success: true,
        message: "Chat history updated successfully",
        chat: existingChat,
      });
    }

    // Creating a new chat - enforce 10 chat limit per user
    const userChatsCount = await ChatHistory.countDocuments({ userID });
    if (userChatsCount >= MAX_SAVED_CHATS) {
      // the +1 reserves a slot or seat for the new chat we are going to create.
      const excessCount = userChatsCount - MAX_SAVED_CHATS + 1;
      // in sorting 1 is ascending and -1 is descending

      // finding a list of oldest chats to delete
      // limit = returns the maximum number of document specified by the limit.
      const oldestChats = await ChatHistory.find({ userID })
        .sort({ updatedAt: 1, createdAt: 1 })
        .limit(excessCount);

      if (oldestChats.length > 0) {
        const oldestIds = oldestChats.map((c) => c._id);
        await ChatHistory.deleteMany({ _id: { $in: oldestIds } });
      }
    }

    const newChat = await ChatHistory.create({
      userID,
      title: calculatedTitle,
      messages: messagesList,
    });

    return res.status(200).json({
      success: true,
      message: "Chat history saved successfully",
      chat: newChat,
    });

  } catch (err) {
    console.error("Error saving chat history:", err);
    return res
      .status(500)
      .json({ error: "error while saving chat history, please try again!" });
  }
};

const getChatHistories = async (req, res) => {
  const userID = req.user.userId;
  try {
    const chats = await ChatHistory.find({ userID })
      .sort({ updatedAt: -1 })
      .select("_id title updatedAt createdAt messages");

    return res.status(200).json({ success: true, chats });
  } catch (err) {
    console.error("Error getting chat histories:", err);
    return res
      .status(500)
      .json({ error: "Failed to retrieve chat histories" });
  }
};

const getChatHistoryById = async (req, res) => {
  const userID = req.user.userId;
  const { chatId } = req.params;

  try {
    const chat = await ChatHistory.findOne({ _id: chatId, userID });
    if (!chat) {
      return res.status(404).json({ error: "Chat history not found" });
    }

    return res.status(200).json({ success: true, chat });
  } catch (err) {
    console.error("Error fetching chat history by id:", err);
    return res.status(500).json({ error: "Failed to retrieve chat history" });
  }
};

const deleteChatHistoryById = async (req, res) => {
  const userID = req.user.userId;
  const { chatId } = req.params;

  try {
    const deletedChat = await ChatHistory.findOneAndDelete({
      _id: chatId,
      userID,
    });
    if (!deletedChat) {
      return res.status(404).json({ error: "Chat history not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Chat history deleted successfully" });
  } catch (err) {
    console.error("Error deleting chat history:", err);
    return res.status(500).json({ error: "Failed to delete chat history" });
  }
};

module.exports = {
  chatWithAI,
  saveChathistory,
  getChatHistories,
  getChatHistoryById,
  deleteChatHistoryById,
};
