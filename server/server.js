const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const upload = require('./config/multerFile');
const uploadProfileImg = require('./config/multerProfile');
const app = express();
const Message = require('./model/message');
const UserProfileImage = require('./model/profile');
const { mainDB, usersDB, logsDB } = require('./config/db');
const messageRoutes = require('./routes/message');
const userRoutes = require('./routes/users.js');
const conversationRoutes = require("./routes/conversationRoutes.js");

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', messageRoutes);
app.use('/api', userRoutes);
app.use("/api/conversations", conversationRoutes);

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }
});

// ✅ نگه داشتن کاربرهای آنلاین — { username: socketId }
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('User Connected:', socket.id);

    // ✅ کاربر وقتی وارد میشه username خودش رو میفرسته
    socket.on('user_online', (username) => {
        if (!username) return;
        onlineUsers.set(username, socket.id);

        // به همه بگو این کاربر آنلاین شد
        io.emit('online_users', Array.from(onlineUsers.keys()));
        console.log(`✅ ${username} is online`);
    });

    socket.on('send_message', async (dataa) => {
        try {
            if (!dataa._id) {
                const newMessage = new Message({
                    senderId: dataa.senderId,
                    receiverId: dataa.receiverId,
                    text: dataa.text,
                    file: dataa.file
                });
                await newMessage.save();
                io.emit('receive_message', newMessage);
            } else {
                socket.broadcast.emit('receive_message', dataa);
            }
        } catch (error) {
            console.log("Socket Error:", error.message);
        }
    });

    // ✅ وقتی گیرنده پیام‌ها رو دید، به فرستنده اطلاع بده
socket.on('messages_seen', ({ senderId, receiverId }) => {
    console.log("🔵 messages_seen received:", senderId, "->", receiverId); // این خط رو اضافه کن
    const senderSocketId = onlineUsers.get(senderId);
    console.log("🔵 senderSocketId:", senderSocketId); // این هم
    if (senderSocketId) {
        io.to(senderSocketId).emit('messages_seen_update', { senderId, receiverId });
    }
});


    // ✅ وقتی کاربر چت رو باز کرد، unread رو تو DB صفر کن
    socket.on('mark_read', async ({ username, otherUsername }) => {
        try {
            const User = require('./model/users');
            const Conversation = require('./model/conversation');

            const user = await User.findOne({ username });
            const other = await User.findOne({ username: otherUsername });
            if (!user || !other) return;

            const conversation = await Conversation.findOne({
                participants: { $all: [user._id, other._id] }
            });

            if (conversation) {
                // ✅ username به عنوان key (نه _id)
                conversation.unreadCounts = {
                    ...conversation.unreadCounts,
                    [username]: 0
                };
                conversation.markModified('unreadCounts');
                await conversation.save();
                console.log(`✅ mark_read: ${username} read chat with ${otherUsername}`);
            }
        } catch (err) {
            console.error('mark_read error:', err.message);
        }
    });

    socket.on('delete_message', (msgId) => {
        socket.broadcast.emit('message_deleted', msgId);
    });

    // ✅ وقتی disconnect شد از لیست آنلاین حذف میشه
    socket.on('disconnect', () => {
        for (const [username, sockId] of onlineUsers.entries()) {
            if (sockId === socket.id) {
                onlineUsers.delete(username);
                console.log(`❌ ${username} went offline`);
                break;
            }
        }
        // به همه بگو لیست آنلاین آپدیت شد
        io.emit('online_users', Array.from(onlineUsers.keys()));
    });
});

// ✅ endpoint برای گرفتن لیست آنلاین (اختیاری)
app.get('/api/online-users', (req, res) => {
    res.json(Array.from(onlineUsers.keys()));
});

mainDB.on("connected", () => console.log("Connected to chatDB"));
logsDB.on("connected", () => console.log("Connected to logsDB"));

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`✅ Server is running on PORT ${PORT}`);
});