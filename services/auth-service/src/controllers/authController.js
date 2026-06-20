const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const logger = require('../config/logger');

async function register(req, res) {
  try {
    const result = await authService.register(req.validatedBody);
    return successResponse(res, result, 'Account created successfully! Welcome to DocBridge.', 201);
  } catch (error) {
    logger.error('Registration error:', { message: error.message, stack: error.stack, errors: error.errors });
    return errorResponse(res, error.message, error.statusCode || 500, error.errors);
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.validatedBody;
    const meta = {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    };
    const result = await authService.login(email, password, meta);
    return successResponse(res, result, 'Welcome back!');
  } catch (error) {
    logger.error('Login error:', { message: error.message, stack: error.stack, errors: error.errors });
    return errorResponse(res, error.message, error.statusCode || 500, error.errors);
  }
}

async function logout(req, res) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.logout(refreshToken);
    return successResponse(res, result, 'Logged out successfully.');
  } catch (error) {
    logger.error('Logout error:', { message: error.message });
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

async function refreshToken(req, res) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return errorResponse(res, 'Refresh token is required.', 400);
    }
    const result = await authService.refreshAccessToken(token);
    return successResponse(res, result, 'Token refreshed successfully.');
  } catch (error) {
    logger.error('Refresh token error:', { message: error.message });
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

async function getMe(req, res) {
  try {
    const user = await authService.getProfile(req.user.userId);
    return successResponse(res, user, 'Profile retrieved.');
  } catch (error) {
    logger.error('Get profile error:', { message: error.message });
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

async function updateProfile(req, res) {
  try {
    const user = await authService.updateProfile(req.user.userId, req.validatedBody);
    return successResponse(res, user, 'Profile updated successfully.');
  } catch (error) {
    logger.error('Update profile error:', { message: error.message });
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.validatedBody;
    const result = await authService.changePassword(req.user.userId, currentPassword, newPassword);
    return successResponse(res, result, 'Password changed successfully. All other sessions have been logged out.');
  } catch (error) {
    logger.error('Change password error:', { message: error.message });
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

module.exports = { register, login, logout, refreshToken, getMe, updateProfile, changePassword };
