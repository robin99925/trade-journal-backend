const router = require("express").Router();

const authMiddleware = require("../../middleware/auth.middleware");

const capitalController = require("./capital.controller");

const { amountValidation } = require("./capital.validation");

router.post(
  "/onboarding",
  authMiddleware,
  amountValidation,
  capitalController.onboarding,
);

router.post(
  "/deposit",
  authMiddleware,
  amountValidation,
  capitalController.deposit,
);

router.post(
  "/withdraw",
  authMiddleware,
  amountValidation,
  capitalController.withdraw,
);

router.get("/history", authMiddleware, capitalController.history);

router.get("/current", authMiddleware, capitalController.current);

module.exports = router;
