const express = require('express');
const router = express.Router();
const games = require('../data/games.json');

// recommend based on USER preference
router.get('/recommend', (req, res) => {
    const { genre, platform } = req.query;

    if (!genre && !platform) {
        return res.status(400).json({ error: 'Please provide at least one preference (genre or platform)' });
    }

    const recommendedGames = games.filter(game => {
        const matchesGenre = genre ? game.genre.includes(genre) : true;
        const matchesPlatform = platform ? game.platform.includes(platform) : true;
        return matchesGenre && matchesPlatform;
    });

    res.json(recommendedGames);
});

module.exports = router;