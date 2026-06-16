// const express = require('express');
// const router = express.Router();
// const Message = require('../model/message');
// const upload = require('../config/multerFile');
// const path = require('path');
// const fs = require('fs');


// // ارسال پیام
// router.post('/messages', upload.single('file'), async (req, res) => {
//     try {

//         const { senderId, receiverId, text } = req.body;

//         let fileData = null;

//         if (req.file) {

//             let subFolder = '';

//             if (req.file.mimetype.startsWith('image/')) {
//                 subFolder = 'pictures/';
//             } else if (req.file.mimetype.startsWith('video/')) {
//                 subFolder = 'videos/';
//             } else if (req.file.mimetype.startsWith('audio/')) {
//                 subFolder = 'audios/';
//             } else if (
//                 req.file.mimetype === 'application/pdf' ||
//                 req.file.mimetype === 'text/plain'
//             ) {
//                 subFolder = 'documents/';
//             } else if (req.file.mimetype === 'application/zip') {
//                 subFolder = 'archives/';
//             }

//             fileData = {
//                 url: `/uploads/${subFolder}${req.file.filename}`,
//                 type: req.file.mimetype,
//                 name: req.file.originalname,
//                 size: req.file.size
//             };
//         }

//         const newMessage = new Message({
//             senderId,
//             receiverId,
//             text,
//             file: fileData
//         });
//         console.log("Saving message...");

//         await newMessage.save();
//         console.log("Saved!");
//         res.status(201).json(newMessage);
//         console.log("this is body from message.js:", req.body);

//     } catch (err) {
//         console.error("Error:", err.message);
//         res.status(500).json({ error: err.message });
//     }
// });


// // گرفتن همه پیام‌ها
// router.get('/messages', async (req, res) => {
//     try {

//         const messages = await Message.find().sort({ createdAt: 1 });

//         res.json(messages);

//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });


// // گرفتن پیام‌های بین دو کاربر
// router.get('/messages/:user1/:user2', async (req, res) => {
//     try {

//         const { user1, user2 } = req.params;

//         const messages = await Message.find({
//             $or: [
//                 { senderId: user1, receiverId: user2 },
//                 { senderId: user2, receiverId: user1 }
//             ]
//         }).sort({ createdAt: 1 });

//         res.json(messages);

//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });


// // لیست چت‌ها (Inbox)
// router.get("/messages/chats/:username", async (req, res) => {
//     try {
//         const username = req.params.username;

//         console.log("CHAT ROUTE HIT:", username);

//         const messages = await Message.find({
//             $or: [
//                 { senderId: username },
//                 { receiverId: username }
//             ]
//         }).sort({ createdAt: -1 });

//         console.log("FOUND:", messages.length);
//         console.log(await Message.collection.name);

//         res.json(messages);

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: err.message });
//     }
// });


// // router.get('/messages/chats/:userId', async (req, res) => {
// //     try {

// //         const { userId } = req.params;

// //         const messages = await Message.find({
// //             $or: [
// //                 { senderId: userId },
// //                 { receiverId: userId },
// //                 { sender: userId }
// //             ]
// //         }).sort({ createdAt: -1 });

// //         const chats = {};

// //         messages.forEach(msg => {

// //             const otherUser =
// //                 msg.senderId === userId ? msg.receiverId : msg.senderId;

// //             if (!chats[otherUser]) {
// //                 chats[otherUser] = msg;
// //             }

// //         });

// //         res.json(Object.values(chats));
// //         console.log("UserId:", userId);
// //         console.log("Messages:", messages);

// //     } catch (err) {
// //         res.status(500).json({ error: err.message });
// //     }
// // });

// // router.get("/conversations/:userId", async (req, res) => {
// //   try {
// //     const { userId } = req.params;

// //     const messages = await Message.find({
// //       $or: [
// //         { senderId: userId },
// //         { receiverId: userId }
// //       ]
// //     }).sort({ createdAt: -1 });

// //     const seenUsers = new Set();
// //     const conversations = [];

// //     for (const msg of messages) {

// //       const otherUser =
// //         msg.senderId === userId
// //           ? msg.receiverId
// //           : msg.senderId;

// //       if (!seenUsers.has(otherUser)) {

// //         seenUsers.add(otherUser);

// //         conversations.push({
// //           user: otherUser,
// //           lastMessage: msg.text,
// //           messageId: msg._id
// //         });

// //       }
// //     }

// //     res.json(conversations);

// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });


// // حذف پیام
// router.delete('/messages/:id', async (req, res) => {
//     try {

//         const messageId = req.params.id;

//         const message = await Message.findById(messageId);

//         if (!message) {
//             return res.status(404).json({ message: "پیام پیدا نشد" });
//         }

//         if (message.file && message.file.url) {

//             const filePath = path.join(__dirname, '..', message.file.url);

//             if (fs.existsSync(filePath)) {
//                 fs.unlinkSync(filePath);
//             }

//         }

//         await Message.findByIdAndDelete(messageId);

//         res.json({ message: 'پیام حذف شد' });

//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const Message = require('../model/message');
const upload = require('../config/multerFile');
const path = require('path');
const fs = require('fs');


// -------------------------
// 📌 ارسال پیام (متن، عکس، فایل)
// -------------------------


router.post('/messages', upload.single('file'), async (req, res) => {
    try {
        const { senderId, receiverId, text } = req.body;

        let fileData = null;

        if (req.file) {
            let subFolder = '';

            if (req.file.mimetype.startsWith('image/')) subFolder = 'pictures/';
            else if (req.file.mimetype.startsWith('video/')) subFolder = 'videos/';
            else if (req.file.mimetype.startsWith('audio/')) subFolder = 'audios/';
            else if (
                req.file.mimetype === 'application/pdf' ||
                req.file.mimetype === 'text/plain'
            ) subFolder = 'documents/';
            else if (req.file.mimetype === 'application/zip') subFolder = 'archives/';

            fileData = {
                url: `/uploads/${subFolder}${req.file.filename}`,
                type: req.file.mimetype,
                name: req.file.originalname,
                size: req.file.size
            };
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            file: fileData
        });

        await newMessage.save();

        res.status(201).json(newMessage);

    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});


// -------------------------
// 📌 گرفتن همه پیام‌ها (برای Debug فقط)
// -------------------------
router.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// -------------------------
// 📌 گرفتن پیام‌های بین دو کاربر
//   مسیر: /messages/:user1/:user2
// -------------------------
router.get('/messages/:user1/:user2', async (req, res) => {
    try {
        const { user1, user2 } = req.params;

        if (!user1 || !user2) {
            return res.status(400).json({ error: "user1 یا user2 ارسال نشده" });
        }

        const messages = await Message.find({
            $or: [
                { senderId: user1, receiverId: user2 },
                { senderId: user2, receiverId: user1 }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// -------------------------
// 📌 Inbox - آخرین پیام هر مکالمه
//   مسیر: /messages/chats/:username
// -------------------------

router.get("/messages/chats/:username", async (req, res) => {
    try {
        const username = req.params.username;

        if (!username) {
            return res.status(400).json({ error: "Username لازم است" });
        }

        // تمام پیام‌هایی که کاربر داخلش بوده
        const messages = await Message.find({
            $or: [
                { senderId: username },
                { receiverId: username }
            ]
        }).sort({ createdAt: -1 }); // جدیدترین اول

        const map = new Map();

        messages.forEach(msg => {
            const otherUser =
                msg.senderId === username ? msg.receiverId : msg.senderId;

            if (!map.has(otherUser)) {
                map.set(otherUser, msg); // اولین پیام = جدیدترین پیام
            }
        });

        const result = Array.from(map.values());

        res.json(result);

    } catch (err) {
        console.error("CHAT ROUTE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});


// -------------------------
// 📌 mark-seen — علامت‌گذاری پیام‌ها به عنوان خوانده‌شده
// -------------------------

router.post('/messages/mark-seen', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;

        await Message.updateMany(
            { senderId, receiverId, seen: false },
            { $set: { seen: true } }
        );

        res.json({ success: true });
    } catch (err) {
        console.error("mark-seen error:", err.message);
        res.status(500).json({ error: err.message });
    }
});


// -------------------------
// 📌 حذف پیام
// -------------------------

router.delete('/messages/:id', async (req, res) => {
    try {
        const messageId = req.params.id;
        const Conversation = require('../model/conversation');
        const User = require('../model/users');

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "پیام پیدا نشد" });
        }

        const { senderId, receiverId } = message;

        // حذف فایل از سرور
        if (message.file && message.file.url) {
            const filePath = path.join(__dirname, '..', message.file.url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await Message.findByIdAndDelete(messageId);

        // ✅ آپدیت lastMessage تو conversation
        const sender = await User.findOne({ username: senderId });
        const receiver = await User.findOne({ username: receiverId });

        if (sender && receiver) {
            const conversation = await Conversation.findOne({
                participants: { $all: [sender._id, receiver._id] }
            });

            if (conversation) {
                // آخرین پیام باقیمونده رو پیدا کن
                const lastMsg = await Message.findOne({
                    $or: [
                        { senderId, receiverId },
                        { senderId: receiverId, receiverId: senderId }
                    ]
                }).sort({ createdAt: -1 });

                conversation.lastMessage = lastMsg ? (lastMsg.text || "فایل") : "";
                await conversation.save();
            }
        }

        res.json({ message: 'پیام حذف شد' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



module.exports = router;

// THIS IS A PATCH MARKER - see sed below