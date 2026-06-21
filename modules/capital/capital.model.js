const mongoose = require("mongoose");

const capitalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: ["INITIAL", "DEPOSIT", "WITHDRAW"],
      required: true,
    },

    note: {
      type: String,
      default: "",
    },

    effectiveDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);
capitalSchema.index({
  userId: 1,
  effectiveDate: -1,
});

module.exports = mongoose.model("CapitalHistory", capitalSchema);
