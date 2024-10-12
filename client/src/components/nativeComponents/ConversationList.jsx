// src/components/ConversationsList.jsx

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ConversationsList = ({ nativeId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Fetch all conversations for the native
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/natives/${nativeId}/conversations`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setConversations(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load conversations.");
        setLoading(false);
      }
    };

    fetchConversations();
  }, [nativeId, token]);

  const handleConversationClick = (conversationId) => {
    navigate(`/chat/${conversationId}`); // Navigate to the chat view
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto p-6 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">
        Active Conversations
      </h2>
      {conversations.length > 0 ? (
        <ul className="space-y-4">
          {conversations.map((conv) => (
            <li
              key={conv._id}
              className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow cursor-pointer"
              onClick={() => handleConversationClick(conv._id)}
            >
              <div className="flex items-center space-x-4">
                <img
                  src={conv.traveller.profileUrl || "default-avatar.png"}
                  alt={conv.traveller.firstName}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-bold">
                    {conv.traveller.firstName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {conv.lastMessage?.message || "No messages yet..."}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(conv.updatedAt).toLocaleTimeString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">No active conversations.</p>
      )}
    </div>
  );
};

export default ConversationsList;
