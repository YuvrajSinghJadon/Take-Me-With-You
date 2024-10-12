import React from "react";
import { useNavigate } from "react-router-dom";
import NativeCard from "./NativeCard"; // Import the NativeCard component

const NativeList = ({ natives }) => {
  const navigate = useNavigate();

  const handleNativeClick = (nativeId) => {
    navigate(`/natives/${nativeId}`); // Navigate to the native's profile
  };

  return (
    <div className="native-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
      {natives.map((native) => (
        <NativeCard
          key={native._id}
          native={native}
          onClick={() => handleNativeClick(native._id)} // Correctly pass the handler
        />
      ))}
    </div>
  );
};

export default NativeList;
