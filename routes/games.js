const express = require("express");
const router = express.Router();
const Game = require("../models/game");

// get all the games 
router.get("/", async (req, res) => {
    try {
        const games = await Game.find();
        res.json(games);
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

module.exports = router;
