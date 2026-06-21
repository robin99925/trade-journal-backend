const { validationResult } = require("express-validator");

const tradeService = require("./trade.service");

/**
 * Create Trade
 */
const createTrade = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const trade = await tradeService.createTrade(req.user._id, req.body);

    return res.status(201).json({
      success: true,
      message: "Trade created successfully",
      data: trade,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get All Trades
 */
const getTrades = async (req, res) => {
  try {
    const result = await tradeService.getTrades(req.user._id, req.query);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Single Trade
 */
const getTradeById = async (req, res) => {
  try {
    const trade = await tradeService.getTradeById(req.params.id, req.user._id);

    return res.status(200).json({
      success: true,
      data: trade,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update Trade
 */
const updateTrade = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const trade = await tradeService.updateTrade(
      req.params.id,
      req.user._id,
      req.body,
    );

    return res.status(200).json({
      success: true,
      message: "Trade updated successfully",
      data: trade,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete Trade
 */
const deleteTrade = async (req, res) => {
  try {
    await tradeService.deleteTrade(req.params.id, req.user._id);

    return res.status(200).json({
      success: true,
      message: "Trade deleted successfully",
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const getTradeSummary = async (req, res) => {
  try {
    const data = await tradeService.getTradeSummary(req.user._id);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTrade,
  getTrades,
  getTradeById,
  updateTrade,
  deleteTrade,
  getTradeSummary,
};
