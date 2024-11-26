const { BadRequestError, NotFoundError } = require("../errors");
const Conversation = require("../models/Conversation");
const FriendRequest = require("../models/FriendRequest");
const User = require("../models/User");
const sendPushNotification = require("./expoPushNotification");

const sendFriendRequest = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user.id;

  if (!receiverId) {
    throw new BadRequestError("Receiver ID is required");
  }

  if (receiverId == senderId) {
    throw new BadRequestError("You can not request yourself!");
  }

  try {
    const existingRequest = await FriendRequest.findOne({
      sender: senderId,
      receiver: receiverId,
    });

    if (existingRequest?.status=='PENDING') {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    const friendRequest = new FriendRequest({
      sender: senderId,
      receiver: receiverId,
    });
    await friendRequest.save();

    await sendPushNotification(
      receiverId,
      `New Friend Request : ${req.user.full_name} `,
      {
        content: `${req.user.full_name} sent you a friend request.`,
      }
    );

    return res
      .status(201)
      .json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error(error);
    throw new BadRequestError("Failed to send friend request");
  }
};

const handleFriendRequest = async (req, res) => {
  const userId = req.user.id;
  const { requestId, action } = req.body;

  if (!requestId || !action) {
    throw new BadRequestError("requestId and action are required");
  }

  if (!["ACCEPT", "REJECT"].includes(action)) {
    throw new BadRequestError("Action must be either ACCEPT or REJECT");
  }

  try {
    const request = await FriendRequest.findById(requestId);

    if (!request) {
      throw new NotFoundError("Friend request not found");
    }

    if (request.receiver.toString() !== userId.toString()) {
      throw new BadRequestError(
        "You are not authorized to take action on this friend request"
      );
    }

    if (action === "ACCEPT") {
      request.status = "ACCEPTED";
      await request.save();

      await User.findByIdAndUpdate(request.sender, {
        $addToSet: { friend_list: request.receiver },
      });
      await User.findByIdAndUpdate(request.receiver, {
        $addToSet: { friend_list: request.sender },
      });

      const existingConversation = await Conversation.findOne({
        participants: { $all: [request.sender, request.receiver] },
      });

      if (!existingConversation) {
        await Conversation.create({
          participants: [request.sender, request.receiver],
        });
      }

      await sendPushNotification(
        request.sender,
        `${req.user.full_name} accepted your friend request!`,
        {
          content: `${req.user.full_name} accepted your friend request.`,
        }
      );

      return res.status(200).json({ message: "Friend request accepted" });
    } else if (action === "REJECT") {
      request.status = "REJECTED";
      await request.save();

      await sendPushNotification(
        request.sender,
        `${req.user.full_name} rejected your friend request.`,
        {
          content: `${req.user.full_name} rejected your friend request.`,
        }
      );

      return res.status(200).json({ message: "Friend request rejected" });
    }
  } catch (error) {
    console.error(error);
    throw new BadRequestError("Failed to handle friend request");
  }
};

const listFriendRequests = async (req, res) => {
  const userId = req.user.id;

  try {
    const requests = await FriendRequest.find({
      receiver: userId,
      status: "PENDING",
    }).populate("sender", "first_name last_name username profile_picture");

    return res.status(200).json(requests);
  } catch (error) {
    console.error(error);
    throw new BadRequestError("Failed to list friend requests");
  }
};

const unfriend = async (req, res) => {
  const userId = req.user.id;
  const { friendId } = req.body;

  if (!friendId) {
    throw new BadRequestError("Friend ID is required");
  }

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      throw new NotFoundError("User not found");
    }

    if (
      !user.friend_list.includes(friendId) ||
      !friend.friend_list.includes(userId)
    ) {
      return res
        .status(400)
        .json({ message: "You are not friends with this user" });
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { friend_list: friendId },
    });
    await User.findByIdAndUpdate(friendId, {
      $pull: { friend_list: userId },
    });

    await sendPushNotification(
      friendId,
      `${req.user.full_name} has unfriended you.`,
      {
        content: `${req.user.full_name} has removed you from their friend list.`,
      }
    );

    return res.status(200).json({ message: "Unfriended successfully" });
  } catch (error) {
    console.error(error);
    throw new BadRequestError("Failed to unfriend");
  }
};

module.exports = {
  sendFriendRequest,
  handleFriendRequest,
  listFriendRequests,
  unfriend,
};
