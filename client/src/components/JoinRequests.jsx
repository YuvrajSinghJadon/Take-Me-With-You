import React, { useState, useEffect } from "react";
import axios from "axios";
import Loading from "./Loading"; // Assuming you have a loading component

const JoinRequests = ({ posts }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch join requests for all posts when the component mounts
  useEffect(() => {
    const fetchJoinRequests = async () => {
      try {
        const allRequests = [];

        // Fetch join requests for each post
        for (const post of posts) {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/posts/join-requests/${post._id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          // Combine all join requests into one array
          allRequests.push(...response.data.data);
        }

        setRequests(allRequests);
      } catch (error) {
        console.error("Error fetching join requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJoinRequests();
  }, [posts]);

  

  // Function to handle accepting the request
  const acceptRequest = async (requestId) => {
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/posts/accept-join-request/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        alert(response.data.message);
        // Remove the request from the list
        setRequests((prevRequests) =>
          prevRequests.filter((request) => request._id !== requestId)
        );
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error accepting join request:", error);
      alert("Failed to accept the request. Try again.");
    }
  };
  // Function to handle rejecting the request
  const rejectRequest = async (requestId) => {
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/posts/reject-join-request/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        // Remove the request from the list
        setRequests((prevRequests) =>
          prevRequests.filter((request) => request._id !== requestId)
        );
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error rejecting join request:", error);
      alert("Failed to reject the request. Try again.");
    }
  };

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

              {/* Accept/Reject Buttons */}
              <div className="flex gap-2">
                <button
                  className="text-white px-2 rounded"
                  onClick={() => acceptRequest(request._id)}
                >
                  ✅
                </button>
                <button
                  className=" text-white px-2 py-1 rounded"
                  onClick={() => rejectRequest(request._id)}
                >
                  ❌
                </button>
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
