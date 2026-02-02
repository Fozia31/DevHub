import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// DB
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/v1/auth.routes.js";
import taskRoutes from "./routes/v1/task.routes.js";
import adminRoutes from "./routes/v1/admin.routes.js";

dotenv.config();

console.log("🔥 Server file loaded");

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

/* =========================
   1. Core Middleware
========================= */
app.use(express.json());
app.use(cookieParser());

/* =========================
   2. CORS (Vercel ↔ Render)
========================= */
const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? "https://dev-hub-lac-ten.vercel.app"
    : "http://localhost:3000";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight
app.options("*", cors({ origin: allowedOrigin, credentials: true }));

/* =========================
   3. Static Files & Routes
========================= */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoutes);

/* =========================
   4. Health Check
========================= */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/* =========================
   5. Start Server + DB
========================= */
const startServer = async () => {
  try {
    console.log("👉 DB URI exists?", !!process.env.MONGO_URI);

    await connectDB();

    const PORT = process.env.PORT;
    if (!PORT) throw new Error("PORT not defined");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
