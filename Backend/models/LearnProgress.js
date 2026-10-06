const mongoose = require("mongoose");

// One row per user per lesson or project. Created on first open, so "started" is
// just "a row exists"; updatedAt drives "continue where you left off".
const learnProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // A lesson or project id from utils/curriculum.js, not an ObjectId — the
    // content lives in code, not the DB.
    itemId: {
      type: String,
      required: true,
    },
    completedSteps: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

learnProgressSchema.index({ userId: 1, itemId: 1 }, { unique: true });

const LearnProgress = mongoose.model("LearnProgress", learnProgressSchema);

module.exports = LearnProgress;
