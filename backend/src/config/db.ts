// backend/src/config/db.ts
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("🔗 Attempting MongoDB connection...");

    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI environment variable is not set!");
      process.exit(1);
    }

    // Hide password in logs
    const safeUri = process.env.MONGO_URI.replace(
      /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
      "mongodb+srv://$1:****@"
    );
    console.log(`Connecting to: ${safeUri}`);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: "majority",
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    return conn;
  } catch (error: any) {
    console.error("❌ MongoDB Connection Failed:", error.message);

    if (error.name === "MongooseServerSelectionError") {
      console.error("🔍 Possible issues:");
      console.error("1. MONGO_URI is wrong or missing in Render");
      console.error("2. MongoDB Atlas IP whitelist (add 0.0.0.0/0)");
      console.error("3. Database user permissions");
    }

    process.exit(1);
  }
};

export default connectDB;
