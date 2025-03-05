import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const InterviewReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, description, interviewData, resume } = location.state || {};
  const [overallFeedback, setOverallFeedback] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateOverallFeedback = async () => {
      try {
        const response = await axios.post('http://localhost:4000/generate-review', {
          interviewData,
          role,
          resume
        });

        setOverallFeedback(response.data.feedback?.replace(/\*+/g, '') || "No overall feedback generated.");
      } catch (error) {
        console.error("Error generating review:", error);
        setOverallFeedback("Failed to generate overall feedback.");
      } finally {
        setLoading(false);
      }
    };

    if (interviewData?.length) {
      generateOverallFeedback();
    } else {
      navigate('/interview');
    }
  }, [interviewData, navigate, role, resume]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Interview Review</h1>
          <h2 className="text-lg text-gray-600 mt-1">
            {role} - {description}
          </h2>
          {resume && <p className="text-sm text-gray-500 mt-1">Based on uploaded resume</p>}
        </header>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Generating comprehensive review...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Overall Performance Summary</h3>
              <div className="text-gray-700 space-y-2 whitespace-pre-line">{overallFeedback}</div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Detailed Feedback</h3>
              {interviewData.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-700">Question {index + 1}</h4>
                    <p className="text-gray-600">{item.question}</p>
                  </div>
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-700">Your Answer</h4>
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-700">Feedback</h4>
                    <p className="text-gray-600 whitespace-pre-line">{item.feedback}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Suggested Answer</h4>
                    <p className="text-gray-600 text-sm whitespace-pre-line">{item.example}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Return Home
              </button>
              <button
                onClick={() => navigate('/interview', { state: location.state })}
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Retry Interview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewReviewPage;
