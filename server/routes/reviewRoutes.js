const express = require("express");
const { getReviews, approveReview, deleteReview } = require("../controllers/reviewController");
const router = express.Router();

router.get("/", getReviews);
router.put("/:id", approveReview);
router.delete("/:id", deleteReview);

module.exports = router;
