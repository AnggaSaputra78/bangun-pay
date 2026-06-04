import User from '../models/User.model.js';
import BaseRepository from './Base.repository.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await this.model
      .findOne({ email, deletedAt: null })
      .select('+password +refreshTokens');
  }

  async findById(id) {
    return await this.model.findById(id).where({ deletedAt: null });
  }

  async findByIdWithPassword(id) {
    return await this.model
      .findById(id)
      .where({ deletedAt: null })
      .select('+password +refreshTokens');
  }

  async updateLastLogin(id) {
    return await this.model.findByIdAndUpdate(id, {
      lastLogin: new Date(),
    });
  }

  async addRefreshToken(userId, token, expiresAt) {
    return await this.model.findByIdAndUpdate(
      userId,
      {
        $push: {
          refreshTokens: {
            token,
            expiresAt,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );
  }

  async removeRefreshToken(userId, token) {
    return await this.model.findByIdAndUpdate(
      userId,
      {
        $pull: {
          refreshTokens: { token },
        },
      },
      { new: true }
    );
  }

  async clearAllRefreshTokens(userId) {
    return await this.model.findByIdAndUpdate(
      userId,
      {
        $set: {
          refreshTokens: [],
        },
      },
      { new: true }
    );
  }

  async cleanExpiredRefreshTokens(userId) {
    return await this.model.findByIdAndUpdate(
      userId,
      {
        $pull: {
          refreshTokens: {
            expiresAt: { $lt: new Date() },
          },
        },
      },
      { new: true }
    );
  }
}

export default new UserRepository();