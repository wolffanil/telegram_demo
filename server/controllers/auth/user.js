const { BadRequestError, NotFoundError } = require("../../errors");
const User = require("../../models/User");
const FriendRequest = require("../../models/FriendRequest");
const Conversation = require("../../models/Conversation");

const searchUsersByNameOrUsername = async (req, res) => {
  const { query } = req.params;
  const userId = req.user.id;

  try {
    const users = await User.find({
      is_discoverable: "VISIBLE",
      _id: { $ne: userId },
      $or: [
        { first_name: { $regex: query, $options: "i" } },
        { last_name: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
      ],
    }).limit(10);

    const friendRequests = await FriendRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: "PENDING",
    });

    const requestedUserIds = friendRequests
      .filter((request) => request.sender.toString() === userId.toString())
      .map((request) => request.receiver.toString());

    const receivedUserIds = friendRequests
      .filter((request) => request.receiver.toString() === userId.toString())
      .map((request) => request.sender.toString());

    const responseUsers = users.map((user) => {
      return {
        id: user._id,
        full_name: user.first_name + " " + user.last_name,
        username: user.username,
        profile_picture: user.profile_picture,
        last_seen: user.last_seen,
        is_online: user.is_online,
        is_connected: user.friend_list.includes(userId),
        is_requested: requestedUserIds.includes(user._id.toString()),
        has_request: receivedUserIds.includes(user._id.toString()),
      };
    });

    return res.status(200).json(responseUsers);
  } catch (error) {
    console.error(error);
    throw new BadRequestError("Failed to search users");
  }
};

const getFriendsList = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate(
      "friend_list",
      "first_name last_name username profile_picture last_seen is_online"
    );

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const friendsList = await Promise.all(
      user.friend_list.map(async (friend) => {
        const conversation = await Conversation.findOne({
          participants: { $all: [userId, friend._id] },
        }).select("_id");

        return {
          id: friend._id,
          full_name: friend.first_name + " " + friend.last_name,
          username: friend.username,
          profile_picture: friend.profile_picture,
          last_seen: friend.last_seen,
          is_online: friend.is_online,
          conversation_id: conversation ? conversation._id : null,
        };
      })
    );

    return res.status(200).json(friendsList);
  } catch (error) {
    console.error(error);
    throw new BadRequestError("Failed to retrieve friends list");
  }
};

module.exports = {
  searchUsersByNameOrUsername,
  getFriendsList,
};
