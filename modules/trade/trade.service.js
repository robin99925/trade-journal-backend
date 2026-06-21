const Trade = require("./trade.model");
const User = require("../auth/auth.model");
const CapitalHistory = require("../capital/capital.model");

const createTrade = async (userId, payload) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const trade = await Trade.create({
    ...payload,
    userId,
    capitalAtTrade: payload.capitalAtTrade || user.currentCapital || 0,
  });

  return trade;
};

const getTradeById = async (tradeId, userId) => {
  const trade = await Trade.findOne({
    _id: tradeId,
    userId,
    isDeleted: false,
  });

  if (!trade) {
    throw new Error("Trade not found");
  }

  return trade;
};

const updateTrade = async (tradeId, userId, payload) => {
  const trade = await Trade.findOne({
    _id: tradeId,
    userId,
    isDeleted: false,
  });

  if (!trade) {
    throw new Error("Trade not found");
  }

  // Nested objects ko replace nahi karega, merge karega
  if (payload.psychology) {
    trade.psychology = {
      ...trade.psychology.toObject(),
      ...payload.psychology,
    };
    delete payload.psychology;
  }

  if (payload.strategy) {
    trade.strategy = {
      ...trade.strategy.toObject(),
      ...payload.strategy,
    };
    delete payload.strategy;
  }

  if (payload.review) {
    trade.review = {
      ...trade.review.toObject(),
      ...payload.review,
    };
    delete payload.review;
  }

  Object.assign(trade, payload);

  // Model pre("validate") hook quantity, pnl, percentage, status, side calculate karega
  await trade.save();

  return trade;
};

const deleteTrade = async (tradeId, userId) => {
  const trade = await Trade.findOne({
    _id: tradeId,
    userId,
    isDeleted: false,
  });

  if (!trade) {
    throw new Error("Trade not found");
  }

  trade.isDeleted = true;
  trade.deletedAt = new Date();

  await trade.save();

  return true;
};

const getTrades = async (userId, queryParams) => {
  const {
    page = 1,
    limit = 20,
    status,
    setup,
    market,
    symbol,
    fromDate,
    toDate,
    sortBy = "tradeDate",
    order = "desc",
  } = queryParams;

  const currentPage = Math.max(Number(page) || 1, 1);
  const pageLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const query = {
    userId,
    isDeleted: false,
  };

  if (status) {
    query.status = String(status).toUpperCase();
  }

  if (setup) {
    query["strategy.setup"] = {
      $regex: setup,
      $options: "i",
    };
  }

  if (market) {
    query.market = String(market).toUpperCase();
  }

  if (symbol) {
    query.symbol = {
      $regex: symbol,
      $options: "i",
    };
  }

  if (fromDate || toDate) {
    query.tradeDate = {};

    if (fromDate) {
      query.tradeDate.$gte = new Date(fromDate);
    }

    if (toDate) {
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
      query.tradeDate.$lte = endDate;
    }
  }

  const allowedSortFields = [
    "tradeDate",
    "pnl",
    "symbol",
    "entryPrice",
    "exitPrice",
    "createdAt",
  ];

  const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : "tradeDate";

  const skip = (currentPage - 1) * pageLimit;

  const [trades, total] = await Promise.all([
    Trade.find(query)
      .select(
        "symbol market type side lots lotSize quantity entryPrice exitPrice pnl pnlPercentage rr status tradeDate strategy.setup screenshot createdAt",
      )
      .sort({
        [finalSortBy]: order === "asc" ? 1 : -1,
      })
      .skip(skip)
      .limit(pageLimit),

    Trade.countDocuments(query),
  ]);

  return {
    trades,
    pagination: {
      total,
      page: currentPage,
      limit: pageLimit,
      totalPages: Math.ceil(total / pageLimit),
    },
  };
};

const getTradeSummary = async (userId) => {
  const [summary] = await Trade.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: null,

        totalTrades: {
          $sum: 1,
        },

        totalWins: {
          $sum: {
            $cond: [{ $eq: ["$status", "WIN"] }, 1, 0],
          },
        },

        totalLosses: {
          $sum: {
            $cond: [{ $eq: ["$status", "LOSS"] }, 1, 0],
          },
        },

        netPnl: {
          $sum: "$pnl",
        },

        averagePnl: {
          $avg: "$pnl",
        },
      },
    },
  ]);

  const totalTrades = summary?.totalTrades || 0;
  const totalWins = summary?.totalWins || 0;
  const totalLosses = summary?.totalLosses || 0;
  const netPnl = summary?.netPnl || 0;
  const averagePnl = summary?.averagePnl || 0;

  const latestCapital = await CapitalHistory.findOne({
    userId,
  }).sort({
    effectiveDate: -1,
  });

  const currentCapital = latestCapital?.capital || 0;
  const initialCapital = latestCapital?.initialCapital || currentCapital;

  const roi = initialCapital > 0 ? (netPnl / initialCapital) * 100 : 0;

  const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;

  return {
    currentCapital,
    totalTrades,
    totalWins,
    totalLosses,
    netPnl: Number(netPnl.toFixed(2)),
    averagePnl: Number(averagePnl.toFixed(2)),
    winRate: Number(winRate.toFixed(2)),
    roi: Number(roi.toFixed(2)),
  };
};

module.exports = {
  createTrade,
  getTradeById,
  updateTrade,
  deleteTrade,
  getTrades,
  getTradeSummary,
};
