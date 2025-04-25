/**
 * Game Model
 * 
 * Defines the schema for game records in the database.
 * Includes fields such as title, description, category, 
 * image URL, and metadata like release date and ratings.
 * 
 * This model serves as the core data structure for all
 * game-related operations within the GameRec application.
 */

const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
    title: { type: String, required: true },
    genre: [{ type: String }],
    release_date: Date,
    rating: Number
});

module.exports = mongoose.model("Game", GameSchema);
