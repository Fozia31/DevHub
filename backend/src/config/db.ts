// backend/src/config/db.ts
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('🔗 Attempting MongoDB connection...');
    
    // Validate MONGO_URI exists
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI environment variable is not set!');
      console.error('Please set MONGO_URI in your Render environment variables');
      process.exit(1);
    }
    
    // Log first part of URI (without password) for debugging
    const safeUri = process.env.MONGO_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://$1:****@');
    console.log(`Connecting to: ${safeUri}`);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    return conn;
  } catch (error: any) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    console.error('Error details:', error);
    
    // More specific error messages
    if (error.name === 'MongooseServerSelectionError') {
      console.error('🔍 Possible issues:');
      console.error('1. Check if MONGO_URI is correct in Render environment variables');
      console.error('2. Check MongoDB Atlas IP whitelist (add 0.0.0.0/0)');
      console.error('3. Check if database user has proper permissions');
      console.error('4. Check network connectivity from Render to MongoDB Atlas');
    }
    
    process.exit(1);
  }
};

export default connectDB;