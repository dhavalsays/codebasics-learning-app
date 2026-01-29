const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticate);

// Profile
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Statistics
router.get('/stats', userController.getStats);

// Badges
router.get('/badges', userController.getBadges);

// Activity/Streak
router.post('/activity', userController.recordActivity);
router.get('/streak', userController.getStreak);

module.exports = router;
