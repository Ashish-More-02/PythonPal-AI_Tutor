const express = require("express");
const { getCurriculum, openItem, checkStep, completeItem } = require("../controllers/LearnController");
const { checkJWTtoken } = require("../middleware/CommonMiddleware");

const router = express.Router();

// Mounted at "/api/learn" in index.js. Guided learning: Python Basics lessons and
// projects share open → step → check; slides lessons use /complete instead.
router.use(checkJWTtoken);

router.get("/", getCurriculum);
router.post("/:itemId/open", openItem);
router.post("/:itemId/steps/:stepId/check", checkStep);
router.post("/:itemId/complete", completeItem);

module.exports = router;
