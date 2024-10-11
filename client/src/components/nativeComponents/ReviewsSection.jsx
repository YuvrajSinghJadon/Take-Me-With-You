const ReviewsSection = ({ reviews }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-headline mb-4">Recent Reviews</h2>
      {reviews?.length > 0 ? (
        reviews.map((review, index) => (
          <div key={index} className="border-b border-gray-200 pb-4 mb-4">
            <p className="font-bold text-primaryRed">
              Rating: {review.rating}/5
            </p>
            <p className="text-gray-600">
              {review.comment || "No comment provided"}
            </p>
            <p className="text-sm text-gray-500">
              By: {review.traveller?.firstName || "Unknown traveler"}
            </p>
            <p className="text-sm text-gray-400">
              Date: {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))
      ) : (
        <p>No reviews yet.</p>
      )}
    </div>
  );
};

export default ReviewsSection;
