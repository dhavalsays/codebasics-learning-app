const { query } = require('../config/database');

const getWeeklyLeaderboard = async (limit = 50, offset = 0, currentUserId = null) => {
  // Get the start of the current week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const result = await query(
    `SELECT
      u.id,
      u.name,
      u.profile_image,
      u.level,
      COALESCE(lw.total_xp, 0) as weekly_xp,
      RANK() OVER (ORDER BY COALESCE(lw.total_xp, 0) DESC) as rank
     FROM users u
     LEFT JOIN leaderboard_weekly lw ON u.id = lw.user_id AND lw.week_start = $1
     WHERE COALESCE(lw.total_xp, 0) > 0
     ORDER BY weekly_xp DESC, u.created_at ASC
     LIMIT $2 OFFSET $3`,
    [weekStartStr, limit, offset]
  );

  let currentUserRank = null;

  if (currentUserId) {
    const userRankResult = await query(
      `SELECT rank FROM (
        SELECT
          u.id,
          RANK() OVER (ORDER BY COALESCE(lw.total_xp, 0) DESC) as rank
        FROM users u
        LEFT JOIN leaderboard_weekly lw ON u.id = lw.user_id AND lw.week_start = $1
        WHERE COALESCE(lw.total_xp, 0) > 0
      ) ranked
      WHERE id = $2`,
      [weekStartStr, currentUserId]
    );

    if (userRankResult.rows.length > 0) {
      currentUserRank = parseInt(userRankResult.rows[0].rank, 10);
    }
  }

  return {
    weekStart: weekStartStr,
    leaderboard: result.rows.map((row) => ({
      userId: row.id,
      name: row.name,
      profileImage: row.profile_image,
      level: row.level,
      weeklyXp: parseInt(row.weekly_xp, 10),
      rank: parseInt(row.rank, 10),
      isCurrentUser: row.id === currentUserId,
    })),
    currentUserRank,
    totalCount: result.rows.length,
  };
};

const getAllTimeLeaderboard = async (limit = 50, offset = 0, currentUserId = null) => {
  const result = await query(
    `SELECT
      id,
      name,
      profile_image,
      level,
      total_xp,
      RANK() OVER (ORDER BY total_xp DESC) as rank
     FROM users
     WHERE total_xp > 0
     ORDER BY total_xp DESC, created_at ASC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  let currentUserRank = null;

  if (currentUserId) {
    const userRankResult = await query(
      `SELECT rank FROM (
        SELECT id, RANK() OVER (ORDER BY total_xp DESC) as rank
        FROM users
        WHERE total_xp > 0
      ) ranked
      WHERE id = $1`,
      [currentUserId]
    );

    if (userRankResult.rows.length > 0) {
      currentUserRank = parseInt(userRankResult.rows[0].rank, 10);
    }
  }

  return {
    leaderboard: result.rows.map((row) => ({
      userId: row.id,
      name: row.name,
      profileImage: row.profile_image,
      level: row.level,
      totalXp: parseInt(row.total_xp, 10),
      rank: parseInt(row.rank, 10),
      isCurrentUser: row.id === currentUserId,
    })),
    currentUserRank,
    totalCount: result.rows.length,
  };
};

const getUserRank = async (userId) => {
  // Get weekly rank
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const weeklyRankResult = await query(
    `SELECT rank, weekly_xp FROM (
      SELECT
        u.id,
        COALESCE(lw.total_xp, 0) as weekly_xp,
        RANK() OVER (ORDER BY COALESCE(lw.total_xp, 0) DESC) as rank
      FROM users u
      LEFT JOIN leaderboard_weekly lw ON u.id = lw.user_id AND lw.week_start = $1
    ) ranked
    WHERE id = $2`,
    [weekStartStr, userId]
  );

  // Get all-time rank
  const allTimeRankResult = await query(
    `SELECT rank, total_xp FROM (
      SELECT id, total_xp, RANK() OVER (ORDER BY total_xp DESC) as rank
      FROM users
    ) ranked
    WHERE id = $1`,
    [userId]
  );

  const weekly = weeklyRankResult.rows[0] || { rank: null, weekly_xp: 0 };
  const allTime = allTimeRankResult.rows[0] || { rank: null, total_xp: 0 };

  return {
    weekly: {
      rank: weekly.rank ? parseInt(weekly.rank, 10) : null,
      xp: parseInt(weekly.weekly_xp, 10),
    },
    allTime: {
      rank: allTime.rank ? parseInt(allTime.rank, 10) : null,
      xp: parseInt(allTime.total_xp, 10),
    },
  };
};

module.exports = {
  getWeeklyLeaderboard,
  getAllTimeLeaderboard,
  getUserRank,
};
