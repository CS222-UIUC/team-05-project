/**
 * Review Model
 * 
 * Defines the schema for game reviews in the database.
 * Each review connects a user to a game with rating and comments.
 * 
 * The schema includes:
 * - Reference to the user who created the review
 * - Reference to the game being reviewed
 * - Numerical rating (typically 1-5)
 * - Text content of the review
 * - Timestamps for creation and updates
 */
const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    game_id: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
    rating: { type: Number, min: 1, max: 5 },
    review_text: String,
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Review", ReviewSchema);
