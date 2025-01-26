const Review = require("../models/Review");

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate("product", "name");
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
};

exports.approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { approved: true },
      { new: true }
    );
    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: "Error approving review" });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await Review.findByIdAndDelete(id);
    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review" });
  }
};
