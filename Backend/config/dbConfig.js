// this function will return a connect function which we can call later

const mongoose = require("mongoose");

// cloud connection string
const MONGODB_CLOUD_CONNECTION_STRING = process.env.MONGODB_CLOUD_CONNECTION_STRING;

function connectDB() {
  mongoose
    .connect(MONGODB_CLOUD_CONNECTION_STRING)
    .then(() => {
      console.log("mongodb connected successfully!");
    })
    .catch((err) => {
      console.log("error in mongodb Connection" + err);
    });
}

module.exports = {connectDB};