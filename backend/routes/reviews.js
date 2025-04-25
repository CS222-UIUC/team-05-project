const express = require("express");
const router = express.Router();
const Review = require("../models/review");

// get all reviews(test)
router.get("/", async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate("user_id", "username")
            .populate("game_id", "title");
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// get reviews by game id
router.get("/game/:gameId", async (req, res) => {
    try {
        const reviews = await Review.find({ game_id: req.params.gameId })
            .populate("user_id", "username");
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// creat review
router.post("/", async (req, res) => {
    const { user_id, game_id, rating, review_text } = req.body;

    const review = new Review({
        user_id,
        game_id,
        rating,
        review_text
    });

    try {
        const savedReview = await review.save();
        res.status(201).json(savedReview);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// delete review
router.delete("/:id", async (req, res) => {
    try {
        const deletedReview = await Review.findByIdAndDelete(req.params.id);
        if (!deletedReview) {
            return res.status(404).json({ message: "Review not found." });
        }
        res.json({ message: "Deleted successfully." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
