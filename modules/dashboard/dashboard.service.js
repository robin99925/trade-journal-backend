const mongoose = require("mongoose");

const Trade = require("../trade/trade.model");
const CapitalHistory = require("../capital/capital.model");

const getDashboard = async (userId) => {
  const objectId = new mongoose.Types.ObjectId(userId);

  const [stats, equityCurve, tradeOutcome, topStrategies, recentTrades] =
    await Promise.all([
      getStats(objectId),
      getEquityCurve(objectId),
      getTradeOutcome(objectId),
      getTopStrategies(objectId),
      getRecentTrades(objectId),
    ]);

  return {
    stats,
    equityCurve,
    tradeOutcome,
    topStrategies,
    recentTrades,
  };
};

const getStats = async (userId) => {
  const [initialCapital, tradeStats] = await Promise.all([
    CapitalHistory.findOne({
      userId,
      type: "INITIAL",
    }).sort({
      effectiveDate: 1,
    }),

    Trade.aggregate([
      {
        $match: {
          userId,
          isDeleted: false,
        },
      },

      {
        $group: {
          _id: null,

          netPnl: {
            $sum: "$pnl",
          },

          totalTrades: {
            $sum: 1,
          },

          wins: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "WIN"],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
  ]);

  const startingCapital = Number(initialCapital?.amount || 0);

  const stats = tradeStats[0] || {
    netPnl: 0,
    totalTrades: 0,
    wins: 0,
  };

  const currentCapital = startingCapital + stats.netPnl;

  const roi =
    startingCapital > 0
      ? Number(((stats.netPnl / startingCapital) * 100).toFixed(2))
      : 0;

  const winRate =
    stats.totalTrades > 0
      ? Number(((stats.wins / stats.totalTrades) * 100).toFixed(2))
      : 0;

  return {
    startingCapital,
    currentCapital,
    netPnl: stats.netPnl,
    roi,
    winRate,
    totalTrades: stats.totalTrades,
  };
};

const getEquityCurve = async (userId) => {
  return Trade.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,
      },
    },

    {
      $group: {
        _id: {
          year: {
            $year: "$tradeDate",
          },

          month: {
            $month: "$tradeDate",
          },
        },

        pnl: {
          $sum: "$pnl",
        },
      },
    },

    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);
};

const getTradeOutcome = async (userId) => {
  const result = await Trade.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,
      },
    },

    {
      $group: {
        _id: "$status",

        count: {
          $sum: 1,
        },
      },
    },
  ]);

  const response = {
    wins: 0,
    losses: 0,
    breakeven: 0,
  };

  result.forEach((item) => {
    if (item._id === "WIN") {
      response.wins = item.count;
    }

    if (item._id === "LOSS") {
      response.losses = item.count;
    }

    if (item._id === "BE") {
      response.breakeven = item.count;
    }
  });

  return response;
};

const getTopStrategies = async (userId) => {
  return Trade.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,
      },
    },

    {
      $addFields: {
        strategyName: {
          $cond: [
            {
              $or: [
                { $eq: ["$strategy.setup", ""] },
                { $eq: ["$strategy.setup", null] },
              ],
            },
            "No Strategy",
            "$strategy.setup",
          ],
        },
      },
    },

    {
      $group: {
        _id: "$strategyName",

        trades: {
          $sum: 1,
        },

        totalPnl: {
          $sum: "$pnl",
        },

        wins: {
          $sum: {
            $cond: [{ $eq: ["$status", "WIN"] }, 1, 0],
          },
        },

        losses: {
          $sum: {
            $cond: [{ $eq: ["$status", "LOSS"] }, 1, 0],
          },
        },
      },
    },

    {
      $project: {
        _id: 0,

        strategy: "$_id",

        trades: 1,
        wins: 1,
        losses: 1,
        totalPnl: 1,

        winRate: {
          $cond: [
            { $gt: ["$trades", 0] },
            {
              $round: [
                {
                  $multiply: [
                    {
                      $divide: ["$wins", "$trades"],
                    },
                    100,
                  ],
                },
                2,
              ],
            },
            0,
          ],
        },
      },
    },

    {
      $sort: {
        trades: -1,
        totalPnl: -1,
      },
    },

    {
      $limit: 5,
    },
  ]);
};

const getRecentTrades = async (userId) => {
  return Trade.find({
    userId,
    isDeleted: false,
  })
    .select(
      `
      symbol
      type
      side
      pnl
      rr
      status
      tradeDate
      lots
      quantity
    `,
    )
    .sort({
      tradeDate: -1,
    })
    .limit(8);
};

module.exports = {
  getDashboard,
};
