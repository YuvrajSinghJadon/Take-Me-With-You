import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { io } from "socket.io-client";
import moment from "moment";
import {
  ProfileSection,
  ServicesSection,
  EarningsSection,
  RatingsSection,
  ReviewsSection,
  UpdateProfileModal,
} from "../components/nativeComponents";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { IoSend, IoPencil } from "react-icons/io5";

function NativeHome() {
  const { user, token } = useSelector((state) => state.user);
  const [nativeData, setNativeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [editMode, setEditMode] = useState(null); // Track editing mode
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Initialize socket connection on component mount
  useEffect(() => {
    socketRef.current = io(
      import.meta.env.MODE === "development"
        ? "http://localhost:8800"
        : "https://take-me-with-you.onrender.com"
    );

    return () => {
      socketRef.current.disconnect(); // Cleanup socket on unmount
    };
  }, []);

  // Fetch native profile data
  useEffect(() => {
    const fetchNativeData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/natives/homepage/${user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNativeData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching native data:", error);
        setError("Error fetching data");
        setLoading(false);
      }
    };
    fetchNativeData();
  }, [user._id, token]);

  // Fetch conversations when native data is available
  useEffect(() => {
    if (!nativeData) return;

    const fetchConversations = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/natives/conversations/natives/${
            nativeData.id
          }`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setConversations(response.data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };
    fetchConversations();
  }, [nativeData, token]);

  // Load messages for the selected conversation
  const loadMessages = async (conversationId) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/natives/conversations/messages/${conversationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Messages response", response.data);
      setMessages(response.data || []);
      setSelectedConversation(conversationId);
      setChatModalOpen(true);
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    }
  };
  console.log("Messages", messages);

  const sendMessage = () => {
    if (message.trim()) {
      const eventData = {
        message,
        conversationId: selectedConversation,
        senderId: user._id, // Always include the senderId
      };

      if (editMode) {
        eventData.messageId = editMode; // Add messageId for edit mode
        eventData.newMessageContent = message; // Server expects this field for edit
        socketRef.current.emit("editDirectMessage", eventData); // Emit edit event
        setEditMode(null); // Exit edit mode
      } else {
        socketRef.current.emit("sendDirectMessage", eventData); // Emit new message event
      }

      setMessage(""); // Clear the input field
    }
  };
  // Delete a message
  const deleteMessage = (messageId) => {
    socketRef.current.emit("deleteDirectMessage", {
      messageId,
      conversationId: selectedConversation,
    });
  };

  // Scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle socket events for new messages
  useEffect(() => {
    if (!selectedConversation) return;

    socketRef.current.emit("joinDirectConversation", {
      conversationId: selectedConversation,
    });

    socketRef.current.on("receiveDirectMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]); // Add new message to state
      scrollToBottom(); // Keep chat scrolled to the bottom
    });
    // Handle edited messages
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

    return () => {
      socketRef.current.emit("leaveDirectConversation", selectedConversation);
      socketRef.current.off("receiveDirectMessage");
      socketRef.current.off("directMessageEdited");
      socketRef.current.off("directMessageDeleted");
    };
  }, [selectedConversation]);

  const handleEdit = (messageId, currentMessage) => {
    setMessage(currentMessage); // Set the message in the input field
    setEditMode(messageId); // Enable edit mode with the messageId
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="bg-offWhite min-h-screen p-8 font-body">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <ProfileSection {...nativeData} />
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EarningsSection earnings={nativeData.earnings} />
          <RatingsSection ratings={nativeData.ratings} />
          <ServicesSection services={nativeData.services} />
        </div>
      </div>

      <div className="mt-8">
        <ReviewsSection reviews={nativeData.reviews} />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Active Conversations</h2>
        {conversations.length === 0 ? (
          <p>No active conversations.</p>
        ) : (
          <ul className="space-y-4">
            {conversations.map((conv) => (
              <li
                key={conv._id}
                className="p-4 bg-white rounded-lg shadow cursor-pointer hover:bg-gray-100"
                onClick={() => loadMessages(conv._id)}
              >
                <div className="flex justify-between">
                  <span>{conv.travellerId?.firstName}</span>
                  <span className="text-sm text-gray-500">
                    {moment(conv.updatedAt).fromNow()}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {conv.lastMessage?.message || "No message available"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {chatModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Chat</h2>
            <div className="max-h-80 overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`mb-2 flex flex-col ${
                    msg.sender._id === user._id ? "items-end" : "items-start"
                  }`}
                >
                  <p className="inline-block p-2 bg-gray-200 rounded-lg max-w-xs">
                    {msg.message}
                  </p>

                  {/* Edit and Delete Icons for User's Own Messages */}
                  {msg.sender._id === user._id && (
                    <div className="flex space-x-2 mt-1">
                      <FaEdit
                        onClick={() => handleEdit(msg._id, msg.message)}
                        className="text-blue-500 cursor-pointer"
                      />
                      <FaTrashAlt
                        onClick={() => deleteMessage(msg._id)}
                        className="text-red-500 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex mt-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()} // Send on Enter key
                className="flex-1 p-2 border rounded-lg"
                placeholder="Type a message..."
              />
              <button
                onClick={sendMessage}
                className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                {editMode ? <IoPencil size={20} /> : <IoSend size={20} />}{" "}
                {/* Icon button */}
              </button>
            </div>

            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
              onClick={() => setChatModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <button
        className="bg-blue-500 text-white py-2 px-4 rounded-lg mt-8"
        onClick={() => setIsModalOpen(true)}
      >
        Update Profile
      </button>

      {isModalOpen && (
        <UpdateProfileModal
          nativeData={nativeData}
          onClose={() => setIsModalOpen(false)}
          token={token}
          setNativeData={setNativeData}
        />
      )}
    </div>
  );
}

export default NativeHome;
