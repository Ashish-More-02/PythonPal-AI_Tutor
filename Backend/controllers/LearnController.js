const Groq = require("groq-sdk");
const IDENode = require("../models/IDE_Nodes");
const LearnProgress = require("../models/LearnProgress");
const {
  lessons,
  projects,
  getItem,
  toPublicItem,
  isSlides,
  stepIdsOf,
  READ_STEP_ID,
} = require("../utils/curriculum");
const { reviewPrompt_txt } = require("../utils/Review_Prompt");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Same model as chat: the review has to read beginner code accurately.
const REVIEW_MODEL = "openai/gpt-oss-120b";
const MAX_CODE_CHARS = 20_000;
// Output is only evidence for the reviewer; a runaway print loop shouldn't eat our tokens.
const MAX_OUTPUT_CHARS = 5_000;

// Where each kind's file lives in the learner's IDE tree.
const FOLDERS = { lesson: "lessons", project: "projects" };

// GET /api/learn
// Every lesson and project with this user's progress, for the dashboard.
const getCurriculum = async (req, res) => {
  const userId = req.user.userId; // from middleware
  try {
    const progressRows = await LearnProgress.find({ userId }); // gets only the items which have user progress
    const progressById = {};

    // here we are trying to create a key-value pair , for fast lookup later
    for (const p of progressRows) {
      progressById[p.itemId] = p;
    }

    // this function returns complete data for a specific item
    const summarize = (item) => {
      const progress = progressById[item.id];  // if user already have some progress here , progress will contian that item.id or else undefined.
      const stepIds = stepIdsOf(item);  // gives us all the steps for that specific ID
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        format: isSlides(item) ? "slides" : "exercises",
        totalSteps: stepIds.length,
        // Count only steps that still exist, in case content is edited later.
        completedSteps: progress
          ? stepIds.filter((id) => progress.completedSteps.includes(id)).length
          : 0,
        started: !!progress,
        lastOpenedAt: progress ? progress.updatedAt : null,
      };
    };

    return res.status(200).json({
      success: true,
      lessons: lessons.map(summarize),
      projects: projects.map(summarize),
    });
  } catch (err) {
    console.error("Error getting curriculum:", err);
    return res.status(500).json({ error: "Failed to load lessons" });
  }
};

// POST /api/learn/:itemId/open
// Makes sure the progress row and the item's file exist, then returns both.
// Slides lessons have no code, so no file (file: null).
// Upserts, so opening twice (or React StrictMode's double effect) is harmless.
const openItem = async (req, res) => {
  const userId = req.user.userId;
  const found = getItem(req.params.itemId);
  if (!found) {
    return res.status(404).json({ error: "Lesson not found" });
  }
  const { item, kind } = found;

  try {
    const file = isSlides(item)
      ? null
      : await ensureItemFile(userId, item, kind);

    // No-op update still bumps updatedAt, which is what "continue" sorts by.
    const progress = await LearnProgress.findOneAndUpdate(
      { userId, itemId: item.id },
      { $setOnInsert: { completedSteps: [] } },
      { upsert: true, new: true },
    );

    return res.status(200).json({
      success: true,
      item: toPublicItem(item, kind),
      completedSteps: progress.completedSteps,
      file,
    });
  } catch (err) {
    if (err.status === 409) {
      return res.status(409).json({ error: err.message });
    }
    console.error("Error opening learn item:", err);
    return res.status(500).json({ error: "Failed to open lesson" });
  }
};

// Creates /<lessons|projects>/<id>.py (and its folder) on first open, returns it.
const ensureItemFile = async (userId, item, kind) => {
  const folderName = FOLDERS[kind];

  // inserting or updating folder name
  const folder = await IDENode.findOneAndUpdate(
    { userId, path: `/${folderName}` },
    { $setOnInsert: { name: folderName, type: "folder", parentId: null } },
    { upsert: true, new: true },
  );

  // A learner's own file with that name would otherwise become the parent.
  if (folder.type !== "folder") {
    const err = new Error(
      `You have a file called "${folderName}" in Free Practice. Rename it so we can make your ${folderName} folder.`,
    );
    err.status = 409;
    throw err;
  }

  // $setOnInsert: starter code only on the very first open — never overwrite their work.
  const fileName = `${item.id}.py`;
  const file = await IDENode.findOneAndUpdate(
    { userId, path: `/${folderName}/${fileName}` },
    {
      $setOnInsert: {
        name: fileName,
        type: "file",
        parentId: folder._id,
        content: item.starterCode,
        language: "python",
      },
    },
    { upsert: true, new: true },
  );

  return file;
};

// POST /api/learn/:itemId/steps/:stepId/check
// Body: { code: string, output?: string }
// The task and goal come from the curriculum, never from the body, so a learner
// can't send an easier goal and pass.
const checkStep = async (req, res) => {
  const userId = req.user.userId;
  const { itemId, stepId } = req.params;
  const { code, output } = req.body;

  const step = getItem(itemId)?.item.steps?.find((s) => s.id === stepId);
  if (!step) {
    return res.status(404).json({ error: "Step not found" });
  }

  if (typeof code !== "string" || !code.trim()) {
    return res
      .status(400)
      .json({ error: "Write some code first, then check it." });
  }
  if (code.length > MAX_CODE_CHARS) {
    return res
      .status(413)
      .json({ error: "That program is too long to check." });
  }

  const safeOutput =
    typeof output === "string" ? output.slice(0, MAX_OUTPUT_CHARS) : "";

  try {
    const completion = await groq.chat.completions.create({
      model: REVIEW_MODEL,
      messages: [
        { role: "system", content: reviewPrompt_txt },
        {
          role: "user",
          content:
            `Step task: ${step.task}\n` +
            `Goal (this decides the pass): ${step.goal}\n\n` +
            `Learner's code:\n<code>\n${code}\n</code>\n\n` +
            `Output when they ran it:\n<output>\n${safeOutput || "(no output)"}\n</output>`,
        },
      ],
      temperature: 0.2,
      // gpt-oss spends part of this on reasoning, so leave room beyond the short JSON.
      max_completion_tokens: 2048,
      reasoning_effort: "low",
      response_format: { type: "json_object" },
    });

    let review;
    try {
      review = JSON.parse(completion.choices[0]?.message?.content || "");
    } catch {
      console.error(
        "Review was not JSON:",
        completion.choices[0]?.message?.content,
      );
      return res
        .status(502)
        .json({
          error: "Codey got confused checking that one. Please try again.",
        });
    }

    // Only a real boolean true passes — "false" as a string must not.
    const passed = review.passed === true;

    const progress = passed
      ? await LearnProgress.findOneAndUpdate(
          { userId, itemId },
          { $addToSet: { completedSteps: stepId } },
          { upsert: true, new: true },
        )
      : await LearnProgress.findOne({ userId, itemId });

    return res.status(200).json({
      success: true,
      passed,
      feedback: String(review.feedback || ""),
      hint: passed ? "" : String(review.hint || ""),
      completedSteps: progress ? progress.completedSteps : [],
    });
  } catch (err) {
    if (err?.status === 429) {
      return res.status(429).json({
        error:
          "Codey is a bit busy right now. Please wait a few seconds and check again.",
      });
    }
    console.error("Error checking step:", err);
    return res
      .status(500)
      .json({ error: "Could not check your code", details: err.message });
  }
};

// POST /api/learn/:itemId/complete
// "Mark as complete" for slides lessons. Exercises can't use this — Codey checks those.
const completeItem = async (req, res) => {
  const userId = req.user.userId;
  const found = getItem(req.params.itemId);
  if (!found) {
    return res.status(404).json({ error: "Lesson not found" });
  }
  if (!isSlides(found.item)) {
    return res
      .status(400)
      .json({ error: "This lesson is completed by checking your code." });
  }

  try {
    const progress = await LearnProgress.findOneAndUpdate(
      { userId, itemId: found.item.id },
      { $addToSet: { completedSteps: READ_STEP_ID } },
      { upsert: true, new: true },
    );
    return res
      .status(200)
      .json({ success: true, completedSteps: progress.completedSteps });
  } catch (err) {
    console.error("Error completing learn item:", err);
    return res.status(500).json({ error: "Failed to mark lesson complete" });
  }
};

module.exports = { getCurriculum, openItem, checkStep, completeItem };
