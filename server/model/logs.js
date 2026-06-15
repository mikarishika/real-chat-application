const { logsDB } = require("../config/db");
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  action: String,
  time: Date
});

module.exports = logsDB.model("Log", logSchema);
