const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = 3000;

const app = express();

// password for main db : Ashish-pythonPal

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

app.get("/", (req, res) => {
  res.json({ status: "connected", "what is this?": "homepage" });
});

app.listen(PORT, () => {
  console.log("server started on PORT : " + PORT);
});
