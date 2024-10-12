import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { fetchNativeProfile, startConversation } from "../../api/nativeApis.js";
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

  // Handle enquiry and start conversation
  const handleEnquiry = async () => {
    try {
      const conversation = await startConversation(nativeId, user._id, token);
      if (conversation && conversation.conversationId) {
        setConversationId(conversation.conversationId); // Store conversationId
        setIsChatOpen(true);

        // Initialize socket only when conversation starts
        socketRef.current = io(
          import.meta.env.MODE === "development"
            ? "http://localhost:8800"
            : "https://take-me-with-you.onrender.com"
        );

        // Join the conversation room
        socketRef.current.emit("joinConversation", {
          conversationId: conversation.conversationId,
          userId: user._id,
        });

        // Receive messages
        socketRef.current.on("receiveMessage", (newMessage) => {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
          scrollToBottom();
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
      } else {
        throw new Error("Conversation ID is missing");
      }
    } catch (err) {
      setError("Failed to start conversation");
    }
  };

  // Send message
  const sendMessage = () => {
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

  // Scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Clean up socket events when the component unmounts or chat closes
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

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
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender._id === user._id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg max-w-xs shadow-md ${
                        msg.sender._id === user._id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <span className="block text-xs opacity-75 mt-1">
                        {moment(msg.createdAt).fromNow()}
                      </span>
                    </div>
                  </div>
                ))
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
