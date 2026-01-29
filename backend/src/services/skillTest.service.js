const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');
const gamificationService = require('./gamification.service');

/**
 * Get all available skill tests with user's best score
 */
const getAllTests = async (userId = null) => {
  let result;

  if (userId) {
    // Include user's best score for each test
    result = await query(
      `SELECT
        st.id, st.title, st.description, st.category,
        st.total_questions, st.passing_score,
        MAX(sta.score_percentage) as best_score,
        COUNT(sta.id) as attempt_count
       FROM skill_tests st
       LEFT JOIN skill_test_attempts sta ON st.id = sta.test_id AND sta.user_id = $1
       WHERE st.is_active = true
       GROUP BY st.id
       ORDER BY st.category, st.title`,
      [userId]
    );
  } else {
    result = await query(
      `SELECT id, title, description, category, total_questions, passing_score
       FROM skill_tests
       WHERE is_active = true
       ORDER BY category, title`,
      []
    );
  }

  return result.rows.map((test) => ({
    id: test.id,
    title: test.title,
    description: test.description,
    category: test.category,
    totalQuestions: test.total_questions,
    passingScore: test.passing_score,
    bestScore: test.best_score ? parseInt(test.best_score, 10) : null,
    attemptCount: test.attempt_count ? parseInt(test.attempt_count, 10) : 0,
  }));
};

/**
 * Get test details by ID
 */
const getTestById = async (testId) => {
  const result = await query(
    `SELECT id, title, description, category, total_questions, passing_score
     FROM skill_tests WHERE id = $1 AND is_active = true`,
    [testId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Test not found', 404, 'TEST_NOT_FOUND');
  }

  const test = result.rows[0];
  return {
    id: test.id,
    title: test.title,
    description: test.description,
    category: test.category,
    totalQuestions: test.total_questions,
    passingScore: test.passing_score,
  };
};

/**
 * Get random questions for a skill test
 */
const getQuestions = async (testId) => {
  const test = await getTestById(testId);

  // Get random questions for the test
  const questionsResult = await query(
    `SELECT id, question_text, option_a, option_b, option_c, option_d, topic, difficulty
     FROM skill_questions
     WHERE test_id = $1 AND is_active = true
     ORDER BY RANDOM()
     LIMIT $2`,
    [testId, test.totalQuestions]
  );

  return {
    testId: test.id,
    title: test.title,
    passingScore: test.passingScore,
    totalQuestions: questionsResult.rows.length,
    questions: questionsResult.rows.map((q) => ({
      id: q.id,
      questionText: q.question_text,
      options: [
        { key: 'a', text: q.option_a },
        { key: 'b', text: q.option_b },
        { key: 'c', text: q.option_c },
        { key: 'd', text: q.option_d },
      ],
      topic: q.topic,
      difficulty: q.difficulty,
    })),
  };
};

/**
 * Submit skill test and save attempt
 */
const submitTest = async (userId, testId, answers) => {
  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    throw new AppError('Answers are required', 400, 'ANSWERS_REQUIRED');
  }

  // Verify test exists
  const test = await getTestById(testId);

  // Get correct answers for submitted questions
  const questionIds = answers.map((a) => a.questionId);
  const correctAnswersResult = await query(
    `SELECT id, correct_answer, explanation, topic
     FROM skill_questions
     WHERE id = ANY($1)`,
    [questionIds]
  );

  const correctAnswersMap = {};
  correctAnswersResult.rows.forEach((row) => {
    correctAnswersMap[row.id] = {
      correctAnswer: row.correct_answer,
      explanation: row.explanation,
      topic: row.topic,
    };
  });

  // Calculate score and build results
  let correctCount = 0;
  const topicScores = {};
  const results = answers.map((answer) => {
    const correct = correctAnswersMap[answer.questionId];
    const isCorrect = correct && answer.answer.toLowerCase() === correct.correctAnswer.toLowerCase();
    if (isCorrect) correctCount++;

    // Track topic scores
    if (correct?.topic) {
      if (!topicScores[correct.topic]) {
        topicScores[correct.topic] = { correct: 0, total: 0 };
      }
      topicScores[correct.topic].total++;
      if (isCorrect) topicScores[correct.topic].correct++;
    }

    return {
      questionId: answer.questionId,
      userAnswer: answer.answer,
      correctAnswer: correct?.correctAnswer || null,
      isCorrect,
      explanation: correct?.explanation || null,
    };
  });

  const totalQuestions = answers.length;
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
  const isPassing = scorePercentage >= test.passingScore;

  // Save attempt to database
  const attemptId = uuidv4();
  await query(
    `INSERT INTO skill_test_attempts
      (id, user_id, test_id, answers, score_percentage, correct_count, total_questions)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [attemptId, userId, testId, JSON.stringify(answers), scorePercentage, correctCount, totalQuestions]
  );

  // Award XP for completing test
  await gamificationService.awardXp(userId, 'skill_test_complete');

  // Award XP for each correct answer
  for (let i = 0; i < correctCount; i++) {
    await gamificationService.awardXp(userId, 'correct_answer');
  }

  // Perfect score bonus
  if (scorePercentage === 100) {
    await gamificationService.awardXp(userId, 'perfect_score');
  }

  // Check for skill badges
  await gamificationService.checkSkillTestBadges(userId, testId, scorePercentage);

  // Calculate topic breakdown
  const topicBreakdown = Object.entries(topicScores).map(([topic, scores]) => ({
    topic,
    correct: scores.correct,
    total: scores.total,
    percentage: Math.round((scores.correct / scores.total) * 100),
  }));

  return {
    attemptId,
    testId,
    testTitle: test.title,
    totalQuestions,
    correctCount,
    scorePercentage,
    passingScore: test.passingScore,
    isPassing,
    topicBreakdown,
    results,
  };
};

/**
 * Get user's test history
 */
const getTestHistory = async (userId, testId = null) => {
  let sql = `
    SELECT
      sta.id as attempt_id,
      sta.test_id,
      st.title as test_title,
      st.category,
      sta.score_percentage,
      sta.correct_count,
      sta.total_questions,
      st.passing_score,
      sta.completed_at
    FROM skill_test_attempts sta
    JOIN skill_tests st ON sta.test_id = st.id
    WHERE sta.user_id = $1
  `;
  const params = [userId];

  if (testId) {
    sql += ` AND sta.test_id = $2`;
    params.push(testId);
  }

  sql += ` ORDER BY sta.completed_at DESC LIMIT 50`;

  const result = await query(sql, params);

  return result.rows.map((row) => ({
    attemptId: row.attempt_id,
    testId: row.test_id,
    testTitle: row.test_title,
    category: row.category,
    scorePercentage: row.score_percentage,
    correctCount: row.correct_count,
    totalQuestions: row.total_questions,
    isPassing: row.score_percentage >= row.passing_score,
    completedAt: row.completed_at,
  }));
};

/**
 * Get attempt details with answers
 */
const getAttemptDetails = async (userId, attemptId) => {
  const result = await query(
    `SELECT
      sta.id, sta.test_id, sta.answers, sta.score_percentage,
      sta.correct_count, sta.total_questions, sta.completed_at,
      st.title as test_title, st.passing_score
     FROM skill_test_attempts sta
     JOIN skill_tests st ON sta.test_id = st.id
     WHERE sta.id = $1 AND sta.user_id = $2`,
    [attemptId, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Attempt not found', 404, 'ATTEMPT_NOT_FOUND');
  }

  const attempt = result.rows[0];
  const answers = attempt.answers;

  // Get question details for review
  const questionIds = answers.map((a) => a.questionId);
  const questionsResult = await query(
    `SELECT id, question_text, option_a, option_b, option_c, option_d,
            correct_answer, explanation, topic, difficulty
     FROM skill_questions
     WHERE id = ANY($1)`,
    [questionIds]
  );

  const questionsMap = {};
  questionsResult.rows.forEach((q) => {
    questionsMap[q.id] = q;
  });

  const reviewItems = answers.map((answer) => {
    const q = questionsMap[answer.questionId];
    const isCorrect = q && answer.answer.toLowerCase() === q.correct_answer.toLowerCase();

    return {
      questionId: answer.questionId,
      questionText: q?.question_text,
      options: q ? [
        { key: 'a', text: q.option_a },
        { key: 'b', text: q.option_b },
        { key: 'c', text: q.option_c },
        { key: 'd', text: q.option_d },
      ] : [],
      userAnswer: answer.answer,
      correctAnswer: q?.correct_answer,
      isCorrect,
      explanation: q?.explanation,
      topic: q?.topic,
      difficulty: q?.difficulty,
    };
  });

  return {
    attemptId: attempt.id,
    testId: attempt.test_id,
    testTitle: attempt.test_title,
    scorePercentage: attempt.score_percentage,
    correctCount: attempt.correct_count,
    totalQuestions: attempt.total_questions,
    isPassing: attempt.score_percentage >= attempt.passing_score,
    completedAt: attempt.completed_at,
    review: reviewItems,
  };
};

/**
 * Get available topics for practice
 */
const getTopics = async () => {
  const result = await query(
    `SELECT DISTINCT topic, COUNT(*) as question_count
     FROM skill_questions
     WHERE is_active = true AND topic IS NOT NULL
     GROUP BY topic
     ORDER BY topic`,
    []
  );

  return result.rows.map((row) => ({
    topic: row.topic,
    questionCount: parseInt(row.question_count, 10),
  }));
};

/**
 * Get practice questions by topic
 */
const getPracticeQuestions = async (topic, limit = 10, difficulty = null) => {
  let sql = `
    SELECT id, question_text, option_a, option_b, option_c, option_d, difficulty, topic
    FROM skill_questions
    WHERE is_active = true AND topic ILIKE $1
  `;
  const params = [`%${topic}%`];

  if (difficulty) {
    sql += ` AND difficulty = $${params.length + 1}`;
    params.push(difficulty);
  }

  sql += ` ORDER BY RANDOM() LIMIT $${params.length + 1}`;
  params.push(limit);

  const result = await query(sql, params);

  return result.rows.map((q) => ({
    id: q.id,
    questionText: q.question_text,
    options: [
      { key: 'a', text: q.option_a },
      { key: 'b', text: q.option_b },
      { key: 'c', text: q.option_c },
      { key: 'd', text: q.option_d },
    ],
    difficulty: q.difficulty,
    topic: q.topic,
  }));
};

/**
 * Submit practice answer and get immediate feedback
 */
const submitPracticeAnswer = async (userId, questionId, answer) => {
  const result = await query(
    `SELECT correct_answer, explanation, topic
     FROM skill_questions
     WHERE id = $1`,
    [questionId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Question not found', 404, 'QUESTION_NOT_FOUND');
  }

  const { correct_answer, explanation, topic } = result.rows[0];
  const isCorrect = answer.toLowerCase() === correct_answer.toLowerCase();

  // Award XP for correct practice answer
  if (isCorrect) {
    await gamificationService.awardXp(userId, 'practice_correct');
  }

  // Log activity for analytics
  await query(
    `INSERT INTO user_activity_log (id, user_id, activity_type, metadata)
     VALUES ($1, $2, 'practice_answer', $3)`,
    [uuidv4(), userId, JSON.stringify({ questionId, isCorrect, topic })]
  );

  return {
    isCorrect,
    correctAnswer: correct_answer,
    explanation,
  };
};

/**
 * Get user's practice stats
 */
const getPracticeStats = async (userId) => {
  const result = await query(
    `SELECT
      COUNT(*) as total_attempts,
      COUNT(*) FILTER (WHERE (metadata->>'isCorrect')::boolean = true) as correct_count
     FROM user_activity_log
     WHERE user_id = $1 AND activity_type = 'practice_answer'`,
    [userId]
  );

  const stats = result.rows[0];
  const totalAttempts = parseInt(stats.total_attempts, 10) || 0;
  const correctCount = parseInt(stats.correct_count, 10) || 0;

  return {
    totalAttempts,
    correctCount,
    accuracy: totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0,
  };
};

module.exports = {
  getAllTests,
  getTestById,
  getQuestions,
  submitTest,
  getTestHistory,
  getAttemptDetails,
  getTopics,
  getPracticeQuestions,
  submitPracticeAnswer,
  getPracticeStats,
};
