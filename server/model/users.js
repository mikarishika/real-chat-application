const { mainDB } = require("../config/db");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true
  },

  username: {
    type: String,
    required: true
  },

  email: {
    type: String
  },

  fullName: {
    type: String
  },

  password: {
    type: String,
    required: true
  },

  profilePic: {
    type: String
  }
});

module.exports = mainDB.model("User", userSchema);


// const { usersDB } = require("../config/db");
// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   username: String,
//   password: String
// });

// module.exports = usersDB.model("User", userSchema);
