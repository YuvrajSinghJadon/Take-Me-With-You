// JoinRequests.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Loading from "./Loading"; // Assuming you have a loading component

const JoinRequests = ({ postId }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch join requests when the component mounts
  useEffect(() => {
    const fetchJoinRequests = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/posts/join-requests/${postId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setRequests(response.data.data);
      } catch (error) {
        console.error("Error fetching join requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJoinRequests();
  }, [postId]);

  if (loading) {
    return <Loading />; // Show loading spinner if data is still loading
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-4">
      {/* Header showing total join requests */}
      <div className="text-lg font-semibold mb-4">
        {requests.length} Join Requests
      </div>

      {/* Scrollable container for user join request cards */}
      <div className="h-64 overflow-y-auto">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div
              key={request._id}
              className="flex items-center p-2 mb-2 border-b border-gray-200"
            >
              {/* User Profile Image */}
              <img
                src={request.userId.profileUrl || "/default-profile.png"}
                alt={`${request.userId.firstName} ${request.userId.lastName}`}
                className="w-10 h-10 rounded-full mr-3"
              />

              {/* User Details */}
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {request.userId.firstName} {request.userId.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  Requested to join {request.postId.title}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No join requests found.</p>
        )}
      </div>
    </div>
  );
};

export default JoinRequests;
