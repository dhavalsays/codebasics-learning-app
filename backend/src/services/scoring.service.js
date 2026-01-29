const { query } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Scoring Service for Career Suitability Tests
 *
 * ALGORITHM (from PRD Section 5.4):
 *
 * Step 1: Calculate Weighted Score
 *   Weighted_Score = Σ (Question_Score × Role_Weight)
 *
 * Step 2: Calculate Maximum Possible Score
 *   Max_Score = Σ (Max_Question_Score × Role_Weight)
 *
 * Step 3: Calculate Suitability Percentage
 *   Suitability_% = (Weighted_Score / Max_Score) × 100
 *
 * Step 4: Handle Negative Scores (Normalized)
 *   Normalized_% = ((Weighted_Score - Min_Score) / (Max_Score - Min_Score)) × 100
 *
 * All 3 career tests (DA, DS, DE) use the SAME 12 questions but apply
 * DIFFERENT role-specific weights to calculate suitability percentages.
 */

const VALID_ROLES = ['da', 'ds', 'de'];

const ROLE_NAMES = {
  da: 'Data Analyst',
  ds: 'Data Scientist / AI Engineer',
  de: 'Data Engineer',
};

/**
 * Calculate career suitability score for a specific role
 * @param {string} role - 'da', 'ds', or 'de'
 * @param {Array} answers - Array of { question_id, option_id }
 * @returns {Object} Score result with suitability percentage, percentile rank, etc.
 */
const calculateCareerScore = async (role, answers) => {
  if (!VALID_ROLES.includes(role)) {
    throw new AppError('Invalid role. Must be da, ds, or de', 400, 'INVALID_ROLE');
  }

  // Get question IDs from answers
  const questionIds = answers.map((a) => a.question_id);

  // Fetch all question data: options with scores, and role-specific weights
  const questionsResult = await query(
    `SELECT
      cq.id as question_id,
      cq.serial_no,
      cq.category,
      cqo.id as option_id,
      cqo.score as option_score,
      crw.weight as role_weight
     FROM career_questions cq
     JOIN career_question_options cqo ON cq.id = cqo.question_id
     JOIN career_role_weights crw ON cq.id = crw.question_id
     WHERE cq.id = ANY($1) AND crw.role = $2 AND cq.is_active = true`,
    [questionIds, role]
  );

  if (questionsResult.rows.length === 0) {
    throw new AppError('Questions not found', 404, 'QUESTIONS_NOT_FOUND');
  }

  // Build lookup maps for weights and option scores
  const questionWeights = {};
  const optionScores = {};
  const questionCategories = {};
  const questionMinMax = {};

  questionsResult.rows.forEach((row) => {
    const qId = row.question_id;
    questionWeights[qId] = parseFloat(row.role_weight);
    optionScores[row.option_id] = parseInt(row.option_score, 10);
    questionCategories[qId] = row.category;

    // Track min/max scores per question
    if (!questionMinMax[qId]) {
      questionMinMax[qId] = { min: row.option_score, max: row.option_score };
    } else {
      questionMinMax[qId].min = Math.min(questionMinMax[qId].min, row.option_score);
      questionMinMax[qId].max = Math.max(questionMinMax[qId].max, row.option_score);
    }
  });

  // Calculate weighted score and track min/max possible
  let totalWeightedScore = 0;
  let maxPossibleScore = 0;
  let minPossibleScore = 0;

  // Category breakdown tracking
  const categoryScores = {};
  const categoryMaxScores = {};
  const categoryMinScores = {};

  // Process each answer
  answers.forEach((answer) => {
    const questionId = answer.question_id;
    const optionId = answer.option_id;
    const weight = questionWeights[questionId];
    const score = optionScores[optionId];
    const category = questionCategories[questionId];
    const minMax = questionMinMax[questionId];

    if (weight === undefined || score === undefined || !minMax) {
      return; // Skip invalid answers
    }

    // Calculate weighted contribution for this answer
    const weightedScore = score * weight;
    totalWeightedScore += weightedScore;

    // Calculate max/min possible weighted scores
    const maxWeighted = minMax.max * weight;
    const minWeighted = minMax.min * weight;
    maxPossibleScore += maxWeighted;
    minPossibleScore += minWeighted;

    // Track category breakdowns
    if (!categoryScores[category]) {
      categoryScores[category] = 0;
      categoryMaxScores[category] = 0;
      categoryMinScores[category] = 0;
    }
    categoryScores[category] += weightedScore;
    categoryMaxScores[category] += maxWeighted;
    categoryMinScores[category] += minWeighted;
  });

  // Calculate normalized suitability percentage (handles potential negative scores)
  let suitabilityPercentage;
  const scoreRange = maxPossibleScore - minPossibleScore;

  if (scoreRange === 0) {
    suitabilityPercentage = 50; // Default if no range
  } else {
    // Normalized percentage formula from PRD Step 4
    suitabilityPercentage = Math.round(
      ((totalWeightedScore - minPossibleScore) / scoreRange) * 100
    );
  }

  // Clamp between 0 and 100
  suitabilityPercentage = Math.max(0, Math.min(100, suitabilityPercentage));

  // Calculate category breakdown percentages
  const breakdown = {};
  Object.keys(categoryScores).forEach((category) => {
    const catRange = categoryMaxScores[category] - categoryMinScores[category];
    let catPercent;

    if (catRange === 0) {
      catPercent = 50;
    } else {
      catPercent = Math.round(
        ((categoryScores[category] - categoryMinScores[category]) / catRange) * 100
      );
    }

    breakdown[category] = Math.max(0, Math.min(100, catPercent));
  });

  // Calculate percentile rank against all previous attempts for this role
  const percentileRank = await calculatePercentileRank(role, suitabilityPercentage);

  // Determine suitability level based on percentage
  const level = getSuitabilityLevel(suitabilityPercentage);

  return {
    role,
    roleName: ROLE_NAMES[role],
    rawWeightedScore: Math.round(totalWeightedScore * 1000) / 1000,
    maxPossibleScore: Math.round(maxPossibleScore * 1000) / 1000,
    minPossibleScore: Math.round(minPossibleScore * 1000) / 1000,
    suitabilityPercentage,
    percentileRank,
    level,
    breakdown,
  };
};

/**
 * Calculate scores for all three roles at once
 * Used for comparison feature
 * @param {Array} answers - Array of { question_id, option_id }
 * @returns {Object} Scores for all three roles
 */
const calculateAllRoleScores = async (answers) => {
  const questionIds = answers.map((a) => a.question_id);

  // Fetch all data for all roles at once
  const questionsResult = await query(
    `SELECT
      cq.id as question_id,
      cq.serial_no,
      cq.category,
      cqo.id as option_id,
      cqo.score as option_score,
      crw.role,
      crw.weight as role_weight
     FROM career_questions cq
     JOIN career_question_options cqo ON cq.id = cqo.question_id
     JOIN career_role_weights crw ON cq.id = crw.question_id
     WHERE cq.id = ANY($1) AND cq.is_active = true`,
    [questionIds]
  );

  // Organize data by role
  const roleData = { da: {}, ds: {}, de: {} };
  const optionScores = {};
  const questionMinMax = {};

  questionsResult.rows.forEach((row) => {
    const qId = row.question_id;
    optionScores[row.option_id] = parseInt(row.option_score, 10);

    // Track min/max scores per question
    if (!questionMinMax[qId]) {
      questionMinMax[qId] = { min: row.option_score, max: row.option_score };
    } else {
      questionMinMax[qId].min = Math.min(questionMinMax[qId].min, row.option_score);
      questionMinMax[qId].max = Math.max(questionMinMax[qId].max, row.option_score);
    }

    // Store weight by role and question
    if (!roleData[row.role][qId]) {
      roleData[row.role][qId] = parseFloat(row.role_weight);
    }
  });

  // Calculate scores for each role
  const results = {};

  for (const role of VALID_ROLES) {
    let totalWeightedScore = 0;
    let maxPossibleScore = 0;
    let minPossibleScore = 0;

    answers.forEach((answer) => {
      const weight = roleData[role][answer.question_id];
      const score = optionScores[answer.option_id];
      const minMax = questionMinMax[answer.question_id];

      if (weight === undefined || score === undefined || !minMax) return;

      totalWeightedScore += score * weight;
      maxPossibleScore += minMax.max * weight;
      minPossibleScore += minMax.min * weight;
    });

    const scoreRange = maxPossibleScore - minPossibleScore;
    let suitabilityPercentage;

    if (scoreRange === 0) {
      suitabilityPercentage = 50;
    } else {
      suitabilityPercentage = Math.round(
        ((totalWeightedScore - minPossibleScore) / scoreRange) * 100
      );
    }

    suitabilityPercentage = Math.max(0, Math.min(100, suitabilityPercentage));

    results[role] = {
      role,
      roleName: ROLE_NAMES[role],
      suitabilityPercentage,
      level: getSuitabilityLevel(suitabilityPercentage),
    };
  }

  // Determine best fit
  const sortedRoles = Object.values(results).sort(
    (a, b) => b.suitabilityPercentage - a.suitabilityPercentage
  );

  return {
    scores: results,
    bestFit: sortedRoles[0],
    ranking: sortedRoles.map((r) => r.role),
  };
};

/**
 * Calculate percentile rank for a score among all attempts
 * @param {string} role - The role being tested
 * @param {number} score - The suitability percentage
 * @returns {number} Percentile rank (1-99)
 */
const calculatePercentileRank = async (role, score) => {
  const result = await query(
    `SELECT
      COUNT(*) FILTER (WHERE suitability_percentage < $1) as lower_count,
      COUNT(*) as total_count
     FROM career_test_attempts
     WHERE role_tested = $2`,
    [score, role]
  );

  const { lower_count, total_count } = result.rows[0];
  const total = parseInt(total_count, 10);

  if (total === 0) {
    return 50; // Default for first attempt
  }

  const lowerCount = parseInt(lower_count, 10);
  const percentile = Math.round((lowerCount / total) * 100);

  // Clamp between 1 and 99
  return Math.max(1, Math.min(99, percentile));
};

/**
 * Get suitability level based on percentage
 * Based on PRD Section 5.5 Result Interpretation
 * @param {number} percentage - Suitability percentage
 * @returns {Object} Level info with message and color
 */
const getSuitabilityLevel = (percentage) => {
  if (percentage >= 85) {
    return {
      level: 'Excellent Fit',
      message: 'This role is highly suited for you!',
      color: 'green',
      code: 'EXCELLENT',
    };
  }
  if (percentage >= 70) {
    return {
      level: 'Good Fit',
      message: 'This role could be a great match.',
      color: 'green',
      code: 'GOOD',
    };
  }
  if (percentage >= 50) {
    return {
      level: 'Moderate Fit',
      message: 'You have some alignment. May need skill development.',
      color: 'yellow',
      code: 'MODERATE',
    };
  }
  if (percentage >= 30) {
    return {
      level: 'Partial Fit',
      message: 'Consider other roles or significant skill development.',
      color: 'orange',
      code: 'PARTIAL',
    };
  }
  return {
    level: 'Low Fit',
    message: 'This role may not be the best match.',
    color: 'red',
    code: 'LOW',
  };
};

/**
 * Get the score range (min/max possible) for a role
 * Useful for displaying score context
 * @param {string} role - The role
 * @returns {Object} Min and max possible scores
 */
const getScoreRange = async (role) => {
  const result = await query(
    `SELECT
      SUM(max_score * crw.weight) as max_possible,
      SUM(min_score * crw.weight) as min_possible
     FROM (
       SELECT
         cq.id as question_id,
         MAX(cqo.score) as max_score,
         MIN(cqo.score) as min_score
       FROM career_questions cq
       JOIN career_question_options cqo ON cq.id = cqo.question_id
       WHERE cq.is_active = true
       GROUP BY cq.id
     ) q
     JOIN career_role_weights crw ON q.question_id = crw.question_id
     WHERE crw.role = $1`,
    [role]
  );

  return {
    role,
    maxPossible: parseFloat(result.rows[0]?.max_possible || 0),
    minPossible: parseFloat(result.rows[0]?.min_possible || 0),
  };
};

/**
 * Get role-specific weights for all questions
 * Useful for debugging and admin panel
 * @param {string} role - The role
 * @returns {Array} Questions with weights
 */
const getRoleWeights = async (role) => {
  if (!VALID_ROLES.includes(role)) {
    throw new AppError('Invalid role', 400, 'INVALID_ROLE');
  }

  const result = await query(
    `SELECT
      cq.serial_no,
      cq.question_text,
      cq.category,
      crw.weight
     FROM career_questions cq
     JOIN career_role_weights crw ON cq.id = crw.question_id
     WHERE crw.role = $1 AND cq.is_active = true
     ORDER BY cq.serial_no`,
    [role]
  );

  return result.rows.map((row) => ({
    serialNo: row.serial_no,
    questionText: row.question_text,
    category: row.category,
    weight: parseFloat(row.weight),
  }));
};

module.exports = {
  calculateCareerScore,
  calculateAllRoleScores,
  calculatePercentileRank,
  getSuitabilityLevel,
  getScoreRange,
  getRoleWeights,
  VALID_ROLES,
  ROLE_NAMES,
};
