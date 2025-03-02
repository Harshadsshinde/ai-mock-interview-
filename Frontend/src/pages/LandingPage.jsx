        import React, { useState } from 'react';
        import { useNavigate } from 'react-router-dom';
        import axios from 'axios';

        const roles = [
            "Custom Job Description", "Business Analyst", "Product Manager", "Software Engineer", "Marketing Specialist",
            "Customer Service Representative", "Sales Representative", "Human Resources Specialist",
            "Data Analyst", "UX/UI Designer", "QA Engineer"
        ];

        const LandingPage = () => {
            const [selectedRole, setSelectedRole] = useState(null);
            const [customDescription, setCustomDescription] = useState("");
            const [resume, setResume] = useState(null);
            const [uploading, setUploading] = useState(false);
            const [userId] = useState("12345"); // Temporary User ID (Replace with actual authentication logic)
            const navigate = useNavigate();

            const handleResumeUpload = async (event) => {
                const file = event.target.files[0];
                if (!file) return;
                setUploading(true);
            
                const formData = new FormData();
                formData.append("resume", file);
                formData.append("userId", userId); 
                
                try {
                    const response = await axios.post("http://localhost:4000/upload-resume", formData, {
                        headers: { "Content-Type": "multipart/form-data" }
                    });
            
                    if (response.data.resume && response.data.resume.filePath) {
                        setResume(response.data.resume.filePath); // Fix response handling
                        alert("Resume uploaded successfully!");
                    } else {
                        throw new Error("Resume upload response is invalid");
                    }
                } catch (error) {
                    console.error("Upload failed:", error);
                    alert("Failed to upload resume");
                }
            
                setUploading(false);
            };
            
            const generateQuestions = async () => {
                const roleDesc = selectedRole === "Custom Job Description" ? customDescription : "";
                if (!selectedRole || (selectedRole === "Custom Job Description" && !customDescription.trim())) {
                    alert("Please select a role and provide a description.");
                    return;
                }

                try {
                    const response = await axios.post('http://localhost:4000/get-questions', { 
                        role: selectedRole, 
                        userId // Include userId to fetch the correct resume
                    });

                    if (response.data.questions) {
                        navigate('/interview', { state: { role: selectedRole, description: roleDesc, questions: response.data.questions, resume } });
                    } else {
                        alert('No questions found for this role');
                    }
                } catch (error) {
                    console.error('Error generating questions:', error);
                    alert('Failed to generate questions');
                }
            };

            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-6">
                    <header className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900">#1 AI Interview Prep</h1>
                        <p className="text-lg text-gray-700 mt-2">Boost your confidence, ace the job interview</p>
                    </header>
                    <section className="mt-6 w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800">Select a Job Role</h2>
                        <div className="mt-3 grid grid-cols-4 gap-3 w-full">
                            {roles.map((role, index) => (
                                <button 
                                    key={index} 
                                    className={`p-2 font-bold text-sm w-full rounded-md shadow transition-all ${selectedRole === role ? 'bg-blue-700 text-white' : 'bg-gray-300 text-gray-900 hover:bg-gray-400'}`}
                                    onClick={() => setSelectedRole(role)}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                        {selectedRole === "Custom Job Description" && (
                            <textarea 
                                className="mt-3 w-full p-2 border rounded-md" 
                                placeholder="Enter your job description here..." 
                                maxLength="5000"
                                value={customDescription}
                                onChange={(e) => setCustomDescription(e.target.value)}
                            ></textarea>
                        )}
                        <label className="mt-4 w-full border border-dashed p-3 text-center text-gray-500 cursor-pointer hover:bg-gray-100 block">
                            Upload your resume for improved, tailored feedback!
                            <input type="file" className="hidden" onChange={handleResumeUpload} />
                        </label>
                        {uploading ? <p className="text-blue-500 text-sm mt-2">Uploading...</p> : resume && <p className="text-green-600 text-sm mt-2">Resume uploaded: {resume}</p>}
                        <button 
                            className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg shadow-md hover:bg-green-600 transition"
                            onClick={generateQuestions}
                        >
                            Generate Questions
                        </button>
                    </section>
                </div>
            );
        };

        export default LandingPage;