import mongoose from 'mongoose';
import env from './env.js';
import logger from '../helpers/logger.js';

const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(env.MONGODB_URI);

    logger.info(`MongoDB Connected: ${connection.connection.host}`);

    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDatabase;