const express = require("express");
const { signup, signin } = require("../controllers/AuthController");
const { checkJWTtoken } = require("../middleware/CommonMiddleware");

const router = express.Router();

// protected route with middleware.
router.use(checkJWTtoken);
router.post("/signup", signup);
router.post("/sigin", signin);

module.exports = router;
