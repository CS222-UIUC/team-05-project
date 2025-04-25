const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
    title: { type: String, required: true },
    genre: { type: [String] },
    release_date: Date,
    rating: Number,
    describe: String,
    cover_url: String  
});

module.exports = mongoose.model("Game", GameSchema);
