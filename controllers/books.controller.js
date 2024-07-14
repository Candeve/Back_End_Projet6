const express = require("express");
const { upload, optimizeImage } = require("../middlewares/multer");
const Book = require("../models/Book").Book;
const jwt = require("jsonwebtoken");

const booksRouter = express.Router();

booksRouter.get("/bestrating", getBestRating);
booksRouter.get("/:id", getBookById);
booksRouter.get("/", getBooks);
booksRouter.post("/", checkToken, upload.single("image"), optimizeImage, postBook);
booksRouter.delete("/:id", checkToken, deleteBook);
booksRouter.put("/:id", checkToken, upload.single("image"), optimizeImage, putBook);
booksRouter.post("/:id/rating", checkToken, postRating);

async function postRating(req, res) {
  const id = req.params.id;
  if (!id) {
    return res.status(400).send("ID du livre manquant");
  }

  const { rating } = req.body;
  const userId = req.tokenPayload.userId;

  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).send("Livre non trouvé");
    }

    const previousRating = book.ratings.find(r => r.userId === userId);
    if (previousRating) {
      return res.status(400).send("Vous avez déjà noté ce livre");
    }

    const newRating = {
      userId,
      grade: rating
    };

    book.ratings.push(newRating);
    book.averageRating = calculateAverageRating(book.ratings);
    await book.save();

    res.status(200).json(book); // Retourner le livre mis à jour
  } catch (e) {
    console.error("Erreur lors de l'ajout de la note:", e);
    return res.status(500).send("Une erreur est survenue: " + e.message);
  }
}

function calculateAverageRating(ratings) {
  const sum = ratings.reduce((total, r) => total + r.grade, 0);
  const average = sum / ratings.length;
  return parseFloat(average.toFixed(1)); // Limiter à 1 chiffre après la virgule
}

async function getBestRating(req, res) {
  try {
    const books = await Book.find().sort({ averageRating: -1 }).limit(3);
    books.forEach(book => {
      book.imageUrl = getAbsoluteImagePath(book.imageUrl);
    });
    res.send(books);
  } catch (e) {
    console.error("Erreur lors de la récupération des meilleurs livres:", e);
    return res.status(500).send("Une erreur est survenue: " + e.message);
  }
}

async function putBook(req, res) {
  const id = req.params.id;
  let bookData = req.body;

  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).send("Livre non trouvé");
    }
    if (book.userId !== req.tokenPayload.userId) {
      return res.status(403).send("Vous ne pouvez pas modifier les livres des autres utilisateurs");
    }

    if (req.file) {
      // Si un fichier est fourni, les données du livre sont encodées en chaîne de caractères
      bookData = JSON.parse(req.body.book);
      bookData.imageUrl = req.file.filename; // Mettre à jour l'URL de l'image
    }

    const updatedBook = await Book.findByIdAndUpdate(id, { $set: bookData }, { new: true });
    res.status(200).json(updatedBook); // Retourner le livre mis à jour
  } catch (e) {
    console.error("Erreur lors de la mise à jour du livre:", e);
    return res.status(500).send("Une erreur est survenue: " + e.message);
  }
}

async function deleteBook(req, res) {
  const id = req.params.id;
  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).send("Livre non trouvé");
    }
    if (book.userId !== req.tokenPayload.userId) {
      return res.status(403).send("Vous ne pouvez pas supprimer les livres des autres utilisateurs");
    }
    await Book.findByIdAndDelete(id);
    res.send("Livre supprimé");
  } catch (e) {
    console.error("Erreur lors de la suppression du livre:", e);
    return res.status(500).send("Une erreur est survenue: " + e.message);
  }
}

function checkToken(req, res, next) {
  const headers = req.headers;
  const authorization = headers.authorization;
  if (!authorization) {
    return res.status(401).send("Non autorisé");
  }
  const token = authorization.split(" ")[1];
  try {
    const tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
    req.tokenPayload = tokenPayload;
    next();
  } catch (e) {
    console.error("Erreur de vérification du token:", e);
    return res.status(401).send("Non autorisé");
  }
}

async function getBookById(req, res) {
  const id = req.params.id;
  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).send("Livre non trouvé");
    }
    book.imageUrl = getAbsoluteImagePath(book.imageUrl);
    res.send(book);
  } catch (e) {
    console.error("Erreur lors de la récupération du livre:", e);
    return res.status(500).send("Une erreur est survenue: " + e.message);
  }
}

async function postBook(req, res) {
  const bookData = JSON.parse(req.body.book);
  if (!req.file) {
    return res.status(400).send("Image manquante");
  }
  bookData.imageUrl = req.file.filename;
  try {
    const book = await Book.create(bookData);
    res.send({ message: "Livre ajouté", book });
  } catch (e) {
    console.error("Erreur lors de l'ajout du livre:", e);
    return res.status(500).send("Une erreur est survenue: " + e.message);
  }
}

async function getBooks(req, res) {
  try {
    const books = await Book.find();
    books.forEach(book => {
      book.imageUrl = getAbsoluteImagePath(book.imageUrl);
    });
    res.send(books);
  } catch (e) {
    console.error("Erreur lors de la récupération des livres:", e);
    return res.status(500).send("Une erreur est survenue: " + e.message);
  }
}

function getAbsoluteImagePath(fileName) {
  return `http://localhost:4000${process.env.IMAGES_PUBLIC_URL}/${fileName}`;
}

module.exports = booksRouter;
