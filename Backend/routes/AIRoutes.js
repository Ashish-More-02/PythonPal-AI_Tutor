const express = require("express");
const { chatWithAI } = require("../controllers/GroqAIController");

const router = express.Router();

// Mounted at "/ai" in index.js, so the full URL is POST /ai/chat
router.post("/chat", chatWithAI);

module.exports = router;
