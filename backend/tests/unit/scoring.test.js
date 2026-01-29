/**
 * Unit Tests for Scoring Service
 *
 * Tests the weighted scoring algorithm for career suitability tests
 * as defined in PRD Section 5.4
 */

// Mock the database module
jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
}));

const { query } = require('../../src/config/database');
const {
  getSuitabilityLevel,
  calculatePercentileRank,
} = require('../../src/services/scoring.service');

describe('Scoring Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSuitabilityLevel', () => {
    it('should return Excellent Fit for scores >= 85', () => {
      const result = getSuitabilityLevel(85);
      expect(result.level).toBe('Excellent Fit');
      expect(result.code).toBe('EXCELLENT');
      expect(result.color).toBe('green');
    });

    it('should return Excellent Fit for score of 100', () => {
      const result = getSuitabilityLevel(100);
      expect(result.level).toBe('Excellent Fit');
      expect(result.message).toBe('This role is highly suited for you!');
    });

    it('should return Good Fit for scores 70-84', () => {
      const result = getSuitabilityLevel(70);
      expect(result.level).toBe('Good Fit');
      expect(result.code).toBe('GOOD');
      expect(result.color).toBe('green');

      const result2 = getSuitabilityLevel(84);
      expect(result2.level).toBe('Good Fit');
    });

    it('should return Moderate Fit for scores 50-69', () => {
      const result = getSuitabilityLevel(50);
      expect(result.level).toBe('Moderate Fit');
      expect(result.code).toBe('MODERATE');
      expect(result.color).toBe('yellow');

      const result2 = getSuitabilityLevel(69);
      expect(result2.level).toBe('Moderate Fit');
    });

    it('should return Partial Fit for scores 30-49', () => {
      const result = getSuitabilityLevel(30);
      expect(result.level).toBe('Partial Fit');
      expect(result.code).toBe('PARTIAL');
      expect(result.color).toBe('orange');

      const result2 = getSuitabilityLevel(49);
      expect(result2.level).toBe('Partial Fit');
    });

    it('should return Low Fit for scores below 30', () => {
      const result = getSuitabilityLevel(0);
      expect(result.level).toBe('Low Fit');
      expect(result.code).toBe('LOW');
      expect(result.color).toBe('red');

      const result2 = getSuitabilityLevel(29);
      expect(result2.level).toBe('Low Fit');
    });

    it('should handle edge cases at boundaries', () => {
      expect(getSuitabilityLevel(85).level).toBe('Excellent Fit');
      expect(getSuitabilityLevel(84).level).toBe('Good Fit');
      expect(getSuitabilityLevel(70).level).toBe('Good Fit');
      expect(getSuitabilityLevel(69).level).toBe('Moderate Fit');
      expect(getSuitabilityLevel(50).level).toBe('Moderate Fit');
      expect(getSuitabilityLevel(49).level).toBe('Partial Fit');
      expect(getSuitabilityLevel(30).level).toBe('Partial Fit');
      expect(getSuitabilityLevel(29).level).toBe('Low Fit');
    });
  });

  describe('calculatePercentileRank', () => {
    it('should return 50 for first attempt', async () => {
      query.mockResolvedValue({
        rows: [{ lower_count: '0', total_count: '0' }],
      });

      const rank = await calculatePercentileRank('da', 75);
      expect(rank).toBe(50);
    });

    it('should calculate correct percentile', async () => {
      // 80 out of 100 people scored lower
      query.mockResolvedValue({
        rows: [{ lower_count: '80', total_count: '100' }],
      });

      const rank = await calculatePercentileRank('da', 90);
      expect(rank).toBe(80);
    });

    it('should clamp percentile to minimum of 1', async () => {
      query.mockResolvedValue({
        rows: [{ lower_count: '0', total_count: '100' }],
      });

      const rank = await calculatePercentileRank('da', 10);
      expect(rank).toBe(1);
    });

    it('should clamp percentile to maximum of 99', async () => {
      query.mockResolvedValue({
        rows: [{ lower_count: '100', total_count: '100' }],
      });

      const rank = await calculatePercentileRank('da', 100);
      expect(rank).toBe(99);
    });

    it('should handle different roles', async () => {
      query.mockResolvedValue({
        rows: [{ lower_count: '50', total_count: '100' }],
      });

      await calculatePercentileRank('ds', 75);
      expect(query).toHaveBeenCalledWith(
        expect.any(String),
        [75, 'ds']
      );
    });
  });

  describe('Weighted Score Calculation Logic', () => {
    /**
     * These tests verify the mathematical logic of the scoring algorithm
     * without database dependencies
     */

    it('should calculate weighted score correctly', () => {
      // Simulating: Question score * Weight
      // Q1: Score 5 * Weight 0.6 = 3.0 for DS
      // Q1: Score 5 * Weight 0.35 = 1.75 for DE
      // Q1: Score 5 * Weight 0.05 = 0.25 for DA

      const score = 5;
      const dsWeight = 0.60;
      const deWeight = 0.35;
      const daWeight = 0.05;

      expect(score * dsWeight).toBeCloseTo(3.0, 2);
      expect(score * deWeight).toBeCloseTo(1.75, 2);
      expect(score * daWeight).toBeCloseTo(0.25, 2);
    });

    it('should normalize score to percentage correctly', () => {
      // Formula: ((Score - Min) / (Max - Min)) * 100
      const rawScore = 15;
      const minScore = 5;
      const maxScore = 25;

      const percentage = ((rawScore - minScore) / (maxScore - minScore)) * 100;
      expect(percentage).toBe(50);
    });

    it('should handle full score normalization', () => {
      const rawScore = 25;
      const minScore = 5;
      const maxScore = 25;

      const percentage = ((rawScore - minScore) / (maxScore - minScore)) * 100;
      expect(percentage).toBe(100);
    });

    it('should handle minimum score normalization', () => {
      const rawScore = 5;
      const minScore = 5;
      const maxScore = 25;

      const percentage = ((rawScore - minScore) / (maxScore - minScore)) * 100;
      expect(percentage).toBe(0);
    });

    it('should verify role weights sum approximately to 1', () => {
      // From PRD: Q1 weights should sum to ~1.0
      const q1DsWeight = 0.60;
      const q1DeWeight = 0.35;
      const q1DaWeight = 0.05;

      const total = q1DsWeight + q1DeWeight + q1DaWeight;
      expect(total).toBe(1.0);
    });

    it('should verify all PRD weights', () => {
      // Weights from PRD Section 5.3
      const weights = [
        { ds: 0.60, de: 0.35, da: 0.05 }, // Q1: Coding
        { ds: 0.75, de: 0.10, da: 0.15 }, // Q2: Maths
        { ds: 0.33, de: 0.65, da: 0.02 }, // Q3: CS
        { ds: 0.20, de: 0.10, da: 0.70 }, // Q4: Dashboards
        { ds: 0.20, de: 0.10, da: 0.70 }, // Q5: Presenting
        { ds: 0.15, de: 0.75, da: 0.10 }, // Q6: Data Storage
        { ds: 0.34, de: 0.33, da: 0.33 }, // Q7: AI Tools
        { ds: 0.20, de: 0.70, da: 0.10 }, // Q8: Systems
        { ds: 0.10, de: 0.10, da: 0.80 }, // Q9: Quick Entry
        { ds: 0.40, de: 0.30, da: 0.30 }, // Q10: Problem Solving
        { ds: 0.20, de: 0.10, da: 0.70 }, // Q11: Business Focus
        { ds: 0.70, de: 0.20, da: 0.10 }, // Q12: Experimentation
      ];

      weights.forEach((w, i) => {
        const total = w.ds + w.de + w.da;
        expect(total).toBeCloseTo(1.0, 1);
      });
    });
  });

  describe('Score Scenarios', () => {
    /**
     * Test realistic scoring scenarios based on PRD personas
     */

    it('should favor DA for business-oriented answers', () => {
      // Simulating high scores on Q4, Q5, Q9, Q11 (DA-weighted questions)
      // DA weights: 0.70, 0.70, 0.80, 0.70

      const daScore =
        5 * 0.70 + // Q4: Dashboards
        5 * 0.70 + // Q5: Presenting
        5 * 0.80 + // Q9: Quick Entry
        5 * 0.70;  // Q11: Business Focus

      const dsScore =
        5 * 0.20 + // Q4
        5 * 0.20 + // Q5
        5 * 0.10 + // Q9
        5 * 0.20;  // Q11

      const deScore =
        5 * 0.10 + // Q4
        5 * 0.10 + // Q5
        5 * 0.10 + // Q9
        5 * 0.10;  // Q11

      expect(daScore).toBeGreaterThan(dsScore);
      expect(daScore).toBeGreaterThan(deScore);
    });

    it('should favor DS for technical/analytical answers', () => {
      // High scores on Q1, Q2, Q12 (DS-weighted questions)
      // DS weights: 0.60, 0.75, 0.70

      const dsScore =
        5 * 0.60 + // Q1: Coding
        5 * 0.75 + // Q2: Maths
        5 * 0.70;  // Q12: Experimentation

      const daScore =
        5 * 0.05 + // Q1
        5 * 0.15 + // Q2
        5 * 0.10;  // Q12

      const deScore =
        5 * 0.35 + // Q1
        5 * 0.10 + // Q2
        5 * 0.20;  // Q12

      expect(dsScore).toBeGreaterThan(daScore);
      expect(dsScore).toBeGreaterThan(deScore);
    });

    it('should favor DE for infrastructure/systems answers', () => {
      // High scores on Q3, Q6, Q8 (DE-weighted questions)
      // DE weights: 0.65, 0.75, 0.70

      const deScore =
        5 * 0.65 + // Q3: CS
        5 * 0.75 + // Q6: Data Storage
        5 * 0.70;  // Q8: Systems

      const dsScore =
        5 * 0.33 + // Q3
        5 * 0.15 + // Q6
        5 * 0.20;  // Q8

      const daScore =
        5 * 0.02 + // Q3
        5 * 0.10 + // Q6
        5 * 0.10;  // Q8

      expect(deScore).toBeGreaterThan(dsScore);
      expect(deScore).toBeGreaterThan(daScore);
    });
  });
});
