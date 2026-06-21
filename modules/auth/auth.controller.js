const { validationResult } = require("express-validator");

const authService = require("./auth.service");

const generateToken = require("../../utils/generateToken");

const register = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    await authService.registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const user = await authService.loginUser(email, password);

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

const getMe = async (req, res, next) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
};

module.exports = {
  register,
  login,
  getMe,
};
