const Conversation = require("../models/Conversation");
const User = require("../models/User");
const sendPushNotification = require("./expoPushNotification");
const jwt = require("jsonwebtoken");

const handleSocketConnection = (io) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.headers.access_token;
    if (!token) {
      return next(new Error("Authentication invalid: No token provided"));
    }
    try {
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(payload.id);
      if (!user) {
        return next(new Error("Authentication invalid: User not found"));
      }
      socket.user = { id: payload.id, full_name: payload.full_name };
      next();
    } catch (error) {
      console.log("Socket Error", error);
      return next(
        new Error("Authentication invalid: Token verification failed")
      );
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;

    updateUserStatus(userId, true, socket, io);

    socket.on("subscribeToUsers", (userIds) => {
      userIds.forEach((id) => {
        socket.join(id);
      });
    });

    socket.on("subscribeToConversations", (conversationIds) => {
      conversationIds.forEach((id) => {
        socket.join(id);
      });
    });

    socket.on("SEND_MESSAGE", async ({ conversationId, type, content }) => {
      try {
        const message = {
          sender: socket.user.id,
          type,
          content,
          createdAt: new Date(),
          is_seen: false,
          is_delivered: false,
        };

        const updatedConversation = await Conversation.findByIdAndUpdate(
          conversationId,
          { $push: { messages: message } },
          { new: true, fields: { messages: { $slice: -1 } } }
        ).populate({
          path: "messages.sender",
          select: "full_name profile_picture username",
        });

        if (!updatedConversation) {
          socket.emit("ERROR", "Conversation not found");
          return;
        }

        const newMessage = updatedConversation.messages[0];

        io.to(conversationId).emit("NEW_MESSAGE", {
          message: {
            content: newMessage.content,
            id: newMessage._id,
            is_delivered: newMessage.is_delivered,
            is_seen: newMessage.is_seen,
            sender: newMessage.sender,
            type: newMessage.type,
            createdAt: newMessage?.createdAt,
          },
          conversationId,
        });

        const otherParticipants = updatedConversation.participants.filter(
          (id) => id.toString() !== socket.user.id
        );

        for (let participantId of otherParticipants) {
          await sendPushNotification(
            participantId,
            `${socket.user.full_name} sent you a message: ${content}`,
            { conversationId, type, content }
          );
        }
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("ERROR", "Failed to send message");
      }
    });

    socket.on("TYPING", ({ conversationId, isTyping }) => {
      io.to(conversationId).emit("TYPING_STATUS", {
        conversationId,
        userId: socket.user.id,
        isTyping,
      });
    });

    socket.on("MESSAGE_SEEN", async ({ conversationId, messageId }) => {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        socket.emit("ERROR", "Conversation not found");
        return;
      }

      const messageIndex = conversation.messages.findIndex(
        (msg) => msg._id.toString() === messageId
      );

      if (messageIndex !== -1) {
        conversation.messages[messageIndex].is_seen = true;
        await conversation.save();

        io.to(conversationId).emit("MESSAGE_SEEN", {
          messageId,
          conversationId,
          userId: socket.user.id,
        });
      }
    });

    socket.on("UPDATE_USER_STATUS", async ({ is_online }) => {
      await updateUserStatus(socket.user.id, is_online, socket, io);
    });

    socket.on("CLEAR_CHAT", async (conversationId) => {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        socket.emit("ERROR", "Conversation not found");
        return;
      }

      conversation.messages.forEach((message) => {
        if (!message.deletedFor.includes(socket.user.id)) {
          message.deletedFor.push(socket.user.id);
        }
      });

      await conversation.save();
      socket.emit("CHAT_CLEARED", { conversationId });
    });

    socket.on("DELETE_MESSAGE", async ({ conversationId, messageId, type }) => {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        socket.emit("ERROR", "Conversation not found");
        return;
      }

      const message = conversation.messages.id(messageId);

      if (!message) {
        socket.emit("ERROR", "Message not found");
        return;
      }

      if (message.sender.toString() === socket.user.id && type == "complete") {
        // Delete for everyone if sender
        conversation.messages.id(messageId).isDeleted = true;
        await conversation.save();
        io.to(conversationId).emit("MESSAGE_DELETED", {
          messageId,
        });
      } else {
        // Delete only for the current user
        if (!message.deletedFor.includes(socket.user.id)) {
          message.deletedFor.push(socket.user.id);
          await conversation.save();
        }
        socket.emit("MESSAGE_DELETED", { messageId });
      }
    });

    socket.on("GET_USER_STATUS", async ({ userId }) => {
      const user = await User.findById(userId);
      if (user) {
        socket.emit("USER_LIVE_STATUS", {
          id: user._id,
          is_online: user.is_online,
          last_seen: user.last_seen,
        });
      } else {
        socket.emit("ERROR", "User not found");
      }
    });

    socket.on("disconnect", () => {
      updateUserStatus(userId, false, socket, io);
    });
  });
};

const updateUserStatus = async (userId, is_online, socket, io) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { is_online: is_online, last_seen: new Date() },
      { new: true }
    );

    if (user) {
      io.to(userId).emit("USER_LIVE_STATUS", {
        id: user._id,
        is_online: user.is_online,
        last_seen: user.last_seen,
      });
    }
  } catch (error) {
    console.error("Failed to update user status:", error);
  }
};

module.exports = handleSocketConnection;
