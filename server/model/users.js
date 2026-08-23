const mongoose = require("mongoose");
const chatDb = require("../config/chatDb");

// ========== USER SCHEMA ==========
const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      sparse: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      default: "",
    },
    fullName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    profilePic: {
      type: String,
      default: null,
    },
    profilePics: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        if (ret) {
          delete ret.password;
        }
        return ret;
      },
    },
  }
);

const User = chatDb.model("User", userSchema);

// ========== USER PROFILE IMAGE SCHEMA ==========
const userProfileImageSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    fileNameInServer: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const UserProfileImage = chatDb.model(
  "UserProfileImage",
  userProfileImageSchema
);

module.exports = { User, UserProfileImage };
