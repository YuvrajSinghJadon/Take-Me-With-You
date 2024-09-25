import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8800"); // Connect to backend

const GroupChat = ({ roomId }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Join the specified room when the component mounts
    socket.emit("joinRoom", roomId);

    // Listen for incoming messages
    socket.on("receiveMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Clean up the socket listener on unmount
    return () => {
      socket.off("receiveMessage");
      socket.emit("leaveRoom", roomId); // Optional: Leave the room when leaving the component
    };
  }, [roomId]);

  const sendMessage = () => {
    if (message) {
      // Send the message along with the roomId to the server
      socket.emit("sendMessage", { message, roomId });
      setMessage(""); // Clear the input
    }
  };

  return (
    <div>
      <h2>Group Chat Room: {roomId}</h2>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            {msg}
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
