const express = require('express');
const router = express.Router();
const careerTestController = require('../controllers/careerTest.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth');
const {
  roleParamValidator,
  submitTestValidator,
  attemptIdValidator,
} = require('../validators/careerTest.validator');

// Get all career test info
router.get('/', optionalAuth, careerTestController.getAllTests);

// Get questions for a specific role test
router.get('/:role/questions', roleParamValidator, optionalAuth, careerTestController.getQuestions);

// Submit test answers and get results
router.post('/:role/submit', submitTestValidator, authenticate, careerTestController.submitTest);

// Get detailed results for an attempt
router.get('/results/:attemptId', attemptIdValidator, authenticate, careerTestController.getResults);

// Compare all 3 role scores
router.get('/compare', authenticate, careerTestController.compareScores);

// Get user's test history
router.get('/history', authenticate, careerTestController.getHistory);

module.exports = router;
