const Trade = require("../trade/trade.model");

/**
 * Get Month Range
 */
const getMonthRange = (month, year) => {
  const startDate = new Date(year, month - 1, 1);

  const endDate = new Date(year, month, 0);

  endDate.setHours(23, 59, 59, 999);

  return {
    startDate,
    endDate,
  };
};

/**
 * Calendar Grid
 */
const getCalendar = async (userId, queryParams) => {
  const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } =
    queryParams;

  const { startDate, endDate } = getMonthRange(Number(month), Number(year));

  const days = await Trade.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,
        tradeDate: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$tradeDate",
          },
        },
        pnl: { $sum: "$pnl" },
        tradeCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        pnl: 1,
        tradeCount: 1,
        status: {
          $cond: [
            { $gt: ["$pnl", 0] },
            "PROFIT",
            {
              $cond: [{ $lt: ["$pnl", 0] }, "LOSS", "BE"],
            },
          ],
        },
      },
    },
    {
      $sort: { date: 1 },
    },
  ]);

  // Monthly summary ke liye same month ke saare trades
  const summaryData = await Trade.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,
        tradeDate: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,

        totalTrades: { $sum: 1 },

        netPnl: { $sum: "$pnl" },

        winningTrades: {
          $sum: {
            $cond: [{ $gt: ["$pnl", 0] }, 1, 0],
          },
        },

        losingTrades: {
          $sum: {
            $cond: [{ $lt: ["$pnl", 0] }, 1, 0],
          },
        },

        totalProfit: {
          $sum: {
            $cond: [{ $gt: ["$pnl", 0] }, "$pnl", 0],
          },
        },

        totalLoss: {
          $sum: {
            $cond: [{ $lt: ["$pnl", 0] }, { $abs: "$pnl" }, 0],
          },
        },

        averageRR: {
          $avg: {
            $cond: [{ $gt: ["$rr", 0] }, "$rr", null],
          },
        },

        bestTrade: {
          $max: "$pnl",
        },
      },
    },
  ]);

  const data = summaryData[0] || {};

  const totalTrades = data.totalTrades || 0;
  const winningTrades = data.winningTrades || 0;
  const losingTrades = data.losingTrades || 0;
  const totalProfit = data.totalProfit || 0;
  const totalLoss = data.totalLoss || 0;
  const netPnl = data.netPnl || 0;

  const winRate =
    totalTrades > 0
      ? Number(((winningTrades / totalTrades) * 100).toFixed(2))
      : 0;

  const profitFactor =
    totalLoss > 0
      ? Number((totalProfit / totalLoss).toFixed(2))
      : totalProfit > 0
        ? totalProfit
        : 0;

  const averageRR = Number((data.averageRR || 0).toFixed(2));

  const expectancy =
    totalTrades > 0 ? Number((netPnl / totalTrades).toFixed(2)) : 0;

  return {
    month: Number(month),
    year: Number(year),

    days,

    summary: {
      netPnl,
      totalTrades,
      winningTrades,
      losingTrades,
      totalProfit,
      totalLoss,

      winRate,
      profitFactor,
      averageRR,
      expectancy,
      bestTrade: data.bestTrade || 0,
    },
  };
};

/**
 * Analytics
 */
const getAnalytics = async (userId, queryParams) => {
  const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } =
    queryParams;

  const { startDate, endDate } = getMonthRange(Number(month), Number(year));

  const trades = await Trade.find({
    userId,

    isDeleted: false,

    tradeDate: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  const totalTrades = trades.length;

  const totalWins = trades.filter((trade) => trade.status === "WIN").length;

  const totalLosses = trades.filter((trade) => trade.status === "LOSS").length;

  const netPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);

  const averageRR =
    totalTrades > 0
      ? trades.reduce((sum, trade) => sum + trade.rr, 0) / totalTrades
      : 0;

  const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;

  const bestTrade = trades.length ? Math.max(...trades.map((t) => t.pnl)) : 0;

  const grossProfit = trades
    .filter((t) => t.pnl > 0)
    .reduce((sum, t) => sum + t.pnl, 0);

  const grossLoss = Math.abs(
    trades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0),
  );

  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

  const avgWin = totalWins > 0 ? grossProfit / totalWins : 0;

  const avgLoss = totalLosses > 0 ? grossLoss / totalLosses : 0;

  const expectancy =
    (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss;

  const dayWise = await Trade.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,

        tradeDate: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },

    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$tradeDate",
          },
        },

        pnl: {
          $sum: "$pnl",
        },
      },
    },
  ]);

  const winningDays = dayWise.filter((d) => d.pnl > 0).length;

  const losingDays = dayWise.filter((d) => d.pnl < 0).length;

  const breakevenDays = dayWise.filter((d) => d.pnl === 0).length;

  const bestDay = dayWise.sort((a, b) => b.pnl - a.pnl)[0] || null;

  const worstDay = dayWise.sort((a, b) => a.pnl - b.pnl)[0] || null;

  return {
    monthlySummary: {
      netPnl,

      totalTrades,

      winRate: Number(winRate.toFixed(2)),

      profitFactor: Number(profitFactor.toFixed(2)),

      averageRR: Number(averageRR.toFixed(2)),

      expectancy: Number(expectancy.toFixed(2)),

      bestTrade,
    },

    overview: {
      winningDays,

      losingDays,

      breakevenDays,

      bestDay,

      worstDay,
    },
  };
};

/**
 * Day Details
 */
const getDayDetails = async (userId, date) => {
  const start = new Date(date);

  start.setHours(0, 0, 0, 0);

  const end = new Date(date);

  end.setHours(23, 59, 59, 999);

  const trades = await Trade.find({
    userId,

    isDeleted: false,

    tradeDate: {
      $gte: start,
      $lte: end,
    },
  }).sort({
    tradeDate: -1,
  }).select(`
        symbol
        strategy
        side
        pnl
        rr
        status
        tradeDate
      `);

  const pnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);

  return {
    summary: {
      pnl,

      tradeCount: trades.length,
    },

    trades,
  };
};

module.exports = {
  getCalendar,
  getAnalytics,
  getDayDetails,
};
