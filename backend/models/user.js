/**
 * User Model
 * 
 * Defines the schema for user accounts in the database.
 * Manages user authentication data and profile information.
 * 
 * The schema typically includes:
 * - Username (for display and identification)
 * - Password (stored securely with hashing)
 * - Optional profile fields (email, avatar, etc.)
 * - Authentication metadata (registration date, last login)
 * - References to user's favorite games and reviews
 */
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true },
    password_hash: { type: String, required: true },

    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game' }]
});

module.exports = mongoose.model("User", UserSchema);
