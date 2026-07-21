const jwt = require("jsonwebtoken");

// this middleware will check the jwt token for any request and then we can proceed with the request
const checkJWTtoken = async (req, res, next) => {
  // this will hold the value of auth header
  const header = req.header.authorization;

  if (!header) {
    return res.status(401).json({error:"Authorization headers are not provided, please provide it with JWT token"});
  }

  // token contain "Bearer <token_data>"
  const token = header.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "auth token not found!" });
  }

  // verify token using jwt.verify() method
  try {
    const UserPayload = jwt.verify(token, process.env.JWT_SECRET);

    // attach the userPayload to common req object
    req.user = UserPayload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "unable to decode jwt token" });
  }
};

module.exports = {
  checkJWTtoken,
};
