const express = require("express");
const { chatWithAI } = require("../controllers/GroqAIController");
const { checkJWTtoken } = require("../middleware/CommonMiddleware");

const router = express.Router();

// Mounted at "/ai" in index.js, so the full URL is POST /ai/chat.
// checkJWTtoken runs first: only a logged-in user (valid token) reaches the AI.
router.post("/chat", checkJWTtoken, chatWithAI);

module.exports = router;
