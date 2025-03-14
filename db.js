// db.js
const mongoose = require("mongoose");
require('dotenv').config();

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected (Atlas)!");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
    }
}

module.exports = connectDB;
