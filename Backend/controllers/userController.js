import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Setup mail transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// Register User with Email Verification
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword });

    const otp = Math.floor(100000 + Math.random() * 900000);
    await transporter.sendMail({
      to: email,
      subject: "Verify Your Email",
      text: `Your OTP code is: ${otp}`,
    });

    await user.save();
    res.json({ message: "OTP sent! Verify your email." });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
};

// Verify OTP & Activate Account
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "Invalid email" });

  if (user.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

  user.verified = true;
  await user.save();
  res.json({ message: "Account verified successfully!" });
};

// Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token, message: "Login successful!" });
};
