import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";
import axios from "axios";
import pdfjs from 'pdfjs-dist/legacy/build/pdf.js';
const { getDocument } = pdfjs;
import authRoutes from "./routes/auth.js";

import dotenv from "dotenv";
dotenv.config();



// console.log(process.env); // Check if SMTP_USER and SMTP_PASS appear

// import authRoutes from "./routes/authRoutes.js"; 






// Ensure "uploads" directory exists
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📂 'uploads' directory created");
}

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());




// Replace with your actual API key
const API_KEY = "AIzaSyBpt_kCZkeK_EwdavXJZmbDKvRDmvBE-Kg";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-002:generateContent?key=${API_KEY}`;

// MongoDB Connection
mongoose
  .connect("mongodb+srv://harshad:123478890@cluster0.sboae.mongodb.net/ai_interview?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

  app.use("/api/auth", authRoutes);

// Resume Schema & Model
const ResumeSchema = new mongoose.Schema({
  userId: String,
  filePath: String,
  extractedText: String,
  uploadedAt: { type: Date, default: Date.now },
});
const Resume = mongoose.model("Resume", ResumeSchema);

// Multer Configuration
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// PDF Text Extraction
async function extractTextFromPDF(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File not found: ${filePath}`);
      return "";
    }

    const dataBuffer = fs.readFileSync(filePath);
    const uint8ArrayData = new Uint8Array(dataBuffer);
    const pdf = await getDocument({ data: uint8ArrayData }).promise;
    let extractedText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      extractedText += textContent.items.map((item) => item.str).join(" ") + "\n";
    }

    return extractedText;
  } catch (error) {
    console.error("❌ PDF Parsing Error:", error);
    return "PDF Parsing Failed";
  }
}

// Upload Resume
app.post("/upload-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = path.join(uploadDir, req.file.filename);
    const { userId } = req.body;

    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ error: "File upload failed" });
    }

    const extractedText = await extractTextFromPDF(filePath);
    const newResume = new Resume({ userId, filePath, extractedText });
    await newResume.save();

    res.json({
      message: "✅ Resume processed successfully!",
      resume: newResume,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ error: "Failed to upload resume" });
  }
});

// Get Questions
app.post("/get-questions", async (req, res) => {
  try {
    const { role, userId } = req.body;
    if (!role || !userId) return res.status(400).json({ error: "Missing required fields" });

    const resumeData = await Resume.findOne({ userId }).sort({ uploadedAt: -1 });
    const resumeText = resumeData?.extractedText || "";

    const prompt = resumeText
      ? `Generate exactly 5 concise interview questions for ${role} based on this resume:\n${resumeText}`
      : `Generate exactly 5 interview questions for ${role} role`;

    const response = await axios.post(GEMINI_URL, {
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const questions = response.data?.candidates?.[0]?.content?.parts?.[0]?.text
      ?.split("\n")
      .filter(q => q.trim());

    res.json({ success: true, questions: questions?.slice(0, 5) || [] });
  } catch (error) {
    console.error("❌ Question generation error:", error);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

// Submit Answer & Get Feedback
// Submit Answer & Get Feedback
// Submit Answer & Get Feedback (Improved Version)
app.post("/submit-answer", async (req, res) => {
  try {
    const { answers, questions } = req.body;
    
    if (!answers?.length || !questions?.length || answers.length !== questions.length) {
      return res.status(400).json({ error: "Invalid Q&A format" });
    }

    const results = await Promise.all(
      answers.map(async (answer, index) => {
        try {
          const question = questions[index];

          // AI Prompt Formatting
          const aiPrompt = `
            Analyze this interview answer for "${question}":\n"${answer}"
            Provide feedback and a concise example answer (max 8 sentences) in this format:
            ###FEEDBACK###:[your feedback here]
            ###EXAMPLE###:[short example here]
            Keep the example answer under 80 words.
          `;

          // API Call to Gemini
          const response = await axios.post(GEMINI_URL, {
            contents: [{ role: "user", parts: [{ text: aiPrompt }] }]
          });

          const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

          // Extracting Feedback & Example using safer parsing
          const feedbackMatch = responseText.match(/###FEEDBACK###:\s*(.*?)\s*###EXAMPLE###/s);
          const exampleMatch = responseText.match(/###EXAMPLE###:\s*(.*)/s);

          const feedback = feedbackMatch ? feedbackMatch[1].trim() : "No feedback generated";
          const exampleAnswer = exampleMatch ? exampleMatch[1].trim() : "No example generated";

          return { question, answer, feedback, exampleAnswer };
        } catch (error) {
          console.error(`❌ Error processing answer ${index + 1}:`, error);
          return { 
            question, 
            answer, 
            error: "Feedback generation failed" 
          };
        }
      })
    );

    res.json({ results });
  } catch (error) {
    console.error("❌ Submit Answer Error:", error);
    res.status(500).json({ error: "Failed to process answers" });
  }
});

// server.js
app.post('/generate-review', async (req, res) => {
  try {
    const { interviewData, role, resume } = req.body;
    
    const prompt = `Analyze these interview responses for a ${role} position${resume ? ' (candidate resume available)' : ''}:
    ${interviewData.map(item => `
    Question: ${item.question}
    Answer: ${item.answer}
    Feedback: ${item.feedback}
    `).join('\n')}

    Provide a comprehensive review focusing on:
    1. Overall strengths
    2. Key improvement areas
    3. Technical knowledge demonstration
    4. Communication skills
    5. Final recommendations
    
    Use concise bullet points and keep under 400 words.`;

    const response = await axios.post(GEMINI_URL, {
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const feedback = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    res.json({ feedback });
    
  } catch (error) {
    console.error("Review generation error:", error);
    res.status(500).json({ error: "Failed to generate review" });
  }
});
// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
