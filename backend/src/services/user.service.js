const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');
const config = require('../config');
const gamificationService = require('./gamification.service');

const getProfile = async (userId) => {
  const result = await query(
    `SELECT id, email, name, profile_image, total_xp, current_streak,
            longest_streak, level, last_active_date, created_at
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const user = result.rows[0];
  const levelInfo = getLevelInfo(user.total_xp);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    profileImage: user.profile_image,
    totalXp: user.total_xp,
    currentStreak: user.current_streak,
    longestStreak: user.longest_streak,
    level: levelInfo.level,
    levelTitle: levelInfo.title,
    xpToNextLevel: levelInfo.xpToNextLevel,
    lastActiveDate: user.last_active_date,
    createdAt: user.created_at,
  };
};

const updateProfile = async (userId, { name, profileImage, bio }) => {
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(name);
  }

  if (profileImage !== undefined) {
    updates.push(`profile_image = $${paramCount++}`);
    values.push(profileImage);
  }

  if (updates.length === 0) {
    throw new AppError('No fields to update', 400, 'NO_FIELDS');
  }

  updates.push(`updated_at = NOW()`);
  values.push(userId);

  const result = await query(
    `UPDATE users SET ${updates.join(', ')}
     WHERE id = $${paramCount}
     RETURNING id, email, name, profile_image, total_xp, level`,
    values
  );

  return result.rows[0];
};

const getStats = async (userId) => {
  // Get career test stats
  const careerStats = await query(
    `SELECT
      COUNT(*) as total_attempts,
      COUNT(DISTINCT role_tested) as roles_tested,
      MAX(suitability_percentage) as best_score
     FROM career_test_attempts
     WHERE user_id = $1`,
    [userId]
  );

  // Get skill test stats
  const skillStats = await query(
    `SELECT
      COUNT(*) as total_attempts,
      MAX(score_percentage) as best_score
     FROM skill_test_attempts
     WHERE user_id = $1`,
    [userId]
  );

  // Get user's XP and streak info
  const userResult = await query(
    `SELECT total_xp, current_streak, longest_streak, level
     FROM users WHERE id = $1`,
    [userId]
  );

  // Get badge count
  const badgeCount = await query(
    `SELECT COUNT(*) as count FROM user_badges WHERE user_id = $1`,
    [userId]
  );

  // Get share count
  const shareCount = await query(
    `SELECT COUNT(*) as count FROM user_activity_log
     WHERE user_id = $1 AND activity_type = 'social_share'`,
    [userId]
  );

  const user = userResult.rows[0];
  const career = careerStats.rows[0];
  const skill = skillStats.rows[0];

  return {
    totalXp: user.total_xp,
    currentStreak: user.current_streak,
    longestStreak: user.longest_streak,
    level: user.level,
    badgesEarned: parseInt(badgeCount.rows[0].count, 10),
    careerTestsCompleted: parseInt(career.total_attempts, 10),
    rolesExplored: parseInt(career.roles_tested, 10),
    bestCareerScore: career.best_score,
    skillTestsCompleted: parseInt(skill.total_attempts, 10),
    bestSkillScore: skill.best_score,
    totalShares: parseInt(shareCount.rows[0].count, 10),
  };
};

const getBadges = async (userId) => {
  // Get all badges with earned status
  const result = await query(
    `SELECT
      b.id, b.name, b.description, b.icon_url, b.criteria,
      ub.earned_at IS NOT NULL as is_earned,
      ub.earned_at
     FROM badges b
     LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = $1
     ORDER BY ub.earned_at DESC NULLS LAST, b.name`,
    [userId]
  );

  return result.rows.map((badge) => ({
    id: badge.id,
    name: badge.name,
    description: badge.description,
    iconUrl: badge.icon_url,
    criteria: badge.criteria,
    isEarned: badge.is_earned,
    earnedAt: badge.earned_at,
  }));
};

const recordActivity = async (userId) => {
  const today = new Date().toISOString().split('T')[0];

  // Get user's last active date
  const userResult = await query(
    `SELECT last_active_date, current_streak, longest_streak
     FROM users WHERE id = $1`,
    [userId]
  );

  const user = userResult.rows[0];
  const lastActive = user.last_active_date;

  let newStreak = user.current_streak;
  let xpAwarded = 0;

  if (!lastActive || lastActive.toISOString().split('T')[0] !== today) {
    // Check if last active was yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActive && lastActive.toISOString().split('T')[0] === yesterdayStr) {
      // Continue streak
      newStreak = user.current_streak + 1;
    } else if (!lastActive || lastActive.toISOString().split('T')[0] !== today) {
      // Reset streak (more than 1 day gap)
      newStreak = 1;
    }

    const newLongestStreak = Math.max(newStreak, user.longest_streak);

    // Update user
    await query(
      `UPDATE users SET
        last_active_date = $1,
        current_streak = $2,
        longest_streak = $3,
        updated_at = NOW()
       WHERE id = $4`,
      [today, newStreak, newLongestStreak, userId]
    );

    // Award daily login XP
    xpAwarded = await gamificationService.awardXp(userId, 'daily_login');

    // Check streak milestones
    if (newStreak === 7) {
      await gamificationService.awardXp(userId, 'streak_7_days');
      await gamificationService.awardBadge(userId, 'streak_starter');
    } else if (newStreak === 30) {
      await gamificationService.awardXp(userId, 'streak_30_days');
      await gamificationService.awardBadge(userId, 'streak_master');
    }
  }

  return {
    currentStreak: newStreak,
    xpAwarded,
    isNewDay: xpAwarded > 0,
  };
};

const getStreak = async (userId) => {
  const result = await query(
    `SELECT current_streak, longest_streak, last_active_date
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const user = result.rows[0];

  return {
    currentStreak: user.current_streak,
    longestStreak: user.longest_streak,
    lastActiveDate: user.last_active_date,
  };
};

/**
 * Record a social share event
 * @param {string} userId - User ID
 * @param {Object} shareData - Share details { platform, contentType, contentId }
 */
const recordShare = async (userId, { platform, contentType, contentId }) => {
  const validPlatforms = ['linkedin', 'twitter', 'facebook', 'whatsapp', 'other'];
  const validContentTypes = ['career_test_result', 'skill_test_result', 'badge', 'profile'];

  if (!validPlatforms.includes(platform)) {
    throw new AppError('Invalid platform', 400, 'INVALID_PLATFORM');
  }

  if (!validContentTypes.includes(contentType)) {
    throw new AppError('Invalid content type', 400, 'INVALID_CONTENT_TYPE');
  }

  // Log the share event
  await query(
    `INSERT INTO user_activity_log (id, user_id, activity_type, metadata)
     VALUES ($1, $2, 'social_share', $3)`,
    [uuidv4(), userId, JSON.stringify({ platform, contentType, contentId })]
  );

  // Award XP for sharing
  const xpAwarded = await gamificationService.awardXp(userId, 'social_share');

  // Check for Social Butterfly badge (5 shares)
  const shareCount = await query(
    `SELECT COUNT(*) as count FROM user_activity_log
     WHERE user_id = $1 AND activity_type = 'social_share'`,
    [userId]
  );

  if (parseInt(shareCount.rows[0].count, 10) >= 5) {
    await gamificationService.awardBadge(userId, 'social_butterfly');
  }

  return {
    xpAwarded,
    message: 'Share recorded successfully',
  };
};

/**
 * Get user's share history
 */
const getShareHistory = async (userId) => {
  const result = await query(
    `SELECT metadata, created_at
     FROM user_activity_log
     WHERE user_id = $1 AND activity_type = 'social_share'
     ORDER BY created_at DESC
     LIMIT 50`,
    [userId]
  );

  return result.rows.map((row) => ({
    platform: row.metadata.platform,
    contentType: row.metadata.contentType,
    contentId: row.metadata.contentId,
    sharedAt: row.created_at,
  }));
};

// Helper function to get level info
const getLevelInfo = (totalXp) => {
  const levels = config.levels;
  let currentLevel = levels[0];

  for (const level of levels) {
    if (totalXp >= level.minXp) {
      currentLevel = level;
    } else {
      break;
    }
  }

  // Calculate XP to next level
  const nextLevel = levels.find((l) => l.level === currentLevel.level + 1);
  const xpToNextLevel = nextLevel ? nextLevel.minXp - totalXp : 0;

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    xpToNextLevel,
  };
};

module.exports = {
  getProfile,
  updateProfile,
  getStats,
  getBadges,
  recordActivity,
  getStreak,
  recordShare,
  getShareHistory,
};
