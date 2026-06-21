const calendarService = require("./calendar.service");

/**
 * Calendar Grid
 */
const getCalendar = async (req, res) => {
  try {
    const data = await calendarService.getCalendar(req.user._id, req.query);

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

/**
 * Analytics
 */
const getAnalytics = async (req, res) => {
  try {
    const data = await calendarService.getAnalytics(req.user._id, req.query);

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

/**
 * Day Details
 */
const getDayDetails = async (req, res) => {
  try {
    const data = await calendarService.getDayDetails(
      req.user._id,
      req.params.date,
    );

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
  getCalendar,
  getAnalytics,
  getDayDetails,
};
