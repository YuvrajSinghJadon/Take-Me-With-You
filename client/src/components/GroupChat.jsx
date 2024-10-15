import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import moment from "moment";
import { FaPaperclip, FaSmile, FaEdit, FaTrashAlt } from "react-icons/fa";

const socket = io(
  import.meta.env.MODE === "development"
    ? "http://localhost:8800"
    : "https://take-me-with-you.onrender.com"
);

const GroupChat = ({ roomId }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = useState("");
  const [editMode, setEditMode] = useState(null);
  const { user } = useSelector((state) => state.user);
  const messagesEndRef = useRef(null);
  const [isChatAccessible, setIsChatAccessible] = useState(true);

  // Use socket connection and load messages when the component mounts
  useEffect(() => {
    socket.emit("joinRoom", { roomId, userId: user._id });

    // Register socket listeners
    socket.on("receiveMessage", handleNewMessage);
    socket.on("loadMessages", handleLoadMessages);
    socket.on("accessDenied", handleAccessDenied);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("messageEdited", handleMessageEdited);
    socket.on("typing", handleTypingStatus);

    // Cleanup function to avoid duplicate listeners
    return () => {
      socket.off("receiveMessage", handleNewMessage);
      socket.off("loadMessages", handleLoadMessages);
      socket.off("accessDenied", handleAccessDenied);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("messageEdited", handleMessageEdited);
      socket.off("typing", handleTypingStatus);
      socket.emit("leaveRoom", roomId);
    };
  }, [roomId, user._id]);

  const handleNewMessage = (newMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    scrollToBottom();
  };

  const handleLoadMessages = (chatHistory) => {
    setMessages(chatHistory);
    scrollToBottom();
  };

  const handleAccessDenied = (message) => {
    alert(message);
    setIsChatAccessible(false);
  };

  const handleMessageDeleted = (messageId) => {
    setMessages((prevMessages) =>
      prevMessages.filter((msg) => msg._id !== messageId)
    );
  };

  const handleMessageEdited = (updatedMessage) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg._id === updatedMessage._id ? updatedMessage : msg
      )
    );
  };

  const handleTypingStatus = (data) => {
    setTypingStatus(data ? `${data} is typing...` : "");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        message,
        groupId: roomId,
        senderId: user._id,
      };

      if (editMode) {
        socket.emit("editMessage", {
          messageId: editMode,
          message,
          groupId: roomId,
        });
        setEditMode(null);
      } else {
        socket.emit("sendGroupMessage", newMessage);
      }
      setMessage(""); // Clear the input field
      scrollToBottom();
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", user.firstName);
  };

  const handleEdit = (messageId, text) => {
    setMessage(text);
    setEditMode(messageId);
  };

  const handleDelete = (messageId) => {
    socket.emit("deleteMessage", { messageId, groupId: roomId });
  };

  const renderDateGroup = (date) => {
    const today = moment().startOf("day");
    const messageDate = moment(date).startOf("day");
    if (today.isSame(messageDate)) return "Today";
    if (today.subtract(1, "days").isSame(messageDate)) return "Yesterday";
    return moment(date).format("MMMM D, YYYY");
  };

  return (
    <div className="flex flex-col h-full max-h-[70vh] bg-gray-100 dark:bg-gray-800 shadow-lg rounded-lg">
      <div className="bg-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h2 className="text-lg font-bold">Group Chat</h2>
        <span className="text-sm opacity-75">{`Room ID: ${roomId}`}</span>
      </div>

      {isChatAccessible ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length > 0 ? (
              <>
                {messages.map((msg, index) => {
                  const isSameUser = msg.sender._id === user._id;
                  const showDate =
                    index === 0 ||
                    !moment(messages[index - 1]?.createdAt).isSame(
                      msg.createdAt,
                      "day"
                    );
                  return (
                    <div key={msg._id}>
                      {showDate && (
                        <div className="text-center text-xs text-gray-500 my-2 sticky top-0">
                          {renderDateGroup(msg.createdAt)}
                        </div>
                      )}

                      <div
                        className={`flex ${
                          isSameUser ? "justify-end" : "justify-start"
                        } items-start`}
                      >
                        <div
                          className={`relative ${
                            isSameUser
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-black"
                          } p-3 rounded-lg max-w-xs break-words shadow-md`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <span className="block text-xs opacity-75 mt-1">
                            {msg.sender.firstName} -{" "}
                            {moment(msg.createdAt).fromNow()}
                          </span>

                          {isSameUser && (
                            <div className="absolute right-0 top-0 flex space-x-1">
                              <FaEdit
                                onClick={() => handleEdit(msg._id, msg.message)}
                                className="text-white cursor-pointer hover:text-yellow-300"
                              />
                              <FaTrashAlt
                                onClick={() => handleDelete(msg._id)}
                                className="text-white cursor-pointer hover:text-red-500"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <p className="text-center text-gray-500">No messages yet...</p>
            )}
          </div>

          {typingStatus && (
            <div className="p-2 text-xs text-gray-400">{typingStatus}</div>
          )}

          <div className="bg-white dark:bg-gray-700 p-4 rounded-b-lg flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <FaSmile size={20} />
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <FaPaperclip size={20} />
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
        </>
      ) : (
        <div className="p-4 text-center text-red-500">
          You are no longer a member of this group.
        </div>
      )}
    </div>
  );
};

export default GroupChat;
