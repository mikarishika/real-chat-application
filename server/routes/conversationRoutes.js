const express = require("express");
const router = express.Router();
const Conversation = require("../model/conversation");

// ✅ آپدیت مکالمه + زیاد کردن unread برای گیرنده
router.post("/update", async (req, res) => {
    try {
        const { senderUsername, receiverUsername, lastMessage } = req.body;
        const User = require("../model/users");

        const sender = await User.findOne({ username: senderUsername });
        const receiver = await User.findOne({ username: receiverUsername });

        if (!sender || !receiver) {
            return res.status(404).json({ error: "User not found" });
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [sender._id, receiver._id] }
        });

        if (!conversation) {
            conversation = new Conversation({
                participants: [sender._id, receiver._id],
                lastMessage,
                unreadCounts: { [receiverUsername]: 1 }
            });
        } else {
            conversation.lastMessage = lastMessage;
            const current = conversation.unreadCounts?.[receiverUsername] || 0;
            conversation.unreadCounts = {
                ...conversation.unreadCounts,
                [receiverUsername]: current + 1
            };
            conversation.markModified("unreadCounts");
        }

        await conversation.save();
        res.status(200).json(conversation);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Conversation update failed" });
    }
});

// ✅ گرفتن مکالمات کاربر
router.get("/user/:username", async (req, res) => {
    try {
        const { username } = req.params;
        const User = require("../model/users");
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const conversations = await Conversation
            .find({ participants: user._id })
            .populate("participants", "username profilePic")
            .sort({ updatedAt: -1 });

        // ✅ myUnread رو با username key بخون
        const result = conversations.map(conv => {
            const obj = conv.toObject();
            const unread = obj.unreadCounts?.[username];
            obj.myUnread = (typeof unread === 'number' && unread > 0) ? unread : 0;
            return obj;
        });

        res.json(result);

    } catch (err) {
        console.error("Fetch conversations error:", err);
        res.status(500).json({ error: "Failed to fetch conversations" });
    }
});

// ✅ reset کردن unread از طریق HTTP (backup)
router.post("/mark-read", async (req, res) => {
    try {
        const { username, otherUsername } = req.body;
        const User = require("../model/users");

        const user = await User.findOne({ username });
        const other = await User.findOne({ username: otherUsername });

        if (!user || !other) {
            return res.status(404).json({ error: "User not found" });
        }

        const conversation = await Conversation.findOne({
            participants: { $all: [user._id, other._id] }
        });

        if (conversation) {
            conversation.unreadCounts = {
                ...conversation.unreadCounts,
                [username]: 0
            };
            conversation.markModified("unreadCounts");
            await conversation.save();
        }

        res.json({ success: true });

    } catch (err) {
        console.error("mark-read error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;