const skillTestService = require('../services/skillTest.service');

const getAllTests = async (req, res, next) => {
  try {
    const tests = await skillTestService.getAllTests();
    res.status(200).json({
      success: true,
      data: tests,
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

const getPracticeQuestions = async (req, res, next) => {
  try {
    const { topic } = req.params;
    const { limit = 10 } = req.query;
    const questions = await skillTestService.getPracticeQuestions(topic, parseInt(limit, 10));
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

module.exports = {
  getAllTests,
  getQuestions,
  submitTest,
  getPracticeQuestions,
  submitPracticeAnswer,
};
