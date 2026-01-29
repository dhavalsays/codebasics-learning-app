const authService = require('../services/auth.service');
const { AppError } = require('../middlewares/errorHandler');

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const result = await authService.register({ email, password, name });
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    const result = await authService.googleAuth(idToken);
    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const linkedinAuth = async (req, res, next) => {
  try {
    const { accessToken } = req.body;
    const result = await authService.linkedinAuth(accessToken);
    res.status(200).json({
      success: true,
      message: 'LinkedIn authentication successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const appleAuth = async (req, res, next) => {
  try {
    const { identityToken, user } = req.body;
    const result = await authService.appleAuth(identityToken, user);
    res.status(200).json({
      success: true,
      message: 'Apple authentication successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    await authService.deleteAccount(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
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
