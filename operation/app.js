const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();

connectDB();

const IMAGES_FOLDER = process.env.IMAGES_FOLDER || 'images';

app.use(cors());
app.use(express.json());
app.use(`/${process.env.IMAGES_PUBLIC_URL}`, express.static(IMAGES_FOLDER));

module.exports = app;
