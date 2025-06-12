import moongose from 'mongoose';

export const connectDB = async () => {
  try {
    const connection = await moongose.connect(process.env.DATABASE_URL);
    console.log('MongoDB connected successfully', connection.connection.host);
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};
