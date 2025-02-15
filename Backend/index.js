const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = 3000;
const User = require("./models/User");

const app = express();

mongoose
  .connect(
    "mongodb+srv://ashishmore2125:Ashish-pythonPal@cluster0.ef5dj.mongodb.net/users"
  )
  .then(() => {
    console.log("mongodb connected successfully !");
  })
  .catch((err) => {
    console.log("error : " + err);
  });

// using middlewares to support json parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


// app.use(
//   cors({
//     origin: "*", // Allows requests from any origin
//     credentials: true, 
//   })
// );

app.get("/", (req, res) => {
  res.json({ status: "connected", "what is this?": "homepage" });
});

// sign up route
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // all fields are required
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required " });
    }

    const user = await User.create({ name, email, password });

    return res.status(201).json({ message: "user registered successfully " });
  } catch (err) {
    res.status(500).json({ error: "My server Error ", details: err });
  }
});

// sign in route
app.post("/signin", async (req, res) => {
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

    // Compare the password directly
    if (password !== user.password) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    return res.status(200).json({
      message: "login successful",
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log("server started on PORT : " + PORT);
});