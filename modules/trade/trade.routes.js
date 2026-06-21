const router = require("express").Router();

const authMiddleware = require("../../middleware/auth.middleware");

const tradeController = require("./trade.controller");

const {
  createTradeValidation,
  updateTradeValidation,
} = require("./trade.validation");

/**
 * Create Trade
 */
router.post(
  "/",
  authMiddleware,
  createTradeValidation,
  tradeController.createTrade,
);

/**
 * Get All Trades
 */
router.get("/", authMiddleware, tradeController.getTrades);
router.get("/summary", authMiddleware, tradeController.getTradeSummary);

/**
 * Get Trade By Id
 */
router.get("/:id", authMiddleware, tradeController.getTradeById);

/**
 * Update Trade
 */
router.patch(
  "/:id",
  authMiddleware,
  updateTradeValidation,
  tradeController.updateTrade,
);

/**
 * Soft Delete Trade
 */
router.delete("/:id", authMiddleware, tradeController.deleteTrade);

module.exports = router;
