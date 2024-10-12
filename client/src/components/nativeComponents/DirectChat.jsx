import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const socket = io(
  import.meta.env.MODE === "development"
    ? "http://localhost:8800"
    : "https://take-me-with-you.onrender.com"
);

const DirectChat = ({ conversationId }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { user } = useSelector((state) => state.user);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.emit("joinRoom", { roomId: conversationId, userId: user._id });

    socket.on("receiveMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      scrollToBottom();
    });

    socket.on("loadMessages", (chatHistory) => {
      setMessages(chatHistory);
      scrollToBottom();
    });

    return () => {
      socket.off("receiveMessage");
      socket.emit("leaveRoom", conversationId);
    };
  }, [conversationId]);

  const sendMessage = () => {
    if (message && user?._id) {
      socket.emit("sendMessage", {
        message,
        conversationId,
        senderId: user._id,
      });
      setMessage("");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="direct-chat-container">
      <div className="messages-list">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <p>
              {msg.sender.firstName}: {msg.message}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default DirectChat;
