const multer = require('multer');
const path = require('path');
const fs = require('fs');

// پوشه‌ای که عکس‌های پروفایل در آن ذخیره می‌شوند
const profilePicsDir = 'uploads/pictures/profilePics';

// اطمینان از وجود پوشه profilePics
if (!fs.existsSync(profilePicsDir)) {
    fs.mkdirSync(profilePicsDir, { recursive: true });
}

// تنظیمات Multer برای ذخیره سازی
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, profilePicsDir);
    },
    filename: function (req, file, cb) {
        // ایجاد یک نام منحصر به فرد برای فایل
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname || '').toLowerCase(); // گرفتن پسوند فایل و تبدیل به حروف کوچک
        cb(null, `profile-${uniqueSuffix}${ext}`);
    }
});

// فیلتر برای انواع فایل های تصویری رایج
const imageFilter = (req, file, cb) => {
    // لیست پسوندهای مجاز
    const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff']);

    // گرفتن پسوند فایل از نام اصلی آن
    const ext = path.extname(file.originalname || '').toLowerCase();

    // بررسی اینکه پسوند در لیست مجاز هست یا نه
    if (!allowedExtensions.has(ext)) {
        // اگر مجاز نبود، خطا برمی‌گردونیم
        return cb(new Error('فقط فایل‌های تصویری با پسوندهای jpg, jpeg, png, gif, bmp, tiff مجاز هستند.'), false);
    }

    // اگر مجاز بود، اجازه آپلود رو می‌دیم
    cb(null, true);
};

// محدودیت حجم فایل (مثال: 10 مگابایت)
const upload = multer({
    storage: storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 1024 * 1024 * 10 // 10MB
    }
});

module.exports = upload;
