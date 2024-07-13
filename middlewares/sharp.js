const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const optimizeImage = (options) => async (req, res, next) => {
  if (!req.file) return next();

  const filePath = path.join(String(process.env.IMAGES_FOLDER), req.file.filename);
  const optimizedFilePath = path.join(String(process.env.IMAGES_FOLDER), 'optimized-' + req.file.filename);
  const extension = path.extname(req.file.filename).toLowerCase();

  try {
    console.log("File path:", filePath);
    console.log("Optimized file path:", optimizedFilePath);
    console.log("File extension:", extension);

    let image = sharp(filePath);

    if (options.resize) {
      image = image.resize(options.resize.width, options.resize.height);
    }

    switch (extension) {
      case '.jpeg':
      case '.jpg':
        image = image.jpeg({ quality: options.quality });
        break;
      case '.png':
        image = image.png({ compressionLevel: 8 });
        break;
      case '.webp':
        image = image.webp({ quality: options.quality });
        break;
      default:
        image = image.jpeg({ quality: options.quality }); // Default compression for other formats
    }

    await image.toFile(optimizedFilePath);

    console.log("Image optimisée avec succès");

    fs.unlinkSync(filePath);
    fs.renameSync(optimizedFilePath, filePath);

    next();
  } catch (error) {
    console.error("Erreur lors de l'optimisation de l'image:", error);
    res.status(500).send("Une erreur est survenue lors de l'optimisation de l'image.");
  }
};

module.exports = optimizeImage;
