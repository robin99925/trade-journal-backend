const router = require("express").Router();

const authMiddleware = require("../../middleware/auth.middleware");

const calendarController = require("./calendar.controller");

/**
 * Calendar Grid
 */
router.get("/", authMiddleware, calendarController.getCalendar);

/**
 * Calendar Analytics
 */
// router.get("/analytics", authMiddleware, calendarController.getAnalytics);

/**
 * Day Details
 */
// router.get("/day/:date", authMiddleware, calendarController.getDayDetails);

module.exports = router;
