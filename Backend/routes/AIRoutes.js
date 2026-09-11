const express = require("express");
const {
  chatWithAI,
  saveChathistory,
  getChatHistories,
  getChatHistoryById,
  deleteChatHistoryById,
} = require("../controllers/GroqAIController");
const { checkJWTtoken } = require("../middleware/CommonMiddleware");

const router = express.Router();
 
// Mounted at "/ai" in index.js, so the full URL is POST /ai/chat.
// checkJWTtoken runs first: only a logged-in user (valid token) reaches the AI.
router.post("/chat", checkJWTtoken, chatWithAI);
router.post("/save_chat_history", checkJWTtoken, saveChathistory);
router.get("/get_chat_histories", checkJWTtoken, getChatHistories);
router.get("/get_chat_history/:chatId", checkJWTtoken, getChatHistoryById);
router.delete("/delete_chat_history/:chatId", checkJWTtoken, deleteChatHistoryById);

module.exports = router;
