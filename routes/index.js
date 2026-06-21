const router = require("express").Router();

const authRoutes = require("../modules/auth/auth.routes");
const capitalRoutes = require("../modules/capital/capital.routes");
const tradeRoutes = require("../modules/trade/trade.routes");
const dashboardRoutes = require("../modules/dashboard/dashboard.routes");
const calendarRoutes = require("../modules/calendar/calendar.routes");

router.use("/auth", authRoutes);
router.use("/capital", capitalRoutes);
router.use("/trades", tradeRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/calendar", calendarRoutes);

module.exports = router;
