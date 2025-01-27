const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    organisation_uid: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    tokens: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
