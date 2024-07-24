// Nous importons mongoose
const mongoose = require("mongoose");

// Définition du schéma de l'utilisateur
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Email de l'utilisateur (unique et requis)
  password: { type: String, required: true } // Mot de passe de l'utilisateur (requis)
});

// Création du modèle User basé sur le schéma défini
const User = mongoose.model("User", UserSchema);

// Nous exportons le modèle User
module.exports = { User };
