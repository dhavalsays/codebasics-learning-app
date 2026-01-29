const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const { query, transaction } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Generate JWT access and refresh tokens
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  const refreshToken = jwt.sign({ userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

  return { accessToken, refreshToken };
};

/**
 * Format user object for API response
 */
const formatUserResponse = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  profileImage: user.profile_image,
  totalXp: user.total_xp || 0,
  level: user.level || 1,
  currentStreak: user.current_streak || 0,
});

/**
 * Find or create user from OAuth provider
 */
const findOrCreateOAuthUser = async ({ email, name, profileImage, provider, providerId }) => {
  // Check if user exists with this provider ID
  let result = await query(
    `SELECT id, email, name, profile_image, total_xp, level, current_streak
     FROM users WHERE auth_provider = $1 AND auth_provider_id = $2`,
    [provider, providerId]
  );

  if (result.rows.length > 0) {
    // User exists, update last login info
    const user = result.rows[0];
    await query(
      `UPDATE users SET updated_at = NOW() WHERE id = $1`,
      [user.id]
    );
    return user;
  }

  // Check if email already exists with different provider
  result = await query(
    `SELECT id, email, name, profile_image, total_xp, level, current_streak, auth_provider
     FROM users WHERE email = $1`,
    [email]
  );

  if (result.rows.length > 0) {
    const existingUser = result.rows[0];
    // Link this OAuth provider to existing account
    await query(
      `UPDATE users SET
        auth_provider = $1,
        auth_provider_id = $2,
        profile_image = COALESCE(profile_image, $3),
        updated_at = NOW()
       WHERE id = $4`,
      [provider, providerId, profileImage, existingUser.id]
    );
    return { ...existingUser, profile_image: profileImage || existingUser.profile_image };
  }

  // Create new user
  const userId = uuidv4();
  const insertResult = await query(
    `INSERT INTO users (id, email, name, profile_image, auth_provider, auth_provider_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, email, name, profile_image, total_xp, level, current_streak`,
    [userId, email, name, profileImage, provider, providerId]
  );

  return insertResult.rows[0];
};

/**
 * Register with email and password
 */
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
     RETURNING id, email, name, profile_image, total_xp, level, current_streak, created_at`,
    [userId, email, passwordHash, name]
  );

  const user = result.rows[0];
  const tokens = generateTokens(user.id);

  return {
    user: formatUserResponse(user),
    ...tokens,
  };
};

/**
 * Login with email and password
 */
const login = async ({ email, password }) => {
  const result = await query(
    `SELECT id, email, name, password_hash, profile_image, total_xp, level, current_streak
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
    user: formatUserResponse(user),
    ...tokens,
  };
};

/**
 * Google OAuth authentication
 * Verifies Google ID token and creates/finds user
 *
 * The mobile app should use @react-native-google-signin/google-signin
 * and send the idToken to this endpoint
 */
const googleAuth = async (idToken) => {
  if (!idToken) {
    throw new AppError('Google ID token is required', 400, 'TOKEN_REQUIRED');
  }

  try {
    // Verify the Google ID token
    // In production, use Google's tokeninfo endpoint or google-auth-library
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );

    if (!response.ok) {
      throw new AppError('Invalid Google token', 401, 'INVALID_TOKEN');
    }

    const payload = await response.json();

    // Verify the token is for our app
    if (config.oauth.google.clientId && payload.aud !== config.oauth.google.clientId) {
      throw new AppError('Token not intended for this app', 401, 'INVALID_AUDIENCE');
    }

    // Extract user info
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      throw new AppError('Email not provided by Google', 400, 'EMAIL_REQUIRED');
    }

    // Find or create user
    const user = await findOrCreateOAuthUser({
      email,
      name: name || email.split('@')[0],
      profileImage: picture,
      provider: 'google',
      providerId: googleId,
    });

    const tokens = generateTokens(user.id);

    return {
      user: formatUserResponse(user),
      ...tokens,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Google authentication failed', 401, 'GOOGLE_AUTH_FAILED');
  }
};

/**
 * LinkedIn OAuth authentication
 * Requires access token from LinkedIn OAuth flow
 *
 * The mobile app should complete OAuth flow and send accessToken
 */
const linkedinAuth = async (accessToken) => {
  if (!accessToken) {
    throw new AppError('LinkedIn access token is required', 400, 'TOKEN_REQUIRED');
  }

  try {
    // Fetch user profile from LinkedIn
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!profileResponse.ok) {
      throw new AppError('Invalid LinkedIn token', 401, 'INVALID_TOKEN');
    }

    const profile = await profileResponse.json();

    const { sub: linkedinId, email, name, picture } = profile;

    if (!email) {
      throw new AppError('Email not provided by LinkedIn', 400, 'EMAIL_REQUIRED');
    }

    // Find or create user
    const user = await findOrCreateOAuthUser({
      email,
      name: name || email.split('@')[0],
      profileImage: picture,
      provider: 'linkedin',
      providerId: linkedinId,
    });

    const tokens = generateTokens(user.id);

    return {
      user: formatUserResponse(user),
      ...tokens,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('LinkedIn authentication failed', 401, 'LINKEDIN_AUTH_FAILED');
  }
};

/**
 * Apple Sign-In authentication
 * Verifies Apple identity token
 *
 * The mobile app should use @invertase/react-native-apple-authentication
 * and send identityToken and user info
 */
const appleAuth = async (identityToken, userInfo) => {
  if (!identityToken) {
    throw new AppError('Apple identity token is required', 400, 'TOKEN_REQUIRED');
  }

  try {
    // Decode the JWT (Apple identity token is a JWT)
    // In production, verify signature using Apple's public keys
    const parts = identityToken.split('.');
    if (parts.length !== 3) {
      throw new AppError('Invalid Apple token format', 401, 'INVALID_TOKEN');
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    // Verify issuer and audience
    if (payload.iss !== 'https://appleid.apple.com') {
      throw new AppError('Invalid token issuer', 401, 'INVALID_ISSUER');
    }

    if (config.oauth.apple.clientId && payload.aud !== config.oauth.apple.clientId) {
      throw new AppError('Token not intended for this app', 401, 'INVALID_AUDIENCE');
    }

    // Check token expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      throw new AppError('Token has expired', 401, 'TOKEN_EXPIRED');
    }

    const appleId = payload.sub;
    const email = payload.email || userInfo?.email;

    if (!email) {
      throw new AppError('Email not provided by Apple', 400, 'EMAIL_REQUIRED');
    }

    // Apple only provides name on first sign-in
    const name = userInfo?.name
      ? `${userInfo.name.firstName || ''} ${userInfo.name.lastName || ''}`.trim()
      : email.split('@')[0];

    // Find or create user
    const user = await findOrCreateOAuthUser({
      email,
      name,
      profileImage: null, // Apple doesn't provide profile image
      provider: 'apple',
      providerId: appleId,
    });

    const tokens = generateTokens(user.id);

    return {
      user: formatUserResponse(user),
      ...tokens,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Apple authentication failed', 401, 'APPLE_AUTH_FAILED');
  }
};

/**
 * Request password reset
 * Generates a reset token and stores it (would send email in production)
 */
const forgotPassword = async (email) => {
  const result = await query(
    'SELECT id, email, name FROM users WHERE email = $1 AND password_hash IS NOT NULL',
    [email]
  );

  // Always return success to prevent email enumeration
  if (result.rows.length === 0) {
    return { message: 'If an account exists, a reset email will be sent' };
  }

  const user = result.rows[0];

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Store reset token in database
  await query(
    `UPDATE users SET
      reset_token = $1,
      reset_token_expires = $2,
      updated_at = NOW()
     WHERE id = $3`,
    [resetTokenHash, resetTokenExpiry, user.id]
  );

  // In production, send email with reset link
  // For now, return the token (remove in production!)
  console.log(`Password reset token for ${email}: ${resetToken}`);

  return {
    message: 'If an account exists, a reset email will be sent',
    // Remove this in production - only for testing
    ...(config.env === 'development' && { resetToken }),
  };
};

/**
 * Reset password using token
 */
const resetPassword = async (token, newPassword) => {
  if (!token || !newPassword) {
    throw new AppError('Token and new password are required', 400, 'MISSING_FIELDS');
  }

  // Hash the provided token to compare with stored hash
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with valid reset token
  const result = await query(
    `SELECT id FROM users
     WHERE reset_token = $1 AND reset_token_expires > NOW()`,
    [tokenHash]
  );

  if (result.rows.length === 0) {
    throw new AppError('Invalid or expired reset token', 400, 'INVALID_TOKEN');
  }

  const userId = result.rows[0].id;

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 12);

  // Update password and clear reset token
  await query(
    `UPDATE users SET
      password_hash = $1,
      reset_token = NULL,
      reset_token_expires = NULL,
      updated_at = NOW()
     WHERE id = $2`,
    [passwordHash, userId]
  );

  return { message: 'Password reset successful' };
};

/**
 * Refresh access token using refresh token
 */
const refreshToken = async (token) => {
  if (!token) {
    throw new AppError('Refresh token is required', 400, 'TOKEN_REQUIRED');
  }

  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret);

    // Verify user still exists
    const result = await query('SELECT id FROM users WHERE id = $1', [decoded.userId]);
    if (result.rows.length === 0) {
      throw new AppError('User not found', 401, 'USER_NOT_FOUND');
    }

    const tokens = generateTokens(decoded.userId);
    return tokens;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }
};

/**
 * Logout user (invalidate tokens if using blacklist)
 */
const logout = async (userId) => {
  // Update last active timestamp
  await query(
    `UPDATE users SET updated_at = NOW() WHERE id = $1`,
    [userId]
  );

  // In production with Redis, you would blacklist the token here
  return { message: 'Logout successful' };
};

/**
 * Delete user account (GDPR compliant)
 */
const deleteAccount = async (userId) => {
  await transaction(async (client) => {
    // Delete user's activity log
    await client.query('DELETE FROM user_activity_log WHERE user_id = $1', [userId]);

    // Delete user badges
    await client.query('DELETE FROM user_badges WHERE user_id = $1', [userId]);

    // Delete career test attempts
    await client.query('DELETE FROM career_test_attempts WHERE user_id = $1', [userId]);

    // Delete skill test attempts
    await client.query('DELETE FROM skill_test_attempts WHERE user_id = $1', [userId]);

    // Delete leaderboard entries
    await client.query('DELETE FROM leaderboard_weekly WHERE user_id = $1', [userId]);

    // Delete user
    await client.query('DELETE FROM users WHERE id = $1', [userId]);
  });

  return { message: 'Account deleted successfully' };
};

/**
 * Change password for authenticated user
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const result = await query(
    'SELECT password_hash FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const user = result.rows[0];

  if (!user.password_hash) {
    throw new AppError('Cannot change password for social login accounts', 400, 'SOCIAL_ACCOUNT');
  }

  const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValidPassword) {
    throw new AppError('Current password is incorrect', 401, 'INVALID_PASSWORD');
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await query(
    `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
    [passwordHash, userId]
  );

  return { message: 'Password changed successfully' };
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
  changePassword,
  generateTokens,
};
