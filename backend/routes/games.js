const express = require("express");
const router = express.Router();
const Game = require("../models/game");
const User = require('../models/user');

// get all the games 
router.get("/", async (req, res) => {
    try {
        const { title, genre, rating } = req.query;
        const query = {};

        if (title) {
            // Using regex for partial match (case-insensitive)
            query.title = new RegExp(title, 'i');
        }
        if (genre) {
            query.genre = genre;
        }
        if (rating) {
            // e.g., rating >= provided
            const min = parseInt(rating, 10);
            if (!isNaN(min)) {
                query.rating = { $gte: min };
            }
        }

        const games = await Game.find(query);
        res.json(games);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// get game by id
router.get("/:id", async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) return res.status(404).json({ message: "Game not found." });
        res.json(game);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// add new games
router.post("/", async (req, res) => {
    const game = new Game(req.body);
    try {
        const savedGame = await game.save();
        res.status(201).json(savedGame);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// update game info
router.put("/:id", async (req, res) => {
    try {
        const updatedGame = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedGame);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// delete game
router.delete("/:id", async (req, res) => {
    try {
        const deletedGame = await Game.findByIdAndDelete(req.params.id);
        if (!deletedGame) return res.status(404).json({ message: "Game not found." });
        res.json({ message: "Game deleted successfully." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// recommendation algorithm
router.get("/recommend/content/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate("favorites", "genre rating");

        if (!user) return res.status(404).json({ message: "User not found." });

        // back to default rating list if no fav games
        if (user.favorites.length === 0) {
            const popularGames = await Game.find()
                .sort({ rating: -1 })
                .limit(10);
            return res.json(popularGames);
        }

        // user genre weights
        const genreWeights = {};
        user.favorites.forEach(game => {
            game.genre?.forEach(genre => {
                genreWeights[genre] = (genreWeights[genre] || 0) + 1;
            });
        });

        // recommend games excluding all fav games
        const candidateGames = await Game.find({
            _id: { $nin: user.favorites.map(g => g._id) }
        });

        // recommendation score
        const scoredGames = candidateGames.map(game => {
            const genreScore = game.genre.reduce(
                (sum, genre) => sum + (genreWeights[genre] || 0),
                0
            );

            const ratingScore = game.rating / 10;

            // final weights
            const finalScore = 0.7 * genreScore + 0.3 * ratingScore;

            return { game, score: finalScore };
        });

        // top 10 games of rating high-to-low
        const recommended = scoredGames
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(item => item.game);

        res.json(recommended);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
