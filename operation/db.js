// Nous importons mongoose
const mongoose = require("mongoose");

// Construit l'URL de connexion à la base de données
const DB_URL = `mongodb+srv://EmeryG:1RzLxzDaXtZbp98q@cluster0.stivmkm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Fonction asynchrone pour se connecter à la base de données
async function connect() {
  try {
    await mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true }); // Connexion à MongoDB
    console.log("Connected to DB"); // Log un message de succès
  } catch (e) {
    console.error("Error connecting to database: ", e); // Log l'erreur de connexion
  }
}

// Nous exportons la fonction de connexion
module.exports = connect;
