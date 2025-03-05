import Resume from "../models/Resume.js";
import multer from "multer";
import fs from "fs";
import path from "path";

// Setup file storage
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Upload Resume
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const { userId } = req.body;
    const filePath = path.join("./uploads", req.file.filename);

    const newResume = new Resume({ userId, filePath });
    await newResume.save();

    res.json({ message: "Resume uploaded successfully!", resume: newResume });
  } catch (error) {
    res.status(500).json({ error: "Resume upload failed" });
  }
};
