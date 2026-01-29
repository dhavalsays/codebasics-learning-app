const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboard.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth');

// Weekly leaderboard
router.get('/weekly', optionalAuth, leaderboardController.getWeeklyLeaderboard);

// All-time leaderboard
router.get('/alltime', optionalAuth, leaderboardController.getAllTimeLeaderboard);

// Get user's rank
router.get('/rank', authenticate, leaderboardController.getUserRank);

module.exports = router;
