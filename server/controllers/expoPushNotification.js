const { Expo } = require("expo-server-sdk");
const User = require("../models/User");

const expo = new Expo();

const sendPushNotification = async (userId, messageBody, data = {}) => {
  try {
    const user = await User.findById(userId).select("device_tokens");

    if (!user || !user.device_tokens || user.device_tokens.length === 0) {
      console.log(`No device tokens found for user: ${userId}`);
      return;
    }

    const pushTokens = user.device_tokens.filter((token) =>
      Expo.isExpoPushToken(token)
    );

    if (pushTokens.length === 0) {
      console.log(`No valid Expo push tokens for user: ${userId}`);
      return;
    }

    const messages = pushTokens.map((pushToken) => ({
      to: pushToken,
      sound: "default",
      body: messageBody,
      data: data,
    }));

    const chunks = expo.chunkPushNotifications(messages);
    for (let chunk of chunks) {
      try {
        let receipts = await expo.sendPushNotificationsAsync(chunk);
        console.log("Receipts for push notifications:", receipts);
      } catch (error) {
        console.error("Error sending push notifications:", error);
      }
    }
  } catch (error) {
    console.error("Error fetching user or sending notifications:", error);
  }
};

module.exports = sendPushNotification;
