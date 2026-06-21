const calculatePnL = (side, entryPrice, exitPrice, quantity) => {
  if (side === "BUY") {
    return (exitPrice - entryPrice) * quantity;
  }

  return (entryPrice - exitPrice) * quantity;
};

const calculateRR = (side, entryPrice, exitPrice, stopLoss) => {
  let risk = 0;
  let reward = 0;

  if (side === "BUY") {
    risk = entryPrice - stopLoss;
    reward = exitPrice - entryPrice;
  } else {
    risk = stopLoss - entryPrice;
    reward = entryPrice - exitPrice;
  }

  if (risk <= 0) {
    return 0;
  }

  return Number((reward / risk).toFixed(2));
};

const calculateStatus = (pnl) => {
  if (pnl > 0) {
    return "WIN";
  }

  if (pnl < 0) {
    return "LOSS";
  }

  return "BE";
};

module.exports = {
  calculatePnL,
  calculateRR,
  calculateStatus,
};
