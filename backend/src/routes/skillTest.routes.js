const express = require('express');
const router = express.Router();
const skillTestController = require('../controllers/skillTest.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth');

// List all skill tests
router.get('/', optionalAuth, skillTestController.getAllTests);

// Get questions for a specific skill test
router.get('/:id/questions', authenticate, skillTestController.getQuestions);

// Submit skill test answers
router.post('/:id/submit', authenticate, skillTestController.submitTest);

// Get practice questions by topic
router.get('/practice/:topic', authenticate, skillTestController.getPracticeQuestions);

// Submit practice answer
router.post('/practice/submit', authenticate, skillTestController.submitPracticeAnswer);

module.exports = router;
