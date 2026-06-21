const { body } = require("express-validator");

const { MARKETS, TRADE_TYPES } = require("./trade.constants");

const optionalString = (field, maxLength = 1000) =>
  body(field)
    .optional({ checkFalsy: true })
    .isString()
    .withMessage(`${field} must be a string`)
    .trim()
    .isLength({ max: maxLength })
    .withMessage(`${field} is too long`);

const createTradeValidation = [
  // -------------------------
  // Step 1: Trade Details
  // -------------------------
  body("symbol")
    .trim()
    .notEmpty()
    .withMessage("Symbol is required")
    .isLength({ max: 50 })
    .withMessage("Symbol is too long"),

  body("market").optional().isIn(MARKETS).withMessage("Invalid market"),

  body("type")
    .notEmpty()
    .withMessage("Trade type is required")
    .isIn(TRADE_TYPES)
    .withMessage("Trade type must be Long or Short"),

  body("tradeDate")
    .notEmpty()
    .withMessage("Trade date is required")
    .isISO8601()
    .withMessage("Invalid trade date"),

  body("entryPrice")
    .notEmpty()
    .withMessage("Entry price is required")
    .isFloat({ min: 0 })
    .withMessage("Entry price must be 0 or greater"),

  body("exitPrice")
    .notEmpty()
    .withMessage("Exit price is required")
    .isFloat({ min: 0 })
    .withMessage("Exit price must be 0 or greater"),

  body("lots")
    .notEmpty()
    .withMessage("Lots is required")
    .isInt({ min: 1 })
    .withMessage("Lots must be at least 1"),

  body("lotSize")
    .notEmpty()
    .withMessage("Lot size is required")
    .isInt({ min: 1 })
    .withMessage("Lot size must be at least 1"),

  body("stopLoss")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Stop loss must be 0 or greater"),

  body("targetPrice")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Target price must be 0 or greater"),

  body("screenshot")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Screenshot must be a URL or string")
    .trim(),

  body("capitalAtTrade")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Capital at trade must be 0 or greater"),

  // -------------------------
  // Step 2: Psychology
  // -------------------------
  optionalString("psychology.mindset", 100),
  optionalString("psychology.emotion", 100),

  body("psychology.confidence")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Confidence must be between 1 and 5"),

  optionalString("psychology.discipline", 100),
  optionalString("psychology.thoughts", 500),
  optionalString("psychology.distraction", 200),

  // -------------------------
  // Step 3: Strategy
  // -------------------------
  optionalString("strategy.setup", 100),
  optionalString("strategy.timeframe", 100),

  body("strategy.plans")
    .optional()
    .isArray()
    .withMessage("Strategy plans must be an array"),

  body("strategy.plans.*")
    .optional()
    .isString()
    .withMessage("Each strategy plan must be a string")
    .trim()
    .isLength({ max: 100 })
    .withMessage("Strategy plan is too long"),

  optionalString("strategy.reason", 1000),
  optionalString("strategy.entryType", 100),
  optionalString("strategy.expectedOutcome", 1000),
  optionalString("strategy.marketCondition", 200),
  optionalString("strategy.exitStrategy", 500),
  optionalString("strategy.riskManagement", 500),

  body("strategy.tools")
    .optional()
    .isArray()
    .withMessage("Strategy tools must be an array"),

  body("strategy.tools.*")
    .optional()
    .isString()
    .withMessage("Each tool must be a string")
    .trim()
    .isLength({ max: 100 })
    .withMessage("Tool name is too long"),

  // -------------------------
  // Step 4: Review
  // -------------------------
  body("review.rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  optionalString("review.wentWell", 500),
  optionalString("review.improvement", 500),
  optionalString("review.learning", 500),
  optionalString("review.notes", 1000),
];

const updateTradeValidation = [
  body("symbol")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Symbol cannot be empty")
    .isLength({ max: 50 })
    .withMessage("Symbol is too long"),

  body("market").optional().isIn(MARKETS).withMessage("Invalid market"),

  body("type")
    .optional()
    .isIn(TRADE_TYPES)
    .withMessage("Trade type must be Long or Short"),

  body("tradeDate").optional().isISO8601().withMessage("Invalid trade date"),

  body("entryPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Entry price must be 0 or greater"),

  body("exitPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Exit price must be 0 or greater"),

  body("lots")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Lots must be at least 1"),

  body("lotSize")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Lot size must be at least 1"),

  body("stopLoss")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Stop loss must be 0 or greater"),

  body("targetPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Target price must be 0 or greater"),

  body("screenshot")
    .optional()
    .isString()
    .withMessage("Screenshot must be a string"),

  body("psychology.confidence")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Confidence must be between 1 and 5"),

  body("strategy.plans")
    .optional()
    .isArray()
    .withMessage("Strategy plans must be an array"),

  body("strategy.tools")
    .optional()
    .isArray()
    .withMessage("Strategy tools must be an array"),

  body("review.rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  optionalString("psychology.mindset", 100),
  optionalString("psychology.emotion", 100),
  optionalString("psychology.discipline", 100),
  optionalString("psychology.thoughts", 500),
  optionalString("psychology.distraction", 200),

  optionalString("strategy.setup", 100),
  optionalString("strategy.timeframe", 100),
  optionalString("strategy.reason", 1000),
  optionalString("strategy.entryType", 100),
  optionalString("strategy.expectedOutcome", 1000),
  optionalString("strategy.marketCondition", 200),
  optionalString("strategy.exitStrategy", 500),
  optionalString("strategy.riskManagement", 500),

  optionalString("review.wentWell", 500),
  optionalString("review.improvement", 500),
  optionalString("review.learning", 500),
  optionalString("review.notes", 1000),
];

module.exports = {
  createTradeValidation,
  updateTradeValidation,
};
