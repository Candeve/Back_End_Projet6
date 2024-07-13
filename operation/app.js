const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./db");

const app = express();

connectDB();

const IMAGES_FOLDER = process.env.IMAGES_FOLDER || 'images';
const IMAGES_PUBLIC_URL = process.env.IMAGES_PUBLIC_URL || 'public/images';

app.use(cors());
app.use(express.json());
app.use(IMAGES_PUBLIC_URL, express.static(IMAGES_FOLDER));

module.exports = app;
