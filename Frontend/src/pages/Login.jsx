import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Failed to log in");

      login(data.token, email);
      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-800 to-cyan-700 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl w-full max-w-md p-8 overflow-hidden"
      >
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white/5 rounded-full"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: Math.random() * 4 + 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <motion.h2 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
        >
          Welcome Back
        </motion.h2>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </motion.div>
          )}

          <div className="relative group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border-2 border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200/30 outline-none transition-all duration-300"
              placeholder=" "
              required
            />
            <label className="absolute left-4 top-3 text-gray-300 pointer-events-none transition-all duration-300 group-focus-within:-translate-y-6 group-focus-within:text-sm group-focus-within:text-cyan-400 group-[input:not(:placeholder-shown)]:-translate-y-6 group-[input:not(:placeholder-shown)]:text-sm">
              Email Address
            </label>
          </div>

          <div className="relative group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border-2 border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200/30 outline-none transition-all duration-300"
              placeholder=" "
              required
            />
            <label className="absolute left-4 top-3 text-gray-300 pointer-events-none transition-all duration-300 group-focus-within:-translate-y-6 group-focus-within:text-sm group-focus-within:text-cyan-400 group-[input:not(:placeholder-shown)]:-translate-y-6 group-[input:not(:placeholder-shown)]:text-sm">
              Password
            </label>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-transform duration-200 hover:shadow-lg hover:shadow-cyan-500/30"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </motion.button>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-white/20"></div>
            <span className="flex-shrink mx-4 text-gray-300">or continue with</span>
            <div className="flex-grow border-t border-white/20"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {['google', 'github'].map((provider) => (
              <motion.button
                key={provider}
                whileHover={{ y: -2 }}
                className="p-3 bg-white/5 rounded-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-colors duration-200"
              >
                <img 
                  src={`/${provider}-icon.svg`} 
                  alt={provider} 
                  className="w-6 h-6"
                />
                <span className="capitalize text-gray-200">{provider}</span>
              </motion.button>
            ))}
          </div>

          <p className="text-center text-gray-300">
            Don't have an account?{' '}
            <motion.a 
              href="/register" 
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
              whileHover={{ scale: 1.05 }}
            >
              Register here
            </motion.a>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;