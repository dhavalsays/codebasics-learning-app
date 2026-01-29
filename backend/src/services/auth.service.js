const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const { query, transaction } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  const refreshToken = jwt.sign({ userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

  return { accessToken, refreshToken };
};

const register = async ({ email, password, name }) => {
  // Check if user exists
  const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    throw new AppError('Email already registered', 400, 'EMAIL_EXISTS');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user
  const userId = uuidv4();
  const result = await query(
    `INSERT INTO users (id, email, password_hash, name, auth_provider)
     VALUES ($1, $2, $3, $4, 'email')
     RETURNING id, email, name, profile_image, total_xp, level, created_at`,
    [userId, email, passwordHash, name]
  );

  const user = result.rows[0];
  const tokens = generateTokens(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      profileImage: user.profile_image,
      totalXp: user.total_xp,
      level: user.level,
    },
    ...tokens,
  };
};

const login = async ({ email, password }) => {
  const result = await query(
    `SELECT id, email, name, password_hash, profile_image, total_xp, level
     FROM users WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const user = result.rows[0];

  if (!user.password_hash) {
    throw new AppError('Please use social login for this account', 401, 'SOCIAL_LOGIN_REQUIRED');
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const tokens = generateTokens(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      profileImage: user.profile_image,
      totalXp: user.total_xp,
      level: user.level,
    },
    ...tokens,
  };
};

const googleAuth = async (idToken) => {
  // TODO: Verify Google ID token with Firebase Admin SDK
  // For now, this is a placeholder
  throw new AppError('Google authentication not yet implemented', 501, 'NOT_IMPLEMENTED');
};

const linkedinAuth = async (accessToken) => {
  // TODO: Verify LinkedIn access token
  throw new AppError('LinkedIn authentication not yet implemented', 501, 'NOT_IMPLEMENTED');
};

const appleAuth = async (identityToken, user) => {
  // TODO: Verify Apple identity token
  throw new AppError('Apple authentication not yet implemented', 501, 'NOT_IMPLEMENTED');
};

const forgotPassword = async (email) => {
  const result = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    // Don't reveal if email exists
    return;
  }

  // TODO: Generate reset token and send email
  throw new AppError('Password reset not yet implemented', 501, 'NOT_IMPLEMENTED');
};

const resetPassword = async (token, newPassword) => {
  // TODO: Verify reset token and update password
  throw new AppError('Password reset not yet implemented', 501, 'NOT_IMPLEMENTED');
};

const refreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret);
    const tokens = generateTokens(decoded.userId);
    return tokens;
  } catch (error) {
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }
};

const logout = async (userId) => {
  // TODO: Invalidate refresh token if using token blacklist
  return true;
};

const deleteAccount = async (userId) => {
  await transaction(async (client) => {
    // Delete user badges
    await client.query('DELETE FROM user_badges WHERE user_id = $1', [userId]);

    // Delete test attempts
    await client.query('DELETE FROM career_test_attempts WHERE user_id = $1', [userId]);

    // Delete leaderboard entries
    await client.query('DELETE FROM leaderboard_weekly WHERE user_id = $1', [userId]);

    // Delete user
    await client.query('DELETE FROM users WHERE id = $1', [userId]);
  });

  return true;
};

module.exports = {
  register,
  login,
  googleAuth,
  linkedinAuth,
  appleAuth,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  deleteAccount,
};
