const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    isVerified: {
      type: Boolean,
      default: true,
    },

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    currentCapital: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
