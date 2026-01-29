const { body, validationResult } = require('express-validator');
const { AppError } = require('../middlewares/errorHandler');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((e) => e.msg).join(', ');
    throw new AppError(errorMessages, 400, 'VALIDATION_ERROR');
  }
  next();
};

const updateProfileValidator = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('profileImage')
    .optional()
    .isURL()
    .withMessage('Profile image must be a valid URL'),
  handleValidationErrors,
];

const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('New password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('New password must contain at least one number'),
  handleValidationErrors,
];

const shareValidator = [
  body('platform')
    .isIn(['linkedin', 'twitter', 'facebook', 'whatsapp', 'other'])
    .withMessage('Platform must be linkedin, twitter, facebook, whatsapp, or other'),
  body('contentType')
    .isIn(['career_test_result', 'skill_test_result', 'badge', 'profile'])
    .withMessage('Content type must be career_test_result, skill_test_result, badge, or profile'),
  body('contentId')
    .optional()
    .isUUID()
    .withMessage('Content ID must be a valid UUID if provided'),
  handleValidationErrors,
];

module.exports = {
  updateProfileValidator,
  changePasswordValidator,
  shareValidator,
  handleValidationErrors,
};
