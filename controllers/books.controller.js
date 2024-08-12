const express = require("express");
const { upload, processImage } = require("../middlewares/multer");
const Book = require("../models/Book").Book;
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const booksRouter = express.Router();

booksRouter.get("/bestrating", getBestRating);
booksRouter.get("/:id", getBookById);
booksRouter.get("/", getBooks);
booksRouter.post("/", checkToken, upload.single("image"), processImage, postBook);
booksRouter.delete("/:id", checkToken, deleteBook);
booksRouter.put("/:id", checkToken, upload.single("image"), processImage, putBook);
booksRouter.post("/:id/rating", checkToken, postRating);

async function postRating(req, res) {
  const id = req.params.id;
  if (!id) {
    return res.status(400).send("ID du livre manquant");
  }

  const rating = req.body.rating;
  const userId = req.tokenPayload.userId;

  if (rating < 0 || rating > 5) {
    return res.status(400).send("La note doit être comprise entre 0 et 5");
  }

  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).send("Livre non trouvé");
    }
    const previousRating = book.ratings.find(r => r.userId === userId);
    if (previousRating) {
      return res.status(400).send("Vous avez déjà noté ce livre");
    }
    book.ratings.push({ userId, grade: rating });
    book.averageRating = calculateAverageRating(book.ratings);
    await book.save();
    book.imageUrl = getAbsoluteImagePath(book.imageUrl);
    res.send(book);
  } catch (e) {
    console.error("Erreur lors de l'ajout de la note:", e);
    return res.status(500).send("Une erreur est survenue: " + e.message);
  }
}

function calculateAverageRating(ratings) {
  const sum = ratings.reduce((total, r) => total + r.grade, 0);
  return (sum / ratings.length).toFixed(1);
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

      bookData = JSON.parse(req.body.book);
      bookData.imageUrl = req.file.filename; 

  
      if (book.imageUrl) {
        const oldImagePath = path.join(process.env.IMAGES_FOLDER, book.imageUrl);
        fs.unlink(oldImagePath, err => {
          if (err) {
            console.error("Erreur lors de la suppression de l'ancienne image:", err);
          }
        });
      }
    }

    const updatedBook = await Book.findByIdAndUpdate(id, { $set: bookData }, { new: true });
    res.send({ message: "Livre mis à jour", book: updatedBook });
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

  
    if (book.imageUrl) {
      const imagePath = path.join(process.env.IMAGES_FOLDER, book.imageUrl);
      fs.unlink(imagePath, err => {
        if (err) {
          console.error("Erreur lors de la suppression de l'image:", err);
        }
      });
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
    book.imageUrl = getAbsoluteImagePath(book.imageUrl);
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
