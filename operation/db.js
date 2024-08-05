const mongoose = require("mongoose");
require('dotenv').config();

const DB_URL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_DOMAIN}/?retryWrites=true&w=majority&appName=Cluster0`;

async function connect() {
  try {
    await mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to DB");
  } catch (e) {
    console.error("Error connecting to database: ", e);
  }
}

module.exports = connect;
