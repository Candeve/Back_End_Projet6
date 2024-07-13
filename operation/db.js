const mongoose = require("mongoose");

const DB_URL = `mongodb+srv://EmeryG:1RzLxzDaXtZbp98q@cluster0.stivmkm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

async function connect() {
  try {
    await mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to DB");
  } catch (e) {
    console.error("Error connecting to database: ", e);
  }
}

module.exports = connect;