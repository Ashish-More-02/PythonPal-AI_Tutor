const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "New Chat",
    },
    messages: [
      {
        role: { type: String, required: true },
        content: { type: String, default: "" },
        context: { type: mongoose.Schema.Types.Mixed, default: null },
      },
    ],
  },
  { timestamps: true }
);

const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);

module.exports = {
  ChatHistory,
};