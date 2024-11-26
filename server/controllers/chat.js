const { NotFoundError } = require("../errors");
const Conversation = require("../models/Conversation");

const getUserConversations = async (req, res) => {
  const userId = req.user.id;

  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate("participants", "first_name last_name username profile_picture")
    .populate({
      path: "messages.sender",
      select: "first_name last_name username profile_picture",
    })
    .sort({ updatedAt: -1 })
    .exec();

  const result = await Promise.all(
    conversations.map(async (conversation) => {
      const latestMessage =
        conversation.messages[conversation.messages.length - 1] || null;

      const otherParticipant = conversation.participants.find(
        (participant) => participant._id.toString() !== userId
      );

      const unreadCount = conversation.messages.reduce((count, message) => {
        if (
          message.sender.toString() === otherParticipant._id.toString() &&
          !message.is_seen &&
          !message.isDeleted &&
          !message.deletedFor.includes(userId)
        ) {
          return count + 1;
        }
        return count;
      }, 0);

      const isTyping =
        conversation.isTyping.find(
          (typingStatus) =>
            typingStatus.participantId.toString() ===
            otherParticipant._id.toString()
        )?.is_typing || false;

      return {
        conversationId: conversation._id,
        otherParticipant: {
          id: otherParticipant?.id,
          full_name: `${otherParticipant.first_name} ${otherParticipant.last_name}`,
          profile_picture: otherParticipant.profile_picture,
          username: otherParticipant.username,
        },
        messages:
          latestMessage &&
          !latestMessage.isDeleted &&
          !latestMessage.deletedFor.includes(userId)
            ? [
                {
                  id: latestMessage._id,
                  type: latestMessage.type,
                  content: latestMessage.isDeleted
                    ? "This message was deleted"
                    : latestMessage.content,
                  is_seen: latestMessage.is_seen,
                  is_delivered: latestMessage.is_delivered,
                  sender: {
                    _id: latestMessage.sender._id,
                    first_name: latestMessage.sender.first_name,
                    last_name: latestMessage.sender.last_name,
                    username: latestMessage.sender.username,
                    profile_picture: latestMessage.sender.profile_picture,
                  },
                  createdAt: latestMessage?.createdAt,
                },
              ]
            : [],
        is_typing: isTyping,
        unreadMessages: unreadCount,
      };
    })
  );

  return res.status(200).json(result);
};

const getPaginatedChats = async (req, res) => {
  const { conversationId, page = 1 } = req.query;
  const pageSize = 10;

  const pageNumber = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;

  const conversation = await Conversation.findById(conversationId)
    .populate(
      "messages.sender",
      "first_name last_name username profile_picture"
    )
    .exec();

  if (!conversation) {
    throw new NotFoundError("Conversation not found");
  }

  const totalMessages = conversation.messages.filter(
    (message) => !message.isDeleted && !message.deletedFor.includes(req.user.id)
  ).length;

  const totalPages = Math.ceil(totalMessages / pageSize);

  const paginatedMessages = conversation.messages
    .filter(
      (message) =>
        !message.isDeleted && !message.deletedFor.includes(req.user.id)
    )
    .slice(pageSize * (pageNumber - 1), pageSize * pageNumber);

  const sortedMessages = paginatedMessages
    .sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    })
    .map((message) => {
      return {
        id: message._id,
        type: message.type,
        content: message.isDeleted
          ? "This message was deleted"
          : message.content,
        is_seen: message.is_seen,
        is_delivered: message.is_delivered,
        sender: message.sender,
        createdAt: message?.createdAt,
      };
    });

  return res.status(200).json({
    messages: sortedMessages,
    currentPage: pageNumber,
    totalPages,
  });
};

module.exports = {
  getUserConversations,
  getPaginatedChats,
};
