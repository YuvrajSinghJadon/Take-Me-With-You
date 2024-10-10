import { Expo } from "expo-server-sdk";

// Create an instance of the Expo SDK client
let expo = new Expo();

// Helper function to send a push notification
const sendPushNotification = async (
  expoPushToken,
  messageTitle,
  messageBody
) => {
  // Check if the token is a valid Expo push token
  if (!Expo.isExpoPushToken(expoPushToken)) {
    console.error(`Push token ${expoPushToken} is not a valid Expo push token`);
    return;
  }

  const message = {
    to: expoPushToken,
    sound: "default",
    title: messageTitle,
    body: messageBody,
    data: { withSome: "data" },
  };

  try {
    // Corrected log statement
    console.log("Sending push notification to:", expoPushToken);

    const ticket = await expo.sendPushNotificationsAsync([message]);
    console.log("Notification sent:", ticket);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

export default sendPushNotification;
