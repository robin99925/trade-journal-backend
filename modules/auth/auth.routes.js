const router = require("express").Router();

const authController = require("./auth.controller");

const { registerValidation, loginValidation } = require("./auth.validation");
const authMiddleware = require("../../middleware/auth.middleware");

router.post("/register", registerValidation, authController.register);

router.post("/login", loginValidation, authController.login);

router.get("/me", authMiddleware, authController.getMe);

module.exports = router;
