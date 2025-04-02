const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
    title: { type: String, required: true },
    genre: String,
    release_date: Date,
    rating: Number
});

module.exports = mongoose.model("Game", GameSchema);
