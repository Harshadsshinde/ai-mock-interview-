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
  const [exampleAnswer, setExampleAnswer] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [questions, setQuestions] = useState(initialQuestions || []);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setIsSubmitting(true);
      if (questions.length === 0 || !answer.trim()) return;

      const response = await axios.post('http://localhost:4000/submit-answer', {
        answers: [answer],
        questions: [questions[questionIndex]]
      });

      const result = response.data?.results?.[0] || {};
      setFeedback(result.feedback || "No feedback available.");
      setExampleAnswer(result.exampleAnswer || "No sample response available.");
      setShowFeedback(true);
    } catch (error) {
      console.error("Error submitting answer:", error);
      alert(error.response?.data?.error || "Failed to get feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
    } else {
      const restart = window.confirm("Interview completed! Would you like to restart?");
      if (restart) {
        setQuestionIndex(0);
      } else {
        navigate('/');
      }
    }
    
    setAnswer("");
    setFeedback("");
    setExampleAnswer("");
    setShowFeedback(false);
  };

  const formatResponseText = (text) => {
    return text.split('\n').map((line, index) => (
      <p key={index} className="whitespace-pre-line">
        {line.trim().replace(/^(\d+\.?|-|\*)/, '• ')}
      </p>
    ));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-3xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">AI Interview Simulation</h1>
          <h2 className="text-lg text-gray-600 mt-1">
            {role} - {description}
          </h2>
        </header>

        <main className="mt-4">
          {questions.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="font-medium text-gray-700">
                  Question {questionIndex + 1} of {questions.length}
                </span>
                <button
                  className={`flex items-center gap-1 ${
                    isSpeaking ? 'text-blue-600' : 'text-blue-500 hover:text-blue-600'
                  }`}
                  onClick={() => handleTextToSpeech(questions[questionIndex])}
                  disabled={isSpeaking}
                >
                  {isSpeaking ? (
                    <>
                      <span className="animate-pulse">🔊</span> Speaking...
                    </>
                  ) : (
                    <>
                      <span>🔊</span> Read Question
                    </>
                  )}
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800 font-medium">
                  {questions[questionIndex]}
                </p>
              </div>

              <textarea
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={4}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Generating questions...</p>
            </div>
          )}
        </main>

        {!showFeedback ? (
          <button
            className={`mt-6 w-full py-3 rounded-lg font-semibold transition-colors ${
              !answer.trim() || isSubmitting
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
            onClick={submitAnswer}
            disabled={!answer.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Analyzing...
              </span>
            ) : (
              'Submit Answer & Get Feedback'
            )}
          </button>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                AI Feedback
              </h3>
              <div className="text-gray-700 space-y-2">
                {feedback ? (
                  formatResponseText(feedback)
                ) : (
                  <p className="text-gray-500">No feedback available</p>
                )}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Suggested Answer
              </h3>
              <div className="text-gray-700 space-y-2 text-sm">
                {exampleAnswer ? (
                  formatResponseText(exampleAnswer)
                ) : (
                  <p className="text-gray-500">No example available</p>
                )}
              </div>
            </div>

            <button
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
              onClick={handleNextQuestion}
            >
              {questionIndex < questions.length - 1 ? (
                'Next Question →'
              ) : (
                'Complete Interview'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPage;