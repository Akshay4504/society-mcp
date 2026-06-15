import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/society_maintenance_db';

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB successfully connected to: ${mongoUri.split('@').pop()}`);
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error);
    process.exit(1);
  }
};
