const express = require("express");
const router = express.Router();
const Game = require("../models/game");
const User = require("../models/user");

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

// Get recommended games
router.get("/recommend/:userId", async (req, res) => {
    try {
        // Get user data
        const user = await User.findById(req.params.userId).populate('favorites');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // If user has no favorite games, return top-rated games
        if (!user.favorites || user.favorites.length === 0) {
            const topRatedGames = await Game.find().sort({ rating: -1 }).limit(10);
            return res.json(topRatedGames);
        }
        
        // Collect genre preferences from user's favorite games
        const genrePreferences = {};
        user.favorites.forEach(game => {
            if (game.genre && game.genre.length > 0) {
                game.genre.forEach(g => {
                    if (!genrePreferences[g]) {
                        genrePreferences[g] = 0;
                    }
                    genrePreferences[g] += 1;
                });
            }
        });
        
        // Sort genres by preference count (descending order)
        const sortedGenres = Object.keys(genrePreferences).sort(
            (a, b) => genrePreferences[b] - genrePreferences[a]
        );
        
        // If no valid genre preferences, return top-rated games
        if (sortedGenres.length === 0) {
            const topRatedGames = await Game.find().sort({ rating: -1 }).limit(10);
            return res.json(topRatedGames);
        }
        
        // Get IDs of already favorited games to exclude them
        const favoritesIds = user.favorites.map(game => game._id.toString());
        
        // Find recommendations based on user's preferred genres
        const recommendations = await Game.find({
            _id: { $nin: favoritesIds }, // Exclude already favorited games
            genre: { $in: sortedGenres.slice(0, 3) } // Use top 3 preferred genres
        }).sort({ rating: -1 }).limit(10);
        
        // If we don't have enough recommendations, add some high-rated games
        if (recommendations.length < 10) {
            const additionalRecommendations = await Game.find({
                _id: { $nin: [...favoritesIds, ...recommendations.map(r => r._id.toString())] }
            }).sort({ rating: -1 }).limit(10 - recommendations.length);
            
            recommendations.push(...additionalRecommendations);
        }
        
        res.json(recommendations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
