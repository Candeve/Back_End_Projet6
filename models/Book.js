// Nous importons mongoose
const mongoose = require("mongoose");

// Définition du schéma du livre
const BookSchema = new mongoose.Schema({
  userId: String, // ID de l'utilisateur
  title: String, // Titre du livre
  author: String, // Auteur du livre
  imageUrl: String, // URL de l'image du livre
  year: Number, // Année de publication
  genre: String, // Genre du livre
  ratings: [
    {
      userId: String, // ID de l'utilisateur ayant noté
      grade: Number // Note attribuée
    }
  ],
  averageRating: Number // Note moyenne du livre
});

// Création du modèle Book basé sur le schéma défini
const Book = mongoose.model("Book", BookSchema);

// Nous exportons le modèle Book
module.exports = { Book };
