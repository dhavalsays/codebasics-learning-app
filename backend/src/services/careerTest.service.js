const { v4: uuidv4 } = require('uuid');
const { query, transaction } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');
const scoringService = require('./scoring.service');
const gamificationService = require('./gamification.service');

const VALID_ROLES = ['da', 'ds', 'de'];

const getAllTests = async () => {
  return [
    {
      id: 'da',
      name: 'Data Analyst Fit Test',
      description: 'Discover if Data Analyst is the right career for you',
      questionCount: 12,
      estimatedTime: '5-7 minutes',
      icon: 'chart-bar',
    },
    {
      id: 'ds',
      name: 'Data Scientist/AI Engineer Fit Test',
      description: 'Find out if Data Science or AI Engineering matches your profile',
      questionCount: 12,
      estimatedTime: '5-7 minutes',
      icon: 'brain',
    },
    {
      id: 'de',
      name: 'Data Engineer Fit Test',
      description: 'Evaluate your suitability for a Data Engineering career',
      questionCount: 12,
      estimatedTime: '5-7 minutes',
      icon: 'database',
    },
  ];
};

const getQuestions = async (role) => {
  if (!VALID_ROLES.includes(role)) {
    throw new AppError('Invalid role. Must be da, ds, or de', 400, 'INVALID_ROLE');
  }

  const result = await query(
    `SELECT
      cq.id,
      cq.serial_no,
      cq.question_text,
      cq.category,
      cq.option_type,
      json_agg(
        json_build_object(
          'id', cqo.id,
          'text', cqo.option_text,
          'order', cqo.option_order
        ) ORDER BY cqo.option_order
      ) as options
    FROM career_questions cq
    JOIN career_question_options cqo ON cq.id = cqo.question_id
    WHERE cq.is_active = true
    GROUP BY cq.id, cq.serial_no, cq.question_text, cq.category, cq.option_type
    ORDER BY cq.serial_no`,
    []
  );

  return {
    role,
    totalQuestions: result.rows.length,
    questions: result.rows.map((q) => ({
      id: q.id,
      serialNo: q.serial_no,
      questionText: q.question_text,
      category: q.category,
      optionType: q.option_type,
      options: q.options,
    })),
  };
};

const submitTest = async (userId, role, answers) => {
  if (!VALID_ROLES.includes(role)) {
    throw new AppError('Invalid role. Must be da, ds, or de', 400, 'INVALID_ROLE');
  }

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    throw new AppError('Answers are required', 400, 'ANSWERS_REQUIRED');
  }

  // Calculate scores using the scoring service
  const scoreResult = await scoringService.calculateCareerScore(role, answers);

  // Save the attempt
  const attemptId = uuidv4();
  await query(
    `INSERT INTO career_test_attempts
      (id, user_id, role_tested, answers, raw_weighted_score, suitability_percentage, percentile_rank, completed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
    [
      attemptId,
      userId,
      role,
      JSON.stringify(answers),
      scoreResult.rawWeightedScore,
      scoreResult.suitabilityPercentage,
      scoreResult.percentileRank,
    ]
  );

  // Award XP for completing the test
  await gamificationService.awardXp(userId, 'career_test_complete');

  // Check if user has completed all 3 tests for bonus
  await gamificationService.checkAllCareerTestsBonus(userId);

  // Check for achievement badges
  await gamificationService.checkCareerTestBadges(userId, role, scoreResult.suitabilityPercentage);

  return {
    attemptId,
    role,
    suitabilityPercentage: scoreResult.suitabilityPercentage,
    percentileRank: scoreResult.percentileRank,
    level: scoreResult.level,
    breakdown: scoreResult.breakdown,
    recommendation: getRecommendation(role, scoreResult.suitabilityPercentage),
  };
};

const getResults = async (userId, attemptId) => {
  const result = await query(
    `SELECT
      id, role_tested, answers, raw_weighted_score,
      suitability_percentage, percentile_rank, completed_at
     FROM career_test_attempts
     WHERE id = $1 AND user_id = $2`,
    [attemptId, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Test attempt not found', 404, 'ATTEMPT_NOT_FOUND');
  }

  const attempt = result.rows[0];
  const level = getSuitabilityLevel(attempt.suitability_percentage);

  return {
    attemptId: attempt.id,
    role: attempt.role_tested,
    suitabilityPercentage: attempt.suitability_percentage,
    percentileRank: attempt.percentile_rank,
    level,
    completedAt: attempt.completed_at,
    recommendation: getRecommendation(attempt.role_tested, attempt.suitability_percentage),
  };
};

const compareScores = async (userId) => {
  const result = await query(
    `SELECT DISTINCT ON (role_tested)
      role_tested, suitability_percentage, percentile_rank, completed_at
     FROM career_test_attempts
     WHERE user_id = $1
     ORDER BY role_tested, completed_at DESC`,
    [userId]
  );

  const scores = {
    da: null,
    ds: null,
    de: null,
  };

  result.rows.forEach((row) => {
    scores[row.role_tested] = {
      suitabilityPercentage: row.suitability_percentage,
      percentileRank: row.percentile_rank,
      completedAt: row.completed_at,
      level: getSuitabilityLevel(row.suitability_percentage),
    };
  });

  // Determine best fit
  const completedRoles = Object.entries(scores).filter(([_, data]) => data !== null);
  let bestFit = null;

  if (completedRoles.length > 0) {
    const [role, data] = completedRoles.reduce((best, current) =>
      current[1].suitabilityPercentage > best[1].suitabilityPercentage ? current : best
    );
    bestFit = { role, ...data };
  }

  return {
    scores,
    bestFit,
    completedCount: completedRoles.length,
  };
};

const getHistory = async (userId) => {
  const result = await query(
    `SELECT
      id, role_tested, suitability_percentage, percentile_rank, completed_at
     FROM career_test_attempts
     WHERE user_id = $1
     ORDER BY completed_at DESC
     LIMIT 50`,
    [userId]
  );

  return result.rows.map((row) => ({
    attemptId: row.id,
    role: row.role_tested,
    suitabilityPercentage: row.suitability_percentage,
    percentileRank: row.percentile_rank,
    level: getSuitabilityLevel(row.suitability_percentage),
    completedAt: row.completed_at,
  }));
};

// Helper functions
const getSuitabilityLevel = (percentage) => {
  if (percentage >= 85) return { level: 'Excellent Fit', message: 'This role is highly suited for you!' };
  if (percentage >= 70) return { level: 'Good Fit', message: 'This role could be a great match.' };
  if (percentage >= 50) return { level: 'Moderate Fit', message: 'You have some alignment. May need skill development.' };
  if (percentage >= 30) return { level: 'Partial Fit', message: 'Consider other roles or significant skill development.' };
  return { level: 'Low Fit', message: 'This role may not be the best match.' };
};

const getRecommendation = (role, percentage) => {
  const recommendations = {
    da: {
      course: 'Data Analytics Bootcamp 5.0',
      url: 'https://codebasics.io/bootcamps/data-analytics',
    },
    ds: {
      course: 'Data Science Bootcamp',
      url: 'https://codebasics.io/bootcamps/data-science',
    },
    de: {
      course: 'Data Engineering Bootcamp',
      url: 'https://codebasics.io/bootcamps/data-engineering',
    },
  };

  return recommendations[role] || null;
};

module.exports = {
  getAllTests,
  getQuestions,
  submitTest,
  getResults,
  compareScores,
  getHistory,
};
