const leaderboardService = require('../services/leaderboard.service');

const getWeeklyLeaderboard = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.user?.id || null;

    const leaderboard = await leaderboardService.getWeeklyLeaderboard(
      parseInt(limit, 10),
      parseInt(offset, 10),
      userId
    );

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    next(error);
  }
};

const getAllTimeLeaderboard = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.user?.id || null;

    const leaderboard = await leaderboardService.getAllTimeLeaderboard(
      parseInt(limit, 10),
      parseInt(offset, 10),
      userId
    );

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    next(error);
  }
};

const getUserRank = async (req, res, next) => {
  try {
    const rank = await leaderboardService.getUserRank(req.user.id);
    res.status(200).json({
      success: true,
      data: rank,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWeeklyLeaderboard,
  getAllTimeLeaderboard,
  getUserRank,
};
