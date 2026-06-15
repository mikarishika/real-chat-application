const mongoose = require('mongoose');
const { mainDB } = require('../config/db');

const userProfileImageSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: true
    },

    url: {
        type: String,
        required: true
    },

    fileNameInServer: {
        type: String,
        required: true
    },

    size: {
        type: Number,
        required: true
    },

    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mainDB.model(
    'UserProfileImage',
    userProfileImageSchema
);




// const mongoose = require('mongoose');
// const { mainDB } = require('../config/db');
// const userProfileImageSchema = new mongoose.Schema({
//     url: { type: String, required: true }, // مثلاً /uploads/pictures/profilePics/170...-filename.jpg
//     fileNameInServer: { type: String, required: true }, // نام فایل ذخیره شده توسط multer، مثلاً 170...-filename.jpg
//     size: { type: Number, required: true },
//     uploadedAt: { type: Date, default: Date.now }
// });

// module.exports = mainDB.model('UserProfileImage', userProfileImageSchema);