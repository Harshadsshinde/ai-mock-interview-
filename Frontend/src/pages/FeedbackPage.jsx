// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const InterviewPage = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { role, description, questions: initialQuestions } = location.state || {};

//   const [questionIndex, setQuestionIndex] = useState(0);
//   const [answer, setAnswer] = useState("");
//   const [feedback, setFeedback] = useState("");
//   const [sampleResponse, setSampleResponse] = useState("");
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [questions, setQuestions] = useState(initialQuestions || []);
//   const [answers, setAnswers] = useState([]);
//   const [showFeedback, setShowFeedback] = useState(false);
//   const [showReview, setShowReview] = useState(false);
//   const [reviewFeedback, setReviewFeedback] = useState("");

//   useEffect(() => {
//     if (!initialQuestions?.length && role) {
//       axios.post('http://localhost:4000/get-questions', { role })
//         .then(response => setQuestions(response.data.questions || []))
//         .catch(error => console.error('Error fetching questions:', error));
//     }
//   }, [role, initialQuestions]);

//   useEffect(() => {
//     if (questions.length > 0) {
//       handleTextToSpeech(questions[questionIndex]);
//     }
//   }, [questionIndex, questions]);

//   const handleTextToSpeech = (text) => {
//     const speech = new SpeechSynthesisUtterance(text);
//     speech.lang = 'en-US';
//     speech.rate = 1;
//     speech.onstart = () => setIsSpeaking(true);
//     speech.onend = () => setIsSpeaking(false);
//     window.speechSynthesis.speak(speech);
//   };

//   const submitAnswer = async () => {
//     try {
//       if (questions.length === 0) return;

//       const currentQuestion = questions[questionIndex];

//       const response = await axios.post('http://localhost:4000/submit-answer', { 
//         question: currentQuestion,
//         answer 
//       });

//       console.log("API Response:", response.data);

//       const aiResponse = response.data?.feedback?.split("\n\n") || [];
      
//       let feedbackText = "No feedback available.";
//       let sampleResponseText = "No sample response available.";

//       if (aiResponse.length >= 2) {
//         feedbackText = aiResponse[0].trim();
//         sampleResponseText = aiResponse[1].trim();
//       } else if (aiResponse.length === 1) {
//         feedbackText = aiResponse[0].trim();
//       }

//       setFeedback(feedbackText);
//       setSampleResponse(sampleResponseText);
//       setAnswers([...answers, { question: currentQuestion, answer }]);
//       setShowFeedback(true);
//     } catch (error) {
//       console.error("Error submitting answer:", error);
//     }
//   };

//   const handleNextQuestion = () => {
//     if (questionIndex < questions.length - 1) {
//       setQuestionIndex(questionIndex + 1);
//       setAnswer("");
//       setFeedback("");
//       setSampleResponse("");
//       setShowFeedback(false);
//     } else {
//       setShowReview(true);
//     }
//   };

//   const handleEndInterview = () => {
//     setShowReview(true);
//   };

//   const handleReview = async () => {
//     try {
//       const response = await axios.post('http://localhost:4000/review-answers', { answers });

//       setReviewFeedback(response.data?.review || "No review feedback available.");
//     } catch (error) {
//       console.error("Error reviewing answers:", error);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-6">
//       <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
//         <h1 className="text-2xl font-bold text-gray-900">AI-Powered Interview</h1>
//         <h2 className="text-lg text-gray-700 mt-2">{role} - {description}</h2>

//         {!showReview ? (
//           <>
//             <div className="mt-4">
//               {questions.length > 0 ? (
//                 <>
//                   <h3 className="text-lg font-semibold">Question {questionIndex + 1}</h3>
//                   <p className="text-gray-800 mt-2">{questions[questionIndex]}</p>
//                   <button 
//                     className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
//                     onClick={() => handleTextToSpeech(questions[questionIndex])}
//                     disabled={isSpeaking}
//                   >
//                     {isSpeaking ? "Speaking..." : "Read Question"}
//                   </button>
//                   <textarea 
//                     className="mt-3 w-full p-2 border rounded-md outline-none"
//                     placeholder="Type your answer here..."
//                     value={answer}
//                     onChange={(e) => setAnswer(e.target.value)}
//                   ></textarea>
//                 </>
//               ) : (
//                 <p className="text-gray-600">Loading questions...</p>
//               )}
//             </div>

//             {!showFeedback ? (
//               <button 
//                 className="mt-4 bg-green-500 text-white py-2 w-full rounded-lg"
//                 onClick={submitAnswer}
//               >
//                 Submit Answer & Get Feedback
//               </button>
//             ) : (
//               <>
//                 <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-100">
//                   <h3 className="text-lg font-semibold">AI Feedback on Your Answer:</h3>
//                   <p className="text-gray-700 whitespace-pre-line">{feedback}</p>
//                 </div>
//                 <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-100">
//                   <h3 className="text-lg font-semibold">Example Answer:</h3>
//                   <ul className="list-disc pl-4 text-gray-700">
//                     <li><strong>Analyze the Situation:</strong> Gather data and understand priorities.</li>
//                     <li><strong>Use a Framework:</strong> Apply a structured approach like RICE or Impact/Effort matrix.</li>
//                     <li><strong>Communicate Clearly:</strong> Justify decisions with data and address stakeholder concerns.</li>
//                     <li><strong>Negotiate & Adjust:</strong> Find a balanced solution based on feedback.</li>
//                   </ul>
//                 </div>
//                 <button 
//                   className="mt-4 bg-blue-500 text-white py-2 w-full rounded-lg"
//                   onClick={handleNextQuestion}
//                 >
//                   {questionIndex < questions.length - 1 ? "Next Question" : "Finish Interview"}
//                 </button>
//               </>
//             )}

//             <button 
//               className="mt-4 bg-red-500 text-white py-2 w-full rounded-lg"
//               onClick={handleEndInterview}
//             >
//               End Interview Early
//             </button>
//           </>
//         ) : (
//           <>
//             <h2 className="text-xl font-semibold mt-4">Final AI Review</h2>
//             <button 
//               className="mt-4 bg-green-500 text-white py-2 w-full rounded-lg"
//               onClick={handleReview}
//             >
//               Get AI Review Feedback
//             </button>
//             {reviewFeedback && (
//               <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-100">
//                 <h3 className="text-lg font-semibold">AI Review Feedback:</h3>
//                 <p className="text-gray-700">{reviewFeedback}</p>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default InterviewPage;
import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";
import axios from "axios";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

// 🔥 Ensure "uploads" directory exists before server starts
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📂 'uploads' directory created");
}

// ✅ Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// 🔥 API Key and MongoDB URI
const API_KEY = "AIzaSyBpt_kCZkeK_EwdavXJZmbDKvRDmvBE-Kg";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-002:generateContent?key=${API_KEY}`;
const MONGO_URI = "mongodb+srv://harshad:123478890@cluster0.sboae.mongodb.net/ai_interview?retryWrites=true&w=majority&appName=Cluster0";

// ✅ MongoDB Connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Resume Schema & Model
const ResumeSchema = new mongoose.Schema({
  userId: String,
  filePath: String,
  extractedText: String,
  uploadedAt: { type: Date, default: Date.now },
});
const Resume = mongoose.model("Resume", ResumeSchema);

// ✅ Multer Configuration for File Uploads
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// ✅ PDF Text Extraction (Fixed with Uint8Array)
async function extractTextFromPDF(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Warning: File not found: ${filePath}`);
      return ""; // Return empty text instead of crashing
    }

    const dataBuffer = fs.readFileSync(filePath);
    const uint8ArrayData = new Uint8Array(dataBuffer); // ✅ Convert Buffer to Uint8Array

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
    return "PDF Parsing Failed. Text extraction skipped.";
  }
}

// ✅ Upload Resume & Extract Skills
app.post("/upload-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.join(uploadDir, req.file.filename);
    const { userId } = req.body;

    console.log(`📂 File Uploaded: ${req.file.originalname}`); // ✅ Confirm File Upload

    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ error: "File upload failed: File not found." });
    }

    // 🔥 Extract text using pdfjs-dist
    const extractedText = await extractTextFromPDF(filePath);

    // ✅ Save to MongoDB
    const newResume = new Resume({ userId, filePath, extractedText });
    await newResume.save();

    res.json({
      message: "✅ Resume uploaded and processed successfully!",
      resume: newResume,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ error: "Failed to upload resume" });
  }
});

// ✅ Submit Route
app.post("/submit", async (req, res) => {
  try {
    const { userId, resumeId } = req.body;
    if (!userId || !resumeId) {
      return res.status(400).json({ error: "User ID and Resume ID are required" });
    }
    res.json({ success: true, message: "Submission received" });
  } catch (error) {
    console.error("❌ Submit route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Review Answers Route (Fixes 404 Error)
app.post("/review-answers", async (req, res) => {
  try {
    const { answers, questions } = req.body;  // Now receiving both answers and associated questions
    if (!answers || !Array.isArray(answers) || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: "Invalid or missing answers or questions" });
    }

    // Loop through each answer and its corresponding question to get relevant feedback
    const answersWithFeedback = await Promise.all(
      answers.map(async (answer, index) => {
        const question = questions[index];  // Get the relevant question for this answer
        const response = await axios.post(GEMINI_URL, {
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `
                    You are an AI interview coach. Please analyze the following answer for the interview question. 
                    Provide feedback specific to the content of the answer and give a sample answer that could better address the interview question.

                    Interview Question: "${question}"
                    User's Answer: "${answer}"

                    Feedback:
                    Example Answer:
                  `
                }
              ]
            }
          ]
        });

        // Parse the response from Gemini API and return feedback and example answer
        const feedback = response.data?.choices?.[0]?.text || "No feedback available.";
        return {
          question: question,
          userAnswer: answer,
          feedback: feedback.trim()
        };
      })
    );

    // Send back the feedback along with the user's answer and the question
    res.json({ feedback: answersWithFeedback });
  } catch (error) {
    console.error("❌ AI Review Error:", error);
    res.status(500).json({ error: "Failed to get AI feedback" });
  }
});


// ✅ Serve Uploaded Files
app.use("/uploads", express.static(uploadDir));

// ✅ Start Server
const PORT = 4000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));





app.post("/submit-answer", async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: "Question and answer are required" });
    }

    // Get AI-generated feedback for answer
    const feedback = await generateFeedback(question, answer);
    const sampleResponse = generateSampleResponse(question);

    res.json({
      feedback: {
        aiFeedback: feedback,
        exampleAnswer: sampleResponse,
      },
    });
  } catch (error) {
    console.error("❌ Error submitting answer:", error);
    res.status(500).json({ error: "Failed to process answer" });
  }
});

// Function to simulate generating feedback (replace with actual AI service)
const generateFeedback = async (question, answer) => {
  // For real implementation, integrate with AI services like Gemini or OpenAI
  return `AI Feedback: You answered the question clearly, but adding real-life examples would make your answer stronger. Also, consider elaborating on your role in the project mentioned.`;
};

// Function to simulate generating sample answer (replace with actual logic)
const generateSampleResponse = (question) => {
  // Example response; adjust as needed for real logic
  return `Example Answer: For this question, a strong answer would be: "In my previous role, I handled similar tasks by..." and highlight key achievements.`;
};
