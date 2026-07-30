// this function will return a connect function which we can call later

const mongoose = require("mongoose");
const IDENode = require("../models/IDE_Nodes");

// cloud connection string
const MONGODB_CLOUD_CONNECTION_STRING = process.env.MONGODB_CLOUD_CONNECTION_STRING;

function connectDB() {
  mongoose
    .connect(MONGODB_CLOUD_CONNECTION_STRING)
    .then(async () => {
      console.log("mongodb connected successfully!");
      try {
        await IDENode.syncIndexes();
        console.log("IDENode indexes synced successfully!");
      } catch (err) {
        console.error("Error syncing IDENode indexes:", err.message);
      }
    })
    .catch((err) => {
      console.log("error in mongodb Connection" + err);
    });
}

module.exports = {connectDB};