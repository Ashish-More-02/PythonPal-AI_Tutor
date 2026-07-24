const jwt = require("jsonwebtoken");

// this middleware will check the jwt token for any request and then we can proceed with the request
const checkJWTtoken = async (req, res, next) => {
  // this will hold the value of auth header
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: "You must be logged in to do that." });
  }

  // token contain "Bearer <token_data>"
  const token = header.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Auth token missing. Please log in again." });
  }

  // verify token using jwt.verify() method
  try {
    const UserPayload = jwt.verify(token, process.env.JWT_SECRET);

    // attach the userPayload to common req object
    req.user = UserPayload;
    next();
  } catch (err) {
    // Covers both a tampered token and an expired one.
    return res.status(401).json({ error: "Session expired. Please log in again." });
  }
};

module.exports = {
  checkJWTtoken,
};
