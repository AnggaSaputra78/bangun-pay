import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../config/env.js';

class TokenService {
  generateAccessToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRE,
      }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      env.JWT_REFRESH_SECRET,
      {
        expiresIn: env.JWT_REFRESH_EXPIRE,
      }
    );
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  generateTokenPair(user) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(
      refreshTokenExpiresAt.getDate() + parseInt(env.JWT_REFRESH_EXPIRE)
    );

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
    };
  }

  decodeToken(token) {
    return jwt.decode(token);
  }
}

export default new TokenService();