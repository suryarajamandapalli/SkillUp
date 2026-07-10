const mongoose = require('mongoose');

let useFallback = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.warn("WARNING: MONGO_URI is not defined in .env. Falling back to local in-memory database mock for evaluation.");
    useFallback = true;
    return { useFallback: true };
  }

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5s
    });
    console.log('MongoDB connected successfully.');
    return { useFallback: false };
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    console.warn("WARNING: Unable to connect to MongoDB. Falling back to local in-memory database mock for evaluation.");
    useFallback = true;
    return { useFallback: true };
  }
};

const isFallback = () => useFallback;

module.exports = { connectDB, isFallback };
