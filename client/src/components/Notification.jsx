// src/components/Notification.js
import React from "react";
import sendWhatsAppMessage from "../api/smsService";

const Notification = () => {
  const handleSendMessage = async (to) => {
    try {
      const response = await sendWhatsAppMessage(to, "registration_template", [
        "Welcome to TakeMe!",
      ]);
      console.log("Message sent:", response);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div>
      <button onClick={() => handleSendMessage("917828970454")}>
        Send Registration Notification
      </button>
    </div>
  );
};

export default Notification;
