const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Game = require('../models/game');
const bcrypt = require("bcryptjs");

// user register
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
        username,
        email,
        password_hash: hashedPassword
    });

    try {
        const savedUser = await user.save();
        res.status(201).json({userId: savedUser._id, username: savedUser.username});
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// user login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ message: "Invalid credentials" });

        res.json({ message: "Login successful", userId: user._id, username: user.username });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// add favorite
router.post('/:userId/favorites', async (req, res) => {
    const { gameId } = req.body;
    try {
      const user = await User.findById(req.params.userId);
      if (!user.favorites.includes(gameId)) {
        user.favorites.push(gameId);
        await user.save();
      }
      res.json({ message: 'Game added to favorites.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // delete favorite
  router.delete('/:userId/favorites/:gameId', async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      user.favorites = user.favorites.filter(id => id.toString() !== req.params.gameId);
      await user.save();
      res.json({ message: 'Game removed from favorites.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // get user favorite list
  router.get('/:userId/favorites', async (req, res) => {
    try {
      const user = await User.findById(req.params.userId).populate('favorites');
      res.json(user.favorites);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;
