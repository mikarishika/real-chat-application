const mongoose = require("mongoose");
const { mainDB } = require("../config/db");

const conversationSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  lastMessage: {
    type: String,
    default: ""
  },
  // ✅ اسم فیلد با DB یکیه: unreadCounts
  unreadCounts: {
    type: Object,
    default: {}
  }

}, { timestamps: true });

module.exports = mainDB.model("Conversation", conversationSchema);