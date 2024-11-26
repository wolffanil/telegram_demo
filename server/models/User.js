const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");

const userSchema = new Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    username: {
      type: String,
      required: true,
      match: [/^[a-zA-Z0-9_]{3,30}$/, "Please provide a valid username"],
      unique: true,
    },
    email: { type: String, required: true, unique: true },
    profile_picture: { type: String },
    is_discoverable: {
      type: String,
      enum: ["VISIBLE", "HIDDEN"],
      default: "VISIBLE",
    },
    friend_list: [{ type: Schema.Types.ObjectId, ref: "User" }],
    last_seen: { type: Date },
    is_online: { type: Boolean, default: false },
    device_tokens: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

userSchema.methods.createAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      full_name: this.first_name + this.last_name,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.createRefreshToken = function () {
  return jwt.sign(
    { id: this._id, username: this.username },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const User = mongoose.model("User", userSchema);
module.exports = User;
