const RatingsSection = ({ ratings }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-headline mb-4">Ratings</h2>
      <div className="flex justify-between items-center">
        <p>Average Rating:</p>
        <p className="font-bold text-secondaryRed">
          {ratings?.averageRating || 0} / 5
        </p>
      </div>
      <div className="flex justify-between items-center">
        <p>Number of Reviews:</p>
        <p className="font-bold text-yellowAccent">
          {ratings?.numberOfRatings || 0}
        </p>
      </div>
    </div>
  );
};

export default RatingsSection;
