import { create } from 'zustand';
import { careerTestAPI, skillTestAPI } from '../services/api';

const useTestStore = create((set, get) => ({
  // Career test state
  careerQuestions: [],
  careerAnswers: {},
  currentCareerRole: null,
  careerResult: null,
  careerComparison: null,
  careerHistory: [],

  // Skill test state
  skillTests: [],
  currentSkillTest: null,
  skillQuestions: [],
  skillAnswers: {},
  skillResult: null,
  skillHistory: [],

  // Practice state
  practiceTopics: [],
  practiceQuestions: [],
  practiceStats: null,

  // Loading states
  isLoading: false,
  error: null,

  // ==================
  // Career Test Actions
  // ==================

  fetchCareerQuestions: async (role) => {
    set({ isLoading: true, error: null, currentCareerRole: role });
    try {
      const response = await careerTestAPI.getQuestions(role);
      set({
        careerQuestions: response.data.data.questions,
        careerAnswers: {},
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load questions';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  setCareerAnswer: (questionId, optionId) => {
    const currentAnswers = get().careerAnswers;
    set({
      careerAnswers: {
        ...currentAnswers,
        [questionId]: optionId,
      },
    });
  },

  submitCareerTest: async () => {
    const { currentCareerRole, careerAnswers } = get();
    set({ isLoading: true, error: null });

    try {
      const answers = Object.entries(careerAnswers).map(([question_id, option_id]) => ({
        question_id,
        option_id,
      }));

      const response = await careerTestAPI.submitTest(currentCareerRole, answers);
      set({
        careerResult: response.data.data,
        isLoading: false,
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit test';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  fetchCareerComparison: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await careerTestAPI.compareScores();
      set({
        careerComparison: response.data.data,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load comparison';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  fetchCareerHistory: async () => {
    try {
      const response = await careerTestAPI.getHistory();
      set({ careerHistory: response.data.data });
    } catch (error) {
      console.error('Failed to fetch career history:', error);
    }
  },

  resetCareerTest: () => {
    set({
      careerQuestions: [],
      careerAnswers: {},
      currentCareerRole: null,
      careerResult: null,
    });
  },

  // ==================
  // Skill Test Actions
  // ==================

  fetchSkillTests: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await skillTestAPI.getAllTests();
      set({
        skillTests: response.data.data,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load tests';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  fetchSkillQuestions: async (testId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await skillTestAPI.getQuestions(testId);
      set({
        currentSkillTest: response.data.data,
        skillQuestions: response.data.data.questions,
        skillAnswers: {},
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load questions';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  setSkillAnswer: (questionId, answer) => {
    const currentAnswers = get().skillAnswers;
    set({
      skillAnswers: {
        ...currentAnswers,
        [questionId]: answer,
      },
    });
  },

  submitSkillTest: async () => {
    const { currentSkillTest, skillAnswers } = get();
    set({ isLoading: true, error: null });

    try {
      const answers = Object.entries(skillAnswers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      const response = await skillTestAPI.submitTest(currentSkillTest.testId, answers);
      set({
        skillResult: response.data.data,
        isLoading: false,
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit test';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  fetchSkillHistory: async () => {
    try {
      const response = await skillTestAPI.getHistory();
      set({ skillHistory: response.data.data });
    } catch (error) {
      console.error('Failed to fetch skill history:', error);
    }
  },

  resetSkillTest: () => {
    set({
      currentSkillTest: null,
      skillQuestions: [],
      skillAnswers: {},
      skillResult: null,
    });
  },

  // ==================
  // Practice Actions
  // ==================

  fetchPracticeTopics: async () => {
    try {
      const response = await skillTestAPI.getTopics();
      set({ practiceTopics: response.data.data });
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
  },

  fetchPracticeQuestions: async (topic, limit = 10, difficulty = null) => {
    set({ isLoading: true, error: null });
    try {
      const response = await skillTestAPI.getPracticeQuestions(topic, limit, difficulty);
      set({
        practiceQuestions: response.data.data,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load questions';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  submitPracticeAnswer: async (questionId, answer) => {
    try {
      const response = await skillTestAPI.submitPracticeAnswer(questionId, answer);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  fetchPracticeStats: async () => {
    try {
      const response = await skillTestAPI.getPracticeStats();
      set({ practiceStats: response.data.data });
    } catch (error) {
      console.error('Failed to fetch practice stats:', error);
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useTestStore;
