const multer = require("multer");
const fs = require("fs");
const path = require("path");

// ساخت خودکار پوشه‌ها
const folders = [
  "uploads",
  "uploads/pictures",
  "uploads/videos",
  "uploads/audios",
  "uploads/archives",
  "uploads/documents",
];

folders.forEach((folder) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const mime = file.mimetype;

    if (mime.startsWith("image/")) {
      return cb(null, "uploads/pictures");
    }

    if (mime.startsWith("video/")) {
      return cb(null, "uploads/videos");
    }

    if (mime.startsWith("audio/")) {
      return cb(null, "uploads/audios");
    }

    if (
      mime === "application/zip" ||
      mime === "application/x-zip-compressed" ||
      path.extname(file.originalname).toLowerCase() === ".zip"
    ) {
      return cb(null, "uploads/archives");
    }

    if (
      mime === "application/pdf" ||
      mime === "text/plain" ||
      [".pdf", ".txt"].includes(
        path.extname(file.originalname).toLowerCase()
      )
    ) {
      return cb(null, "uploads/documents");
    }

    return cb(null, "uploads");
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      ext;

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

module.exports = upload;