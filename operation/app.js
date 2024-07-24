// Nous importons les modules nécessaires
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./db");

// Nous créons une instance d'Express
const app = express();

// Nous connectons à la base de données
connectDB();

const IMAGES_FOLDER = process.env.IMAGES_FOLDER || 'images'; // Définit le dossier des images
const IMAGES_PUBLIC_URL = process.env.IMAGES_PUBLIC_URL || '/images'; // Définit l'URL publique des images

app.use(cors()); // Utilise le middleware CORS
app.use(express.json()); // Utilise le middleware pour parser les JSON
app.use(IMAGES_PUBLIC_URL, express.static(IMAGES_FOLDER)); // Sert les fichiers statiques du dossier des images

// Nous exportons l'application Express
module.exports = app;
