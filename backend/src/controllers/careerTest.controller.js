const careerTestService = require('../services/careerTest.service');

const getAllTests = async (req, res, next) => {
  try {
    const tests = await careerTestService.getAllTests();
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
    const { role } = req.params;
    const questions = await careerTestService.getQuestions(role);
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
    const { role } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    const result = await careerTestService.submitTest(userId, role, answers);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getResults = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const result = await careerTestService.getResults(userId, attemptId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const compareScores = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const comparison = await careerTestService.compareScores(userId);
    res.status(200).json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const history = await careerTestService.getHistory(userId);
    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTests,
  getQuestions,
  submitTest,
  getResults,
  compareScores,
  getHistory,
};
