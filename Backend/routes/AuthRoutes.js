const express = require("express");
const { signup, signin } = require("../controllers/AuthController");

const router = express.Router();

// Public routes — a brand-new user can't have a token yet, so these must NOT be
// behind checkJWTtoken. They are what hand the token OUT.
router.post("/signup", signup);
router.post("/signin", signin);

module.exports = router;
