const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    game_id: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
    rating: { type: Number, min: 1, max: 5 },
    review_text: String,
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Review", ReviewSchema);
