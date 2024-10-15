import {
  fetchNativeProfile,
  startConversation,
  editMessage,
  deleteMessage,
  submitReview,
} from "../../api/nativeApis.js";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { FaEdit, FaTrashAlt, FaRegStar, FaStar } from "react-icons/fa";
import { IoSend, IoPencil } from "react-icons/io5";

import { io } from "socket.io-client";
import moment from "moment";

const NativeProfile = () => {
  const { nativeId } = useParams();
  const { user, token } = useSelector((state) => state.user);
  const [nativeData, setNativeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [editMode, setEditMode] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [typingStatus, setTypingStatus] = useState("");
  const messagesEndRef = useRef(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false); // For review modal
  const [rating, setRating] = useState(0); // Star rating
  const [reviewText, setReviewText] = useState(""); // Review text
  const socketRef = useRef(null); // Use ref to avoid socket reinitialization

  // Fetch native profile
  useEffect(() => {
    const loadNativeProfile = async () => {
      try {
        const data = await fetchNativeProfile(nativeId, token);
        setNativeData(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load native data");
        setLoading(false);
      }
    };
    loadNativeProfile();
  }, [nativeId, token]);
  console.log("nativeData", nativeData);

  // Load messages for the selected conversation
  const loadMessages = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/natives/conversations/messages/${conversationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data || []);
      scrollToBottom(); // Scroll to the latest message
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  // Socket initialization and event handling
  useEffect(() => {
    if (isChatOpen && conversationId) {
      socketRef.current = io(
        import.meta.env.MODE === "development"
          ? "http://localhost:8800"
          : "https://take-me-with-you.onrender.com"
      );

      socketRef.current.emit("joinDirectConversation", {
        conversationId,
        userId: user._id,
      });

      socketRef.current.on("receiveDirectMessage", (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
        scrollToBottom();
      });

      socketRef.current.on("directMessageEdited", (updatedMessage) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === updatedMessage._id ? updatedMessage : msg
          )
        );
      });

      socketRef.current.on("directMessageDeleted", (messageId) => {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      });

      // Load messages when chat opens
      loadMessages();
      return () => {
        socketRef.current.disconnect();
        socketRef.current = null;
      };
    }
  }, [isChatOpen, conversationId]);

  // Handle enquiry and start conversation
  const handleEnquiry = async () => {
    try {
      const conversation = await startConversation(nativeId, user._id, token);
      if (conversation && conversation.conversationId) {
        setConversationId(conversation.conversationId); // Store conversationId
        setIsChatOpen(true);
        // Socket initialization moved to useEffect
      } else {
        throw new Error("Conversation ID is missing");
      }
    } catch (err) {
      setError("Failed to start conversation");
    }
  };

  // Send message
  const sendMessage = () => {
    if (message.trim()) {
      const eventData = {
        message,
        conversationId,
        senderId: user._id,
      };

      if (editMode) {
        eventData.messageId = editMode;
        eventData.newMessageContent = message;
        socketRef.current.emit("editDirectMessage", eventData);
        setEditMode(null);
      } else {
        socketRef.current.emit("sendDirectMessage", eventData);
      }
      scrollToBottom();
      setMessage("");
    }
  };

  // Handle typing
  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (socketRef.current) {
      socketRef.current.emit("typing", user.firstName);
    }
  };

  // Edit message
  const handleEdit = (messageId, currentMessage) => {
    setMessage(currentMessage);
    setEditMode(messageId);
  };

  const handleDelete = (messageId) => {
    socketRef.current.emit("deleteDirectMessage", {
      messageId,
      conversationId,
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!nativeData) return <div>No data found.</div>;

  // Handle Review Submission
  const handleSubmitReview = async () => {
    if (!rating || !reviewText) {
      alert("Please provide a rating and review text.");
      return;
    }

    try {
      await submitReview(nativeId, user._id, { rating, reviewText }, token);
      alert("Review submitted successfully!");
      setIsReviewOpen(false); // Close modal
      setRating(0); // Reset rating
      setReviewText(""); // Reset review text
    } catch (err) {
      alert("Failed to submit review");
    }
  };
  // Render stars for rating input
  const renderStars = () => {
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        className="cursor-pointer"
        onClick={() => setRating(index + 1)}
      >
        {index + 1 <= rating ? (
          <FaStar className="text-yellow-500" />
        ) : (
          <FaRegStar className="text-gray-300" />
        )}
      </span>
    ));
  };

  console.log("conversatoinId", conversationId);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!nativeData) return <div>Native not found</div>;
  console.log("nativeData", nativeData);
  return (
    <div className="container mx-auto p-6 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg">
      {/* Profile Header */}
      <div className="flex items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <img
          className="h-28 w-28 rounded-full object-cover mr-6"
          src={nativeData.profilePicture || "default-avatar.png"} // Placeholder if no picture
          alt={nativeData.name}
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {nativeData.name}
          </h1>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            <p>{nativeData.location}</p>
            <p>Languages: {nativeData.languages.join(", ")}</p>
            <p>{nativeData.experience}</p>
          </div>
        </div>
      </div>

      {/* About Me Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          About Me
        </h2>
        <p className="text-gray-600 dark:text-gray-300">{nativeData.bio}</p>
      </div>
      {/* Services Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nativeData.services && nativeData.services.length > 0 ? (
            nativeData.services.map((service) => (
              <div
                key={service._id}
                className="p-4 border rounded-lg shadow-md bg-gray-50 dark:bg-gray-700"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {service.description}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <strong>Price:</strong> ${service.price}
                </p>
                <p
                  className={`text-sm font-semibold ${
                    service.availability ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {service.availability ? "Available" : "Unavailable"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No services available.
            </p>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          What Our Customers Are Saying
        </h2>

        {/* Horizontal Scrollable Container */}
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {nativeData.reviews && nativeData.reviews.length > 0 ? (
            nativeData.reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 flex items-start space-x-4 min-w-[300px]"
              >
                {/* Reviewer Profile Image */}
                <img
                  src={review.traveller?.profileUrl || "default-avatar.png"}
                  alt={review.traveller?.firstName || "Anonymous"}
                  className="w-12 h-12 rounded-full object-cover"
                />

                {/* Review Content */}
                <div className="flex-1">
                  <p className="text-gray-800 dark:text-gray-200 mb-2">
                    {review.comment}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {review.traveller?.firstName || "Anonymous"}
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`${
                            i < review.rating
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No reviews yet. Be the first to review!
            </p>
          )}
        </div>
      </div>

      {/* Add Review Button */}
      <div className="text-center mt-4">
        <button
          onClick={() => setIsReviewOpen(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Add Review
        </button>
      </div>

      {/* Enquiry Button */}
      <div className="text-center mt-4">
        <button
          onClick={handleEnquiry}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Enquire Now
        </button>
      </div>

      {/* Review Modal */}
      {isReviewOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold text-center mb-4">Add a Review</h2>
            <div className="mb-4">
              <h3 className="text-lg">Rating:</h3>
              <div className="flex space-x-2">{renderStars()}</div>
            </div>
            <div className="mb-4">
              <h3 className="text-lg">Review:</h3>
              <textarea
                className="w-full p-3 rounded-lg bg-gray-200 dark:bg-gray-600 text-black dark:text-white focus:outline-none"
                rows="4"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review here..."
              ></textarea>
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleSubmitReview}
                className="bg-blue-500 text-white p-3 rounded-lg shadow hover:bg-blue-600"
              >
                Submit Review
              </button>
              <button
                onClick={() => setIsReviewOpen(false)}
                className="bg-red-500 text-white p-3 rounded-lg shadow hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg flex flex-col h-[80vh]">
            {/* Chat Header */}
            <div className="bg-blue-500 text-white p-2 rounded-t-lg flex justify-between items-center">
              <h2 className="text-xl font-bold">Chat</h2>
              <button onClick={() => setIsChatOpen(false)}>❌</button>
            </div>

            {/* Chat Messages - Scrollable Section */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    msg.sender._id === user._id
                      ? "justify-end"
                      : "justify-start"
                  } mb-2`}
                >
                  <div className="p-3 rounded-lg bg-gray-200 max-w-xs">
                    <p>{msg.message}</p>
                    {msg.sender._id === user._id && (
                      <div className="flex space-x-2 mt-1">
                        <IoPencil
                          onClick={() => handleEdit(msg._id, msg.message)}
                          className="text-blue-500 cursor-pointer"
                          size={20}
                        />
                        <IoSend
                          onClick={() => handleDelete(msg._id)}
                          className="text-red-500 cursor-pointer"
                          size={20}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Fixed Input Section */}
            <div className="bg-gray-100 p-4 rounded-b-lg flex items-center space-x-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()} // Send on Enter
                className="flex-1 p-2 border rounded-lg"
                placeholder="Type a message..."
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                {editMode ? <IoPencil size={20} /> : <IoSend size={20} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NativeProfile;
