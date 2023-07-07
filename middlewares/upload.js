const multer = require("multer");
const path = require("path");
const fs = require("fs");


const storage = (folderName) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const folderPath = `images/uploads/${folderName}`;
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      cb(null, folderPath);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const filename = Date.now() + fileExt;
      cb(null, filename);
    },
  });

const upload = (folderName) => multer({ storage: storage(folderName) });

module.exports = upload;
