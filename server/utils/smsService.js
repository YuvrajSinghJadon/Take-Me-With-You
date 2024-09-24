import axios from "axios";

// Function to send a WhatsApp message using the Infobip API
const sendWhatsAppMessage = async ({ to, message }) => {
  // Prepend country code if missing
  if (!to.startsWith("+")) {
    to = `+91${to}`; // Ensure that the phone number is in the correct format
  }

  const headers = {
    Authorization: `App ${process.env.INFOBIP_API_KEY}`, // Infobip API Key from environment variable
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const data = {
    messages: [
      {
        from: process.env.INFOBIP_SENDER, // WhatsApp Business API number
        to: to, // Recipient's WhatsApp number
        content: {
          text: message, // Message content
        },
      },
    ],
  };

  try {
    // Send the request to Infobip API using axios
    const response = await axios.post(
      "https://9kl5pr.api.infobip.com/whatsapp/1/message/text",
      data,
      { headers }
    );

    // Log response status and data for debugging
    console.log("Infobip Response Status:", response.status);
    console.log("Infobip Response Data:", response.data);

    if (response.status === 200 || response.status === 201) {
      console.log("WhatsApp message sent successfully.");
    } else {
      console.error(
        "Failed to send WhatsApp message. Response:",
        response.data
      );
    }
  } catch (error) {
    console.error(
      "Error while sending WhatsApp message:",
      error.response?.data || error.message
    );
  }
};

export default sendWhatsAppMessage;
