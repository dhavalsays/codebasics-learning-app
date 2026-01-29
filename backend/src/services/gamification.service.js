const { v4: uuidv4 } = require('uuid');
const { query, transaction } = require('../config/database');
const config = require('../config');

/**
 * Gamification Service
 * Handles XP awards, badge assignments, streak tracking, and level calculations
 */

// XP action types mapping
const XP_ACTIONS = {
  career_test_complete: config.xp.careerTestComplete,
  all_career_tests_bonus: config.xp.allCareerTestsBonus,
  skill_test_complete: config.xp.skillTestComplete,
  correct_answer: config.xp.correctAnswer,
  perfect_score: config.xp.perfectScoreBonus,
  daily_login: config.xp.dailyLogin,
  practice_correct: config.xp.practiceCorrect,
  streak_7_days: config.xp.streak7Days,
  streak_30_days: config.xp.streak30Days,
  social_share: config.xp.socialShare,
};

const awardXp = async (userId, actionType) => {
  const xpAmount = XP_ACTIONS[actionType];

  if (!xpAmount) {
    console.warn(`Unknown XP action type: ${actionType}`);
    return 0;
  }

  // Update user's total XP
  const result = await query(
    `UPDATE users
     SET total_xp = total_xp + $1, updated_at = NOW()
     WHERE id = $2
     RETURNING total_xp`,
    [xpAmount, userId]
  );

  const newTotalXp = result.rows[0]?.total_xp || 0;

  // Update user level if needed
  await updateUserLevel(userId, newTotalXp);

  // Update weekly leaderboard
  await updateWeeklyLeaderboard(userId, xpAmount);

  return xpAmount;
};

const updateUserLevel = async (userId, totalXp) => {
  const levels = config.levels;
  let newLevel = 1;

  for (const level of levels) {
    if (totalXp >= level.minXp) {
      newLevel = level.level;
    } else {
      break;
    }
  }

  await query(
    `UPDATE users SET level = $1, updated_at = NOW() WHERE id = $2`,
    [newLevel, userId]
  );

  return newLevel;
};

const updateWeeklyLeaderboard = async (userId, xpAmount) => {
  // Get the start of the current week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  // Upsert weekly leaderboard entry
  await query(
    `INSERT INTO leaderboard_weekly (id, user_id, week_start, total_xp)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, week_start)
     DO UPDATE SET total_xp = leaderboard_weekly.total_xp + $4`,
    [uuidv4(), userId, weekStartStr, xpAmount]
  );
};

const awardBadge = async (userId, badgeSlug) => {
  // Get badge ID from slug/name
  const badgeResult = await query(
    `SELECT id FROM badges WHERE LOWER(REPLACE(name, ' ', '_')) = $1`,
    [badgeSlug.toLowerCase()]
  );

  if (badgeResult.rows.length === 0) {
    console.warn(`Badge not found: ${badgeSlug}`);
    return false;
  }

  const badgeId = badgeResult.rows[0].id;

  // Check if user already has this badge
  const existingBadge = await query(
    `SELECT id FROM user_badges WHERE user_id = $1 AND badge_id = $2`,
    [userId, badgeId]
  );

  if (existingBadge.rows.length > 0) {
    return false; // Already has badge
  }

  // Award badge
  await query(
    `INSERT INTO user_badges (id, user_id, badge_id, earned_at)
     VALUES ($1, $2, $3, NOW())`,
    [uuidv4(), userId, badgeId]
  );

  return true;
};

const checkAllCareerTestsBonus = async (userId) => {
  // Check if user has completed all 3 career tests
  const result = await query(
    `SELECT COUNT(DISTINCT role_tested) as roles_completed
     FROM career_test_attempts
     WHERE user_id = $1`,
    [userId]
  );

  const rolesCompleted = parseInt(result.rows[0]?.roles_completed || 0, 10);

  if (rolesCompleted >= 3) {
    // Award bonus XP
    await awardXp(userId, 'all_career_tests_bonus');

    // Award Path Finder badge
    await awardBadge(userId, 'path_finder');

    return true;
  }

  return false;
};

const checkCareerTestBadges = async (userId, role, score) => {
  // Career Explorer badge - first career test
  const attemptCount = await query(
    `SELECT COUNT(*) as count FROM career_test_attempts WHERE user_id = $1`,
    [userId]
  );

  if (parseInt(attemptCount.rows[0].count, 10) === 1) {
    await awardBadge(userId, 'career_explorer');
  }

  // Role-specific badges for 80%+ score
  if (score >= 80) {
    const badgeMap = {
      da: 'da_natural',
      ds: 'ds_prodigy',
      de: 'de_builder',
    };

    if (badgeMap[role]) {
      await awardBadge(userId, badgeMap[role]);
    }
  }

  // Perfect Match badge for 90%+ on any test
  if (score >= 90) {
    await awardBadge(userId, 'perfect_match');
  }
};

const checkSkillTestBadges = async (userId, testId, score) => {
  // Get test category
  const testResult = await query(
    `SELECT category FROM skill_tests WHERE id = $1`,
    [testId]
  );

  if (testResult.rows.length === 0) return;

  const category = testResult.rows[0].category?.toLowerCase();

  // Award category-specific badges for 80%+ score
  if (score >= 80) {
    if (category === 'python') {
      await awardBadge(userId, 'python_pioneer');
    } else if (category === 'sql') {
      await awardBadge(userId, 'sql_star');
    }
  }
};

const checkLeaderboardBadges = async (userId) => {
  // Get user's weekly rank
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const rankResult = await query(
    `SELECT rank FROM (
      SELECT
        user_id,
        RANK() OVER (ORDER BY total_xp DESC) as rank
      FROM leaderboard_weekly
      WHERE week_start = $1
    ) ranked
    WHERE user_id = $2`,
    [weekStartStr, userId]
  );

  if (rankResult.rows.length === 0) return;

  const rank = parseInt(rankResult.rows[0].rank, 10);

  if (rank === 1) {
    await awardBadge(userId, 'champion');
  } else if (rank <= 10) {
    await awardBadge(userId, 'top_10');
  }
};

const recordSocialShare = async (userId) => {
  // Award XP for sharing
  await awardXp(userId, 'social_share');

  // Check for Social Butterfly badge (5 shares)
  // This would require tracking share count - simplified for now
  return true;
};

module.exports = {
  awardXp,
  awardBadge,
  updateUserLevel,
  updateWeeklyLeaderboard,
  checkAllCareerTestsBonus,
  checkCareerTestBadges,
  checkSkillTestBadges,
  checkLeaderboardBadges,
  recordSocialShare,
};
