// backend/src/config/db.ts
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('🔗 Attempting MongoDB connection...');
    
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI is not set in environment variables!');
      console.error('Please add MONGO_URI to your Render environment variables');
      console.error('Format: mongodb+srv://username:password@cluster.mongodb.net/database');
      throw new Error('MONGO_URI not configured');
    }
    
    // Log safe version of URI (without password)
    const safeUri = process.env.MONGO_URI.replace(
      /mongodb\+srv:\/\/([^:]+):([^@]+)@/, 
      'mongodb+srv://$1:****@'
    );
    console.log(`Connecting to: ${safeUri}`);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
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
    
    if (error.name === 'MongooseServerSelectionError') {
      console.error('\n🔍 TROUBLESHOOTING:');
      console.error('1. Check MONGO_URI in Render → Environment → Environment Variables');
      console.error('2. Go to MongoDB Atlas → Network Access → Add IP 0.0.0.0/0');
      console.error('3. Check MongoDB Atlas → Database Access → User permissions');
      console.error('4. Verify the database name in MONGO_URI (after .net/)');
    }
    
    throw error; // Re-throw to be caught by startServer
  }
};

export default connectDB;