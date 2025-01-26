import React, { useState, useEffect } from "react";
import axios from "axios";
// import "./ManageReviews.css";

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/reviews");
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();
  }, []);

  const approveReview = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/reviews/${id}`, { approved: true });
      setReviews(
        reviews.map((review) =>
          review._id === id ? { ...review, approved: true } : review
        )
      );
    } catch (error) {
      console.error("Error approving review:", error);
    }
  };

  const deleteReview = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/reviews/${id}`);
      setReviews(reviews.filter((review) => review._id !== id));
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Manage Reviews</h1>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Product</th>
            <th>Review</th>
            <th>Rating</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review._id}>
              <td>{review.productName}</td>
              <td>{review.text}</td>
              <td>{review.rating}</td>
              <td>{review.approved ? "Approved" : "Pending"}</td>
              <td>
                {!review.approved && (
                  <button
                    className="btn btn-success me-2"
                    onClick={() => approveReview(review._id)}
                  >
                    Approve
                  </button>
                )}
                <button
                  className="btn btn-danger"
                  onClick={() => deleteReview(review._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageReviews;
