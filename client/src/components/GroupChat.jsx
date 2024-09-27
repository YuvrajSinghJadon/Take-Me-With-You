import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux"; // Assuming you have Redux to get the logged-in user

const socket = io("http://localhost:8800"); // Connect to backend

const GroupChat = ({ roomId }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { user } = useSelector((state) => state.user); // Assuming user is stored in Redux

  useEffect(() => {
    // Join the specified room when the component mounts
    socket.emit("joinRoom", roomId);

    // Listen for incoming messages
    socket.on("receiveMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Load past messages when joining
    socket.on("loadMessages", (chatHistory) => {
      setMessages(chatHistory);
    });

    // Handle when the user is removed from the group
    socket.on("removedFromGroup", (groupId) => {
      if (roomId === groupId) {
        alert("You have been removed from the group.");
        // Optionally, redirect the user away from the chat
      }
    });

    // Clean up the socket listener on unmount
    return () => {
      socket.off("receiveMessage");
      socket.emit("leaveRoom", roomId); // Leave the room when leaving the component
    };
  }, [roomId]);

  const sendMessage = () => {
    if (message && user?._id) {
      // Send the message along with the roomId and userId
      socket.emit("sendMessage", {
        message,
        groupId: roomId, // Correctly pass the groupId (roomId)
        senderId: user._id, // Use the actual user ID from Redux
      });
      setMessage(""); // Clear the input
    }
  };

  return (
    <div>
      <h2>Group Chat Room: {roomId}</h2>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            {msg.message} - {msg.sender.firstName}{" "}
            {/* Ensure sender.firstName is available */}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default GroupChat;
