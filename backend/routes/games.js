const express = require("express");
const router = express.Router();
const Game = require("../models/game");

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

module.exports = router;
