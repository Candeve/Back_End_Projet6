// Nous importons les modules nécessaires
const express = require("express");
const { uploadAndOptimizeImage } = require("../middlewares/multer");
const Book = require("../models/Book").Book;
const jwt = require("jsonwebtoken");

// Nous créons un routeur Express pour les livres
const booksRouter = express.Router();

// Nous définissons les routes et les associons aux fonctions correspondantes
booksRouter.get("/bestrating", getBestRating);
booksRouter.get("/:id", getBookById);
booksRouter.get("/", getBooks);
booksRouter.post("/", checkToken, uploadAndOptimizeImage, postBook);
booksRouter.delete("/:id", checkToken, deleteBook);
booksRouter.put("/:id", checkToken, uploadAndOptimizeImage, updateBook);
booksRouter.post("/:id/rating", checkToken, addRating);

// Fonction pour ajouter une note à un livre
async function addRating(req, res) {
  const id = req.params.id; // Récupère l'ID du livre depuis les paramètres de la requête
  if (!id) {
    return res.status(400).send("ID du livre manquant"); // Vérifie si l'ID est présent
  }

  const { rating } = req.body; // Récupère la note du corps de la requête
  const userId = req.tokenPayload.userId; // Récupère l'ID de l'utilisateur depuis le token

  try {
    const book = await Book.findById(id); // Cherche le livre par son ID
    if (!book) {
      return res.status(404).send("Livre non trouvé"); // Vérifie si le livre existe
    }

    const existingRating = book.ratings.find(r => r.userId === userId); // Vérifie si l'utilisateur a déjà noté ce livre
    if (existingRating) {
      existingRating.grade = rating; // Met à jour la note existante
    } else {
      const newRating = {
        userId,
        grade: rating
      };
      book.ratings.push(newRating); // Ajoute une nouvelle note
    }

    book.averageRating = calculateAverageRating(book.ratings); // Calcule la nouvelle moyenne des notes
    await book.save(); // Sauvegarde les modifications du livre

    book.imageUrl = getAbsoluteImagePath(book.imageUrl); // Met à jour le chemin de l'image
    res.status(200).json(book); // Retourne le livre mis à jour
  } catch (e) {
    console.error("Erreur lors de l'ajout de la note:", e); // Log l'erreur
    return res.status(500).send("Une erreur est survenue: " + e.message); // Retourne une erreur
  }
}

// Fonction pour calculer la moyenne des notes
function calculateAverageRating(ratings) {
  const sum = ratings.reduce((total, r) => total + r.grade, 0); // Calcule la somme des notes
  const average = sum / ratings.length; // Calcule la moyenne
  return parseFloat(average.toFixed(1)); // Retourne la moyenne arrondie à une décimale
}

// Fonction pour récupérer les livres avec les meilleures notes
async function getBestRating(req, res) {
  try {
    const books = await Book.find().sort({ averageRating: -1 }).limit(3); // Cherche les trois livres avec les meilleures notes
    books.forEach(book => {
      book.imageUrl = getAbsoluteImagePath(book.imageUrl); // Met à jour le chemin de l'image
    });
    res.send(books); // Retourne les livres
  } catch (e) {
    console.error("Erreur lors de la récupération des meilleurs livres:", e); // Log l'erreur
    return res.status(500).send("Une erreur est survenue: " + e.message); // Retourne une erreur
  }
}

// Fonction pour mettre à jour un livre
async function updateBook(req, res) {
  const id = req.params.id; // Récupère l'ID du livre depuis les paramètres de la requête
  const bookData = req.body.book ? JSON.parse(req.body.book) : {}; // Récupère les données du livre depuis le corps de la requête
  try {
    const book = await Book.findById(id); // Cherche le livre par son ID
    if (!book) {
      return res.status(404).send("Livre non trouvé"); // Vérifie si le livre existe
    }
    if (book.userId !== req.tokenPayload.userId) {
      return res.status(403).send("Vous ne pouvez pas modifier les livres des autres utilisateurs"); // Vérifie si l'utilisateur est le propriétaire du livre
    }

    if (req.file) {
      bookData.imageUrl = req.file.filename; // Met à jour le chemin de l'image si un fichier est téléchargé
    }

    const updatedBook = await Book.findByIdAndUpdate(id, { $set: bookData }, { new: true }); // Met à jour les données du livre
    updatedBook.imageUrl = getAbsoluteImagePath(updatedBook.imageUrl); // Met à jour le chemin de l'image
    res.send({ message: "Livre mis à jour", book: updatedBook }); // Retourne le livre mis à jour
  } catch (e) {
    console.error("Erreur lors de la mise à jour du livre:", e); // Log l'erreur
    return res.status(500).send("Une erreur est survenue: " + e.message); // Retourne une erreur
  }
}

// Fonction pour supprimer un livre
async function deleteBook(req, res) {
  const id = req.params.id; // Récupère l'ID du livre depuis les paramètres de la requête
  try {
    const book = await Book.findById(id); // Cherche le livre par son ID
    if (!book) {
      return res.status(404).send("Livre non trouvé"); // Vérifie si le livre existe
    }
    if (book.userId !== req.tokenPayload.userId) {
      return res.status(403).send("Vous ne pouvez pas supprimer les livres des autres utilisateurs"); // Vérifie si l'utilisateur est le propriétaire du livre
    }
    await Book.findByIdAndDelete(id); // Supprime le livre
    res.send("Livre supprimé"); // Retourne un message de succès
  } catch (e) {
    console.error("Erreur lors de la suppression du livre:", e); // Log l'erreur
    return res.status(500).send("Une erreur est survenue: " + e.message); // Retourne une erreur
  }
}

// Middleware pour vérifier le token JWT
function checkToken(req, res, next) {
  const headers = req.headers; // Récupère les en-têtes de la requête
  const authorization = headers.authorization; // Récupère l'en-tête d'autorisation
  if (!authorization) {
    return res.status(401).send("Non autorisé"); // Si aucun en-tête d'autorisation, retourne 401
  }
  const token = authorization.split(" ")[1]; // Extrait le token de l'en-tête d'autorisation
  try {
    const tokenPayload = jwt.verify(token, process.env.JWT_SECRET); // Vérifie le token JWT
    req.tokenPayload = tokenPayload; // Attache le payload du token à l'objet de requête
    next(); // Passe au middleware ou routeur suivant
  } catch (e) {
    console.error("Erreur de vérification du token:", e); // Log l'erreur de vérification
    return res.status(401).send("Non autorisé"); // Retourne 401 si le token est invalide
  }
}

// Fonction pour récupérer un livre par son ID
async function getBookById(req, res) {
  const id = req.params.id; // Récupère l'ID du livre depuis les paramètres de la requête
  try {
    const book = await Book.findById(id); // Cherche le livre par son ID
    if (!book) {
      return res.status(404).send("Livre non trouvé"); // Vérifie si le livre existe
    }
    book.imageUrl = getAbsoluteImagePath(book.imageUrl); // Met à jour le chemin de l'image
    res.send(book); // Retourne le livre
  } catch (e) {
    console.error("Erreur lors de la récupération du livre:", e); // Log l'erreur
    return res.status(500).send("Une erreur est survenue: " + e.message); // Retourne une erreur
  }
}

// Fonction pour ajouter un livre
async function postBook(req, res) {
  const bookData = JSON.parse(req.body.book); // Récupère les données du livre depuis le corps de la requête
  if (!req.file) {
    return res.status(400).send("Image manquante"); // Vérifie si une image est téléchargée
  }
  bookData.imageUrl = req.file.filename; // Met à jour le chemin de l'image
  try {
    const book = await Book.create(bookData); // Crée un nouveau livre
    book.imageUrl = getAbsoluteImagePath(book.imageUrl); // Met à jour le chemin de l'image
    res.send({ message: "Livre ajouté", book }); // Retourne le livre ajouté
  } catch (e) {
    console.error("Erreur lors de l'ajout du livre:", e); // Log l'erreur
    return res.status(500).send("Une erreur est survenue: " + e.message); // Retourne une erreur
  }
}

// Fonction pour récupérer tous les livres
async function getBooks(req, res) {
  try {
    const books = await Book.find(); // Cherche tous les livres
    books.forEach(book => {
      book.imageUrl = getAbsoluteImagePath(book.imageUrl); // Met à jour le chemin de l'image
    });
    res.send(books); // Retourne les livres
  } catch (e) {
    console.error("Erreur lors de la récupération des livres:", e); // Log l'erreur
    return res.status(500).send("Une erreur est survenue: " + e.message); // Retourne une erreur
  }
}

// Fonction pour obtenir le chemin absolu de l'image
function getAbsoluteImagePath(fileName) {
  return `http://localhost:4000${process.env.IMAGES_PUBLIC_URL}/${fileName}`; // Construit le chemin complet de l'image
}

// Nous exportons le routeur des livres
module.exports = booksRouter;
