const dashboardService = require("./dashboard.service");

const getDashboard = async (req, res) => {
  try {
    const data = await dashboardService.getDashboard(req.user._id);

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
  getDashboard,
};
