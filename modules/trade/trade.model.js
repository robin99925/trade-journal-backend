const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema(
  {
    // -------------------------
    // User
    // -------------------------
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // -------------------------
    // Trade Details - Step 1
    // -------------------------
    symbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    market: {
      type: String,
      enum: ["INDICES", "CRYPTO", "FOREX", "STOCKS", "FUTURES", "OPTIONS"],
      default: "INDICES",
    },

    // Frontend: Long / Short
    type: {
      type: String,
      required: true,
      enum: ["Long", "Short"],
      default: "Long",
    },

    // Automatically set from type
    side: {
      type: String,
      enum: ["BUY", "SELL"],
      default: "BUY",
    },

    tradeDate: {
      type: Date,
      required: true,
      index: true,
    },

    entryPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    exitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    lots: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    lotSize: {
      type: Number,
      required: true,
      min: 1,
      default: 75,
    },

    // Automatically calculated: lots × lotSize
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    stopLoss: {
      type: Number,
      default: 0,
      min: 0,
    },

    targetPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Automatically calculated
    pnl: {
      type: Number,
      default: 0,
    },

    pnlPercentage: {
      type: Number,
      default: 0,
    },

    rr: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["WIN", "LOSS", "BE"],
      default: "BE",
    },

    screenshot: {
      type: String,
      default: "",
      trim: true,
    },

    capitalAtTrade: {
      type: Number,
      default: 0,
      min: 0,
    },

    // -------------------------
    // Psychology - Step 2
    // -------------------------
    psychology: {
      mindset: {
        type: String,
        default: "",
        trim: true,
      },

      emotion: {
        type: String,
        default: "",
        trim: true,
      },

      confidence: {
        type: Number,
        min: 1,
        max: 5,
        default: 3,
      },

      discipline: {
        type: String,
        default: "",
        trim: true,
      },

      thoughts: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500,
      },

      distraction: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // -------------------------
    // Strategy - Step 3
    // -------------------------
    strategy: {
      setup: {
        type: String,
        default: "",
        trim: true,
      },

      timeframe: {
        type: String,
        default: "",
        trim: true,
      },

      plans: {
        type: [String],
        default: [],
      },

      reason: {
        type: String,
        default: "",
        trim: true,
      },

      entryType: {
        type: String,
        default: "",
        trim: true,
      },

      expectedOutcome: {
        type: String,
        default: "",
        trim: true,
      },

      marketCondition: {
        type: String,
        default: "",
        trim: true,
      },

      exitStrategy: {
        type: String,
        default: "",
        trim: true,
      },

      riskManagement: {
        type: String,
        default: "",
        trim: true,
      },

      tools: {
        type: [String],
        default: [],
      },
    },

    // -------------------------
    // Review - Step 4
    // -------------------------
    review: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 3,
      },

      wentWell: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500,
      },

      improvement: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500,
      },

      learning: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500,
      },

      notes: {
        type: String,
        default: "",
        trim: true,
        maxlength: 1000,
      },
    },

    // -------------------------
    // Soft Delete
    // -------------------------
    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// -------------------------
// Auto Calculate Fields
// IMPORTANT: next() use nahi karna
// -------------------------
tradeSchema.pre("validate", function () {
  const lots = Number(this.lots) || 0;

  const entryPrice = Number(this.entryPrice) || 0;
  const exitPrice = Number(this.exitPrice) || 0;
  const stopLoss = Number(this.stopLoss) || 0;

  this.quantity = lots * this.lotSize;

  // Side optional hai
  this.side = this.type === "Call" ? "BUY" : "SELL";

  // PnL only Entry & Exit se
  this.pnl = (exitPrice - entryPrice) * this.quantity;

  const investedAmount = entryPrice * this.quantity;

  this.pnlPercentage =
    investedAmount > 0
      ? Number(((this.pnl / investedAmount) * 100).toFixed(2))
      : 0;

  const risk = Math.abs(entryPrice - stopLoss);
  const reward = Math.abs(exitPrice - entryPrice);

  this.rr = risk > 0 ? Number((reward / risk).toFixed(2)) : 0;

  if (this.pnl > 0) {
    this.status = "WIN";
  } else if (this.pnl < 0) {
    this.status = "LOSS";
  } else {
    this.status = "BE";
  }
});
// -------------------------
// Indexes
// -------------------------
tradeSchema.index({
  userId: 1,
  tradeDate: -1,
});

tradeSchema.index({
  userId: 1,
  status: 1,
});

tradeSchema.index({
  userId: 1,
  "strategy.setup": 1,
});

tradeSchema.index({
  userId: 1,
  symbol: 1,
});

tradeSchema.index({
  userId: 1,
  isDeleted: 1,
  tradeDate: -1,
});

module.exports = mongoose.model("Trade", tradeSchema);
