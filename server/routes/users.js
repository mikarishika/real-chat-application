const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const fs = require("fs");

const User = require("../model/users");
const UserProfileImage = require("../model/profile");
const uploadProfileImg = require("../config/multerProfile");

try {
    // ================= SIGNUP =================
    router.post("/signup", async (req, res) => {
        try {
            const { username, password } = req.body;

            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.json({ success: false, message: "Username already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = "user_" + Date.now();

            const newUser = new User({ userId, username, password: hashedPassword });
            await newUser.save();

            res.json({
                success: true,
                user: {
                    id: newUser._id,
                    userId: newUser.userId,
                    username: newUser.username,
                    profilePic: newUser.profilePic || null   // ✅
                }
            });

        } catch (err) {
            console.error("Signup error:", err);
            res.status(500).json({ success: false, message: "Server error" });
        }
    });


    // ================= LOGIN =================
    router.post("/login", async (req, res) => {
        const { username, password } = req.body;

        try {
            const user = await User.findOne({ username });

            if (!user) {
                return res.json({ success: false, message: "Invalid username or password" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.json({ success: false, message: "Invalid username or password" });
            }

            res.json({
                success: true,
                message: "Login successful",
                user: {
                    id: user._id,
                    userId: user.userId,
                    username: user.username,
                    profilePic: user.profilePic || null   // ✅ عکس واقعی از DB میاد
                }
            });

        } catch (err) {
            res.status(500).json({ success: false, message: "Server error" });
        }
    });


    // ================= UPLOAD PROFILE IMAGE =================
    router.post("/user/profile-image", uploadProfileImg.single("profileImage"),
        async (req, res) => {
            try {
                if (!req.file) {
                    return res.status(400).json({ message: "لطفا یک عکس پروفایل انتخاب کنید." });
                }

                const profileImageUrl = `/uploads/pictures/profilePics/${req.file.filename}`;
                const username = req.body.username;

                if (!username) {
                    return res.status(400).json({ error: "username لازم است" });
                }

                // ✅ آپدیت profilePic مستقیم تو مدل User
                const updatedUser = await User.findOneAndUpdate(
                    { username },
                    { profilePic: profileImageUrl },
                    { new: true }
                );

                if (!updatedUser) {
                    return res.status(404).json({ error: "کاربر پیدا نشد" });
                }

                // ✅ ذخیره تو UserProfileImage (برای لاگ)
                await new UserProfileImage({
                    username,
                    url: profileImageUrl,
                    fileNameInServer: req.file.filename,
                    size: req.file.size
                }).save();

                res.status(200).json({
                    message: "عکس پروفایل با موفقیت بارگذاری شد.",
                    profilePic: profileImageUrl   // ✅ فرانت این رو میگیره
                });

                console.log("BODY:", req.body);
                console.log("FILE:", req.file?.filename);
                console.log("USERNAME:", req.body.username);
            } catch (err) {
                console.error("Error uploading profile image:", err.message);
                if (req.file && req.file.path) fs.unlink(req.file.path, () => { });
                res.status(500).json({ error: "خطایی در بارگذاری عکس پروفایل رخ داد." });
            }
        }
    );


    // ================= GET PROFILE IMAGE (همین کاربر) =================
    // ✅ قبلاً عکس همه کاربرا میومد — الان فقط عکس همین کاربر
    router.get("/user/profile-image/:username", async (req, res) => {
        try {
            const user = await User.findOne({ username: req.params.username });

            if (!user) {
                return res.status(404).json({ error: "کاربر پیدا نشد" });
            }

            res.json({ profilePic: user.profilePic || null });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // ================= GET PROFILE IMAGESSS (همین کاربر) =================
    router.get("/user/profile-images/:username", async (req, res) => {
        try {
            const images = await UserProfileImage
                .find({
                    username: req.params.username
                })
                .sort({ uploadedAt: 1 });

            res.json(images);

        } catch (err) {
            console.error(err);
            res.status(500).json({
                error: err.message
            });
        }
    });

    // ================= DELETE PROFILE IMAGESSS (همین کاربر) =================
    router.delete("/user/profile-image", async (req, res) => {
        try {

            const { username, url } = req.body;

            await UserProfileImage.deleteOne({
                username,
                url
            });

            res.json({
                success: true
            });

        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    });
    // ================= UPDATE PROFILE IMAGES =================
    router.post("/user/update-profile-pic", async (req, res) => {
        try {
            const { username, profilePic } = req.body;

            await User.updateOne(
                { username },
                { profilePic }
            );

            res.json({ success: true });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    
    // ================= UPDATE USERNAME =================
    router.post("/user/update-username", async (req, res) => {
        try {
            const { username } = req.body;
            if (!username) return res.status(400).json({ error: "Username لازم است" });
            res.json({ success: true, username });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });


    // ================= SEARCH USERS =================
    router.get("/users/search", async (req, res) => {
        try {
            const { query } = req.query;
            if (!query) return res.json([]);

            const users = await User.find({
                $or: [
                    { userId: { $regex: query, $options: "i" } },
                    { username: { $regex: query, $options: "i" } },
                    { fullName: { $regex: query, $options: "i" } }
                ]
            })
                .select("userId username fullName profilePic")
                .limit(10);

            res.json(users);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

} catch (err) {
    console.error("Error in users.js:", err);
}

module.exports = router;



