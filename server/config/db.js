const mongoose = require('mongoose')

const mainDB = mongoose.createConnection("mongodb://127.0.0.1:27017/chatDB")
const usersDB = mongoose.createConnection("mongodb://127.0.0.1:27017/usersDB");
const logsDB = mongoose.createConnection("mongodb://127.0.0.1:27017/logsDB");

module.exports = {mainDB, usersDB, logsDB };