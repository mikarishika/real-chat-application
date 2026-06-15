const mongoose = require("mongoose");
const { mainDB } = require("../config/db");

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: String,
            required: true
        },

        receiverId: {
            type: String,
            required: true
        },

        text: {
            type: String,
            default: ""
        },

        file: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
            size: Number
        },

        // ✅ READ RECEIPT — آیا گیرنده پیام رو دیده؟
        seen: {
            type: Boolean,
            default: false
        },

    },
    {
        timestamps: true
    }
);

module.exports = mainDB.model("Message", messageSchema);