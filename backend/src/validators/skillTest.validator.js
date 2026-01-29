const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('../middlewares/errorHandler');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((e) => e.msg).join(', ');
    throw new AppError(errorMessages, 400, 'VALIDATION_ERROR');
  }
  next();
};

const testIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Test ID must be a valid UUID'),
  handleValidationErrors,
];

const submitTestValidator = [
  param('id')
    .isUUID()
    .withMessage('Test ID must be a valid UUID'),
  body('answers')
    .isArray({ min: 1 })
    .withMessage('Answers must be a non-empty array'),
  body('answers.*.questionId')
    .isUUID()
    .withMessage('Each answer must have a valid questionId (UUID)'),
  body('answers.*.answer')
    .isIn(['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'])
    .withMessage('Each answer must be a, b, c, or d'),
  handleValidationErrors,
];

const practiceTopicValidator = [
  param('topic')
    .isLength({ min: 1, max: 100 })
    .withMessage('Topic must be between 1 and 100 characters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  handleValidationErrors,
];

const submitPracticeValidator = [
  body('questionId')
    .isUUID()
    .withMessage('Question ID must be a valid UUID'),
  body('answer')
    .isIn(['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'])
    .withMessage('Answer must be a, b, c, or d'),
  handleValidationErrors,
];

const attemptIdValidator = [
  param('attemptId')
    .isUUID()
    .withMessage('Attempt ID must be a valid UUID'),
  handleValidationErrors,
];

module.exports = {
  testIdValidator,
  submitTestValidator,
  practiceTopicValidator,
  submitPracticeValidator,
  attemptIdValidator,
  handleValidationErrors,
};
