import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:8800"); // Connect to your backend

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Listen for incoming messages
    socket.on("receiveMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Clean up the socket listener
    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const sendMessage = () => {
    // Send the message to the server
    socket.emit("sendMessage", message);
    setMessage(""); // Clear the input field
  };

  return (
    <div>
      <h2>Chat Room</h2>
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

export default Chat;
