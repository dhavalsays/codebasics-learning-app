const express = require('express');
const router = express.Router();
const skillTestController = require('../controllers/skillTest.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth');

// List all skill tests (with user's best scores if authenticated)
router.get('/', optionalAuth, skillTestController.getAllTests);

// Get available practice topics
router.get('/topics', skillTestController.getTopics);

// Get user's test history
router.get('/history', authenticate, skillTestController.getTestHistory);

// Get user's practice stats
router.get('/practice/stats', authenticate, skillTestController.getPracticeStats);

// Get practice questions by topic
router.get('/practice/:topic', authenticate, skillTestController.getPracticeQuestions);

// Submit practice answer
router.post('/practice/submit', authenticate, skillTestController.submitPracticeAnswer);

// Get specific test details
router.get('/:id', optionalAuth, skillTestController.getTestById);

// Get questions for a specific skill test
router.get('/:id/questions', authenticate, skillTestController.getQuestions);

// Submit skill test answers
router.post('/:id/submit', authenticate, skillTestController.submitTest);

// Get attempt details for review
router.get('/attempts/:attemptId', authenticate, skillTestController.getAttemptDetails);

module.exports = router;
