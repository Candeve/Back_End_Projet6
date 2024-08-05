const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const storage = multer.memoryStorage();

const upload = multer({ storage });

async function processImage(req, res, next) {
  if (!req.file) {
    return next();
  }

  try {
    const processedImage = await sharp(req.file.buffer)
      .resize({ width: 300 }) 
      .toFormat('jpeg')
      .jpeg({ quality: 80 })
      .toBuffer();

    const fileName = `${req.file.originalname.split(' ').join('-').toLowerCase()}-${Date.now()}.jpeg`;
    const filePath = path.join(process.env.IMAGES_FOLDER, fileName);
    fs.writeFileSync(filePath, processedImage);


    delete req.file.buffer;

    req.file.filename = fileName;
    next();
  } catch (err) {
    console.error("Erreur lors du traitement de l'image:", err);
    next(err);
  }
}

module.exports = { upload, processImage };
