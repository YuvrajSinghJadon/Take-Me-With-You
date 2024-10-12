import React from "react";
import { FaStar } from "react-icons/fa"; // For displaying ratings

const NativeCard = ({ native, onClick }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex items-center space-x-4 w-full mb-6">
      {/* Profile Picture */}
      <div className="flex-shrink-0">
        <img
          className="h-20 w-20 rounded-full object-cover"
          src={native.profilePicture || "default-avatar.png"} // Placeholder if no picture
          alt={`${native.name}'s profile`}
        />
      </div>

      {/* Info Section */}
      <div className="flex-1">
        {/* Name */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {native.name}
        </h2>

        {/* Ratings */}
        <div className="flex items-center text-yellow-400">
          {Array.from({ length: Math.floor(native.ratings || 0) }).map(
            (_, i) => (
              <FaStar key={i} />
            )
          )}
          {/* If no ratings */}
          {native.ratings === 0 && (
            <p className="text-sm text-gray-500">No ratings yet</p>
          )}
        </div>

        {/* Languages */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Languages: {native.languages.join(", ")}
        </p>
      </div>

      {/* View Profile Button */}
      <div>
        <button
          onClick={onClick} // Add the onClick handler for View Profile here
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default NativeCard;
