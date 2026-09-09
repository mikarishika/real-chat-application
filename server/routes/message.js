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
const { Message } = require('../model/message');
const { User } = require('../model/users');
const Conversation = require('../model/conversation');
const upload = require('../config/multerFile');
const path = require('path');
const fs = require('fs');


// -------------------------
// 📌 گرفتن لیست تمام کاربران (برای Sidebar) - بدون خود کاربر
//   مسیر: GET /messages/users
// -------------------------
router.get('/messages/users', async (req, res) => {
    try {
        const currentUserId = req.query.userId;
        const users = await User.find(currentUserId ? { _id: { $ne: currentUserId } } : {})
            .select('-password')
            .sort({ createdAt: -1 });

        const messages = currentUserId
            ? await Message.find({
                $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
            }).sort({ createdAt: -1 })
            : [];
        const latestMessages = new Map();
        const unreadCounts = new Map();

        messages.forEach((message) => {
            const otherUserId = message.senderId === currentUserId
                ? message.receiverId
                : message.senderId;
            if (!latestMessages.has(otherUserId)) latestMessages.set(otherUserId, message);
            if (message.receiverId === currentUserId && !message.seen) {
                unreadCounts.set(otherUserId, (unreadCounts.get(otherUserId) || 0) + 1);
            }
        });

        res.json(users.map((user) => ({
            ...user.toObject(),
            lastMessage: latestMessages.get(user._id.toString()) || null,
            unreadCount: unreadCounts.get(user._id.toString()) || 0,
        })));
    } catch (err) {
        console.error("Get Users Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});


// -------------------------
// 📌 گرفتن پیام‌های یک کاربر
//   مسیر: GET /messages/:userId
// -------------------------
router.get('/messages/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: "userId لازم است" });
        }

        const messages = await Message.find({
            $or: [
                { chatId: userId },
                { sender: userId }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        console.error("Get Messages Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});


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
// ارسال پیام از رابط کاربری چت
// مسیر: POST /messages/send/:receiverId
// -------------------------
const uploadMessageFiles = (req, res, next) => {
    upload.array('files', 50)(req, res, (err) => {
        if (err) {
            console.error("File Upload Error:", err.message);
            return res.status(400).json({
                message: err.code === "LIMIT_UNEXPECTED_FILE"
                    ? "تعداد فایل‌های انتخاب‌شده بیشتر از حد مجاز است"
                    : err.message,
            });
        }
        next();
    });
};

router.post('/messages/send/:receiverId', uploadMessageFiles, async (req, res) => {
    try {
        const { receiverId } = req.params;
        const { text } = req.body;
        const senderId = req.body.senderId || req.body.sender;

        if (!senderId || !receiverId) {
            return res.status(400).json({ message: "فرستنده و گیرنده الزامی هستند" });
        }

        const uploadedFiles = req.files || [];
        const fileData = uploadedFiles.map((file) => {
            let uploadFolder = "documents";
            if (file.mimetype.startsWith("image/")) uploadFolder = "pictures";
            else if (file.mimetype.startsWith("video/")) uploadFolder = "videos";
            else if (file.mimetype.startsWith("audio/")) uploadFolder = "audios";
            else if (file.mimetype.includes("zip")) uploadFolder = "archives";
            return {
                url: `/uploads/${uploadFolder}/${file.filename}`,
                type: file.mimetype,
                name: file.originalname,
                size: file.size,
            };
        });
        const attachments = fileData.length === 1 ? fileData[0] : fileData;

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text: text || "",
            image: fileData.length === 1 && fileData[0].type.startsWith("image/") ? fileData[0].url : null,
            file: attachments,
        });

        const io = req.app.get('io');
        if (io) io.emit('newMessage', newMessage);

        res.status(201).json(newMessage);
    } catch (err) {
        console.error("Send Message Error:", err.message);
        res.status(500).json({ message: err.message || "ارسال پیام ناموفق بود" });
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


// -------------------------
// 📌 SEED MESSAGE - یک پیام نمونه برای تست
// -------------------------
router.post('/messages/seed', async (req, res) => {
    try {
        // پاک کردن پیام‌های قدیمی
        await Message.deleteMany({});

        // گرفتن دو کاربر اول
        const users = await User.find().limit(2);
        
        if (users.length < 2) {
            return res.status(400).json({ error: "حداقل 2 کاربر لازم است" });
        }

        const [sender, receiver] = users;

        // ایجاد یک conversation
        const conversation = await Conversation.create({
            participants: [sender._id, receiver._id],
            createdBy: sender._id,
            isGroup: false
        });

        // ایجاد یک پیام نمونه
        const seedMessage = new Message({
            chatId: conversation._id,
            sender: sender._id,
            content: "سلام! 👋 این یک پیام نمونه است.",
            replyTo: null
        });

        await seedMessage.save();

        // آپدیت conversation
        conversation.lastMessage = seedMessage._id;
        await conversation.save();

        res.json({ 
            success: true, 
            message: 'Seed message created!',
            data: { conversation, seedMessage }
        });
    } catch (err) {
        console.error("Seed error:", err.message);
        res.status(500).json({ error: err.message });
    }
});



module.exports = router;

// THIS IS A PATCH MARKER - see sed below