import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const InterviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, description, questions: initialQuestions } = location.state || {};

  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [sampleResponse, setSampleResponse] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [questions, setQuestions] = useState(initialQuestions || []);
  const [answers, setAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState("");

  useEffect(() => {
    if (!initialQuestions?.length && role) {
      axios.post('http://localhost:4000/get-questions', { role })
        .then(response => setQuestions(response.data.questions || []))
        .catch(error => console.error('Error fetching questions:', error));
    }
  }, [role, initialQuestions]);

  useEffect(() => {
    if (questions.length > 0) {
      handleTextToSpeech(questions[questionIndex]);
    }
  }, [questionIndex, questions]);

  const handleTextToSpeech = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'en-US';
    speech.rate = 1;
    speech.onstart = () => setIsSpeaking(true);
    speech.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(speech);
  };

  const submitAnswer = async () => {
    try {
      if (questions.length === 0) return;

      const currentQuestion = questions[questionIndex];

      const response = await axios.post('http://localhost:4000/submit-answer', { 
        question: currentQuestion,
        answer 
      });

      console.log("API Response:", response.data);

      const aiResponse = response.data?.feedback?.split("\n\n") || [];
      
      let feedbackText = "No feedback available.";
      let sampleResponseText = "No sample response available.";

      if (aiResponse.length >= 2) {
        feedbackText = aiResponse[0].trim();
        sampleResponseText = aiResponse[1].trim();
      } else if (aiResponse.length === 1) {
        feedbackText = aiResponse[0].trim();
      }

      setFeedback(feedbackText);
      setSampleResponse(sampleResponseText);
      setAnswers([...answers, { question: currentQuestion, answer }]);
      setShowFeedback(true);
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  const handleNextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setAnswer("");
      setFeedback("");
      setSampleResponse("");
      setShowFeedback(false);
    } else {
      setShowReview(true);
    }
  };

  const handleEndInterview = () => {
    setShowReview(true);
  };

  const handleReview = async () => {
    try {
      const response = await axios.post('http://localhost:4000/review-answers', { answers });

      setReviewFeedback(response.data?.review || "No review feedback available.");
    } catch (error) {
      console.error("Error reviewing answers:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-6">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900">AI-Powered Interview</h1>
        <h2 className="text-lg text-gray-700 mt-2">{role} - {description}</h2>

        {!showReview ? (
          <>
            <div className="mt-4">
              {questions.length > 0 ? (
                <>
                  <h3 className="text-lg font-semibold">Question {questionIndex + 1}</h3>
                  <p className="text-gray-800 mt-2">{questions[questionIndex]}</p>
                  <button 
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
                    onClick={() => handleTextToSpeech(questions[questionIndex])}
                    disabled={isSpeaking}
                  >
                    {isSpeaking ? "Speaking..." : "Read Question"}
                  </button>
                  <textarea 
                    className="mt-3 w-full p-2 border rounded-md outline-none"
                    placeholder="Type your answer here..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                  ></textarea>
                </>
              ) : (
                <p className="text-gray-600">Loading questions...</p>
              )}
            </div>

            {!showFeedback ? (
              <button 
                className="mt-4 bg-green-500 text-white py-2 w-full rounded-lg"
                onClick={submitAnswer}
              >
                Submit Answer & Get Feedback
              </button>
            ) : (
              <>
                <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-100">
                  <h3 className="text-lg font-semibold">AI Feedback on Your Answer:</h3>
                  <p className="text-gray-700 whitespace-pre-line">{feedback}</p>
                </div>
                <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-100">
                  <h3 className="text-lg font-semibold">Example Answer:</h3>
                  <ul className="list-disc pl-4 text-gray-700">
                    <li><strong>Analyze the Situation:</strong> Gather data and understand priorities.</li>
                    <li><strong>Use a Framework:</strong> Apply a structured approach like RICE or Impact/Effort matrix.</li>
                    <li><strong>Communicate Clearly:</strong> Justify decisions with data and address stakeholder concerns.</li>
                    <li><strong>Negotiate & Adjust:</strong> Find a balanced solution based on feedback.</li>
                  </ul>
                </div>
                <button 
                  className="mt-4 bg-blue-500 text-white py-2 w-full rounded-lg"
                  onClick={handleNextQuestion}
                >
                  {questionIndex < questions.length - 1 ? "Next Question" : "Finish Interview"}
                </button>
              </>
            )}

            <button 
              className="mt-4 bg-red-500 text-white py-2 w-full rounded-lg"
              onClick={handleEndInterview}
            >
              End Interview Early
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mt-4">Final AI Review</h2>
            <button 
              className="mt-4 bg-green-500 text-white py-2 w-full rounded-lg"
              onClick={handleReview}
            >
              Get AI Review Feedback
            </button>
            {reviewFeedback && (
              <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-100">
                <h3 className="text-lg font-semibold">AI Review Feedback:</h3>
                <p className="text-gray-700">{reviewFeedback}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InterviewPage;




import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse"; // ✅ Using pdf-parse for text extraction
import Tesseract from "tesseract.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
const MONGO_URI =
  "mongodb+srv://harshad:123478890@cluster0.sboae.mongodb.net/ai_interview?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Resume Schema
const resumeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  filePath: { type: String, required: true },
  extractedText: { type: String },
});
const Resume = mongoose.model("Resume", resumeSchema);

// ✅ File Upload Configuration
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// ✅ Extract Text from Normal PDFs
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text || "No text extracted from the PDF.";
  } catch (error) {
    console.error("❌ PDF Parsing Error:", error);
    return "PDF Parsing Failed.";
  }
}

// ✅ Extract Text from Scanned PDFs using OCR
async function extractTextFromScannedPDF(filePath) {
  try {
    const { data } = await Tesseract.recognize(filePath, "eng");
    return data.text || "OCR Failed. No text extracted.";
  } catch (error) {
    console.error("❌ OCR Error:", error);
    return "OCR Failed.";
  }
}

// ✅ Main Function to Extract Text from Any PDF
async function extractText(filePath) {
  try {
    const extractedText = await extractTextFromPDF(filePath);

    // If the extracted text is empty, assume it's a scanned PDF and use OCR
    if (!extractedText.trim()) {
      console.log("🔍 Scanned PDF detected, using OCR...");
      return extractTextFromScannedPDF(filePath);
    }

    console.log("📄 Regular PDF detected, text extracted successfully.");
    return extractedText;
  } catch (error) {
    console.error("❌ Text Extraction Error:", error);
    return "Text extraction failed.";
  }
}

// ✅ Upload Resume & Extract Skills
app.post("/upload-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = path.join(uploadDir, req.file.filename);
    const { userId } = req.body;

    console.log(`📂 File Uploaded: ${req.file.originalname}`);

    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ error: "File upload failed: File not found." });
    }

    // 🔥 Extract text dynamically (handles normal PDFs & scanned PDFs)
    const extractedText = await extractText(filePath);

    // ✅ Save to MongoDB
    const newResume = new Resume({ userId, filePath, extractedText });
    await newResume.save();

    res.json({ message: "✅ Resume uploaded and processed successfully!", resume: newResume });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ error: "Failed to upload resume" });
  }
});

// ✅ Get All Uploaded Resumes
app.get("/resumes", async (req, res) => {
  try {
    const resumes = await Resume.find();
    res.json(resumes);
  } catch (error) {
    console.error("❌ Fetch Resumes Error:", error);
    res.status(500).json({ error: "Failed to fetch resumes" });
  }
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

