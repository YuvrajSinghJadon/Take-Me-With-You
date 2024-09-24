// server/utils/smsService.js
import fetch from "node-fetch"; // Ensure you have this installed

const sendWhatsAppMessage = async (phone, templateName, placeholders) => {
  const myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    "5f1005f4b4e0f1d161e49dab3b5a31f6-0fb2ee6a-2d8b-41e0-bae0-9d575f15a55a"
  ); // Replace with your actual API key
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept", "application/json");

  const raw = JSON.stringify({
    messages: [
      {
        from: "447860099299", // Your sender number
        to: phone,
        content: {
          templateName: templateName,
          templateData: {
            body: {
              placeholders: placeholders,
            },
          },
          language: "en",
        },
      },
    ],
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      "https://9kl5pr.api.infobip.com/whatsapp/1/message/template",
      requestOptions
    );
    return await response.json(); // Return the result
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export default sendWhatsAppMessage;
