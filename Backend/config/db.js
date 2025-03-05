const mongoose = require("mongoose");
require("dotenv").config();
 const MONGO_URI ='mongodb+srv://harshad:123478890@cluster0.sboae.mongodb.net/ai_interview?retryWrites=true&w=majority&appName=Cluster0';
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected...");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
