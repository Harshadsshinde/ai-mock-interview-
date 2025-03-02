import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
// import Dashboard from './pages/Dashboard';
import InterviewPage from './pages/InterviewPage';
// import FeedbackPage from './pages/FeedbackPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                {/* <Route path="/dashboard" element={<Dashboard />} /> */}
                <Route path="/interview" element={<InterviewPage />} />
                {/* <Route path="/feedback" element={<FeedbackPage />} /> */}
            </Routes>
        </Router>
    );
}

export default App;