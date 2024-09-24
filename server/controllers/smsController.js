// server/controllers/smsController.js
import sendWhatsAppMessage from "../utils/smsService.js"; // Import from the utils directory

export const sendNotification = async (req, res) => {
  const { phone, templateName, placeholders } = req.body;

  try {
    const response = await sendWhatsAppMessage(
      phone,
      templateName,
      placeholders
    );
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error("Failed to send message:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};
