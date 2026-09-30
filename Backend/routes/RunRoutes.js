const express = require("express");
const { runCode } = require("../controllers/RunCodeController");
const { checkJWTtoken } = require("../middleware/CommonMiddleware");

const router = express.Router();

// Mounted at "/api/run" in index.js. Behind the token so our free-tier quota
// can only be spent by logged-in users.
router.post("/", checkJWTtoken, runCode);

module.exports = router;
