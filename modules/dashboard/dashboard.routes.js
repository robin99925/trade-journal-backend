const router = require("express").Router();

const authMiddleware = require("../../middleware/auth.middleware");

const dashboardController = require("./dashboard.controller");

router.get("/", authMiddleware, dashboardController.getDashboard);

module.exports = router;
