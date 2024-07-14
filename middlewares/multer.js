const multer = require("multer");
const path = require("path");
const sharp = require("sharp");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, String(process.env.IMAGES_FOLDER));
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.toLowerCase().split(' ').join('-') + '-' + Date.now() + path.extname(file.originalname);
    cb(null, fileName);
  }
});

const upload = multer({
  storage
});

const optimizeImage = async (req, res, next) => {
  if (!req.file) return next();

  const filePath = path.join(String(process.env.IMAGES_FOLDER), req.file.filename);
  const optimizedFilePath = path.join(String(process.env.IMAGES_FOLDER), 'optimized-' + req.file.filename);

  try {
    await sharp(filePath)
      .resize(800, 800, {
        fit: sharp.fit.inside,
        withoutEnlargement: true
      })
      .toFile(optimizedFilePath);

    req.file.filename = 'optimized-' + req.file.filename;
    next();
  } catch (err) {
    console.error("Erreur lors de l'optimisation de l'image:", err);
    next(err);
  }
};

module.exports = { upload, optimizeImage };
