const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');
const gamificationService = require('./gamification.service');

const getAllTests = async () => {
  const result = await query(
    `SELECT id, title, description, category, total_questions, passing_score
     FROM skill_tests
     WHERE is_active = true
     ORDER BY category, title`,
    []
  );

  return result.rows.map((test) => ({
    id: test.id,
    title: test.title,
    description: test.description,
    category: test.category,
    totalQuestions: test.total_questions,
    passingScore: test.passing_score,
  }));
};

const getQuestions = async (testId) => {
  // Get test info
  const testResult = await query('SELECT * FROM skill_tests WHERE id = $1 AND is_active = true', [testId]);

  if (testResult.rows.length === 0) {
    throw new AppError('Test not found', 404, 'TEST_NOT_FOUND');
  }

  const test = testResult.rows[0];

  // Get random questions for the test
  const questionsResult = await query(
    `SELECT id, question_text, option_a, option_b, option_c, option_d, topic, difficulty
     FROM skill_questions
     WHERE test_id = $1 AND is_active = true
     ORDER BY RANDOM()
     LIMIT $2`,
    [testId, test.total_questions]
  );

  return {
    testId: test.id,
    title: test.title,
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

const submitTest = async (userId, testId, answers) => {
  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    throw new AppError('Answers are required', 400, 'ANSWERS_REQUIRED');
  }

  // Get correct answers for submitted questions
  const questionIds = answers.map((a) => a.questionId);
  const correctAnswersResult = await query(
    `SELECT id, correct_answer, explanation
     FROM skill_questions
     WHERE id = ANY($1)`,
    [questionIds]
  );

  const correctAnswersMap = {};
  correctAnswersResult.rows.forEach((row) => {
    correctAnswersMap[row.id] = {
      correctAnswer: row.correct_answer,
      explanation: row.explanation,
    };
  });

  // Calculate score
  let correctCount = 0;
  const results = answers.map((answer) => {
    const correct = correctAnswersMap[answer.questionId];
    const isCorrect = correct && answer.answer.toLowerCase() === correct.correctAnswer.toLowerCase();
    if (isCorrect) correctCount++;

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
  const isPassing = scorePercentage >= 70;

  // Award XP
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

  return {
    totalQuestions,
    correctCount,
    scorePercentage,
    isPassing,
    results,
  };
};

const getPracticeQuestions = async (topic, limit = 10) => {
  const result = await query(
    `SELECT id, question_text, option_a, option_b, option_c, option_d, difficulty
     FROM skill_questions
     WHERE topic ILIKE $1 AND is_active = true
     ORDER BY RANDOM()
     LIMIT $2`,
    [`%${topic}%`, limit]
  );

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
  }));
};

const submitPracticeAnswer = async (userId, questionId, answer) => {
  const result = await query(
    `SELECT correct_answer, explanation
     FROM skill_questions
     WHERE id = $1`,
    [questionId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Question not found', 404, 'QUESTION_NOT_FOUND');
  }

  const { correct_answer, explanation } = result.rows[0];
  const isCorrect = answer.toLowerCase() === correct_answer.toLowerCase();

  // Award XP for correct practice answer
  if (isCorrect) {
    await gamificationService.awardXp(userId, 'practice_correct');
  }

  return {
    isCorrect,
    correctAnswer: correct_answer,
    explanation,
  };
};

module.exports = {
  getAllTests,
  getQuestions,
  submitTest,
  getPracticeQuestions,
  submitPracticeAnswer,
};
