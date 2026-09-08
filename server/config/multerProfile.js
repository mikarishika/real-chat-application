const multer = require("multer");
const fs = require("fs");
const path = require("path");

const profileDirectory = path.join("uploads", "pictures", "profilePics");
fs.mkdirSync(profileDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, profileDirectory);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    callback(null, uniqueName);
  },
});

module.exports = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      return callback(new Error("فقط فایل تصویری مجاز است"));
    }
    callback(null, true);
  },
});
