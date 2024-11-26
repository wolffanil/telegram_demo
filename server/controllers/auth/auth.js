const User = require("../../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../../errors");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const checkUsernameAvailability = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    throw new BadRequestError("Username is required");
  }

  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;

  if (!usernameRegex.test(username)) {
    throw new BadRequestError(
      "Invalid username. Username can only contain letters, numbers, and underscores, and must be between 3 and 30 characters long."
    );
  }

  const user = await User.findOne({ username });

  if (user) {
    return res.status(StatusCodes.OK).json({ available: false });
  }

  res.status(StatusCodes.OK).json({ available: true });
};

const signInWithGoogle = async (req, res) => {
  const { last_name, id_token, first_name, profile_picture, username } =
    req.body;

  if (!id_token) {
    throw new BadRequestError("ID token is required");
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const verifiedEmail = payload.email;

    if (!verifiedEmail) {
      throw new UnauthenticatedError("Invalid Token or expired");
    }

    let user = await User.findOne({ email: verifiedEmail });

    if (user) {
      const accessToken = user.createAccessToken();
      const refreshToken = user.createRefreshToken();

      return res.status(StatusCodes.OK).json({
        user: {
          full_name: `${user.first_name} ${user.last_name}`,
          id: user.id,
          username: user.username,
          profile_picture: user.profile_picture,
          email: user.email,
        },
        tokens: { access_token: accessToken, refresh_token: refreshToken },
      });
    }

    if (!first_name || !last_name || !username || !profile_picture) {
      throw new BadRequestError(
        "Missing required fields for registration: first_name, last_name, username, profile_picture"
      );
    }

    user = new User({
      email: verifiedEmail,
      username,
      first_name,
      last_name,
      profile_picture,
      last_seen: new Date(),
      is_online: false,
    });

    await user.save();

    const accessToken = user.createAccessToken();
    const refreshToken = user.createRefreshToken();

    res.status(StatusCodes.CREATED).json({
      user: {
        full_name: `${user.first_name} ${user.last_name}`,
        id: user.id,
        username: user.username,
        profile_picture: user.profile_picture,
        email: user.email,
      },
      tokens: { access_token: accessToken, refresh_token: refreshToken },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const refreshToken = async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    throw new BadRequestError("Refresh token is required");
  }

  try {
    const payload = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.id);

    if (!user) {
      throw new UnauthenticatedError("Invalid refresh token");
    }

    const newAccessToken = user.createAccessToken();
    const newRefreshToken = user.createRefreshToken();

    res.status(StatusCodes.OK).json({
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    });
  } catch (error) {
    console.error(error);
    throw new UnauthenticatedError("Invalid refresh token");
  }
};

module.exports = {
  signInWithGoogle,
  refreshToken,
  checkUsernameAvailability,
};
