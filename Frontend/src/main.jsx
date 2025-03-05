import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom"; // ✅ Wraps the entire app


createRoot(document.getElementById('root')).render(
  <BrowserRouter>  {/* ✅ Only wrap it here */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
