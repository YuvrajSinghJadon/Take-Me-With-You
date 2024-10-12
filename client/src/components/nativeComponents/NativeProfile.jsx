import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  fetchNativeProfile,
  startConversation,
  editMessage,
  deleteMessage,
} from "../../api/nativeApis.js";
import { FaPaperclip, FaSmile, FaEdit, FaTrashAlt } from "react-icons/fa";
import { io } from "socket.io-client"; // Import Socket.io
import moment from "moment";

const NativeProfile = () => {
  const { nativeId } = useParams();
  const [nativeData, setNativeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false); // For chat modal
  const [messages, setMessages] = useState([]); // Messages state
  const [message, setMessage] = useState(""); // Input message
  const [typingStatus, setTypingStatus] = useState("");
  const [conversationId, setConversationId] = useState(null); // Store conversationId
  const messagesEndRef = useRef(null);
  const { token, user } = useSelector((state) => state.user);
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

  // Initialize socket and join the conversation room when chat opens
  useEffect(() => {
    if (isChatOpen && conversationId) {
      // Initialize socket
      socketRef.current = io(
        import.meta.env.MODE === "development"
          ? "http://localhost:8800"
          : "https://take-me-with-you.onrender.com"
      );

      // Join the conversation room
      socketRef.current.emit("joinConversation", {
        conversationId,
        userId: user._id,
      });

      // Listen for incoming messages
      socketRef.current.on("receiveMessage", (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        scrollToBottom();
      });

      // Listen for edited messages
      socketRef.current.on("messageEdited", (updatedMessage) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === updatedMessage._id ? updatedMessage : msg
          )
        );
      });

      // Listen for deleted messages
      socketRef.current.on("messageDeleted", (messageId) => {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== messageId)
        );
      });

      // Load chat history
      socketRef.current.on("loadMessages", (chatHistory) => {
        setMessages(chatHistory);
        scrollToBottom();
      });

      // Typing indicator
      socketRef.current.on("typing", (data) => {
        setTypingStatus(data ? `${data} is typing...` : "");
      });

      // Cleanup function when component unmounts or chat closes
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [isChatOpen, conversationId, user._id]);

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
    if (!socketRef.current) {
      console.error("Socket not initialized.");
      return;
    }
    if (message && user?._id && conversationId) {
      socketRef.current.emit("sendMessage", {
        conversationId,
        message,
        senderId: user._id,
      });
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
  const handleEdit = async (messageId, currentMessage) => {
    if (!socketRef.current) {
      console.error("Socket not initialized.");
      return;
    }
    const newMessageContent = prompt("Edit your message", currentMessage);
    if (newMessageContent && newMessageContent !== currentMessage) {
      try {
        await editMessage(messageId, newMessageContent, token);
        socketRef.current.emit("editMessage", {
          messageId,
          newMessageContent,
        });
      } catch (error) {
        console.error("Failed to edit message:", error);
      }
    }
  };

  // Delete message
  const handleDelete = async (messageId) => {
    if (!socketRef.current) {
      console.error("Socket not initialized.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteMessage(messageId, token);
        socketRef.current.emit("deleteMessage", { messageId, conversationId });
      } catch (error) {
        console.error("Failed to delete message:", error);
      }
    }
  };

  // Scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!nativeData) return <div>Native not found</div>;

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

      {/* Enquiry Button */}
      <div className="text-center mt-8">
        <button
          onClick={handleEnquiry}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Enquire Now
        </button>
      </div>

      {/* Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-4xl">
            {/* Chat Header */}
            <div className="bg-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
              <h2 className="text-lg font-bold">
                Direct Chat with {nativeData.name}
              </h2>
              <button
                className="text-white"
                onClick={() => setIsChatOpen(false)}
              >
                ❌
              </button>
            </div>

            {/* Messages List */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4"
              style={{ maxHeight: "300px" }}
            >
              {messages.length > 0 ? (
                <>
                  {messages.map((msg, index) => {
                    const isSameUser =
                      msg.sender && msg.sender._id === user._id;
                    return (
                      <div
                        key={msg._id || index}
                        className={`flex ${
                          isSameUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-lg max-w-xs shadow-md ${
                            isSameUser
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-black"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <span className="block text-xs opacity-75 mt-1">
                            {moment(msg.createdAt).fromNow()}
                          </span>

                          {isSameUser && (
                            <div className="flex justify-end mt-2">
                              <FaEdit
                                className="text-white cursor-pointer mr-2"
                                onClick={() => handleEdit(msg._id, msg.message)}
                              />
                              <FaTrashAlt
                                className="text-white cursor-pointer"
                                onClick={() => handleDelete(msg._id)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <p className="text-center text-gray-500">No messages yet...</p>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {typingStatus && (
              <div className="p-2 text-xs text-gray-400">{typingStatus}</div>
            )}

            {/* Message Input */}
            <div className="bg-white dark:bg-gray-700 p-4 rounded-b-lg flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <FaSmile size={20} />
              </button>
              <input
                type="text"
                className="flex-1 bg-gray-200 dark:bg-gray-600 text-black dark:text-white p-3 rounded-lg focus:outline-none"
                value={message}
                onChange={handleTyping}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
              />
              <button
                className="bg-blue-500 text-white p-3 rounded-lg shadow hover:bg-blue-600"
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NativeProfile;
