import React from 'react';
import { Routes, Route } from 'react-router-dom'; // ✅ No need to import BrowserRouter
import LandingPage from './pages/LandingPage';
import InterviewPage from './pages/InterviewPage';
import InterviewReviewPage from './pages/ReviewPage';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/interview" element={<InterviewPage />} />
                <Route path="/generate-review" element={<InterviewReviewPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </>
    );
}

export default App;
