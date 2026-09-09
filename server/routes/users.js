const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const { User, UserProfileImage } = require("../model/users");
const uploadProfileImg = require("../config/multerProfile");

const JWT_SECRET = process.env.JWT_SECRET || "development-secret-change-me";

const publicUser = (user) => ({
    id: user._id,
    userId: user.userId,
    username: user.username,
    email: user.email,
    profilePic: user.profilePic || null,
    profilePics: user.profilePics?.length ? user.profilePics : (user.profilePic ? [user.profilePic] : [])
});

const setAuthCookie = (res, user) => {
    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, {
        expiresIn: "7d"
    });

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

try {
    // ================= SIGNUP =================
    router.post("/auth/signup", async (req, res) => {
        try {
            const { username, email, password } = req.body;
            const normalizedEmail = email?.trim().toLowerCase();

            if (!username?.trim() || !normalizedEmail || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Username, email, and password are required"
                });
            }

            const existingUser = await User.findOne({
                $or: [{ username: username.trim() }, { email: normalizedEmail }]
            });
            if (existingUser) {
                const message = existingUser.username === username
                    ? "Username already exists"
                    : "Email already exists";
                return res.status(409).json({ success: false, message });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = "user_" + Date.now();

            const newUser = new User({
                userId,
                username: username.trim(),
                email: normalizedEmail,
                password: hashedPassword
            });
            await newUser.save();
            setAuthCookie(res, newUser);

            res.json({
                success: true,
                user: publicUser(newUser)
            });

        } catch (err) {
            console.error("Signup error:", err);
            res.status(500).json({ success: false, message: "Server error" });
        }
    });


    // ================= LOGIN =================
    router.post("/auth/login", async (req, res) => {
        const { email, password } = req.body;

        try {
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Email and password are required"
                });
            }

            const user = await User.findOne({ email: email.trim().toLowerCase() });

            if (!user) {
                return res.status(401).json({ success: false, message: "Invalid email or password" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: "Invalid email or password" });
            }

            setAuthCookie(res, user);

            res.json({
                success: true,
                message: "Login successful",
                user: publicUser(user)
            });

        } catch (err) {
            res.status(500).json({ success: false, message: "Server error" });
        }
    });

    router.get("/auth/check", async (req, res) => {
        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).json({ success: false, message: "Not authenticated" });
            }

            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.userId);
            if (!user) {
                return res.status(401).json({ success: false, message: "Not authenticated" });
            }

            res.json({ success: true, user: publicUser(user) });
        } catch (err) {
            res.status(401).json({ success: false, message: "Not authenticated" });
        }
    });

    router.post("/auth/logout", (req, res) => {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });
        res.json({ success: true, message: "Logged out successfully" });
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

                const currentUser = await User.findOne({ username });
                if (!currentUser) {
                    return res.status(404).json({ error: "کاربر پیدا نشد" });
                }

                const updatedUser = await User.findOneAndUpdate(
                    { username },
                    {
                        $push: { profilePics: profileImageUrl },
                        $set: { profilePic: currentUser.profilePic || profileImageUrl }
                    },
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
                    profilePic: updatedUser.profilePic,
                    profilePics: updatedUser.profilePics
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

            res.json({
                profilePic: user.profilePic || null,
                profilePics: user.profilePics?.length ? user.profilePics : (user.profilePic ? [user.profilePic] : [])
            });

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

            const user = await User.findOne({ username });
            if (!user) return res.status(404).json({ error: "کاربر پیدا نشد" });

            const remainingImages = (user.profilePics || []).filter((imageUrl) => imageUrl !== url);
            await User.updateOne(
                { username },
                {
                    $set: {
                        profilePics: remainingImages,
                        profilePic: user.profilePic === url ? (remainingImages[0] || null) : user.profilePic
                    }
                }
            );

            res.json({
                success: true,
                profilePic: user.profilePic === url ? (remainingImages[0] || null) : user.profilePic,
                profilePics: remainingImages
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



