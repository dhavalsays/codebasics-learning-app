const skillTestService = require('../services/skillTest.service');

const getAllTests = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const tests = await skillTestService.getAllTests(userId);
    res.status(200).json({
      success: true,
      data: tests,
    });
  } catch (error) {
    next(error);
  }
};

const getTestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const test = await skillTestService.getTestById(id);
    res.status(200).json({
      success: true,
      data: test,
    });
  } catch (error) {
    next(error);
  }
};

const getQuestions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const questions = await skillTestService.getQuestions(id);
    res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

const submitTest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    const result = await skillTestService.submitTest(userId, id, answers);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getTestHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { testId } = req.query;
    const history = await skillTestService.getTestHistory(userId, testId);
    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

const getAttemptDetails = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;
    const details = await skillTestService.getAttemptDetails(userId, attemptId);
    res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    next(error);
  }
};

const getTopics = async (req, res, next) => {
  try {
    const topics = await skillTestService.getTopics();
    res.status(200).json({
      success: true,
      data: topics,
    });
  } catch (error) {
    next(error);
  }
};

const getPracticeQuestions = async (req, res, next) => {
  try {
    const { topic } = req.params;
    const { limit = 10, difficulty } = req.query;
    const questions = await skillTestService.getPracticeQuestions(
      topic,
      parseInt(limit, 10),
      difficulty
    );
    res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

const submitPracticeAnswer = async (req, res, next) => {
  try {
    const { questionId, answer } = req.body;
    const userId = req.user.id;

    const result = await skillTestService.submitPracticeAnswer(userId, questionId, answer);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getPracticeStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const stats = await skillTestService.getPracticeStats(userId);
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
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
