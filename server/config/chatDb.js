const mongoose = require("mongoose");

// تنها یک اتصال برای کل اپلیکیشن
const chatDb = mongoose.createConnection("mongodb://127.0.0.1:27017/chatDB");

chatDb.on("connected", () => {
  console.log("✅ MongoDB Connected: chatDB");
});

chatDb.on("error", (err) => {
  console.log("❌ MongoDB Error:", err);
});

module.exports = chatDb;
