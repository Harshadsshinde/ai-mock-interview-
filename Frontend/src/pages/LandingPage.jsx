import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const roles = [
    "Custome Job Role ","Business Analyst", "Product Manager", "Software Engineer", 
    "Marketing Specialist", "Customer Service Representative", 
    "Sales Representative", "Human Resources Specialist", 
    "Data Analyst", "UX/UI Designer", "QA Engineer"
];

const LandingPage = () => {
    const [selectedRole, setSelectedRole] = useState(null);
    const [jobDescription, setJobDescription] = useState("");
    const [resume, setResume] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [userId] = useState("12345");
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
    
            if (response.data.resume?.filePath) {
                setResume(response.data.resume.filePath);
                alert("Resume uploaded successfully!");
                // Clear role selection when resume is uploaded
                setSelectedRole(null);
                setJobDescription("");
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload resume");
        }
    
        setUploading(false);
    };

    const generateQuestions = async () => {
        // Only require role/description if no resume uploaded
        if (!resume && (!selectedRole || !jobDescription.trim())) {
            alert("Please either upload a resume or select a role and provide a job description.");
            return;
        }

        try {
            const response = await axios.post('http://localhost:4000/get-questions', { 
                role: resume ? "Resume-Based" : selectedRole,  // Send different role flag for resume
                userId,
                description: jobDescription
            });

            if (response.data.questions) {
                navigate('/interview', { 
                    state: { 
                        role: resume ? "Resume-Based Position" : selectedRole,
                        description: resume ? "Based on uploaded resume" : jobDescription,
                        questions: response.data.questions, 
                        resume 
                    } 
                });
            }
        } catch (error) {
            console.error('Error generating questions:', error);
            alert('Failed to generate questions');
        }
    };

    return (
        <>
        
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 animate-fade-in">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2 animate-slide-down">
                    AI Interview Coach
                </h1>
                <p className="text-lg text-gray-600 animate-slide-up delay-100">
                    {resume ? "Resume-Based Preparation" : "Role-Specific Preparation"}
                </p>
            </header>

            <section className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl">
                {!resume && (
                    <>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                            Select Your Target Role
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                            {roles.map((role) => (
                                <button 
                                    key={role}
                                    className={`p-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                                        selectedRole === role 
                                        ? 'bg-blue-600 text-white shadow-inner scale-95 ring-2 ring-blue-300'
                                        : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:scale-105'
                                    }`}
                                    onClick={() => setSelectedRole(role)}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>

                        {selectedRole && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                    Job Description for {selectedRole}
                                </h3>
                                <textarea 
                                    className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl
                                            focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all
                                            placeholder-gray-400 text-gray-700"
                                    placeholder={`Describe the ${selectedRole} position...`}
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    rows="4"
                                />
                            </div>
                        )}
                    </>
                )}

                <div className="space-y-6">
                    <label className={`group relative block w-full p-8 border-2 border-dashed rounded-xl
                                    ${resume ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400'}
                                    transition-all duration-300 cursor-pointer hover:shadow-md hover:translate-y-[-2px]`}>
                        <div className="text-center">
                            <div className="mb-2 text-4xl">
                                {resume ? '✅' : '📄'}
                            </div>
                            <p className={`text-sm font-medium ${
                                resume ? 'text-green-700' : 'text-gray-600 group-hover:text-blue-600'
                            }`}>
                                {resume ? 'Resume Uploaded!' : 'Upload Your Resume (Optional)'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {resume ? 
                                    "We'll use this resume to generate questions" : 
                                    "PDF or Word document recommended"}
                            </p>
                        </div>
                        <input 
                            type="file" 
                            className="hidden" 
                            onChange={handleResumeUpload} 
                            accept=".pdf,.doc,.docx"
                        />
                    </label>

                    {uploading && (
                        <div className="flex items-center justify-center space-x-2 text-blue-600">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <span>Uploading Resume...</span>
                        </div>
                    )}

                    <button 
                        className={`w-full py-4 text-lg font-semibold text-white rounded-xl transition-all
                                  duration-300 transform hover:scale-105 hover:shadow-xl
                                  ${(resume || selectedRole) ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-300 cursor-not-allowed'}
                                  flex items-center justify-center space-x-2`}
                        onClick={generateQuestions}
                        disabled={!resume && !selectedRole}
                    >
                        <span>{resume ? 'Generate from Resume' : 'Generate Questions'}</span>
                        <svg 
                            className="w-5 h-5 animate-bounce-horizontal" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M13 5l7 7-7 7M5 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </div>
            </section>
        </div>
        </>
    );
};

export default LandingPage;