const { User, RefreshToken } = require('../models');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokenUtils');
const logger = require('../config/logger');

class AuthService {
  async register(data) {
    const existingUser = await User.findByEmail(data.email);
    if (existingUser) {
      const error = new Error('An account with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    const user = await User.create({
      email: data.email.toLowerCase(),
      password_hash: data.password,
      first_name: data.firstName,
      last_name: data.lastName,
      date_of_birth: data.dateOfBirth || null,
      gender: data.gender || null,
      phone: data.phone || null,
    });

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await RefreshToken.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    logger.info(`User registered: ${user.email}`);

    return {
      user: user.toSafeJSON(),
      accessToken,
      refreshToken,
    };
  }

  async login(email, password, meta = {}) {
    const user = await User.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    if (!user.is_active) {
      const error = new Error('Your account has been deactivated. Please contact support.');
      error.statusCode = 403;
      throw error;
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await RefreshToken.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ip_address: meta.ipAddress || null,
      user_agent: meta.userAgent || null,
    });

    await user.update({ last_login_at: new Date() });

    logger.info(`User logged in: ${user.email}`);

    return {
      user: user.toSafeJSON(),
      accessToken,
      refreshToken,
    };
  }

  async logout(refreshToken) {
    const storedToken = await RefreshToken.findOne({ where: { token: refreshToken } });
    if (storedToken) {
      await storedToken.update({ is_revoked: true });
      logger.info(`Refresh token revoked for user: ${storedToken.user_id}`);
    }
    return { message: 'Logged out successfully.' };
  }

  async refreshAccessToken(refreshTokenStr) {
    const storedToken = await RefreshToken.findValidToken(refreshTokenStr);
    if (!storedToken) {
      const error = new Error('Invalid or expired refresh token. Please login again.');
      error.statusCode = 401;
      throw error;
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshTokenStr);
    } catch (err) {
      await storedToken.update({ is_revoked: true });
      const error = new Error('Invalid refresh token. Please login again.');
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findByPk(decoded.userId);
    if (!user || !user.is_active) {
      await storedToken.update({ is_revoked: true });
      const error = new Error('User not found or deactivated.');
      error.statusCode = 401;
      throw error;
    }

    
    await storedToken.update({ is_revoked: true });

    
    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    await RefreshToken.create({
      user_id: user.id,
      token: newRefreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async getProfile(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return user.toSafeJSON();
  }

  async updateProfile(userId, data) {
    const user = await User.findByPk(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const updateFields = {};
    if (data.firstName !== undefined) updateFields.first_name = data.firstName;
    if (data.lastName !== undefined) updateFields.last_name = data.lastName;
    if (data.dateOfBirth !== undefined) updateFields.date_of_birth = data.dateOfBirth;
    if (data.gender !== undefined) updateFields.gender = data.gender;
    if (data.phone !== undefined) updateFields.phone = data.phone;
    if (data.bloodGroup !== undefined) updateFields.blood_group = data.bloodGroup;
    if (data.heightCm !== undefined) updateFields.height_cm = data.heightCm;
    if (data.weightKg !== undefined) updateFields.weight_kg = data.weightKg;
    if (data.knownAllergies !== undefined) updateFields.known_allergies = data.knownAllergies;
    if (data.chronicConditions !== undefined) updateFields.chronic_conditions = data.chronicConditions;
    if (data.emergencyContactName !== undefined) updateFields.emergency_contact_name = data.emergencyContactName;
    if (data.emergencyContactPhone !== undefined) updateFields.emergency_contact_phone = data.emergencyContactPhone;

    await user.update(updateFields);
    logger.info(`Profile updated for user: ${user.email}`);

    return user.toSafeJSON();
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const isValidPassword = await user.validatePassword(currentPassword);
    if (!isValidPassword) {
      const error = new Error('Current password is incorrect.');
      error.statusCode = 400;
      throw error;
    }

    await user.update({ password_hash: newPassword });

    
    await RefreshToken.update(
      { is_revoked: true },
      { where: { user_id: userId, is_revoked: false } }
    );

    logger.info(`Password changed for user: ${user.email}`);

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await RefreshToken.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { accessToken, refreshToken };
  }
}

module.exports = new AuthService();
