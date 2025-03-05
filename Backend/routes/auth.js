import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const router = express.Router();
const MONGO_URI = 'mongodb+srv://harshad:123478890@cluster0.sboae.mongodb.net/ai_interview?retryWrites=true&w=majority&appName=Cluster0';
const JWT_SECRET="yourSecretKey123";

// ✅ Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));

// 📌 Register Route (Generates & Logs OTP, No Email Sending)
router.post("/register", async (req, res) => {
  const { name, email, password, confirmPassword, phone, dob } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ msg: "Missing required fields" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ msg: "Passwords do not match" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already registered. Please log in." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`🔹 OTP for ${email}: ${otp}`); // ✅ Log OTP in console for debugging

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      dob,
      otp,
      isVerified: true, // ✅ No verification needed, directly set to verified
    });

    await newUser.save();
    console.log("✅ User saved successfully");

    // 🔹 Generate JWT Token for Auto Login
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ msg: "Registration successful", token });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// 📌 Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Missing email or password" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({
      msg: "Login successful",
      token,
      user: { name: user.name, email: user.email }, // ✅ Send user data
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ msg: "Server error", error });
  }
});

// 📌 Verify OTP Route (Logs OTP Check)
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    console.log(`🔍 Checking OTP for ${email}: Entered OTP - ${otp}, Stored OTP - ${user.otp}`);

    if (user.otp !== otp) return res.status(400).json({ msg: "Invalid OTP" });

    user.isVerified = true;
    await user.save();

    res.status(200).json({ msg: "OTP verified successfully!" });
  } catch (error) {
    console.error("❌ OTP Verification Error:", error);
    res.status(500).json({ msg: "Server error", error });
  }
});

export default router;
