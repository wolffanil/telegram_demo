const { BadRequestError, NotFoundError } = require("../errors");
const User = require("../models/User");

const registerDeviceToken = async (req, res) => {
  const userId = req.user.id;
  const { device_token } = req.body;

  if (!device_token) {
    throw new BadRequestError("Device token is required");
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!user.device_tokens.includes(device_token)) {
      user.device_tokens.push(device_token);
      await user.save();
    }

    return res.status(200).json({
      message: "Device token registered successfully",
      device_tokens: user.device_tokens,
    });
  } catch (error) {
    console.error(error);
    throw new BadRequestError("Failed to register device token");
  }
};


const removeDeviceToken = async (req, res) => {
  const userId = req.user.id;
  const { device_token } = req.body;

  if (!device_token) {
    throw new BadRequestError("Device token is required");
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    user.device_tokens = user.device_tokens.filter(
      (token) => token !== device_token
    );
    await user.save();

    return res.status(200).json({
      message: "Device token removed successfully",
      device_tokens: user.device_tokens,
    });
  } catch (error) {
    console.error(error);
    throw new BadRequestError("Failed to remove device token");
  }
};

module.exports = {
  registerDeviceToken,
  removeDeviceToken,
};
