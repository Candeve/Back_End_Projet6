const multer = require("multer");
const path = require("path");

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

module.exports = { upload };
