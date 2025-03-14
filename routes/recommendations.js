const express = require("express");
const router = express.Router();
const Recommendation = require("../models/Recommendation");

// get all recommendations(test)
router.get("/", async (req, res) => {
    try {
        const recommendations = await Recommendation.find()
            .populate("user_id", "username")
            .populate("game_id", "title genre");
        res.json(recommendations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// get recommendation for specific user
router.get("/user/:userId", async (req, res) => {
    try {
        const recommendations = await Recommendation.find({ user_id: req.params.userId })
            .populate("game_id", "title genre rating");
        res.json(recommendations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// creat rec
router.post("/", async (req, res) => {
    const recommendation = new Recommendation(req.body);
    try {
        const savedRecommendation = await recommendation.save();
        res.status(201).json(savedRecommendation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// delete rec
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Recommendation.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "Recommendation not found." });
        }
        res.json({ message: "Deleted successfully." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
