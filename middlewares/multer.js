const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.IMAGES_FOLDER || 'images');
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.toLowerCase().split(' ').join('-') + '-' + Date.now();
    cb(null, fileName);
  }
});

const upload = multer({ storage });

module.exports = { upload };
