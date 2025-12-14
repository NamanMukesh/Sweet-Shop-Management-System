import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
    console.log(
      `\n MongoDB connected!! DB Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("❌ Error in DB Connection:", error.message);
    throw error;
  }
};

export default connectDB;