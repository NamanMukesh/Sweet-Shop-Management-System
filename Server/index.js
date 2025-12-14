import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./DB/index.js";
import { authRoutes, sweetRoutes } from "./Routes/index.js";

dotenv.config({
  path: `.env`,
});

const app = express();
const PORT = process.env.PORT || 5000;


connectDB().catch((error) => {
  console.error("Failed to connect to database:", error);
  process.exit(1);
});


app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sweets", sweetRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Sweet Shop Management System API is running",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.error("Error:", err);
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
});
