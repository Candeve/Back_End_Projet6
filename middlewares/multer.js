// Nous importons les modules nécessaires
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, String(process.env.IMAGES_FOLDER)); // Définit le dossier de destination des fichiers
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.toLowerCase().split(' ').join('-') + '-' + Date.now() + path.extname(file.originalname);
    cb(null, fileName); // Passe le nom de fichier généré au callback
  }
});

// Crée une instance de Multer avec le stockage configuré
const upload = multer({
  storage
});

// Middleware pour gérer le téléchargement et l'optimisation d'une image
const uploadAndOptimizeImage = (req, res, next) => {
  upload.single("image")(req, res, async function (err) { // Gère le téléchargement d'une seule image
    if (err) {
      return res.status(500).send("Une erreur est survenue lors du téléchargement de l'image."); // Retourne une erreur si le téléchargement échoue
    }

    if (!req.file) {
      return next(); // Passe au middleware suivant si aucun fichier n'est téléchargé
    }

    const originalFilePath = path.join(String(process.env.IMAGES_FOLDER), req.file.filename); // Chemin complet de l'image originale
    const optimizedFilePath = path.join(String(process.env.IMAGES_FOLDER), 'optimized-' + req.file.filename); // Chemin complet de l'image optimisée

    try {
      await sharp(originalFilePath)
        .resize(800, 800, { fit: "inside" }) // Redimensionne l'image à 800x800 pixels maximum
        .toFile(optimizedFilePath); // Sauvegarde l'image redimensionnée
      req.file.filename = 'optimized-' + req.file.filename; // Met à jour le nom de fichier dans la requête
      next(); // Passe au middleware suivant
    } catch (e) {
      console.error("Erreur lors de l'optimisation de l'image:", e); // Log l'erreur d'optimisation
      return res.status(500).send("Une erreur est survenue lors de l'optimisation de l'image."); // Retourne une erreur si l'optimisation échoue
    }
  });
};

// Nous exportons la fonction de middleware
module.exports = { uploadAndOptimizeImage };
