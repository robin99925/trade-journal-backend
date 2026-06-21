const CapitalHistory = require("./capital.model");
const User = require("../auth/auth.model");

const completeOnboarding = async (userId, amount) => {
  await CapitalHistory.create({
    userId,
    amount,
    type: "INITIAL",
  });

  await User.findByIdAndUpdate(userId, {
    currentCapital: amount,
    onboardingCompleted: true,
  });

  return true;
};

const depositCapital = async (userId, amount, note) => {
  const user = await User.findById(userId);

  const updatedCapital = user.currentCapital + amount;

  await CapitalHistory.create({
    userId,
    amount,
    type: "DEPOSIT",
    note,
  });

  user.currentCapital = updatedCapital;

  await user.save();

  return user.currentCapital;
};

const withdrawCapital = async (userId, amount, note) => {
  const user = await User.findById(userId);

  if (amount > user.currentCapital) {
    throw new Error("Insufficient Capital");
  }

  await CapitalHistory.create({
    userId,
    amount,
    type: "WITHDRAW",
    note,
  });

  user.currentCapital = user.currentCapital - amount;

  await user.save();

  return user.currentCapital;
};

const getCapitalHistory = async (userId) => {
  return CapitalHistory.find({
    userId,
  }).sort({
    createdAt: -1,
  });
};

const getCurrentCapital = async (userId) => {
  const user = await User.findById(userId);

  return user.currentCapital;
};

module.exports = {
  completeOnboarding,
  depositCapital,
  withdrawCapital,
  getCapitalHistory,
  getCurrentCapital,
};
