const multer = require('multer');
const path = require('path');
const fs = require('fs');
const express = require('express')
const app = express();

// ایجاد پوشه آپلود
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // چک کن که اگر فایل عکس است، برود توی فولدر pictures
        if (file.mimetype.startsWith('image/')) {
            cb(null, 'uploads/pictures/');
        }
        else if (file.mimetype.startsWith('video/')) {
            cb(null, 'uploads/videos/');
        }
        else if (file.mimetype.startsWith('audio/')) {
            cb(null, 'uploads/audios/');
        }
        else if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
            cb(null, 'uploads/archives/');
        }
        else if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf') || file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
            cb(null, 'uploads/documents/');
        }
        else {
            cb(null, 'uploads/');
        }
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;









// // config/multerFile.js (مثال)
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // اطمینان از وجود پوشه uploads و زیرپوشه‌ها
// const uploadDir = 'uploads';
// const profilePicDir = path.join(uploadDir, 'profilePics');
// const chatFilesDir = path.join(uploadDir, 'chatFiles'); // پوشه جدا برای فایل‌های چت

// // ایجاد پوشه‌ها اگر وجود ندارند
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
// if (!fs.existsSync(profilePicDir)) fs.mkdirSync(profilePicDir);
// if (!fs.existsSync(chatFilesDir)) fs.mkdirSync(chatFilesDir);


// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         // اینجا بر اساس mimetype یا چیز دیگه تصمیم می‌گیریم که فایل کجا بره
//         // برای مثال، همه فایل‌های چت میرن توی chatFiles
//         cb(null, chatFilesDir + '/'); // همیشه از مسیر نسبی استفاده کن
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + '-' + file.originalname);
//     }
// });

// const fileFilter = (req, file, cb) => {
//     // می‌تونید فیلتر هم اضافه کنید
//     cb(null, true);
// };

// const upload = multer({ storage: storage, fileFilter: fileFilter });

// module.exports = upload;












// // multerConfig.js
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// const uploadDir = 'uploads';
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir);    
// }

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         if (file.mimetype.startsWith('image/')) {
//             cb(null, path.join(uploadDir, 'pictures/')); // استفاده از path.join برای امنیت بیشتر    
//         } else if (file.mimetype.startsWith('video/')) {
//             cb(null, path.join(uploadDir, 'videos/'));    
//         } else if (file.mimetype.startsWith('audio/')) {
//             cb(null, path.join(uploadDir, 'audios/'));    
//         } else if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
//             cb(null, path.join(uploadDir, 'archives/'));    
//         } else if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf') || file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
//             cb(null, path.join(uploadDir, 'documents/'));    
//         } else {
//             cb(null, uploadDir + '/'); // پوشه اصلی آپلود    
//         }
//     },
//     filename: function (req, file, cb) {
//         // استفاده از path.extname برای گرفتن پسوند فایل    
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, uniqueSuffix + path.extname(file.originalname));
//     }
// });

// const upload = multer({ storage: storage });

// // اگر فقط upload را export می کنید:
// module.exports = upload;

// // اگر می خواهید چند چیز را export کنید (مثلا storage هم لازم باشد):
// // module.exports = { upload, storage };
















// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");

// // مسیر پایه
// const uploadDir = path.join(__dirname, "uploads");

// // اطمینان از وجود پوشه‌های مورد نیاز
// const ensureDir = (dir) => {
//   if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
// };

// // پوشه‌های دسته‌بندی شده
// const folders = {
//   pictures: path.join(uploadDir, "pictures"),
//   videos: path.join(uploadDir, "videos"),
//   audios: path.join(uploadDir, "audios"),
//   archives: path.join(uploadDir, "archives"),
//   documents: path.join(uploadDir, "documents"),
// };


// // نام فایل
// const filename = (req, file, cb) => {
//   const ext = path.extname(file.originalname);
//   const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
//   cb(null, name);
// };

// // تنظیمات multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const mime = file.mimetype;

//     if (mime.startsWith("image/")) return cb(null, folders.pictures);
//     if (mime.startsWith("video/")) return cb(null, folders.videos);
//     if (mime.startsWith("audio/")) return cb(null, folders.audios);

//     if (
//       mime === "application/zip" ||
//       mime === "application/x-zip-compressed" ||
//       mime === "application/x-rar-compressed"
//     )
//       return cb(null, folders.archives);

//     if (mime === "application/pdf" || mime.startsWith("application/"))
//       return cb(null, folders.documents);

//     // پیش‌فرض
//     return cb(null, folders.documents);
//   },
//   filename,
// });

// // خروجی
// const upload = multer({ storage });

// module.exports =  upload ;
