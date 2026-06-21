const { validationResult } = require("express-validator");

const capitalService = require("./capital.service");

const onboarding = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { amount } = req.body;

    await capitalService.completeOnboarding(req.user._id, amount);

    return res.status(200).json({
      success: true,
      message: "Onboarding Completed Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deposit = async (req, res) => {
  try {
    const { amount, note } = req.body;

    const capital = await capitalService.depositCapital(
      req.user._id,
      amount,
      note,
    );

    return res.status(200).json({
      success: true,
      currentCapital: capital,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const withdraw = async (req, res) => {
  try {
    const { amount, note } = req.body;

    const capital = await capitalService.withdrawCapital(
      req.user._id,
      amount,
      note,
    );

    return res.status(200).json({
      success: true,
      currentCapital: capital,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const history = async (req, res) => {
  const data = await capitalService.getCapitalHistory(req.user._id);

  return res.status(200).json({
    success: true,
    data,
  });
};

const current = async (req, res) => {
  const capital = await capitalService.getCurrentCapital(req.user._id);

  return res.status(200).json({
    success: true,
    currentCapital: capital,
  });
};

module.exports = {
  onboarding,
  deposit,
  withdraw,
  history,
  current,
};
