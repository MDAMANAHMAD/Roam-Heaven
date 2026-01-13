const mongoose = require("mongoose");
const initData = require("./data.js");
const List = require("../models/list.js");

require('dotenv').config({ path: '../.env' });
const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
    initDB();
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await List.deleteMany({});
  await List.insertMany(initData.data);
  console.log("data was initialized");
};

