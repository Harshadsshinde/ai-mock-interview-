import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext"; // ✅ Import auth context

const Navbar = () => {
  const { user, logout } = useAuth(); // ✅ Get user info from context

  return (
    <motion.nav
      className="flex justify-between items-center p-4 bg-gray-900 text-white shadow-lg fixed w-full top-0 z-50"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo with Animation */}
      <motion.div
        className="text-2xl font-bold tracking-wide cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Link to="/">MyApp</Link>
      </motion.div>

      {/* Login/Register or User Info */}
      <div>
        {user ? (
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.span
              className="text-lg"
              whileHover={{ scale: 1.1 }}
            >
              Hey, {user.name} 👋
            </motion.span>
            <motion.button
              onClick={logout}
              className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link 
              to="/login" 
              className="px-4 py-2 bg-blue-500 rounded-md hover:bg-blue-600 mx-2 transition-all"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-2 bg-green-500 rounded-md hover:bg-green-600 transition-all"
            >
              Register
            </Link>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
