require("dotenv").config(); // always write this line so that we can use env variables anywhere.
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = 3000;
const authRoutes = require("./routes/AuthRoutes");
const {connectDB} = require("./config/dbConfig");

const app = express();

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

// Auth routes.
app.use("/",authRoutes);

// connect to the database 
connectDB();

app.listen(PORT, () => {
  console.log("server started on PORT : " + PORT);
});