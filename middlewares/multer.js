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

const uploadAndOptimizeImage = (req, res, next) => {
  upload.single("image")(req, res, async function (err) {
    if (err) {
      return res.status(500).send("Une erreur est survenue lors du téléchargement de l'image.");
    }

    if (!req.file) {
      return next();
    }

    const originalFilePath = path.join(String(process.env.IMAGES_FOLDER), req.file.filename);
    const optimizedFilePath = path.join(String(process.env.IMAGES_FOLDER), 'optimized-' + req.file.filename);

    try {
      await sharp(originalFilePath)
        .resize(800, 800, { fit: "inside" })
        .toFile(optimizedFilePath);
      req.file.filename = 'optimized-' + req.file.filename;
      next();
    } catch (e) {
      console.error("Erreur lors de l'optimisation de l'image:", e);
      return res.status(500).send("Une erreur est survenue lors de l'optimisation de l'image.");
    }
  });
};

module.exports = { uploadAndOptimizeImage };
