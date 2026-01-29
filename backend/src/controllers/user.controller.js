const userService = require('../services/user.service');
const authService = require('../services/auth.service');

const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getProfile(req.user.id);
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, profileImage, bio } = req.body;
    const profile = await userService.updateProfile(req.user.id, { name, profileImage, bio });
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await userService.getStats(req.user.id);
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

const getBadges = async (req, res, next) => {
  try {
    const badges = await userService.getBadges(req.user.id);
    res.status(200).json({
      success: true,
      data: badges,
    });
  } catch (error) {
    next(error);
  }
};

const recordActivity = async (req, res, next) => {
  try {
    const result = await userService.recordActivity(req.user.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getStreak = async (req, res, next) => {
  try {
    const streak = await userService.getStreak(req.user.id);
    res.status(200).json({
      success: true,
      data: streak,
    });
  } catch (error) {
    next(error);
  }
};

const recordShare = async (req, res, next) => {
  try {
    const { platform, contentType, contentId } = req.body;
    const result = await userService.recordShare(req.user.id, { platform, contentType, contentId });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getShareHistory = async (req, res, next) => {
  try {
    const history = await userService.getShareHistory(req.user.id);
    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getStats,
  getBadges,
  recordActivity,
  getStreak,
  recordShare,
  getShareHistory,
};
