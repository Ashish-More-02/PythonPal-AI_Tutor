require("dotenv").config(); // always write this line so that we can use env variables anywhere.
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = process.env.PORT || 3000; // Render injects PORT in production
const authRoutes = require("./routes/AuthRoutes");
const aiRoutes = require("./routes/AIRoutes");
const {connectDB} = require("./config/dbConfig");
const ideRoutes = require("./routes/IdeRoutes");
const runRoutes = require("./routes/RunRoutes");
const learnRoutes = require("./routes/LearnRoutes");

const app = express();

// using middlewares to support json parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    // local dev + deployed frontend; extra origins (e.g. Vercel previews) via CLIENT_ORIGINS
    origin: [
      "http://localhost:5173",
      "https://python-pal-ai-tutor.vercel.app",
      ...(process.env.CLIENT_ORIGINS ? process.env.CLIENT_ORIGINS.split(",") : []),
    ],
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

// Cheap wake-up/keep-alive target: no auth, no DB, so it answers as soon as the process is up.
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Auth routes.
app.use("/",authRoutes);

// AI routes.
app.use("/ai", aiRoutes);

// IDE routes.
app.use('/api/ide', ideRoutes);

// Code execution routes.
app.use('/api/run', runRoutes);

// Guided learning routes (lessons + projects).
app.use('/api/learn', learnRoutes);

// connect to the database 
connectDB();

app.listen(PORT, () => {
  console.log("server started on PORT : " + PORT);
});