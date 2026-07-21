const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// signup controller.
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // all fields are required
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required " });
    }

    // Verify the PLAINTEXT password before we hash it.
    // At least 6 chars, one uppercase letter, one number, one special character.
    // there is one small issue that now , the password validate function is not in the db schema , any othe controller or function saving passwords will also have to do it before hashing it 
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 6 characters and contain one uppercase letter, one number, and one special character",
      });
    }

    const saltRounds = 10;

    // Only the hash is stored — the plaintext is never persisted.
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      name: name,
      email: email,
      password: hashedPassword,
    });

    return res.status(201).json({ message: "user registered successfully " });
  } catch (err) {
    res.status(500).json({ error: "My server Error ", details: err });
  }
};

// signin contorller
const signin = async (req, res) => {
  const { email, password } = req.body;

  if (email == "" || password == "") {
    return res
      .status(400)
      .json({ error: "email and password cannot be empty " });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ error: "User not found , please try to sign in !" });
    }

    // it returns true or false.
    const compare = await bcrypt.compare(password, user.password);

    if (!compare) {
      return res.status(401).json({ error: "Invalid credentails" });
    } else {
      // if user found , create a JWT token and send it to frontend.
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.status(200).json({
        message: "login successful",
        user: { name: user.name, email: user.email },
      });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

module.exports = {
  signup,
  signin,
};
