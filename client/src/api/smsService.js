// src/api/smsService.js
import { INFOBIP_API_KEY } from "../utils/constants";

const sendWhatsAppMessage = async (to, templateName, placeholders) => {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `App ${INFOBIP_API_KEY}`);
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept", "application/json");

  const raw = JSON.stringify({
    messages: [
      {
        from: "447860099299", // Your sender number
        to: to,
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
