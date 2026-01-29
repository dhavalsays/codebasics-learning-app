const { body, param, validationResult } = require('express-validator');
const { AppError } = require('../middlewares/errorHandler');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((e) => e.msg).join(', ');
    throw new AppError(errorMessages, 400, 'VALIDATION_ERROR');
  }
  next();
};

const VALID_ROLES = ['da', 'ds', 'de'];

const roleParamValidator = [
  param('role')
    .isIn(VALID_ROLES)
    .withMessage('Role must be one of: da, ds, de'),
  handleValidationErrors,
];

const submitTestValidator = [
  param('role')
    .isIn(VALID_ROLES)
    .withMessage('Role must be one of: da, ds, de'),
  body('answers')
    .isArray({ min: 1 })
    .withMessage('Answers must be a non-empty array'),
  body('answers.*.question_id')
    .isUUID()
    .withMessage('Each answer must have a valid question_id (UUID)'),
  body('answers.*.option_id')
    .isUUID()
    .withMessage('Each answer must have a valid option_id (UUID)'),
  handleValidationErrors,
];

const attemptIdValidator = [
  param('attemptId')
    .isUUID()
    .withMessage('Attempt ID must be a valid UUID'),
  handleValidationErrors,
];

module.exports = {
  roleParamValidator,
  submitTestValidator,
  attemptIdValidator,
  handleValidationErrors,
};
